const express = require("express");
const router = express.Router();
const supabase = require("../db");
const auth = require("../middleware/auth");

// GET komentar berdasarkan target (materi atau tugas)
router.get("/:type/:id", auth, async (req, res) => {
    const { type, id } = req.params;

    if (!["material", "assignment"].includes(type)) {
        return res.status(400).json({ message: "Tipe tidak valid" });
    }

    const { data, error } = await supabase
        .from("comments")
        .select(`
            *,
            profiles!comments_user_id_fkey (id, name, avatar, role)
        `)
        .eq("target_type", type)
        .eq("target_id", id)
        .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ message: "Server error" });

    // Susun komentar jadi tree (parent + replies)
    const map = {};
    const roots = [];

    data.forEach((c) => {
        map[c.id] = {
            ...c,
            user_name: c.profiles?.name,
            user_avatar: c.profiles?.avatar,
            user_role: c.profiles?.role,
            replies: [],
        };
    });

    data.forEach((c) => {
        if (c.parent_id) {
            map[c.parent_id]?.replies.push(map[c.id]);
        } else {
            roots.push(map[c.id]);
        }
    });

    res.json(roots);
});

// POST buat komentar baru
router.post("/", auth, async (req, res) => {
    const { target_type, target_id, content, parent_id } = req.body;

    if (!target_type || !target_id || !content?.trim()) {
        return res.status(400).json({ message: "target_type, target_id, dan content wajib diisi" });
    }

    if (!["material", "assignment"].includes(target_type)) {
        return res.status(400).json({ message: "Tipe tidak valid" });
    }

    const { data, error } = await supabase
        .from("comments")
        .insert({
            target_type,
            target_id,
            user_id: req.user.id,
            parent_id: parent_id || null,
            content: content.trim(),
        })
        .select(`*, profiles!comments_user_id_fkey (id, name, avatar, role)`)
        .single();

    if (error) return res.status(500).json({ message: "Gagal kirim komentar" });

    res.status(201).json({
        ...data,
        user_name: data.profiles?.name,
        user_avatar: data.profiles?.avatar,
        user_role: data.profiles?.role,
        replies: [],
    });
});

// DELETE komentar (hanya pemilik komentar)
router.delete("/:id", auth, async (req, res) => {
    const { data: comment } = await supabase
        .from("comments")
        .select("id, user_id")
        .eq("id", req.params.id)
        .single();

    if (!comment) return res.status(404).json({ message: "Komentar tidak ditemukan" });
    if (comment.user_id !== req.user.id) return res.status(403).json({ message: "Bukan komentarmu" });

    const { error } = await supabase.from("comments").delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ message: "Gagal hapus komentar" });

    res.json({ message: "Komentar dihapus" });
});

module.exports = router;