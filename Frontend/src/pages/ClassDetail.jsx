import { useState, useEffect, useCallback } from "react";
import { User, LogOut, Upload, Plus, X, ArrowLeft, BookOpen, ClipboardList, HelpCircle, Users, Copy, Check, FileText, Video, AlertCircle, CheckCircle2, Clock, Calendar, Star, ExternalLink, Lock } from "lucide-react";
import EditProfileModal from "../components/EditProfileModal";
import CommentSection from "../components/CommentSection";
import ModalPilihBuatKuis from "../components/ModalPilihBuatKuis";
import QuizPlayer from "../components/QuizPlayer";

const API_URL = import.meta.env.VITE_API_URL;

// =============================================
// Modal Upload Materi
// =============================================
function ModalUploadMateri({ classId, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else setDragActive(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(e.target);
        formData.append("class_id", classId);
        if (file) formData.set("file", file);
        try {
            const res = await fetch(`${API_URL}/api/materials`, {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: formData,
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            setSuccess(true);
            setTimeout(() => { onSuccess(); onClose(); }, 1500);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div><h2 className="text-2xl font-black text-slate-800 mb-1">Upload Materi</h2><p className="text-slate-500 text-sm">Bagikan materi baru ke siswamu</p></div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600"><X /></button>
                    </div>
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-sm font-bold flex items-center gap-3 border border-red-100"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
                    {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-4 text-sm font-bold flex items-center gap-3 border border-emerald-100"><CheckCircle2 className="w-5 h-5 shrink-0" />Materi berhasil diupload!</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Judul Materi</label>
                            <input type="text" name="title" placeholder="Contoh: Bab 1 - Pengenalan" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">Tipe</label>
                                <select name="type" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800">
                                    <option value="pdf">📄 PDF</option>
                                    <option value="video">🎥 Video</option>
                                    <option value="doc">📝 Dokumen</option>
                                    <option value="pptx">📊 Presentasi</option>
                                    <option value="image">🖼️ Gambar</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">Urutan</label>
                                <input type="number" name="order" defaultValue={1} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Deskripsi <span className="text-slate-400 font-normal">(opsional)</span></label>
                            <textarea name="description" rows={2} placeholder="Deskripsi singkat..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 resize-none" />
                        </div>
                        <div className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-white"}`}
                            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag}
                            onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
                            onClick={() => document.getElementById("materi-file-input").click()}>
                            <input id="materi-file-input" type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                            {file ? (
                                <div><p className="font-bold text-slate-800 text-sm">{file.name}</p><p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-2 text-xs text-red-500 font-bold hover:underline">Hapus</button></div>
                            ) : (<><Upload className="w-8 h-8 text-slate-300 mb-2" /><p className="text-sm font-bold text-slate-500">Klik atau seret file ke sini</p><p className="text-xs text-slate-400">PDF, Video, Word, PPTX, Gambar (maks 10MB)</p></>)}
                        </div>
                        <button type="submit" disabled={loading || success} className={`w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 ${(loading || success) ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Mengupload...</> : success ? "Berhasil!" : <><Upload className="w-4 h-4" />Upload Materi</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// =============================================
// Modal Buat Tugas
// =============================================
function ModalBuatTugas({ classId, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(e.target);
        try {
            const res = await fetch(`${API_URL}/api/assignments`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ class_id: classId, title: formData.get("title"), description: formData.get("description"), deadline: formData.get("deadline"), max_score: parseInt(formData.get("max_score")) || 100 }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            setSuccess(true);
            setTimeout(() => { onSuccess(); onClose(); }, 1500);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div><h2 className="text-2xl font-black text-slate-800 mb-1">Buat Tugas</h2><p className="text-slate-500 text-sm">Beri tugas untuk siswamu</p></div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600"><X /></button>
                    </div>
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-sm font-bold flex items-center gap-3 border border-red-100"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
                    {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-4 text-sm font-bold flex items-center gap-3 border border-emerald-100"><CheckCircle2 className="w-5 h-5 shrink-0" />Tugas berhasil dibuat!</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Judul Tugas</label>
                            <input type="text" name="title" placeholder="Contoh: Latihan Soal Bab 1" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" required /></div>
                        <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Deskripsi / Instruksi</label>
                            <textarea name="description" rows={3} placeholder="Jelaskan instruksi tugas di sini..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 resize-none" required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Deadline</label>
                                <input type="datetime-local" name="deadline" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" required /></div>
                            <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Nilai Maks</label>
                                <input type="number" name="max_score" defaultValue={100} min={1} max={1000} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" /></div>
                        </div>
                        <button type="submit" disabled={loading || success} className={`w-full py-3.5 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 ${(loading || success) ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Membuat...</> : success ? "Berhasil!" : <><ClipboardList className="w-4 h-4" />Buat Tugas</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// =============================================
// Modal Buat Kuis
// =============================================
function ModalBuatKuis({ classId, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""], answer: 0 }]);

    const addQuestion = () => setQuestions([...questions, { question: "", options: ["", "", "", ""], answer: 0 }]);
    const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));
    const updateQuestion = (idx, field, value) => { const u = [...questions]; u[idx][field] = value; setQuestions(u); };
    const updateOption = (qIdx, oIdx, value) => { const u = [...questions]; u[qIdx].options[oIdx] = value; setQuestions(u); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/quizzes`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ class_id: classId, title: e.target.title.value, duration_minutes: parseInt(e.target.duration.value) || 30, questions }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            setSuccess(true);
            setTimeout(() => { onSuccess(); onClose(); }, 1500);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div><h2 className="text-2xl font-black text-slate-800 mb-1">Buat Kuis</h2><p className="text-slate-500 text-sm">Buat soal pilihan ganda untuk siswamu</p></div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600"><X /></button>
                    </div>
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-sm font-bold flex items-center gap-3 border border-red-100"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
                    {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-4 text-sm font-bold flex items-center gap-3 border border-emerald-100"><CheckCircle2 className="w-5 h-5 shrink-0" />Kuis berhasil dibuat!</div>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Judul Kuis</label>
                                <input type="text" name="title" placeholder="Contoh: Kuis Bab 1" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" required /></div>
                            <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Durasi (menit)</label>
                                <input type="number" name="duration" defaultValue={30} min={1} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800" /></div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700">Soal ({questions.length} pertanyaan)</label>
                                <button type="button" onClick={addQuestion} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-4 h-4" />Tambah Soal</button>
                            </div>
                            {questions.map((q, qIdx) => (
                                <div key={qIdx} className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Soal {qIdx + 1}</span>
                                        {questions.length > 1 && <button type="button" onClick={() => removeQuestion(qIdx)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>}
                                    </div>
                                    <input type="text" placeholder="Tulis pertanyaan di sini..." value={q.question} onChange={(e) => updateQuestion(qIdx, "question", e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500 transition-all text-slate-800 text-sm" required />
                                    <div className="grid grid-cols-2 gap-2">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2">
                                                <input type="radio" name={`answer-${qIdx}`} checked={q.answer === oIdx} onChange={() => updateQuestion(qIdx, "answer", oIdx)} className="accent-blue-600 shrink-0" title="Jawaban benar" />
                                                <input type="text" placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}`} value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 outline-none focus:border-blue-500 transition-all text-slate-800 text-sm" required />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400">● Klik radio button untuk menandai jawaban yang benar</p>
                                </div>
                            ))}
                        </div>
                        <button type="submit" disabled={loading || success} className={`w-full py-3.5 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 ${(loading || success) ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Membuat...</> : success ? "Berhasil!" : <><HelpCircle className="w-4 h-4" />Buat Kuis</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// =============================================
// Modal Submit Tugas (Siswa) — dengan lock jika sudah dinilai
// =============================================
function ModalSubmitTugas({ assignment, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [file, setFile] = useState(null);

    const isGraded = assignment.submission?.score !== null && assignment.submission?.score !== undefined;
    const isOverdue = assignment.deadline && new Date(assignment.deadline) < new Date();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isGraded) return;
        setLoading(true);
        setError(null);
        const formData = new FormData(e.target);
        if (file) formData.set("file", file);
        try {
            const res = await fetch(`${API_URL}/api/assignments/${assignment.id}/submit`, {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: formData,
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            setSuccess(true);
            setTimeout(() => { onSuccess(); onClose(); }, 1500);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                        <div><h2 className="text-2xl font-black text-slate-800 mb-1">Kumpulkan Tugas</h2><p className="text-slate-500 text-sm truncate max-w-[250px]">{assignment.title}</p></div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600"><X /></button>
                    </div>

                    {/* LOCKED — sudah dinilai */}
                    {isGraded && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-4 flex flex-col items-center text-center">
                            <Lock className="w-8 h-8 text-emerald-500 mb-2" />
                            <p className="font-black text-emerald-700 text-lg">Tugas Sudah Dinilai</p>
                            <p className="text-emerald-600 text-sm mt-1">Nilaimu: <strong>{assignment.submission.score}</strong> / {assignment.max_score}</p>
                            <p className="text-emerald-500 text-xs mt-2">Tugas tidak dapat diedit setelah dinilai guru.</p>
                            {assignment.submission.feedback && (
                                <div className="mt-3 bg-white border border-emerald-100 rounded-xl p-3 w-full text-left">
                                    <p className="text-xs font-bold text-slate-500 mb-1">Feedback Guru:</p>
                                    <p className="text-sm text-slate-700">{assignment.submission.feedback}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {!isGraded && isOverdue && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold flex items-center gap-2 border border-red-100">
                            <AlertCircle className="w-4 h-4 shrink-0" /> Deadline sudah lewat, tapi kamu masih bisa mengumpulkan
                        </div>
                    )}

                    <div className="bg-slate-50 rounded-2xl p-4 mb-4 space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instruksi</p>
                        <p className="text-sm text-slate-700">{assignment.description}</p>
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Deadline: {new Date(assignment.deadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                    </div>

                    {!isGraded && (
                        <>
                            {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-sm font-bold flex items-center gap-3 border border-red-100"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
                            {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-4 text-sm font-bold flex items-center gap-3 border border-emerald-100"><CheckCircle2 className="w-5 h-5 shrink-0" />Tugas berhasil dikumpulkan!</div>}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">File Tugas <span className="text-slate-400 font-normal">(opsional)</span></label>
                                    <label className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-5 px-4 flex flex-col items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                                        <Upload className="w-6 h-6 text-slate-300 mb-1" />
                                        <span className="text-sm font-bold text-slate-500">{file ? file.name : "Klik untuk pilih file"}</span>
                                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                                    </label>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">Catatan <span className="text-slate-400 font-normal">(opsional)</span></label>
                                    <textarea name="note" rows={3} placeholder="Tulis catatan atau jawaban singkat..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 resize-none" />
                                </div>
                                <button type="submit" disabled={loading || success} className={`w-full py-3.5 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 ${(loading || success) ? "opacity-50 cursor-not-allowed" : ""}`}>
                                    {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Mengumpulkan...</> : success ? "Terkumpul!" : <><CheckCircle2 className="w-4 h-4" />Kumpulkan Tugas</>}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// =============================================
// Modal Lihat Submissions (Guru)
// =============================================
function ModalSubmissions({ assignment, onClose }) {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gradingId, setGradingId] = useState(null);
    const [gradeData, setGradeData] = useState({});
    const [savingId, setSavingId] = useState(null);
    const [successId, setSuccessId] = useState(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            const res = await fetch(`${API_URL}/api/assignments/${assignment.id}/submissions`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data.submissions || []);
            }
            setLoading(false);
        };
        fetchSubmissions();
    }, [assignment.id]);

    const handleGrade = async (siswaId) => {
        setSavingId(siswaId);
        try {
            const res = await fetch(`${API_URL}/api/assignments/${assignment.id}/submissions/${siswaId}/grade`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ score: parseInt(gradeData[siswaId]?.score), feedback: gradeData[siswaId]?.feedback }),
            });
            if (res.ok) {
                setSuccessId(siswaId);
                setGradingId(null);
                setSubmissions((prev) => prev.map((s) => s.siswa_id === siswaId ? { ...s, score: parseInt(gradeData[siswaId]?.score), feedback: gradeData[siswaId]?.feedback } : s));
                setTimeout(() => setSuccessId(null), 2000);
            }
        } finally { setSavingId(null); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-2">
                        <div><h2 className="text-2xl font-black text-slate-800 mb-1">Hasil Pengumpulan</h2><p className="text-slate-500 text-sm">{assignment.title}</p></div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600"><X /></button>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-sm font-bold text-slate-500">Terkumpul: <span className="text-blue-600">{submissions.length}</span> siswa</span>
                        <span className="text-sm font-bold text-slate-500">Nilai maks: <span className="text-slate-700">{assignment.max_score}</span></span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-12">
                            <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="font-bold text-slate-500">Belum ada yang mengumpulkan</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {submissions.map((s) => (
                                <div key={s.siswa_id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {s.siswa_avatar ? <img src={s.siswa_avatar} alt={s.siswa_name} className="w-full h-full object-cover" /> : "👤"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{s.siswa_name}</p>
                                                <p className="text-xs text-slate-400">Dikumpulkan: {new Date(s.submitted_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {s.score !== null && s.score !== undefined ? (
                                                <span className={`text-sm font-black px-3 py-1 rounded-xl ${s.score >= 70 ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}>
                                                    {s.score}/{assignment.max_score}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold bg-slate-100 text-slate-400 px-3 py-1 rounded-xl">Belum dinilai</span>
                                            )}
                                            {successId === s.siswa_id && <Check className="w-5 h-5 text-emerald-500" />}
                                        </div>
                                    </div>

                                    {/* File & Note */}
                                    <div className="mt-3 flex items-center gap-3">
                                        {s.file_url && (
                                            <a href={s.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl">
                                                <ExternalLink className="w-3 h-3" /> Lihat File
                                            </a>
                                        )}
                                        {s.note && <p className="text-xs text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-xl">{s.note}</p>}
                                    </div>

                                    {/* Grading */}
                                    {gradingId === s.siswa_id ? (
                                        <div className="mt-3 space-y-2">
                                            <div className="flex gap-2">
                                                <input type="number" min={0} max={assignment.max_score} placeholder={`Nilai (0-${assignment.max_score})`}
                                                    value={gradeData[s.siswa_id]?.score || ""}
                                                    onChange={(e) => setGradeData({ ...gradeData, [s.siswa_id]: { ...gradeData[s.siswa_id], score: e.target.value } })}
                                                    className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 outline-none focus:border-blue-500 text-sm" />
                                                <button onClick={() => handleGrade(s.siswa_id)} disabled={savingId === s.siswa_id}
                                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                                                    {savingId === s.siswa_id ? "..." : "Simpan"}
                                                </button>
                                                <button onClick={() => setGradingId(null)} className="px-3 py-2 bg-slate-100 text-slate-500 text-sm font-bold rounded-xl hover:bg-slate-200"><X className="w-4 h-4" /></button>
                                            </div>
                                            <textarea placeholder="Feedback (opsional)" value={gradeData[s.siswa_id]?.feedback || ""}
                                                onChange={(e) => setGradeData({ ...gradeData, [s.siswa_id]: { ...gradeData[s.siswa_id], feedback: e.target.value } })}
                                                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 outline-none focus:border-blue-500 text-sm resize-none" rows={2} />
                                        </div>
                                    ) : (
                                        <button onClick={() => { setGradingId(s.siswa_id); setGradeData({ ...gradeData, [s.siswa_id]: { score: s.score || "", feedback: s.feedback || "" } }); }}
                                            className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                            <Star className="w-3 h-3" /> {s.score !== null && s.score !== undefined ? "Ubah Nilai" : "Beri Nilai"}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// =============================================
// Modal Kerjakan Kuis (Siswa)
// =============================================
function ModalKerjakanKuis({ quiz, onClose }) {
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/quizzes/${quiz.id}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ answers }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setResult(data);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={!result ? onClose : undefined} />
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    {result ? (
                        <div className="flex flex-col items-center text-center py-4">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${result.score >= 70 ? "bg-emerald-100" : "bg-orange-100"}`}>
                                <span className={`text-4xl font-black ${result.score >= 70 ? "text-emerald-600" : "text-orange-600"}`}>{result.score}</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2">{result.score >= 70 ? "Luar Biasa! 🎉" : "Tetap Semangat! 💪"}</h2>
                            <p className="text-slate-500 mb-2">Nilai kamu: <strong>{result.score}/100</strong></p>
                            <p className="text-slate-400 text-sm mb-8">Benar: {result.correct} dari {result.total} soal</p>
                            <button onClick={onClose} className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700">Selesai</button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-6">
                                <div><h2 className="text-2xl font-black text-slate-800 mb-1">{quiz.title}</h2>
                                    <p className="text-slate-500 text-sm flex items-center gap-1"><Clock className="w-4 h-4" />{quiz.duration_minutes} menit • {quiz.questions?.length} soal</p></div>
                                <button onClick={onClose} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600"><X /></button>
                            </div>
                            {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-sm font-bold flex items-center gap-3 border border-red-100"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {quiz.questions?.map((q, qIdx) => (
                                    <div key={qIdx} className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                                        <p className="font-bold text-slate-800 text-sm">{qIdx + 1}. {q.question}</p>
                                        <div className="space-y-2">
                                            {q.options.map((opt, oIdx) => (
                                                <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${answers[qIdx] === oIdx ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-100 hover:border-blue-100"}`}>
                                                    <input type="radio" name={`q-${qIdx}`} onChange={() => setAnswers({ ...answers, [qIdx]: oIdx })} className="accent-blue-600" />
                                                    <span className="text-sm font-medium">{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button type="submit" disabled={loading} className={`w-full py-3.5 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/25 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                                    {loading ? "Mengirim..." : "Submit Kuis"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// =============================================
// Main Component
// =============================================
// =============================================
// QuizCard — kartu kuis dengan cek status siswa
// =============================================
function QuizCard({ quiz, isGuru, userId, onPlay, onLeaderboard }) {
    const [status, setStatus] = useState(null); // null = loading, {already_done, result}
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (isGuru) return;
        const check = async () => {
            try {
                const res = await fetch(`${API_URL}/api/quizzes/${quiz.id}/status`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                if (res.ok) setStatus(await res.json());
            } catch {}
        };
        check();
    }, [quiz.id, isGuru]);

    const alreadyDone = status?.already_done;
    const myScore = status?.result?.score;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-slate-800">{quiz.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{quiz.duration_minutes} menit</span>
                        <span className="text-xs text-slate-400">{quiz.questions?.length || 0} soal</span>
                    </div>

                    {/* Tombol untuk guru */}
                    {isGuru && (
                        <button onClick={onLeaderboard}
                            className="mt-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5">
                            🏆 Lihat Leaderboard
                        </button>
                    )}

                    {/* Tombol untuk siswa */}
                    {!isGuru && (
                        <div className="mt-3">
                            {alreadyDone ? (
                                <div className="flex items-center gap-2">
                                    <span className="bg-emerald-50 text-emerald-600 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Sudah dikerjakan • Nilai: {myScore}
                                    </span>
                                </div>
                            ) : (
                                <button onClick={onPlay}
                                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
                                    Kerjakan Kuis →
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// =============================================
// ModalLeaderboard — guru lihat leaderboard kuis
// =============================================
function ModalLeaderboard({ quiz, currentUserId, onClose }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(`${API_URL}/api/quizzes/${quiz.id}/leaderboard`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                if (res.ok) setLeaderboard(await res.json());
            } catch {}
            finally { setLoading(false); }
        };
        fetch_();
    }, [quiz.id]);

    const COLORS = ["bg-yellow-400", "bg-slate-300", "bg-orange-400"];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto">
                <div className="p-7">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-black text-slate-800">🏆 Leaderboard</h2>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">{quiz.title}</p>

                    {loading ? (
                        <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-4xl mb-3">📋</p>
                            <p className="font-bold text-slate-500">Belum ada siswa yang mengerjakan</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leaderboard.map((l, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl ${i < 3 ? "bg-purple-50 border border-purple-100" : "bg-slate-50"}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ${i < 3 ? COLORS[i] : "bg-slate-200 text-slate-500"}`}>
                                        {i + 1}
                                    </div>
                                    <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {l.avatar ? <img src={l.avatar} alt="" className="w-full h-full object-cover" /> : <span className="font-black text-purple-600 text-sm">{l.name?.[0]?.toUpperCase()}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm truncate">{l.name}</p>
                                        <p className="text-xs text-slate-400">{l.correct}/{l.total} benar</p>
                                    </div>
                                    <span className={`font-black text-sm shrink-0 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-400" : "text-purple-600"}`}>
                                        {l.score} pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// =============================================
export default function ClassDetail({ classId, onBack, onLogout }) {
    const [kelas, setKelas] = useState(null);
    const [members, setMembers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [activeTab, setActiveTab] = useState("materi");
    const [user, setUser] = useState({ name: "User", role: "siswa" });
    const [loading, setLoading] = useState(true);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Modals
    const [showUploadMateri, setShowUploadMateri] = useState(false);
    const [showBuatTugas, setShowBuatTugas] = useState(false);
    const [showBuatKuis, setShowBuatKuis] = useState(false);
    const [activeKuis, setActiveKuis] = useState(null);
    const [viewLeaderboard, setViewLeaderboard] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [submitTugas, setSubmitTugas] = useState(null);
    const [viewSubmissions, setViewSubmissions] = useState(null);
    const [doneIds, setDoneIds] = useState(new Set()); // ID materi selesai — persisten dari DB

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [kelasRes, materiRes, tugasRes, kuisRes] = await Promise.all([
                fetch(`${API_URL}/api/classes/${classId}`, { headers }),
                fetch(`${API_URL}/api/materials/class/${classId}`, { headers }),
                fetch(`${API_URL}/api/assignments/class/${classId}`, { headers }),
                fetch(`${API_URL}/api/quizzes/class/${classId}`, { headers }),
            ]);
            if (kelasRes.ok) setKelas(await kelasRes.json());
            if (materiRes.ok) setMaterials(await materiRes.json());
            if (tugasRes.ok) setAssignments(await tugasRes.json());
            if (kuisRes.ok) setQuizzes(await kuisRes.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [classId]);

    const fetchMembers = useCallback(async () => {
        const res = await fetch(`${API_URL}/api/classes/${classId}/members`, { headers });
        if (res.ok) setMembers(await res.json());
    }, [classId]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        if (user.role === "guru" && activeTab === "anggota") fetchMembers();
    }, [activeTab, user.role]);

    // Fetch materi yang sudah selesai dari DB (persisten, tidak reset)
    useEffect(() => {
        if (user.role === "siswa") {
            fetch(`${API_URL}/api/dashboard/done-materials`, { headers })
                .then((r) => r.json())
                .then((data) => setDoneIds(new Set(data.map((d) => d.material_id))))
                .catch(() => {});
        }
    }, [user.role]);

    const handleMarkDone = async (materialId) => {
        if (doneIds.has(materialId)) return;
        try {
            const res = await fetch(`${API_URL}/api/dashboard/material-done/${materialId}`, {
                method: "POST", headers
            });
            if (res.ok) setDoneIds((prev) => new Set([...prev, materialId]));
        } catch {}
    };

    const isGuru = user.role === "guru";

    // Tutup profile menu saat klik di luar
    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('.profile-menu-cd')) setShowProfileMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Hitung tugas yang belum dikumpulkan (untuk notif siswa)
    const tugasBelumSubmit = assignments.filter((a) => !a.submission).length;

    const formatDeadline = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
    };
    const isOverdue = (date) => date && new Date(date) < new Date();

    const copyKode = () => {
        if (kelas?.kode_kelas) { navigator.clipboard.writeText(kelas.kode_kelas); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    };

    const tabs = isGuru
        ? [
            { id: "materi", label: "Materi", icon: <BookOpen className="w-4 h-4" /> },
            { id: "tugas", label: "Tugas", icon: <ClipboardList className="w-4 h-4" />, badge: assignments.length },
            { id: "kuis", label: "Kuis", icon: <HelpCircle className="w-4 h-4" /> },
            { id: "anggota", label: "Anggota", icon: <Users className="w-4 h-4" /> },
        ]
        : [
            { id: "materi", label: "Materi", icon: <BookOpen className="w-4 h-4" /> },
            { id: "tugas", label: "Tugas", icon: <ClipboardList className="w-4 h-4" />, badge: tugasBelumSubmit > 0 ? tugasBelumSubmit : null },
            { id: "kuis", label: "Kuis", icon: <HelpCircle className="w-4 h-4" /> },
        ];

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 leading-tight">{kelas?.name || "Kelas"}</h1>
                            <p className="text-xs text-slate-400 font-medium">{kelas?.subject}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isGuru && kelas?.kode_kelas && (
                            <button onClick={copyKode} className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 px-4 py-2 rounded-xl transition-all">
                                <span className="text-sm font-black text-slate-700 tracking-widest">{kelas.kode_kelas}</span>
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                            </button>
                        )}
                        <div className="relative group">
                            <button className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center overflow-hidden hover:bg-blue-200 transition-colors">
                                {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : "👤"}
                            </button>
                            <div className="absolute top-full right-0 mt-2 bg-white shadow-2xl rounded-2xl p-2 hidden group-hover:block border border-slate-100 min-w-[180px] z-20">
                                <div className="px-3 py-2">
                                    <span className="block text-sm font-black text-slate-800 truncate">{user.name}</span>
                                    <span className="block text-xs text-slate-400 capitalize font-bold">{user.role}</span>
                                </div>
                                <hr className="my-1 border-slate-50" />
                                <button onClick={() => setIsEditProfileOpen(true)} className="w-full text-left px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2"><User className="w-4 h-4" />Edit Profil</button>
                                <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats (Guru) */}
                {isGuru && (
                    <div className="max-w-5xl mx-auto px-6 pb-3 flex items-center gap-6">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500"><Users className="w-4 h-4 text-blue-500" /><span><strong className="text-slate-800">{members.length > 0 ? members.length : "—"}</strong> siswa</span></div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500"><BookOpen className="w-4 h-4 text-emerald-500" /><span><strong className="text-slate-800">{materials.length}</strong> materi</span></div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500"><ClipboardList className="w-4 h-4 text-orange-500" /><span><strong className="text-slate-800">{assignments.length}</strong> tugas</span></div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500"><HelpCircle className="w-4 h-4 text-purple-500" /><span><strong className="text-slate-800">{quizzes.length}</strong> kuis</span></div>
                    </div>
                )}

                {/* Notif siswa ada tugas belum dikumpul */}
                {!isGuru && tugasBelumSubmit > 0 && (
                    <div className="max-w-5xl mx-auto px-6 pb-3">
                        <button onClick={() => setActiveTab("tugas")} className="w-full flex items-center gap-3 bg-orange-50 border border-orange-100 text-orange-700 px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-orange-100 transition-all">
                            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">{tugasBelumSubmit}</span>
                            Kamu punya {tugasBelumSubmit} tugas yang belum dikumpulkan — Klik untuk lihat
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="max-w-5xl mx-auto px-6 flex gap-1 border-t border-slate-100">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 -mb-px relative ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                            {tab.icon}{tab.label}
                            {tab.badge && (
                                <span className="w-5 h-5 bg-orange-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">{tab.badge}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-8 pb-16 sm:pb-8">

                {/* MATERI */}
                {activeTab === "materi" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-800">Materi Pembelajaran</h2>
                            {isGuru && <button onClick={() => setShowUploadMateri(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm"><Upload className="w-4 h-4" />Upload Materi</button>}
                        </div>
                        {materials.length > 0 ? (
                            <div className="space-y-4">
                                {materials.filter(m => !searchQuery || m.title?.toLowerCase().includes(searchQuery.toLowerCase())).map((m) => {
                                    const isDone = doneIds.has(m.id);
                                    return (
                                    <div key={m.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${isDone ? "border-emerald-100" : "border-slate-100"}`}>
                                        <div
                                            onClick={() => m.file_url && window.open(m.file_url, "_blank")}
                                            className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-all cursor-pointer group"
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform ${isDone ? "bg-emerald-100" : "bg-blue-50"}`}>
                                                {isDone
                                                    ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                    : m.type === "video"
                                                        ? <Video className="w-6 h-6 text-blue-500" />
                                                        : <FileText className="w-6 h-6 text-blue-500" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 truncate">{m.title}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{m.description || "Klik untuk buka"}</p>
                                                <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">{m.type}</span>
                                            </div>
                                        </div>
                                        {/* Tombol Tandai Selesai — hanya untuk siswa */}
                                        {!isGuru && (
                                            <div className="px-5 pb-3">
                                                <button
                                                    onClick={() => handleMarkDone(m.id)}
                                                    disabled={isDone}
                                                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${isDone ? "bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100" : "bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 border border-slate-100"}`}>
                                                    {isDone ? "✓ Sudah Selesai" : "Tandai Selesai"}
                                                </button>
                                            </div>
                                        )}
                                        {/* Komentar Materi */}
                                        <div className="px-5 pb-5">
                                            <CommentSection targetType="material" targetId={m.id} currentUserId={user.id} />
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 flex flex-col items-center text-center border-2 border-slate-100 border-dashed">
                                <BookOpen className="w-12 h-12 text-slate-200 mb-4" />
                                <p className="font-bold text-slate-600">Belum ada materi</p>
                                <p className="text-slate-400 text-sm mt-1">{isGuru ? "Klik 'Upload Materi' untuk menambahkan" : "Guru belum menambahkan materi"}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* TUGAS */}
                {activeTab === "tugas" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-800">Daftar Tugas</h2>
                            {isGuru && <button onClick={() => setShowBuatTugas(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm"><Plus className="w-4 h-4" />Buat Tugas</button>}
                        </div>
                        {assignments.length > 0 ? (
                            <div className="space-y-4">
                                {assignments.filter(a => !searchQuery || a.title?.toLowerCase().includes(searchQuery.toLowerCase())).map((a) => (
                                    <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                                    <ClipboardList className="w-6 h-6 text-orange-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800">{a.title}</p>
                                                    <p className="text-sm text-slate-500 mt-1">{a.description}</p>
                                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isOverdue(a.deadline) ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"}`}>
                                                            <Calendar className="w-3 h-3" />{isOverdue(a.deadline) ? "Lewat" : "Deadline"}: {formatDeadline(a.deadline)}
                                                        </span>
                                                        <span className="text-xs text-slate-400">Nilai maks: {a.max_score}</span>
                                                        {!isGuru && (
                                                            a.submission ? (
                                                                <span className="flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    Terkumpul {a.submission.score !== null && a.submission.score !== undefined ? `• Nilai: ${a.submission.score}` : ""}
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1 text-xs font-bold bg-red-50 text-red-500 px-2 py-1 rounded-lg">
                                                                    <AlertCircle className="w-3 h-3" />Belum dikumpulkan
                                                                </span>
                                                            )
                                                        )}
                                                        {isGuru && (
                                                            <span className="flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                                                                <Users className="w-3 h-3" />{a.submission_count || 0} terkumpul
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {isGuru ? (
                                                    <button onClick={() => setViewSubmissions(a)}
                                                        className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all">
                                                        Lihat Pengumpulan
                                                    </button>
                                                ) : a.submission?.score !== null && a.submission?.score !== undefined ? (
                                                    <button onClick={() => setSubmitTugas(a)}
                                                        className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-1">
                                                        <Lock className="w-3.5 h-3.5" /> Sudah Dinilai
                                                    </button>
                                                ) : !a.submission ? (
                                                    <button onClick={() => setSubmitTugas(a)}
                                                        className="text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-all shadow-sm">
                                                        Kumpulkan
                                                    </button>
                                                ) : (
                                                    <button onClick={() => setSubmitTugas(a)}
                                                        className="text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all">
                                                        Lihat / Edit
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        </div>
                                        {/* Komentar Tugas */}
                                        <div className="px-5 pb-5">
                                            <CommentSection targetType="assignment" targetId={a.id} currentUserId={user.id} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 flex flex-col items-center text-center border-2 border-slate-100 border-dashed">
                                <ClipboardList className="w-12 h-12 text-slate-200 mb-4" />
                                <p className="font-bold text-slate-600">Belum ada tugas</p>
                                <p className="text-slate-400 text-sm mt-1">{isGuru ? "Klik 'Buat Tugas' untuk menambahkan" : "Guru belum memberikan tugas"}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* KUIS */}
                {activeTab === "kuis" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-800">Daftar Kuis</h2>
                            {isGuru && <button onClick={() => setShowBuatKuis(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm"><Plus className="w-4 h-4" />Buat Kuis</button>}
                        </div>
                        {quizzes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quizzes.map((q) => (
                                    <QuizCard
                                        key={q.id}
                                        quiz={q}
                                        isGuru={isGuru}
                                        userId={user.id}
                                        onPlay={() => setActiveKuis(q)}
                                        onLeaderboard={() => setViewLeaderboard(q)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 flex flex-col items-center text-center border-2 border-slate-100 border-dashed">
                                <HelpCircle className="w-12 h-12 text-slate-200 mb-4" />
                                <p className="font-bold text-slate-600">Belum ada kuis</p>
                                <p className="text-slate-400 text-sm mt-1">{isGuru ? "Klik 'Buat Kuis' untuk menambahkan" : "Guru belum membuat kuis"}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ANGGOTA (Guru only) */}
                {activeTab === "anggota" && isGuru && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-800">Anggota Kelas <span className="text-blue-600">({members.length})</span></h2>
                        </div>
                        {members.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {members.map((m, idx) => (
                                    <div key={m.id || idx} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                                            {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : <span className="text-xl">👤</span>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{m.name}</p>
                                            <p className="text-xs text-slate-400">Bergabung: {new Date(m.joined_at).toLocaleDateString("id-ID")}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 flex flex-col items-center text-center border-2 border-slate-100 border-dashed">
                                <Users className="w-12 h-12 text-slate-200 mb-4" />
                                <p className="font-bold text-slate-600">Belum ada siswa</p>
                                <p className="text-slate-400 text-sm mt-1">Bagikan kode <strong>{kelas?.kode_kelas}</strong> ke siswamu</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showUploadMateri && <ModalUploadMateri classId={classId} onClose={() => setShowUploadMateri(false)} onSuccess={fetchAll} />}
            {showBuatTugas && <ModalBuatTugas classId={classId} onClose={() => setShowBuatTugas(false)} onSuccess={fetchAll} />}
            {showBuatKuis && <ModalPilihBuatKuis classId={classId} onClose={() => setShowBuatKuis(false)} onSuccess={() => { setShowBuatKuis(false); fetchAll(); }} />}
            {activeKuis && <QuizPlayer quiz={activeKuis} onClose={() => setActiveKuis(null)} onFinish={() => { setActiveKuis(null); fetchAll(); }} />}
            {submitTugas && <ModalSubmitTugas assignment={submitTugas} onClose={() => setSubmitTugas(null)} onSuccess={fetchAll} />}
            {viewSubmissions && <ModalSubmissions assignment={viewSubmissions} onClose={() => setViewSubmissions(null)} />}

            {viewLeaderboard && <ModalLeaderboard quiz={viewLeaderboard} currentUserId={user.id} onClose={() => setViewLeaderboard(null)} />}
            <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} onUpdateSuccess={(u) => setUser(u)} />
        </div>
    );
}