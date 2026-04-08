const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const supabase = require("../db");
const auth = require("../middleware/auth");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") cb(null, true);
        else cb(new Error("Hanya file PDF yang diizinkan"));
    },
});

// GET semua materi pribadi siswa
router.get("/", auth, async (req, res) => {
    const { data, error } = await supabase
        .from("personal_materials")
        .select("*")
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ message: "Server error" });
    res.json(data.map((m) => ({ ...m, is_personal: true })));
});

// POST upload PDF pribadi
router.post("/", auth, (req, res) => {
    upload.single("file")(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: "File PDF wajib diupload" });

        const { title } = req.body;
        if (!title?.trim()) return res.status(400).json({ message: "Judul wajib diisi" });

        // Upload ke Supabase Storage
        const ext = path.extname(req.file.originalname);
        const fileName = `personal_${req.user.id}_${Date.now()}${ext}`;

        const { error: storageErr } = await supabase.storage
            .from("materials")
            .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

        if (storageErr) return res.status(500).json({ message: "Gagal upload file" });

        const { data: urlData } = supabase.storage.from("materials").getPublicUrl(fileName);

        const { data, error } = await supabase
            .from("personal_materials")
            .insert({
                user_id: req.user.id,
                title: title.trim(),
                file_url: urlData.publicUrl,
                type: "pdf",
            })
            .select().single();

        if (error) return res.status(500).json({ message: "Gagal simpan materi" });

        res.status(201).json({ message: "Materi berhasil disimpan", data: { ...data, is_personal: true } });
    });
});

// DELETE materi pribadi
router.delete("/:id", auth, async (req, res) => {
    const { data: existing } = await supabase
        .from("personal_materials")
        .select("id")
        .eq("id", req.params.id)
        .eq("user_id", req.user.id)
        .single();

    if (!existing) return res.status(404).json({ message: "Materi tidak ditemukan" });

    await supabase.from("personal_materials").delete().eq("id", req.params.id);
    res.json({ message: "Materi dihapus" });
});

module.exports = router;