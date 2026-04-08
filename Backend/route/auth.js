const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const supabase = require("../db");
const auth = require("../middleware/auth");

// Avatar disimpan di memori dulu, lalu upload ke Supabase Storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Format foto harus JPG, PNG, atau WebP"));
    },
});

// =============================================
// REGISTER
// =============================================
router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    if (!["siswa", "guru"].includes(role)) {
        return res.status(400).json({ message: "Role tidak valid" });
    }

    // Pakai anon key agar email verifikasi terkirim otomatis
    const { createClient } = require("@supabase/supabase-js");
    const supabaseAnon = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    const { data, error } = await supabaseAnon.auth.signUp({
        email,
        password,
        options: {
            data: { name, role },
            emailRedirectTo: `${process.env.FRONTEND_URL}`,
        },
    });

    if (error) {
        if (error.message.includes("already registered") || error.message.includes("User already registered")) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }
        console.error("Register error:", error);
        return res.status(500).json({ message: "Gagal register: " + error.message });
    }

    // Simpan profile ke tabel profiles (akan diupdate lagi setelah verifikasi)
    if (data.user) {
        const { error: profileErr } = await supabase.from("profiles").upsert({
            id: data.user.id,
            name,
            role,
        });
        if (profileErr) console.error("Profile insert error:", profileErr);
    }

    res.status(201).json({
        message: "Register berhasil! Cek email kamu untuk verifikasi akun sebelum login.",
    });
});

// =============================================
// LOGIN
// =============================================
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        if (error.message.includes("Email not confirmed")) {
            return res.status(403).json({
                message: "Email belum diverifikasi. Cek inbox kamu!",
            });
        }
        return res.status(400).json({ message: "Email atau password salah" });
    }

const userId = data.user.id;

const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

const name = profile?.name || data.user.user_metadata?.name || "User";
const role = profile?.role || data.user.user_metadata?.role || "siswa";

if (!profile) {
    await supabase.from("profiles").upsert({
            id: userId,
            name,
            role,
        });
    }

    res.json({
        message: "Login berhasil",
        token: data.session.access_token,
        user: {
            id: userId,
            email: data.user.email,
            name,
            role,
            avatar: profile?.avatar || null,
            phone: profile?.phone || null,
            bio: profile?.bio || null,
            gender: profile?.gender || null,
            birth_date: profile?.birth_date || null,
        },
    });
});

// =============================================
// GET PROFILE
// =============================================
router.get("/profile", auth, async (req, res) => {
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", req.user.id)
        .maybeSingle();

    if (error || !profile) {
        return res.status(404).json({ message: "Profil tidak ditemukan" });
    }

    res.json({
        id: req.user.id,
        email: req.user.email,
        ...profile,
    });
});

// =============================================
// UPDATE PROFILE
// =============================================
router.put("/profile", auth, (req, res) => {
    upload.single("avatar")(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });

        const { name, phone, bio, gender, birth_date } = req.body;
        let avatarUrl = null;

        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const fileName = `avatar_${req.user.id}_${Date.now()}${ext}`;

            const { error: storageErr } = await supabase.storage
                .from("avatars")
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true,
                });

            if (storageErr) {
                return res.status(500).json({ message: "Gagal upload avatar" });
            }

            const { data: urlData } = supabase.storage
                .from("avatars")
                .getPublicUrl(fileName);

            avatarUrl = urlData.publicUrl;
        }

        const updateData = {
            name: name || undefined,
            phone: phone || null,
            bio: bio || null,
            gender: gender || null,
            birth_date: birth_date || null,
        };

        if (avatarUrl) updateData.avatar = avatarUrl;

        const { error: updateErr } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", req.user.id);

        if (updateErr) {
            return res.status(500).json({ message: "Gagal update profil" });
        }

        const { data: updated } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", req.user.id)
            .maybeSingle();

        res.json({
            message: "Profil berhasil diperbarui",
            user: { id: req.user.id, email: req.user.email, ...updated },
        });
    });
});

// =============================================
// FORGOT PASSWORD
// =============================================
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email wajib diisi" });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ message: "Gagal mengirim email reset" });
    }

    res.json({ message: "Link reset password telah dikirim ke email kamu" });
});

module.exports = router;