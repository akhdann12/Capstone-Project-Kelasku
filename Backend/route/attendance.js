const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const supabase = require("../db");
const auth = require("../middleware/auth");
const { getNowWIB, toDateStr, getPreviousSchoolDayWIB } = require("../utils/date");
const { toCsv, sendCsv } = require("../utils/csv");

// Ambang batas jarak wajah (euclidean distance) dari face-api.js.
// Semakin kecil = semakin mirip. 0.5 itu nilai yang cukup ketat & umum dipakai.
const FACE_MATCH_THRESHOLD = 0.5;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Format foto harus JPG, PNG, atau WebP"));
    },
});

// Helper: upload foto absen ke Supabase Storage
async function uploadPhoto(file, prefix, userId) {
    const ext = path.extname(file.originalname) || ".jpg";
    const fileName = `${prefix}_${userId}_${Date.now()}${ext}`;

    const { error } = await supabase.storage
        .from("attendance-photos")
        .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) {
        // Log detail aslinya ke terminal server (buat debug), tapi ke user cukup pesan yang jelas
        console.error("[attendance] Gagal upload ke storage bucket 'attendance-photos':", error);
        if (error.message?.toLowerCase().includes("bucket not found")) {
            throw new Error("Storage bucket 'attendance-photos' belum dibuat di Supabase. Jalankan dulu SQL migration 001_add_attendance.sql di Supabase SQL Editor.");
        }
        throw new Error(`Gagal upload foto absen: ${error.message || "error tidak diketahui"}`);
    }

    const { data } = supabase.storage.from("attendance-photos").getPublicUrl(fileName);
    return data.publicUrl;
}

// Helper: naikkan streak. Ga reset kalau hari sekolah terakhir absen
// itu = hari sekolah sebelum hari ini (loncatin Sabtu/Minggu otomatis).
async function bumpStreak(userId) {
    const nowWIB = getNowWIB();
    const todayStr = toDateStr(nowWIB);

    const { data: existing } = await supabase
        .from("user_streaks").select("*").eq("user_id", userId).maybeSingle();

    if (!existing) {
        await supabase.from("user_streaks").insert({ user_id: userId, streak_count: 1, last_login_date: todayStr });
        return 1;
    }

    if (existing.last_login_date === todayStr) return existing.streak_count;

    const prevSchoolDay = getPreviousSchoolDayWIB(nowWIB);
    const newStreak = existing.last_login_date === prevSchoolDay ? existing.streak_count + 1 : 1;

    await supabase.from("user_streaks").update({ streak_count: newStreak, last_login_date: todayStr }).eq("user_id", userId);
    return newStreak;
}

// =============================================
// GET status absen hari ini
// =============================================
router.get("/today", auth, async (req, res) => {
    const todayStr = toDateStr(getNowWIB());

    const { data, error } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", req.user.id)
        .eq("attendance_date", todayStr)
        .maybeSingle();

    if (error) return res.status(500).json({ message: "Server error" });
    res.json(data || null);
});

// =============================================
// POST check-in (absen masuk) — wajib foto wajah
// body: photo (file), similarity (jarak wajah dari face-api.js, buat audit)
// =============================================
router.post("/check-in", auth, (req, res) => {
    upload.single("photo")(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: "Foto wajah wajib diambil dulu" });

        const userId = req.user.id;
        const todayStr = toDateStr(getNowWIB());
        const similarity = req.body.similarity !== undefined ? parseFloat(req.body.similarity) : null;

        if (similarity !== null && similarity > FACE_MATCH_THRESHOLD) {
            return res.status(400).json({ message: "Wajah tidak cocok dengan foto profil. Coba lagi dengan pencahayaan yang lebih baik." });
        }

        const { data: existing, error: selectErr } = await supabase
            .from("attendances")
            .select("id, check_in_time")
            .eq("user_id", userId)
            .eq("attendance_date", todayStr)
            .maybeSingle();

        if (selectErr) {
            console.error("[attendance] Gagal baca tabel 'attendances':", selectErr);
            const hint = selectErr.message?.toLowerCase().includes("does not exist")
                ? " Tabel 'attendances' sepertinya belum dibuat — jalankan SQL migration 001_add_attendance.sql di Supabase SQL Editor."
                : "";
            return res.status(500).json({ message: `Gagal baca data absen.${hint}` });
        }

        if (existing?.check_in_time) {
            return res.status(400).json({ message: "Kamu sudah check-in hari ini" });
        }

        let photoUrl;
        try {
            photoUrl = await uploadPhoto(req.file, "checkin", userId);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }

        const nowIso = new Date().toISOString();

        if (existing) {
            const { error } = await supabase
                .from("attendances")
                .update({ check_in_time: nowIso, check_in_photo_url: photoUrl, check_in_similarity: similarity })
                .eq("id", existing.id);
            if (error) {
                console.error("[attendance] Gagal update attendances (check-in):", error);
                return res.status(500).json({ message: `Gagal simpan absen: ${error.message}` });
            }
        } else {
            const { error } = await supabase.from("attendances").insert({
                user_id: userId,
                attendance_date: todayStr,
                check_in_time: nowIso,
                check_in_photo_url: photoUrl,
                check_in_similarity: similarity,
            });
            if (error) {
                console.error("[attendance] Gagal insert attendances (check-in):", error);
                return res.status(500).json({ message: `Gagal simpan absen: ${error.message}` });
            }
        }

        const streak = await bumpStreak(userId);
        res.status(201).json({ message: "Check-in berhasil!", streak });
    });
});

// =============================================
// POST check-out (absen pulang) — wajib foto wajah, wajib udah check-in
// =============================================
router.post("/check-out", auth, (req, res) => {
    upload.single("photo")(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: "Foto wajah wajib diambil dulu" });

        const userId = req.user.id;
        const todayStr = toDateStr(getNowWIB());
        const similarity = req.body.similarity !== undefined ? parseFloat(req.body.similarity) : null;

        if (similarity !== null && similarity > FACE_MATCH_THRESHOLD) {
            return res.status(400).json({ message: "Wajah tidak cocok dengan foto profil. Coba lagi dengan pencahayaan yang lebih baik." });
        }

        const { data: existing, error: selectErr } = await supabase
            .from("attendances")
            .select("id, check_in_time, check_out_time")
            .eq("user_id", userId)
            .eq("attendance_date", todayStr)
            .maybeSingle();

        if (selectErr) {
            console.error("[attendance] Gagal baca tabel 'attendances':", selectErr);
            const hint = selectErr.message?.toLowerCase().includes("does not exist")
                ? " Tabel 'attendances' sepertinya belum dibuat — jalankan SQL migration 001_add_attendance.sql di Supabase SQL Editor."
                : "";
            return res.status(500).json({ message: `Gagal baca data absen.${hint}` });
        }

        if (!existing?.check_in_time) {
            return res.status(400).json({ message: "Kamu belum check-in hari ini" });
        }
        if (existing.check_out_time) {
            return res.status(400).json({ message: "Kamu sudah check-out hari ini" });
        }

        let photoUrl;
        try {
            photoUrl = await uploadPhoto(req.file, "checkout", userId);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }

        const { error } = await supabase
            .from("attendances")
            .update({ check_out_time: new Date().toISOString(), check_out_photo_url: photoUrl, check_out_similarity: similarity })
            .eq("id", existing.id);

        if (error) {
            console.error("[attendance] Gagal update attendances (check-out):", error);
            return res.status(500).json({ message: `Gagal simpan absen: ${error.message}` });
        }
        res.json({ message: "Check-out berhasil!" });
    });
});

// =============================================
// GET riwayat absen (90 hari terakhir)
// =============================================
router.get("/history", auth, async (req, res) => {
    const { data, error } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", req.user.id)
        .order("attendance_date", { ascending: false })
        .limit(90);

    if (error) return res.status(500).json({ message: "Server error" });
    res.json(data || []);
});

// =============================================
// GET export riwayat absen ke CSV (bisa dibuka di Excel/WPS/LibreOffice,
// atau tinggal di-import ke Google Sheets: File > Import > Upload)
// =============================================
router.get("/export", auth, async (req, res) => {
    const { data: profile } = await supabase.from("profiles").select("name").eq("id", req.user.id).maybeSingle();

    const { data, error } = await supabase
        .from("attendances")
        .select("*")
        .eq("user_id", req.user.id)
        .order("attendance_date", { ascending: false });

    if (error) return res.status(500).json({ message: "Server error" });

    const rows = [["Tanggal", "Jam Check-in", "Jam Check-out", "Status"]];
    (data || []).forEach((a) => {
        rows.push([
            new Date(a.attendance_date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
            a.check_in_time ? new Date(a.check_in_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) : "-",
            a.check_out_time ? new Date(a.check_out_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) : "-",
            a.check_out_time ? "Lengkap" : (a.check_in_time ? "Belum Check-out" : "-"),
        ]);
    });

    const fileName = `riwayat-absen-${(profile?.name || "siswa").replace(/\s+/g, "_")}.csv`;
    sendCsv(res, fileName, rows);
});

module.exports = router;