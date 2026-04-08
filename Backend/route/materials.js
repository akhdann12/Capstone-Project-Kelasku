const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const supabase = require("../db");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            "application/pdf",
            "video/mp4",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "image/jpeg",
            "image/png",
            "image/webp",
        ];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Format file tidak didukung (PDF, Video, Word, PPTX, atau Gambar)"));
    },
});

// Helper: upload file ke Supabase Storage
async function uploadToStorage(file) {
    const ext = path.extname(file.originalname);
    const fileName = `materi_${Date.now()}${ext}`;

    const { error } = await supabase.storage
        .from("materials")
        .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error("Gagal upload file ke storage");

    const { data } = supabase.storage.from("materials").getPublicUrl(fileName);
    return data.publicUrl;
}

// Helper: cek apakah siswa adalah member di kelas tertentu
async function isMember(classId, siswaId) {
    const { data } = await supabase
        .from("class_members")
        .select("id")
        .eq("class_id", classId)
        .eq("siswa_id", siswaId)
        .single();
    return !!data;
}

// =============================================
// GET semua materi di satu kelas
// Guru: hanya miliknya | Siswa: semua (kalau sudah join)
// =============================================
router.get("/class/:classId", auth, async (req, res) => {
    const { classId } = req.params;
    const { id: userId, role: userRole } = req.user;

    if (userRole === "siswa") {
        const member = await isMember(classId, userId);
        if (!member) return res.status(403).json({ message: "Kamu belum join kelas ini" });
    }

    let query = supabase
        .from("materials")
        .select("*, profiles!materials_guru_id_fkey (name)")
        .eq("class_id", classId)
        .order("order", { ascending: true });

    if (userRole === "guru") query = query.eq("guru_id", userId);

    const { data, error } = await query;
    if (error) return res.status(500).json({ message: "Server error" });

    res.json(data.map((m) => ({ ...m, guru_name: m.profiles?.name })));
});

// =============================================
// GET detail satu materi
// =============================================
router.get("/:id", auth, async (req, res) => {
    const { id: userId, role: userRole } = req.user;

    let query = supabase
        .from("materials")
        .select("*, profiles!materials_guru_id_fkey (name)")
        .eq("id", req.params.id);

    if (userRole === "guru") query = query.eq("guru_id", userId);

    const { data: material, error } = await query.single();

    if (error || !material) {
        return res.status(404).json({ message: "Materi tidak ditemukan atau tidak diperbolehkan" });
    }

    if (userRole === "siswa") {
        const member = await isMember(material.class_id, userId);
        if (!member) return res.status(403).json({ message: "Kamu belum join kelas ini" });
    }

    res.json({ ...material, guru_name: material.profiles?.name });
});

// =============================================
// POST upload materi baru (guru only)
// =============================================
router.post("/", auth, role(["guru"]), (req, res) => {
    upload.single("file")(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `File terlalu besar: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { class_id, title, description, type, order } = req.body;
        const guru_id = req.user.id;

        if (!title) return res.status(400).json({ message: "Judul materi wajib diisi" });
        if (!class_id) return res.status(400).json({ message: "class_id wajib diisi" });

        // Validasi: kelas harus ada dan milik guru ini
        const { data: kelas } = await supabase
            .from("classes")
            .select("id")
            .eq("id", class_id)
            .eq("guru_id", guru_id)
            .single();

        if (!kelas) return res.status(404).json({ message: "Kelas tidak ditemukan atau bukan kelasmu" });

        let file_url = null;
        if (req.file) {
            try {
                file_url = await uploadToStorage(req.file);
            } catch (e) {
                return res.status(500).json({ message: e.message });
            }
        }

        const { data, error } = await supabase
            .from("materials")
            .insert({
                class_id,
                guru_id,
                title,
                description: description || null,
                file_url,
                type: type || "pdf",
                order: order ? parseInt(order) : 0,
            })
            .select()
            .single();

        if (error) {
            console.error("Insert material error:", error);
            return res.status(500).json({ message: "Gagal simpan materi" });
        }

        res.status(201).json({ message: "Materi berhasil diupload", data });
    });
});

// =============================================
// PUT edit materi (guru only, harus pemilik)
// =============================================
router.put("/:id", auth, role(["guru"]), (req, res) => {
    upload.single("file")(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });

        const { data: existing } = await supabase
            .from("materials")
            .select("*")
            .eq("id", req.params.id)
            .eq("guru_id", req.user.id)
            .single();

        if (!existing) return res.status(404).json({ message: "Materi tidak ditemukan" });

        let file_url = existing.file_url;
        if (req.file) {
            try {
                file_url = await uploadToStorage(req.file);
            } catch (e) {
                return res.status(500).json({ message: e.message });
            }
        }

        const { title, description, type, order } = req.body;

        const { error } = await supabase
            .from("materials")
            .update({
                title: title || existing.title,
                description: description || existing.description,
                file_url,
                type: type || existing.type,
                order: order !== undefined ? parseInt(order) : existing.order,
            })
            .eq("id", req.params.id);

        if (error) return res.status(500).json({ message: "Gagal update materi" });

        res.json({ message: "Materi berhasil diupdate" });
    });
});

// =============================================
// DELETE materi (guru only, harus pemilik)
// =============================================
router.delete("/:id", auth, role(["guru"]), async (req, res) => {
    const { data: existing } = await supabase
        .from("materials")
        .select("id")
        .eq("id", req.params.id)
        .eq("guru_id", req.user.id)
        .single();

    if (!existing) return res.status(404).json({ message: "Materi tidak ditemukan" });

    const { error } = await supabase.from("materials").delete().eq("id", req.params.id);

    if (error) return res.status(500).json({ message: "Gagal hapus materi" });

    res.json({ message: "Materi berhasil dihapus" });
});

// =============================================
// PUT tandai materi selesai (siswa only)
// =============================================
router.put("/:id/done", auth, role(["siswa"]), async (req, res) => {
    const { error } = await supabase.from("material_progress").upsert(
        {
            siswa_id: req.user.id,
            material_id: req.params.id,
            is_done: true,
            done_at: new Date().toISOString(),
        },
        { onConflict: "siswa_id,material_id" }
    );

    if (error) return res.status(500).json({ message: "Gagal update progres" });

    res.json({ message: "Materi ditandai selesai" });
});

module.exports = router;