import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy, ChevronRight, Star } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// Format waktu mm:ss
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Warna avatar otomatis
const AVATAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500"];

export default function QuizPlayer({ quiz, onClose, onFinish }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [timeLeft, setTimeLeft] = useState((quiz.duration_minutes || 30) * 60);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [result, setResult] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [user] = useState(() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } });

    const questions = quiz.questions || [];
    const currentQ = questions[currentIdx];
    const totalQ = questions.length;

    // Timer
    useEffect(() => {
        if (finished || timeLeft <= 0) {
            if (timeLeft <= 0 && !finished) handleSubmit(answers);
            return;
        }
        const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [finished, timeLeft]);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/quizzes/${quiz.id}/leaderboard`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (res.ok) setLeaderboard(await res.json());
        } catch {}
    }, [quiz.id]);

    const handleSubmit = async (finalAnswers) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/quizzes/${quiz.id}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ answers: finalAnswers }),
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data);
                setFinished(true);
                fetchLeaderboard();
            }
        } catch (err) { console.error(err); }
        finally { setSubmitting(false); }
    };

    const handleSelectOption = (oIdx) => {
        if (showFeedback) return;
        setSelectedOption(oIdx);
        const correct = oIdx === currentQ.answer;
        setIsCorrect(correct);
        setShowFeedback(true);

        const newAnswers = { ...answers, [currentIdx]: oIdx };
        setAnswers(newAnswers);

        if (correct) {
            setCorrectCount((c) => c + 1);
            setScore((s) => s + Math.round(100 / totalQ));
        }
    };

    const handleNext = () => {
        if (currentIdx < totalQ - 1) {
            setCurrentIdx((i) => i + 1);
            setSelectedOption(null);
            setShowFeedback(false);
            setIsCorrect(false);
        } else {
            handleSubmit({ ...answers });
        }
    };

    const timePercent = (timeLeft / ((quiz.duration_minutes || 30) * 60)) * 100;
    const isTimeLow = timeLeft < 60;

    // ===== TAMPILAN HASIL =====
    if (finished && result) {
        const myRank = leaderboard.findIndex((l) => l.siswa_id === user.id) + 1;

        return (
            <div className="fixed inset-0 bg-slate-100 z-[200] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4">
                    <button onClick={onFinish} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <h1 className="font-black text-slate-800">{quiz.title}</h1>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Skor */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Skor Kamu</p>
                            <p className="text-slate-500 text-sm mb-6">
                                {result.score >= 80 ? "Luar biasa! 🎉" : result.score >= 60 ? "Bagus! 👍" : "Tetap semangat! 💪"}
                            </p>

                            {/* Circle score */}
                            <div className="relative w-36 h-36 mb-6">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
                                    <circle cx="72" cy="72" r="60" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                    <circle cx="72" cy="72" r="60" fill="none" stroke="#2563eb" strokeWidth="12"
                                        strokeDasharray={`${2 * Math.PI * 60}`}
                                        strokeDashoffset={`${2 * Math.PI * 60 * (1 - result.score / 100)}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-blue-600">{result.score}</span>
                                    <span className="text-xs text-slate-400 font-bold">POINTS</span>
                                </div>
                            </div>

                            <div className="w-full space-y-3">
                                <div className="flex items-center justify-between bg-emerald-50 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                        <CheckCircle className="w-5 h-5" /> Benar
                                    </div>
                                    <span className="font-black text-emerald-700">{result.correct}</span>
                                </div>
                                <div className="flex items-center justify-between bg-red-50 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                                        <XCircle className="w-5 h-5" /> Salah
                                    </div>
                                    <span className="font-black text-red-600">{result.total - result.correct}</span>
                                </div>
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-5">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <h3 className="font-black text-slate-800">Peringkat Kelas</h3>
                            </div>

                            {leaderboard.length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-6">Belum ada data leaderboard</p>
                            ) : (
                                <div className="space-y-3">
                                    {leaderboard.slice(0, 5).map((l, i) => {
                                        const isMe = l.siswa_id === user.id;
                                        return (
                                            <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl ${isMe ? "bg-blue-50 border border-blue-100" : "bg-slate-50"}`}>
                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${i === 0 ? "bg-yellow-400 text-white" : i === 1 ? "bg-slate-300 text-white" : i === 2 ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-500"}`}>
                                                    {i + 1}
                                                </span>
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                                                    {l.avatar ? <img src={l.avatar} alt="" className="w-full h-full object-cover rounded-xl" /> : l.name?.[0]?.toUpperCase()}
                                                </div>
                                                <span className={`flex-1 text-sm font-bold truncate ${isMe ? "text-blue-700" : "text-slate-700"}`}>
                                                    {isMe ? "Kamu" : l.name}
                                                </span>
                                                <span className={`text-sm font-black shrink-0 ${isMe ? "text-blue-600" : "text-slate-600"}`}>{l.score} pts</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <button onClick={onFinish}
                                className="w-full mt-5 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all">
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ===== TAMPILAN SOAL =====
    return (
        <div className="fixed inset-0 bg-slate-100 z-[200] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="flex-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{quiz.title}</p>
                    </div>
                    {/* Timer */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm ${isTimeLow ? "bg-red-50 text-red-600 animate-pulse" : "bg-slate-50 text-slate-600"}`}>
                        <Clock className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
                {/* Progress bar */}
                <div className="max-w-5xl mx-auto mt-3">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${((currentIdx) / totalQ) * 100}%` }} />
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Soal */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Question header */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                    Question {currentIdx + 1} of {totalQ}
                                </span>
                                <div className={`flex items-center gap-1.5 text-sm font-black px-3 py-1.5 rounded-xl ${isTimeLow ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-500"}`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                            <p className="text-lg font-bold text-slate-800 leading-relaxed">{currentQ?.question}</p>
                        </div>

                        {/* Opsi jawaban */}
                        <div className="space-y-3">
                            {currentQ?.options.map((opt, oIdx) => {
                                let style = "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/30";
                                let prefix = "bg-slate-100 text-slate-500";

                                if (showFeedback) {
                                    if (oIdx === currentQ.answer) {
                                        style = "bg-emerald-50 border-emerald-300 text-emerald-800";
                                        prefix = "bg-emerald-500 text-white";
                                    } else if (oIdx === selectedOption && oIdx !== currentQ.answer) {
                                        style = "bg-red-50 border-red-300 text-red-800";
                                        prefix = "bg-red-400 text-white";
                                    } else {
                                        style = "bg-white border-slate-100 text-slate-400 opacity-60";
                                    }
                                } else if (selectedOption === oIdx) {
                                    style = "bg-blue-50 border-blue-400 text-blue-800";
                                    prefix = "bg-blue-500 text-white";
                                }

                                return (
                                    <button key={oIdx} onClick={() => handleSelectOption(oIdx)}
                                        disabled={showFeedback}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${style} ${!showFeedback ? "cursor-pointer" : "cursor-default"}`}>
                                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${prefix}`}>
                                            {String.fromCharCode(65 + oIdx)}
                                        </span>
                                        <span className="font-medium">{opt}</span>
                                        {showFeedback && oIdx === currentQ.answer && (
                                            <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />
                                        )}
                                        {showFeedback && oIdx === selectedOption && oIdx !== currentQ.answer && (
                                            <XCircle className="w-5 h-5 text-red-400 ml-auto shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Feedback + Tombol Lanjut */}
                        {showFeedback && (
                            <div className={`rounded-2xl p-4 flex items-center justify-between ${isCorrect ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}`}>
                                <div>
                                    <p className={`font-black text-base ${isCorrect ? "text-emerald-700" : "text-red-600"}`}>
                                        {isCorrect ? "Keren banget! Jawaban kamu benar!" : "Sayang sekali, jawaban kurang tepat."}
                                    </p>
                                    {isCorrect && <p className="text-emerald-600 text-sm mt-0.5">Kamu baru saja mendapatkan +{Math.round(100 / totalQ)} XP!</p>}
                                </div>
                                <button onClick={handleNext}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all ${isCorrect ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                                    {currentIdx < totalQ - 1 ? "LANJUT" : "SELESAI"} <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar kanan */}
                    <div className="space-y-4">
                        {/* Skor real-time */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Skor Kamu</p>
                            <p className="text-slate-400 text-xs mb-4">Hebat, skor mu sempurna</p>

                            <div className="relative w-28 h-28 mx-auto mb-4">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
                                    <circle cx="56" cy="56" r="46" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                    <circle cx="56" cy="56" r="46" fill="none" stroke="#2563eb" strokeWidth="10"
                                        strokeDasharray={`${2 * Math.PI * 46}`}
                                        strokeDashoffset={`${2 * Math.PI * 46 * (1 - score / 100)}`}
                                        strokeLinecap="round" className="transition-all duration-500" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black text-blue-600">{score}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">POINTS</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-3 py-2">
                                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                                        <CheckCircle className="w-4 h-4" /> Benar
                                    </div>
                                    <span className="font-black text-emerald-700">{correctCount}</span>
                                </div>
                                <div className="flex items-center justify-between bg-red-50 rounded-xl px-3 py-2">
                                    <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
                                        <XCircle className="w-4 h-4" /> Salah
                                    </div>
                                    <span className="font-black text-red-500">{currentIdx + (showFeedback ? 1 : 0) - correctCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Peringkat Kelas (real-time setelah submit) */}
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <p className="text-sm font-black text-slate-700">Peringkat Kelas</p>
                            </div>
                            {leaderboard.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-2">Belum ada data</p>
                            ) : (
                                <div className="space-y-2">
                                    {leaderboard.slice(0, 3).map((l, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                                                {l.name?.[0]?.toUpperCase()}
                                            </div>
                                            <span className="flex-1 text-xs font-bold text-slate-700 truncate">{l.name}</span>
                                            <span className="text-xs font-black text-blue-600 shrink-0">{l.score} pts</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {leaderboard.length > 0 && (
                                <button className="w-full mt-3 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors py-1">
                                    LIHAT SEMUA
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}