import { useState } from "react";
import { X, Upload, Sparkles, PenLine, FileText, ChevronRight, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// =============================================
// Step 1: Pilih metode
// =============================================
function StepPilihMetode({ onPilih, onClose }) {
    const options = [
        {
            id: "pdf",
            icon: <FileText className="w-8 h-8 text-blue-600" />,
            bg: "bg-blue-50",
            border: "border-blue-100 hover:border-blue-300",
            title: "Convert PDF ke Kuis",
            desc: "Upload file PDF materi, AI akan otomatis buat soal dari isinya",
            badge: "AI Powered",
            badgeColor: "bg-blue-100 text-blue-700",
        },
        {
            id: "ai",
            icon: <Sparkles className="w-8 h-8 text-purple-600" />,
            bg: "bg-purple-50",
            border: "border-purple-100 hover:border-purple-300",
            title: "Minta AI Buatkan Kuis",
            desc: "Ketik topik dan jumlah soal, AI generate soal otomatis",
            badge: "AI Powered",
            badgeColor: "bg-purple-100 text-purple-700",
        },
        {
            id: "manual",
            icon: <PenLine className="w-8 h-8 text-emerald-600" />,
            bg: "bg-emerald-50",
            border: "border-emerald-100 hover:border-emerald-300",
            title: "Buat Sendiri",
            desc: "Tulis soal secara manual sesuai kebutuhan kamu",
            badge: "Manual",
            badgeColor: "bg-emerald-100 text-emerald-700",
        },
    ];

    return (
        <div className="p-8">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-black text-slate-800">Buat Kuis Baru</h2>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-slate-400 text-sm mb-8">Pilih cara membuat kuis untuk siswamu</p>

            <div className="space-y-4">
                {options.map((opt) => (
                    <button key={opt.id} onClick={() => onPilih(opt.id)}
                        className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 ${opt.border} transition-all group text-left`}>
                        <div className={`w-16 h-16 ${opt.bg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                            {opt.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-black text-slate-800">{opt.title}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${opt.badgeColor}`}>{opt.badge}</span>
                            </div>
                            <p className="text-sm text-slate-500">{opt.desc}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                    </button>
                ))}
            </div>
        </div>
    );
}

// =============================================
// Step 2a: PDF to Quiz — Coming Soon
// =============================================
function StepPDF({ onBack, onClose }) {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">←</button>
                <div>
                    <h2 className="text-xl font-black text-slate-800">Convert PDF ke Kuis</h2>
                    <p className="text-slate-400 text-sm">Fitur dalam pengembangan</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors ml-auto"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-5">
                    <span className="text-4xl">🚧</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Coming Soon!</h3>
                <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                    Fitur Convert PDF ke Kuis sedang dalam pengembangan dan akan segera hadir.
                </p>
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3">
                    <p className="text-blue-600 text-sm font-bold">
                        Sementara, coba gunakan fitur AI Generate ✨
                    </p>
                </div>
                <button onClick={onBack}
                    className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all">
                    Kembali ke Pilihan
                </button>
            </div>
        </div>
    );
}


// =============================================
// Step 2b: AI Generate
// =============================================
function StepAI({ classId, onBack, onClose, onSuccess }) {
    const [topic, setTopic] = useState("");
    const [jumlah, setJumlah] = useState(5);
    const [kesulitan, setKesulitan] = useState("sedang");
    const [mapel, setMapel] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState(30);
    const [saving, setSaving] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return setError("Topik wajib diisi");
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${API_URL}/api/quizzes/ai-generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ topic, jumlah_soal: jumlah, tingkat_kesulitan: kesulitan, mata_pelajaran: mapel }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            setPreview(result.questions);
            setTitle(`Kuis: ${topic}`);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!title.trim() || !preview?.length) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/quizzes`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ class_id: classId, title, duration_minutes: duration, questions: preview }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            onSuccess();
        } catch (err) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">←</button>
                <div>
                    <h2 className="text-xl font-black text-slate-800">AI Buatkan Kuis</h2>
                    <p className="text-slate-400 text-sm">Ketik topik, AI generate soal otomatis</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors ml-auto"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold flex items-center gap-2 border border-red-100"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

            {!preview ? (
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Topik Kuis *</label>
                        <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                            placeholder="Contoh: Fotosintesis, Persamaan Linear, Revolusi Prancis..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-purple-400 text-slate-800 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Mata Pelajaran <span className="text-slate-400 font-normal">(opsional)</span></label>
                        <input type="text" value={mapel} onChange={(e) => setMapel(e.target.value)}
                            placeholder="Contoh: Biologi, Matematika, Sejarah..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-purple-400 text-slate-800 text-sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Jumlah Soal</label>
                            <select value={jumlah} onChange={(e) => setJumlah(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-purple-400 text-slate-800 text-sm">
                                {[3, 5, 8, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Kesulitan</label>
                            <select value={kesulitan} onChange={(e) => setKesulitan(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-purple-400 text-slate-800 text-sm">
                                <option value="mudah">Mudah</option>
                                <option value="sedang">Sedang</option>
                                <option value="sulit">Sulit</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Durasi (mnt)</label>
                            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min={1}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-purple-400 text-slate-800 text-sm" />
                        </div>
                    </div>

                    <button onClick={handleGenerate} disabled={loading || !topic.trim()}
                        className="w-full py-3.5 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />AI sedang membuat soal...</> : <><Sparkles className="w-4 h-4" />Generate Soal</>}
                    </button>
                </div>
            ) : (
                <PreviewSoal questions={preview} title={title} duration={duration}
                    onTitleChange={setTitle} onDurationChange={setDuration}
                    onQuestionsChange={setPreview} onSave={handleSave} saving={saving} />
            )}
        </div>
    );
}

// =============================================
// Step 2c: Manual
// =============================================
function StepManual({ classId, onBack, onClose, onSuccess }) {
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState(30);
    const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""], answer: 0 }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const addQuestion = () => setQuestions([...questions, { question: "", options: ["", "", "", ""], answer: 0 }]);
    const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));
    const updateQ = (idx, field, val) => { const u = [...questions]; u[idx][field] = val; setQuestions(u); };
    const updateOpt = (qIdx, oIdx, val) => { const u = [...questions]; u[qIdx].options[oIdx] = val; setQuestions(u); };

    const handleSave = async () => {
        if (!title.trim()) return setError("Judul wajib diisi");
        if (questions.some(q => !q.question.trim() || q.options.some(o => !o.trim()))) return setError("Semua soal dan opsi harus diisi");
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/quizzes`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ class_id: classId, title, duration_minutes: duration, questions }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            onSuccess();
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">←</button>
                <div>
                    <h2 className="text-xl font-black text-slate-800">Buat Kuis Manual</h2>
                    <p className="text-slate-400 text-sm">Tulis soal sendiri sesuai kebutuhan</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors ml-auto"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold flex items-center gap-2 border border-red-100"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Judul Kuis *</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul kuis..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-emerald-400 text-slate-800 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Durasi (menit)</label>
                        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min={1}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-emerald-400 text-slate-800 text-sm" />
                    </div>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {questions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Soal {qIdx + 1}</span>
                                {questions.length > 1 && <button onClick={() => removeQuestion(qIdx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
                            </div>
                            <input type="text" placeholder="Tulis pertanyaan..." value={q.question} onChange={(e) => updateQ(qIdx, "question", e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-emerald-400 text-slate-800 text-sm" />
                            <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-2">
                                        <input type="radio" name={`ans-${qIdx}`} checked={q.answer === oIdx} onChange={() => updateQ(qIdx, "answer", oIdx)} className="accent-emerald-600 shrink-0" />
                                        <input type="text" placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}`} value={opt} onChange={(e) => updateOpt(qIdx, oIdx, e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 outline-none focus:border-emerald-400 text-slate-800 text-xs" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400">● Klik radio untuk tandai jawaban benar</p>
                        </div>
                    ))}
                </div>

                <button onClick={addQuestion} className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition-all font-bold text-sm flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Tambah Soal
                </button>

                <button onClick={handleSave} disabled={loading}
                    className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Menyimpan...</> : "Simpan Kuis"}
                </button>
            </div>
        </div>
    );
}

// =============================================
// Preview soal dari AI (bisa edit sebelum simpan)
// =============================================
function PreviewSoal({ questions, title, duration, onTitleChange, onDurationChange, onQuestionsChange, onSave, saving }) {
    const updateQ = (idx, field, val) => {
        const u = [...questions]; u[idx][field] = val; onQuestionsChange(u);
    };
    const updateOpt = (qIdx, oIdx, val) => {
        const u = [...questions]; u[qIdx].options[oIdx] = val; onQuestionsChange(u);
    };

    return (
        <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm font-bold text-emerald-700">{questions.length} soal berhasil digenerate! Cek dan edit jika perlu.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">Judul Kuis</label>
                    <input type="text" value={title} onChange={(e) => onTitleChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-blue-400 text-slate-800 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">Durasi (mnt)</label>
                    <input type="number" value={duration} onChange={(e) => onDurationChange(e.target.value)} min={1}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-blue-400 text-slate-800 text-sm" />
                </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {questions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Soal {qIdx + 1}</span>
                        <input type="text" value={q.question} onChange={(e) => updateQ(qIdx, "question", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-blue-400 text-slate-800 text-sm" />
                        <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                    <input type="radio" name={`prev-${qIdx}`} checked={q.answer === oIdx} onChange={() => updateQ(qIdx, "answer", oIdx)} className="accent-blue-600 shrink-0" />
                                    <input type="text" value={opt} onChange={(e) => updateOpt(qIdx, oIdx, e.target.value)}
                                        className={`w-full bg-white border rounded-xl py-2 px-3 outline-none text-slate-800 text-xs ${q.answer === oIdx ? "border-blue-300 bg-blue-50" : "border-slate-200"}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={onSave} disabled={saving}
                className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Menyimpan...</> : "Simpan Kuis"}
            </button>
        </div>
    );
}

// =============================================
// Main Modal
// =============================================
export default function ModalPilihBuatKuis({ classId, onClose, onSuccess }) {
    const [step, setStep] = useState("pilih"); // pilih | pdf | ai | manual

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto">
                {step === "pilih" && <StepPilihMetode onPilih={setStep} onClose={onClose} />}
                {step === "pdf"   && <StepPDF classId={classId} onBack={() => setStep("pilih")} onClose={onClose} onSuccess={onSuccess} />}
                {step === "ai"    && <StepAI classId={classId} onBack={() => setStep("pilih")} onClose={onClose} onSuccess={onSuccess} />}
                {step === "manual"&& <StepManual classId={classId} onBack={() => setStep("pilih")} onClose={onClose} onSuccess={onSuccess} />}
            </div>
        </div>
    );
}