const express = require("express");
const router = express.Router();
const multer = require("multer");
const Groq = require("groq-sdk");
const supabase = require("../db");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper: parse JSON dari response AI
function parseJSON(text) {
    const clean = text.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Format AI tidak valid");
    return JSON.parse(match[0]);
}

// Helper: generate soal via Groq
async function generateWithGroq(prompt) {
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 3000,
    });
    return completion.choices[0].message.content;
}

// Helper: ekstrak teks dari PDF buffer tanpa library eksternal
function extractTextFromPDF(buffer) {
    const str = buffer.toString("binary");
    const results = [];

    // Cari semua blok teks dalam PDF (BT...ET)
    let i = 0;
    while (i < str.length) {
        const btIdx = str.indexOf("BT", i);
        if (btIdx === -1) break;
        const etIdx = str.indexOf("ET", btIdx);
        if (etIdx === -1) break;

        const block = str.slice(btIdx, etIdx);

        // Ambil semua string dalam tanda kurung (...)Tj atau [...] TJ
        let j = 0;
        while (j < block.length) {
            if (block[j] === "(") {
                let end = j + 1;
                let text = "";
                while (end < block.length && block[end] !== ")") {
                    if (block[end] === "\\" && end + 1 < block.length) {
                        end++; // skip escape
                    }
                    text += block[end];
                    end++;
                }
                if (text.trim()) results.push(text.trim());
                j = end + 1;
            } else {
                j++;
            }
        }
        i = etIdx + 2;
    }

    return results.join(" ").replace(/\s+/g, " ").trim();
}

// GET semua kuis di kelas
router.get("/class/:classId", auth, async (req, res) => {
    const { data, error } = await supabase
        .from("quizzes").select("*").eq("class_id", req.params.classId)
        .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ message: "Server error" });
    res.json(data);
});

// GET leaderboard kuis
router.get("/:id/leaderboard", auth, async (req, res) => {
    const { data, error } = await supabase
        .from("quiz_results")
        .select("score, correct, total, submitted_at, profiles!quiz_results_siswa_id_fkey (id, name, avatar)")
        .eq("quiz_id", req.params.id)
        .order("score", { ascending: false })
        .limit(10);
    if (error) return res.status(500).json({ message: "Server error" });
    res.json(data.map((r, i) => ({
        rank: i + 1,
        name: r.profiles?.name,
        avatar: r.profiles?.avatar,
        siswa_id: r.profiles?.id,
        score: r.score,
        correct: r.correct,
        total: r.total,
    })));
});

// GET cek status siswa sudah kerjakan atau belum
router.get("/:id/status", auth, async (req, res) => {
    const { data } = await supabase
        .from("quiz_results")
        .select("id, score, correct, total, submitted_at")
        .eq("quiz_id", req.params.id)
        .eq("siswa_id", req.user.id)
        .maybeSingle();
    res.json({ already_done: !!data, result: data || null });
});

// POST buat kuis manual (guru only)
router.post("/", auth, role(["guru"]), async (req, res) => {
    const { class_id, title, duration_minutes, questions } = req.body;
    if (!title || !class_id || !questions?.length)
        return res.status(400).json({ message: "Judul, class_id, dan soal wajib diisi" });

    const { data: kelas } = await supabase.from("classes").select("id")
        .eq("id", class_id).eq("guru_id", req.user.id).single();
    if (!kelas) return res.status(403).json({ message: "Bukan kelasmu" });

    const { data, error } = await supabase.from("quizzes")
        .insert({ class_id, guru_id: req.user.id, title, duration_minutes: duration_minutes || 30, questions })
        .select().single();

    if (error) return res.status(500).json({ message: "Gagal buat kuis" });
    res.status(201).json({ message: "Kuis berhasil dibuat", data });
});

// POST generate kuis via Groq AI (guru only)
router.post("/ai-generate", auth, role(["guru"]), async (req, res) => {
    const { topic, jumlah_soal = 5, tingkat_kesulitan = "sedang", mata_pelajaran } = req.body;
    if (!topic) return res.status(400).json({ message: "Topik wajib diisi" });

    try {
        const prompt = `Buatkan ${jumlah_soal} soal kuis pilihan ganda dalam Bahasa Indonesia tentang topik: "${topic}"${mata_pelajaran ? ` untuk mata pelajaran ${mata_pelajaran}` : ""}. Tingkat kesulitan: ${tingkat_kesulitan}.

Balas HANYA dengan JSON valid berikut, tanpa penjelasan apapun:
{
  "questions": [
    {
      "question": "Teks pertanyaan",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "answer": 0
    }
  ]
}

Aturan:
- "answer" adalah INDEX jawaban benar (0=A, 1=B, 2=C, 3=D)
- Tepat 4 opsi per soal
- Soal jelas, tidak ambigu, jawaban tersebar merata
- Bahasa Indonesia yang baik`;

        const text = await generateWithGroq(prompt);
        const parsed = parseJSON(text);
        if (!parsed.questions?.length) throw new Error("Soal tidak ditemukan");
        res.json({ questions: parsed.questions });
    } catch (err) {
        console.error("AI generate error:", err.message);
        res.status(500).json({ message: "Gagal generate soal: " + err.message });
    }
});

// POST generate kuis dari PDF via Groq (guru only)
router.post("/pdf-generate", auth, role(["guru"]), (req, res) => {
    upload.single("pdf")(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: "File PDF wajib diupload" });

        const jumlah_soal = parseInt(req.body.jumlah_soal) || 5;

        try {
            const pdfText = extractTextFromPDF(req.file.buffer);

            if (!pdfText || pdfText.length < 50) {
                return res.status(400).json({
                    message: "PDF tidak bisa dibaca atau isinya kosong. Pastikan PDF bukan hasil scan gambar."
                });
            }

            const truncatedText = pdfText.length > 8000 ? pdfText.substring(0, 8000) + "..." : pdfText;

            const prompt = `Berikut adalah isi dokumen:

---
${truncatedText}
---

Dari dokumen di atas, buatkan ${jumlah_soal} soal kuis pilihan ganda dalam Bahasa Indonesia.

Balas HANYA dengan JSON valid berikut, tanpa penjelasan apapun:
{
  "title": "Judul kuis singkat berdasarkan topik dokumen",
  "questions": [
    {
      "question": "Teks pertanyaan",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "answer": 0
    }
  ]
}

Aturan:
- "answer" adalah INDEX jawaban benar (0=A, 1=B, 2=C, 3=D)
- Soal HARUS berdasarkan isi dokumen
- Tepat 4 opsi per soal
- Bahasa Indonesia yang baik`;

            const text = await generateWithGroq(prompt);
            const parsed = parseJSON(text);
            if (!parsed.questions?.length) throw new Error("Soal tidak ditemukan");

            res.json({ title: parsed.title || "Kuis dari PDF", questions: parsed.questions });
        } catch (err) {
            console.error("PDF generate error:", err.message);
            res.status(500).json({ message: "Gagal generate dari PDF: " + err.message });
        }
    });
});

// POST submit jawaban kuis (siswa only) - hanya 1x
router.post("/:id/submit", auth, role(["siswa"]), async (req, res) => {
    const { answers } = req.body;
    const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", req.params.id).single();
    if (!quiz) return res.status(404).json({ message: "Kuis tidak ditemukan" });

    // Cek sudah dikerjakan sebelumnya
    const { data: existing } = await supabase
        .from("quiz_results")
        .select("id, score")
        .eq("quiz_id", req.params.id)
        .eq("siswa_id", req.user.id)
        .maybeSingle();

    if (existing) {
        return res.status(400).json({
            message: "Kamu sudah pernah mengerjakan kuis ini",
            already_done: true,
            score: existing.score
        });
    }

    const questions = quiz.questions || [];
    let correct = 0;
    questions.forEach((q, idx) => {
        if (answers[idx] !== undefined && parseInt(answers[idx]) === q.answer) correct++;
    });
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

    await supabase.from("quiz_results").insert({
        quiz_id: req.params.id,
        siswa_id: req.user.id,
        answers, score, correct,
        total: questions.length,
        submitted_at: new Date().toISOString(),
    });

    res.json({ message: "Kuis berhasil dikerjakan", score, correct, total: questions.length });
});

// DELETE kuis (guru only)
router.delete("/:id", auth, role(["guru"]), async (req, res) => {
    const { data: existing } = await supabase.from("quizzes").select("id")
        .eq("id", req.params.id).eq("guru_id", req.user.id).single();
    if (!existing) return res.status(404).json({ message: "Kuis tidak ditemukan" });
    const { error } = await supabase.from("quizzes").delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ message: "Gagal hapus kuis" });
    res.json({ message: "Kuis berhasil dihapus" });
});

module.exports = router;