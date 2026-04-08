const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const supabase = require("../db");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

async function uploadToStorage(file) {
    const ext = path.extname(file.originalname);
    const fileName = `submission_${Date.now()}${ext}`;
    const { error } = await supabase.storage
        .from("materials")
        .upload(fileName, file.buffer, { contentType: file.mimetype });
    if (error) throw new Error("Gagal upload file");
    const { data } = supabase.storage.from("materials").getPublicUrl(fileName);
    return data.publicUrl;
}

// GET semua tugas di kelas
router.get("/class/:classId", auth, async (req, res) => {
    const { classId } = req.params;
    const { id: userId, role: userRole } = req.user;

    const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("class_id", classId)
        .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ message: "Server error" });

    if (userRole === "siswa") {
        const { data: submissions } = await supabase
            .from("assignment_submissions")
            .select("assignment_id, score, submitted_at")
            .eq("siswa_id", userId);

        const submissionMap = {};
        (submissions || []).forEach((s) => { submissionMap[s.assignment_id] = s; });

        return res.json(data.map((a) => ({ ...a, submission: submissionMap[a.id] || null })));
    }

    // Guru: tambahkan jumlah submission per tugas
    const assignmentIds = data.map((a) => a.id);
    if (assignmentIds.length > 0) {
        const { data: counts } = await supabase
            .from("assignment_submissions")
            .select("assignment_id")
            .in("assignment_id", assignmentIds);

        const countMap = {};
        (counts || []).forEach((s) => {
            countMap[s.assignment_id] = (countMap[s.assignment_id] || 0) + 1;
        });

        return res.json(data.map((a) => ({ ...a, submission_count: countMap[a.id] || 0 })));
    }

    res.json(data);
});

// POST buat tugas baru (guru only)
router.post("/", auth, role(["guru"]), async (req, res) => {
    const { class_id, title, description, deadline, max_score } = req.body;

    if (!title || !class_id || !deadline) {
        return res.status(400).json({ message: "Judul, class_id, dan deadline wajib diisi" });
    }

    const { data: kelas } = await supabase
        .from("classes").select("id").eq("id", class_id).eq("guru_id", req.user.id).single();

    if (!kelas) return res.status(403).json({ message: "Bukan kelasmu" });

    const { data, error } = await supabase
        .from("assignments")
        .insert({ class_id, guru_id: req.user.id, title, description: description || null, deadline, max_score: max_score || 100 })
        .select().single();

    if (error) return res.status(500).json({ message: "Gagal buat tugas" });
    res.status(201).json({ message: "Tugas berhasil dibuat", data });
});

// DELETE tugas (guru only)
router.delete("/:id", auth, role(["guru"]), async (req, res) => {
    const { data: existing } = await supabase.from("assignments").select("id").eq("id", req.params.id).eq("guru_id", req.user.id).single();
    if (!existing) return res.status(404).json({ message: "Tugas tidak ditemukan" });
    const { error } = await supabase.from("assignments").delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ message: "Gagal hapus tugas" });
    res.json({ message: "Tugas berhasil dihapus" });
});

// POST submit tugas (siswa only)
router.post("/:id/submit", auth, role(["siswa"]), (req, res) => {
    upload.single("file")(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });

        const { note } = req.body;
        let file_url = null;

        if (req.file) {
            try { file_url = await uploadToStorage(req.file); }
            catch (e) { return res.status(500).json({ message: e.message }); }
        }

        if (!file_url && !note) return res.status(400).json({ message: "Upload file atau isi catatan dulu" });

        const { error } = await supabase.from("assignment_submissions").upsert({
            assignment_id: req.params.id,
            siswa_id: req.user.id,
            file_url,
            note: note || null,
            submitted_at: new Date().toISOString(),
        }, { onConflict: "assignment_id,siswa_id" });

        if (error) return res.status(500).json({ message: "Gagal submit tugas" });
        res.status(201).json({ message: "Tugas berhasil dikumpulkan" });
    });
});

// GET semua submission di satu tugas (guru only)
router.get("/:id/submissions", auth, role(["guru"]), async (req, res) => {
    const { data: assignment } = await supabase
        .from("assignments").select("id, guru_id, max_score, title")
        .eq("id", req.params.id).eq("guru_id", req.user.id).single();

    if (!assignment) return res.status(403).json({ message: "Bukan tugasmu" });

    const { data, error } = await supabase
        .from("assignment_submissions")
        .select(`*, profiles!assignment_submissions_siswa_id_fkey (id, name, avatar)`)
        .eq("assignment_id", req.params.id)
        .order("submitted_at", { ascending: false });

    if (error) return res.status(500).json({ message: "Server error" });

    res.json({
        assignment,
        submissions: data.map((s) => ({ ...s, siswa_name: s.profiles?.name, siswa_avatar: s.profiles?.avatar })),
    });
});

// PUT beri nilai (guru only)
router.put("/:id/submissions/:siswaId/grade", auth, role(["guru"]), async (req, res) => {
    const { score, feedback } = req.body;
    if (score === undefined) return res.status(400).json({ message: "Nilai wajib diisi" });

    const { data: assignment } = await supabase
        .from("assignments").select("id, max_score").eq("id", req.params.id).eq("guru_id", req.user.id).single();

    if (!assignment) return res.status(403).json({ message: "Bukan tugasmu" });
    if (score < 0 || score > assignment.max_score) return res.status(400).json({ message: `Nilai harus 0 - ${assignment.max_score}` });

    const { error } = await supabase.from("assignment_submissions")
        .update({ score, feedback: feedback || null, graded_at: new Date().toISOString() })
        .eq("assignment_id", req.params.id)
        .eq("siswa_id", req.params.siswaId);

    if (error) return res.status(500).json({ message: "Gagal beri nilai" });
    res.json({ message: "Nilai berhasil diberikan" });
});

module.exports = router;