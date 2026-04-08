const express = require("express");
const router = express.Router();
const supabase = require("../db");
const auth = require("../middleware/auth");

// =============================================
// Helper: Hitung total XP siswa
// =============================================
async function hitungXP(siswaId) {
    const { data: quizResults } = await supabase
        .from("quiz_results").select("score").eq("siswa_id", siswaId);

    const { data: tugasResults } = await supabase
        .from("assignment_submissions")
        .select("score, assignments!inner(max_score)")
        .eq("siswa_id", siswaId)
        .not("score", "is", null);

    let xp = 0;
    (quizResults || []).forEach((r) => { xp += r.score || 0; });
    (tugasResults || []).forEach((r) => {
        const maxScore = r.assignments?.max_score || 100;
        xp += Math.round(((r.score || 0) / maxScore) * 100);
    });
    return xp;
}

// =============================================
// GET stats siswa — XP, ranking per kelas, streak, progres
// =============================================
router.get("/stats", auth, async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        if (userRole === "guru") {
            // ====== STATS GURU ======
            const { data: kelasList } = await supabase
                .from("classes").select("id, name, subject").eq("guru_id", userId);

            const classIds = (kelasList || []).map((k) => k.id);

            // Total siswa di semua kelas guru
            let totalSiswa = 0;
            if (classIds.length > 0) {
                const { count } = await supabase
                    .from("class_members").select("id", { count: "exact", head: true })
                    .in("class_id", classIds);
                totalSiswa = count || 0;
            }

            // Total materi yang diupload guru
            const { count: totalMateri } = await supabase
                .from("materials").select("id", { count: "exact", head: true })
                .eq("guru_id", userId);

            // Total tugas yang dibuat guru
            const { count: totalTugas } = await supabase
                .from("assignments").select("id", { count: "exact", head: true })
                .eq("guru_id", userId);

            // Total kuis yang dibuat guru
            const { count: totalKuis } = await supabase
                .from("quizzes").select("id", { count: "exact", head: true })
                .eq("guru_id", userId);

            // Streak guru
            const { data: streakData } = await supabase
                .from("user_streaks").select("streak_count")
                .eq("user_id", userId).maybeSingle();

            return res.json({
                role: "guru",
                total_kelas: (kelasList || []).length,
                total_siswa: totalSiswa,
                total_materi: totalMateri || 0,
                total_tugas: totalTugas || 0,
                total_kuis: totalKuis || 0,
                streak: streakData?.streak_count || 0,
            });
        }

        // ====== STATS SISWA ======
        const { data: memberships } = await supabase
            .from("class_members")
            .select("class_id, classes(id, name, subject)")
            .eq("siswa_id", userId);

        const myXP = await hitungXP(userId);

        // Ranking per kelas (cari kelas mana siswa paling tinggi rankingnya)
        const rankingPerKelas = [];

        for (const m of (memberships || [])) {
            const classId = m.class_id;
            const className = m.classes?.name || "Kelas";

            // Ambil semua siswa di kelas ini
            const { data: members } = await supabase
                .from("class_members").select("siswa_id").eq("class_id", classId);

            const siswaIds = (members || []).map((x) => x.siswa_id);
            const xpList = await Promise.all(
                siswaIds.map(async (id) => ({ id, xp: await hitungXP(id) }))
            );
            xpList.sort((a, b) => b.xp - a.xp);
            const myRank = xpList.findIndex((x) => x.id === userId) + 1;

            rankingPerKelas.push({
                class_id: classId,
                class_name: className,
                rank: myRank,
                total_siswa: siswaIds.length,
            });
        }

        // Ambil ranking terbaik untuk ditampilkan di hero
        const bestRanking = rankingPerKelas.sort((a, b) => a.rank - b.rank)[0] || null;

        // Materi selesai
        const { data: materiSelesai } = await supabase
            .from("material_progress").select("id")
            .eq("siswa_id", userId).eq("is_done", true);

        // Streak
        const { data: streakData } = await supabase
            .from("user_streaks").select("streak_count")
            .eq("user_id", userId).maybeSingle();

        return res.json({
            role: "siswa",
            xp: myXP,
            best_ranking: bestRanking,      // { class_name, rank, total_siswa }
            all_rankings: rankingPerKelas,   // semua ranking per kelas
            materi_selesai: (materiSelesai || []).length,
            streak: streakData?.streak_count || 0,
        });

    } catch (err) {
        console.error("Stats error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// =============================================
// POST update streak login
// =============================================
router.post("/streak", auth, async (req, res) => {
    const userId = req.user.id;
    const nowWIB = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const todayWIB = nowWIB.toISOString().split("T")[0];

    const { data: existing } = await supabase
        .from("user_streaks").select("*").eq("user_id", userId).maybeSingle();

    if (!existing) {
        await supabase.from("user_streaks").insert({ user_id: userId, streak_count: 1, last_login_date: todayWIB });
        return res.json({ streak: 1 });
    }

    if (existing.last_login_date === todayWIB) return res.json({ streak: existing.streak_count });

    const yesterdayWIB = new Date(nowWIB);
    yesterdayWIB.setDate(yesterdayWIB.getDate() - 1);
    const yesterdayStr = yesterdayWIB.toISOString().split("T")[0];

    const newStreak = existing.last_login_date === yesterdayStr ? existing.streak_count + 1 : 1;
    await supabase.from("user_streaks").update({ streak_count: newStreak, last_login_date: todayWIB }).eq("user_id", userId);
    return res.json({ streak: newStreak });
});

// =============================================
// GET notifikasi siswa
// =============================================
router.get("/notifications", auth, async (req, res) => {
    const siswaId = req.user.id;
    try {
        const { data: memberships } = await supabase
            .from("class_members")
            .select("class_id, classes(id, name, subject)")
            .eq("siswa_id", siswaId);

        if (!memberships?.length) return res.json([]);

        const classIds = memberships.map((m) => m.class_id);
        const classMap = {};
        memberships.forEach((m) => { classMap[m.class_id] = m.classes; });

        const notifications = [];
        const now = new Date();

        // Tugas belum dikumpul
        const { data: assignments } = await supabase
            .from("assignments").select("id, title, deadline, class_id")
            .in("class_id", classIds).order("deadline", { ascending: true });

        const { data: submissions } = await supabase
            .from("assignment_submissions").select("assignment_id").eq("siswa_id", siswaId);

        const submittedIds = new Set((submissions || []).map((s) => s.assignment_id));

        (assignments || []).forEach((a) => {
            if (submittedIds.has(a.id)) return;
            const deadline = new Date(a.deadline);
            const diffHours = (deadline - now) / 3600000;
            const isOverdue = diffHours < 0;
            const isUrgent = diffHours >= 0 && diffHours < 48;

            notifications.push({
                id: `assignment-${a.id}`,
                type: "assignment",
                title: a.title,
                class_name: classMap[a.class_id]?.name,
                deadline: a.deadline,
                is_overdue: isOverdue,
                is_urgent: isUrgent,
                label: isOverdue ? "Terlambat" : isUrgent ? "Mepet!" : "Tugas",
                color: isOverdue ? "red" : isUrgent ? "orange" : "blue",
            });
        });

        // Kuis belum dikerjakan
        const { data: quizzes } = await supabase
            .from("quizzes").select("id, title, class_id, created_at")
            .in("class_id", classIds).order("created_at", { ascending: false });

        const { data: quizResults } = await supabase
            .from("quiz_results").select("quiz_id").eq("siswa_id", siswaId);

        const doneQuizIds = new Set((quizResults || []).map((r) => r.quiz_id));

        (quizzes || []).forEach((q) => {
            if (doneQuizIds.has(q.id)) return;
            notifications.push({
                id: `quiz-${q.id}`,
                type: "quiz",
                title: q.title,
                class_name: classMap[q.class_id]?.name,
                label: "Kuis Baru",
                color: "purple",
            });
        });

        notifications.sort((a, b) => {
            if (a.is_overdue && !b.is_overdue) return -1;
            if (!a.is_overdue && b.is_overdue) return 1;
            if (a.is_urgent && !b.is_urgent) return -1;
            return 0;
        });

        res.json(notifications);
    } catch (err) {
        console.error("Notifications error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// =============================================
// POST tandai materi selesai (siswa)
// =============================================
router.post("/material-done/:materialId", auth, async (req, res) => {
    const { materialId } = req.params;
    const siswaId = req.user.id;

    const { error } = await supabase.from("material_progress").upsert({
        siswa_id: siswaId,
        material_id: materialId,
        is_done: true,
        done_at: new Date().toISOString(),
    }, { onConflict: "siswa_id,material_id" });

    if (error) return res.status(500).json({ message: "Gagal tandai selesai" });
    res.json({ message: "Materi ditandai selesai" });
});

// =============================================
// GET semua materi yang sudah selesai oleh siswa
// =============================================
router.get("/done-materials", auth, async (req, res) => {
    const { data, error } = await supabase
        .from("material_progress")
        .select("material_id, done_at")
        .eq("siswa_id", req.user.id)
        .eq("is_done", true);

    if (error) return res.status(500).json({ message: "Server error" });
    res.json(data || []);
});

module.exports = router;