const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const supabase = require("../db");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

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

module.exports = router;