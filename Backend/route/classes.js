const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const supabase = require("../db");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { sendCsv } = require("../utils/csv");

// =============================================
// GET semua kelas (guru: punyanya | siswa: yang dia ikuti)
// =============================================
router.get("/", auth, async (req, res) => {
    const { id: userId, role: userRole } = req.user;

    if (userRole === "guru") {
        const { data, error } = await supabase
            .from("classes")
            .select("*, class_members(count)")
            .eq("guru_id", userId)
            .order("created_at", { ascending: false });

        if (error) return res.status(500).json({ message: "Server error" });
        return res.json(data);
    }

    // Siswa: ambil kelas via class_members join classes
    const { data, error } = await supabase
        .from("class_members")
        .select(`
            joined_at,
            classes (
                id, name, description, subject, cover, kode_kelas, guru_id, created_at,
                profiles!classes_guru_id_fkey (name)
            )
        `)
        .eq("siswa_id", userId)
        .order("joined_at", { ascending: false });

    if (error) return res.status(500).json({ message: "Server error" });

    const result = data.map((d) => ({
        ...d.classes,
        guru_name: d.classes.profiles?.name,
        joined_at: d.joined_at,
    }));

    res.json(result);
});

// =============================================
// GET detail 1 kelas
// =============================================
router.get("/:id", auth, async (req, res) => {
    const { id } = req.params;
    const { id: userId, role: userRole } = req.user;

    const { data: kelas, error } = await supabase
        .from("classes")
        .select("*, profiles!classes_guru_id_fkey (name)")
        .eq("id", id)
        .single();

    if (error || !kelas) return res.status(404).json({ message: "Kelas tidak ditemukan" });

    if (userRole === "guru" && kelas.guru_id !== userId) {
        return res.status(403).json({ message: "Bukan kelas kamu" });
    }

    if (userRole === "siswa") {
        const { data: membership } = await supabase
            .from("class_members")
            .select("id")
            .eq("class_id", id)
            .eq("siswa_id", userId)
            .single();

        if (!membership) return res.status(403).json({ message: "Kamu belum join kelas ini" });
    }

    res.json({ ...kelas, guru_name: kelas.profiles?.name });
});

// =============================================
// POST buat kelas baru (guru only)
// =============================================
router.post("/", auth, role(["guru"]), async (req, res) => {
    const { name, description, subject, cover } = req.body;

    if (!name || !subject) {
        return res.status(400).json({ message: "Nama kelas dan mata pelajaran wajib diisi" });
    }

    // Kode kelas: 6 karakter hex uppercase, ex: "A3F9B2"
    const kode_kelas = crypto.randomBytes(3).toString("hex").toUpperCase();

    const { data, error } = await supabase
        .from("classes")
        .insert({
            name,
            description: description || null,
            subject,
            cover: cover || null,
            kode_kelas,
            guru_id: req.user.id,
        })
        .select()
        .single();

    if (error) {
    console.error("Buat kelas error DETAIL:", JSON.stringify(error));
    return res.status(500).json({ message: "Gagal buat kelas: " + error.message });
}

    res.status(201).json({ message: "Kelas berhasil dibuat", data });
});

// =============================================
// PUT edit kelas (guru only, harus pemilik)
// =============================================
router.put("/:id", auth, role(["guru"]), async (req, res) => {
    const { id } = req.params;
    const { name, description, subject, cover } = req.body;

    const { data: kelas } = await supabase
        .from("classes")
        .select("id")
        .eq("id", id)
        .eq("guru_id", req.user.id)
        .single();

    if (!kelas) return res.status(404).json({ message: "Kelas tidak ditemukan atau bukan milikmu" });

    const { error } = await supabase
        .from("classes")
        .update({ name, description: description || null, subject, cover: cover || null })
        .eq("id", id);

    if (error) return res.status(500).json({ message: "Gagal update kelas" });

    res.json({ message: "Kelas berhasil diupdate" });
});

// =============================================
// DELETE kelas (guru only, harus pemilik)
// =============================================
router.delete("/:id", auth, role(["guru"]), async (req, res) => {
    const { id } = req.params;

    const { data: kelas } = await supabase
        .from("classes")
        .select("id")
        .eq("id", id)
        .eq("guru_id", req.user.id)
        .single();

    if (!kelas) return res.status(404).json({ message: "Kelas tidak ditemukan atau bukan milikmu" });

    const { error } = await supabase.from("classes").delete().eq("id", id);

    if (error) return res.status(500).json({ message: "Gagal hapus kelas" });

    res.json({ message: "Kelas berhasil dihapus" });
});

// =============================================
// POST join kelas via kode (siswa only)
// =============================================
router.post("/join", auth, role(["siswa"]), async (req, res) => {
    const { kode_kelas } = req.body;

    if (!kode_kelas) {
        return res.status(400).json({ message: "Kode kelas wajib diisi" });
    }

    const { data: kelas, error: kelasErr } = await supabase
        .from("classes")
        .select("id, name, subject")
        .eq("kode_kelas", kode_kelas.toUpperCase())
        .single();

    if (kelasErr || !kelas) {
        return res.status(404).json({ message: "Kode kelas tidak valid" });
    }

    // Cek sudah join belum
    const { data: existing } = await supabase
        .from("class_members")
        .select("id")
        .eq("class_id", kelas.id)
        .eq("siswa_id", req.user.id)
        .single();

    if (existing) {
        return res.status(400).json({ message: "Kamu sudah bergabung di kelas ini" });
    }

    const { error: joinErr } = await supabase.from("class_members").insert({
        class_id: kelas.id,
        siswa_id: req.user.id,
    });

    if (joinErr) return res.status(500).json({ message: "Gagal join kelas" });

    res.status(201).json({
        message: `Berhasil join kelas "${kelas.name}"`,
        data: kelas,
    });
});

// =============================================
// DELETE leave kelas (siswa only)
// =============================================
router.delete("/:id/leave", auth, role(["siswa"]), async (req, res) => {
    const { error } = await supabase
        .from("class_members")
        .delete()
        .eq("class_id", req.params.id)
        .eq("siswa_id", req.user.id);

    if (error) return res.status(500).json({ message: "Gagal keluar dari kelas" });

    res.json({ message: "Berhasil keluar dari kelas" });
});

// =============================================
// GET daftar siswa di kelas (guru only, harus pemilik)
// =============================================
router.get("/:id/members", auth, role(["guru"]), async (req, res) => {
    const { id } = req.params;

    const { data: kelas } = await supabase
        .from("classes")
        .select("id")
        .eq("id", id)
        .eq("guru_id", req.user.id)
        .single();

    if (!kelas) return res.status(403).json({ message: "Bukan kelasmu" });

    const { data, error } = await supabase
        .from("class_members")
        .select(`
            joined_at,
            profiles!class_members_siswa_id_fkey (id, name, avatar)
        `)
        .eq("class_id", id)
        .order("joined_at", { ascending: true });

    if (error) return res.status(500).json({ message: "Server error" });

    const members = data.map((d) => ({ ...d.profiles, joined_at: d.joined_at }));
    res.json(members);
});

// =============================================
// GET rekap nilai 1 kelas — semua tugas & kuis + nilai tiap siswa
// (guru only, harus pemilik kelas)
// =============================================
router.get("/:id/nilai", auth, role(["guru"]), async (req, res) => {
    const { id } = req.params;

    const { data: kelas } = await supabase
        .from("classes")
        .select("id, name, subject")
        .eq("id", id)
        .eq("guru_id", req.user.id)
        .single();

    if (!kelas) return res.status(403).json({ message: "Bukan kelasmu" });

    try {
        // ---- Rekap Tugas ----
        const { data: assignments } = await supabase
            .from("assignments")
            .select("id, title, description, deadline, max_score, created_at")
            .eq("class_id", id)
            .order("created_at", { ascending: false });

        const assignmentIds = (assignments || []).map((a) => a.id);
        let submissions = [];
        if (assignmentIds.length > 0) {
            const { data } = await supabase
                .from("assignment_submissions")
                .select("assignment_id, siswa_id, score, submitted_at, graded_at, profiles!assignment_submissions_siswa_id_fkey (id, name, avatar)")
                .in("assignment_id", assignmentIds);
            submissions = data || [];
        }

        const tugas = (assignments || []).map((a) => ({
            id: a.id,
            title: a.title,
            deadline: a.deadline,
            max_score: a.max_score,
            created_at: a.created_at,
            submissions: submissions
                .filter((s) => s.assignment_id === a.id)
                .map((s) => ({
                    siswa_id: s.siswa_id,
                    siswa_name: s.profiles?.name || "Siswa",
                    siswa_avatar: s.profiles?.avatar || null,
                    score: s.score,
                    submitted_at: s.submitted_at,
                    graded_at: s.graded_at,
                })),
        }));

        // ---- Rekap Kuis ----
        const { data: quizzes } = await supabase
            .from("quizzes")
            .select("id, title, duration_minutes, created_at")
            .eq("class_id", id)
            .order("created_at", { ascending: false });

        const quizIds = (quizzes || []).map((q) => q.id);
        let quizResults = [];
        if (quizIds.length > 0) {
            const { data } = await supabase
                .from("quiz_results")
                .select("quiz_id, siswa_id, score, correct, total, submitted_at, profiles!quiz_results_siswa_id_fkey (id, name, avatar)")
                .in("quiz_id", quizIds);
            quizResults = data || [];
        }

        const kuis = (quizzes || []).map((q) => ({
            id: q.id,
            title: q.title,
            created_at: q.created_at,
            results: quizResults
                .filter((r) => r.quiz_id === q.id)
                .map((r) => ({
                    siswa_id: r.siswa_id,
                    siswa_name: r.profiles?.name || "Siswa",
                    siswa_avatar: r.profiles?.avatar || null,
                    score: r.score,
                    correct: r.correct,
                    total: r.total,
                    submitted_at: r.submitted_at,
                })),
        }));

        res.json({ kelas: { id: kelas.id, name: kelas.name, subject: kelas.subject }, tugas, kuis });
    } catch (err) {
        console.error("Nilai error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// =============================================
// GET export rekap nilai 1 kelas ke Excel (.xlsx)
// (guru only, harus pemilik kelas)
// =============================================
router.get("/:id/nilai/export", auth, role(["guru"]), async (req, res) => {
    const { id } = req.params;

    const { data: kelas } = await supabase
        .from("classes")
        .select("id, name, subject")
        .eq("id", id)
        .eq("guru_id", req.user.id)
        .single();

    if (!kelas) return res.status(403).json({ message: "Bukan kelasmu" });

    try {
        const { data: assignments } = await supabase
            .from("assignments")
            .select("id, title, deadline, max_score, created_at")
            .eq("class_id", id)
            .order("created_at", { ascending: false });

        const assignmentIds = (assignments || []).map((a) => a.id);
        let submissions = [];
        if (assignmentIds.length > 0) {
            const { data } = await supabase
                .from("assignment_submissions")
                .select("assignment_id, siswa_id, score, submitted_at, profiles!assignment_submissions_siswa_id_fkey (name)")
                .in("assignment_id", assignmentIds);
            submissions = data || [];
        }

        const { data: quizzes } = await supabase
            .from("quizzes")
            .select("id, title, created_at")
            .eq("class_id", id)
            .order("created_at", { ascending: false });

        const quizIds = (quizzes || []).map((q) => q.id);
        let quizResults = [];
        if (quizIds.length > 0) {
            const { data } = await supabase
                .from("quiz_results")
                .select("quiz_id, siswa_id, score, correct, total, submitted_at, profiles!quiz_results_siswa_id_fkey (name)")
                .in("quiz_id", quizIds);
            quizResults = data || [];
        }

        const rows = [["Jenis", "Judul", "Dibuat Tanggal", "Nama Siswa", "Nilai", "Dikumpulkan / Dikerjakan"]];
        const fmtDate = (d) => d ? new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }) : "-";

        (assignments || []).forEach((a) => {
            const subs = submissions.filter((s) => s.assignment_id === a.id);
            if (subs.length === 0) {
                rows.push(["Tugas", a.title, fmtDate(a.created_at), "-", "-", "-"]);
            } else {
                subs.forEach((s) => {
                    rows.push(["Tugas", a.title, fmtDate(a.created_at), s.profiles?.name || "Siswa", s.score ?? "Belum dinilai", fmtDate(s.submitted_at)]);
                });
            }
        });

        (quizzes || []).forEach((q) => {
            const res_ = quizResults.filter((r) => r.quiz_id === q.id);
            if (res_.length === 0) {
                rows.push(["Kuis", q.title, fmtDate(q.created_at), "-", "-", "-"]);
            } else {
                res_.forEach((r) => {
                    rows.push(["Kuis", q.title, fmtDate(q.created_at), r.profiles?.name || "Siswa", `${r.score} (${r.correct}/${r.total} benar)`, fmtDate(r.submitted_at)]);
                });
            }
        });

        const fileName = `rekap-nilai-${kelas.name.replace(/\s+/g, "_")}.csv`;
        sendCsv(res, fileName, rows);
    } catch (err) {
        console.error("Export nilai error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;