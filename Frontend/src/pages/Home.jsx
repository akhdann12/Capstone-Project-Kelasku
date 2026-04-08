import { useState, useEffect, useCallback, useRef } from "react";
import { User, LogOut, Bell, X, FileText, Video, Upload, BookOpen, Trophy, Flame, Star, AlertCircle, Clock, Users, ClipboardList, HelpCircle, CheckCircle2, ChevronRight } from "lucide-react";
import UploadModal from "../components/UploadModal";
import EditProfileModal from "../components/EditProfileModal";
import BottomNav from "../components/BottomNav";

const API_URL = import.meta.env.VITE_API_URL;

const navItems = [
    { label: "Home", id: "home", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" /><path d="M9 22V12h6v10" /></svg> },
    { label: "Calendar", id: "calendar", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> },
    { label: "Classes", id: "classes", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" /><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" /></svg> },
];

function AnimatedProgress({ progress, color }) {
    const [width, setWidth] = useState(0);
    useEffect(() => { const t = setTimeout(() => setWidth(progress), 200); return () => clearTimeout(t); }, [progress]);
    return (
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${width}%` }} />
        </div>
    );
}

function CircleProgress({ value = 0, size = 140, stroke = 12 }) {
    const [animated, setAnimated] = useState(0);
    useEffect(() => { const t = setTimeout(() => setAnimated(value), 300); return () => clearTimeout(t); }, [value]);
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (Math.min(animated, 100) / 100) * circ;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2563eb" strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                className="transition-all duration-1000 ease-out" />
        </svg>
    );
}

// =============================================
// Notifikasi Dropdown
// =============================================
function NotifDropdown({ notifications, loading, onClose }) {
    const colorMap = {
        red: "bg-red-50 text-red-600 border-red-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
    };
    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                <h3 className="font-black text-slate-800 text-sm">Notifikasi</h3>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8"><div className="text-3xl mb-2">🎉</div><p className="text-sm font-bold text-slate-400">Semua beres!</p></div>
                ) : (
                    <div className="p-2 space-y-1.5">
                        {notifications.map((n) => (
                            <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border ${colorMap[n.color] || colorMap.blue}`}>
                                <div className="shrink-0 mt-0.5">{n.type === "assignment" ? <AlertCircle className="w-4 h-4" /> : <Star className="w-4 h-4" />}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm leading-tight truncate">{n.title}</p>
                                    <p className="text-xs opacity-80 mt-0.5">{n.class_name}</p>
                                    {n.deadline && (
                                        <p className="text-xs opacity-70 mt-0.5 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {n.is_overdue ? "Terlambat!" : `Deadline: ${new Date(n.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`}
                                        </p>
                                    )}
                                </div>
                                <span className="text-[10px] font-black shrink-0 opacity-80">{n.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================================
// Modal Upload PDF Pribadi (Siswa)
// =============================================
function ModalUploadPDFSiswa({ onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSave = async () => {
        if (!file || !title.trim()) return setError("Judul dan file wajib diisi");
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", title);
            const res = await fetch(`${API_URL}/api/personal-materials`, {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: formData,
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            onSuccess(result.data);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 p-8">
                <div className="flex justify-between items-start mb-6">
                    <div><h2 className="text-xl font-black text-slate-800 mb-1">Tambah Materi PDF</h2>
                        <p className="text-slate-400 text-sm">Simpan PDF untuk belajar mandiri</p></div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold border border-red-100">{error}</div>}
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-slate-700 block mb-1">Judul</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Catatan Biologi Bab 3"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 text-slate-800 text-sm" />
                    </div>
                    <label className={`w-full border-2 border-dashed rounded-2xl py-6 px-4 flex flex-col items-center cursor-pointer transition-all ${file ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-blue-300"}`}>
                        <FileText className={`w-8 h-8 mb-2 ${file ? "text-blue-500" : "text-slate-300"}`} />
                        <p className="text-sm font-bold text-slate-500">{file ? file.name : "Klik untuk upload PDF"}</p>
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                    </label>
                    <button onClick={handleSave} disabled={loading || !file || !title.trim()}
                        className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Menyimpan...</> : <><Upload className="w-4 h-4" />Simpan Materi</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// =============================================
// Dashboard Guru
// =============================================
function DashboardGuru({ user, stats, materials, loading, onNavigate, onUploadOpen }) {
    const statCards = [
        { icon: <BookOpen className="w-6 h-6 text-blue-500" />, bg: "bg-blue-50", value: stats.total_kelas || 0, label: "Kelas Aktif" },
        { icon: <Users className="w-6 h-6 text-emerald-500" />, bg: "bg-emerald-50", value: stats.total_siswa || 0, label: "Total Siswa" },
        { icon: <FileText className="w-6 h-6 text-purple-500" />, bg: "bg-purple-50", value: stats.total_materi || 0, label: "Materi Diupload" },
        { icon: <ClipboardList className="w-6 h-6 text-orange-500" />, bg: "bg-orange-50", value: stats.total_tugas || 0, label: "Tugas Dibuat" },
    ];

    return (
        <>
            {/* Hero Banner Guru */}
            <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-500 p-8 sm:p-10 shadow-lg shadow-blue-500/20">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at 85% 50%, #ffffff 0%, transparent 60%)" }} />
                <div className="relative z-10 w-full sm:w-2/3">
                    <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">Dashboard Pengajar</p>
                    <h1 className="text-white font-extrabold text-3xl sm:text-4xl leading-tight mb-3">
                        Halo, {user.name}! 👋<br />Siap Mengajar Hari Ini?
                    </h1>
                    <p className="text-blue-100 text-sm mb-8">Pantau aktivitas kelas dan siswamu dari sini.</p>
                    <button onClick={() => onNavigate("classes")}
                        className="bg-white text-blue-700 font-bold text-sm tracking-wider px-7 py-3.5 rounded-xl hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all shadow-md">
                        KELOLA KELAS
                    </button>
                </div>
            </div>

            {/* Stat Cards Guru */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-3`}>{s.icon}</div>
                        <p className="text-2xl font-black text-slate-800">{s.value}</p>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Streak Guru */}
            <div className="bg-white rounded-3xl p-6 sm:px-8 flex items-center justify-between mb-8 shadow-sm border border-slate-100">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">
                        {stats.streak >= 3 ? `🔥 ${stats.streak} Hari Beruntun Mengajar!` : "Semangat Mengajar! 💪"}
                    </h3>
                    <p className="text-slate-500 text-sm">Konsistensimu menginspirasi para siswamu.</p>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3">
                    <Flame className={`w-6 h-6 ${stats.streak > 0 ? "text-orange-500" : "text-slate-300"}`} />
                    <div>
                        <p className="text-2xl font-black text-orange-600">{stats.streak || 0}</p>
                        <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Hari</p>
                    </div>
                </div>
            </div>

            {/* Materi terbaru */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-slate-800 text-xl">Materi Terbaru</h2>
                    <button onClick={() => onNavigate("classes")} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Lihat Semua <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                {loading ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : materials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {materials.slice(0, 6).map((m) => (
                            <div key={m.id} onClick={() => m.file_url && window.open(m.file_url, "_blank")}
                                className="bg-white rounded-3xl p-5 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    {m.type === "video" ? <Video className="w-6 h-6 text-blue-500" /> : <FileText className="w-6 h-6 text-blue-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 text-[15px] mb-1 leading-tight truncate">{m.title}</p>
                                    <p className="text-slate-400 text-xs truncate">{m.class_name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-10 flex flex-col items-center justify-center text-center border-2 border-slate-100 border-dashed">
                        <BookOpen className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="text-slate-600 font-bold">Belum ada materi</p>
                        <p className="text-slate-400 text-sm mt-1">Klik tombol '+' untuk upload materi pertama.</p>
                    </div>
                )}
            </div>
        </>
    );
}

// =============================================
// Dashboard Siswa
// =============================================
function DashboardSiswa({ user, stats, materials, loading, onNavigate, doneIds }) {
    const xpPercent = Math.min((stats.xp % 1000) / 10, 100);
    const allMaterials = [...materials];

    return (
        <>
            {/* Hero Banner Siswa */}
            <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 p-8 sm:p-10 shadow-lg shadow-blue-500/20">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at 85% 50%, #ffffff 0%, transparent 60%)" }} />
                <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="relative z-10 w-full sm:w-2/3">
                    <h1 className="text-white font-extrabold text-3xl sm:text-4xl leading-tight mb-3">
                        Selamat Datang, {user.name}!<br />Siap Belajar Hari ini?
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-[15px] mb-8">Yuk lanjutkan progresmu dan capai target harianmu 🚀</p>
                    <button onClick={() => onNavigate("classes")}
                        className="bg-white text-blue-700 font-bold text-sm tracking-wider px-7 py-3.5 rounded-xl hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all shadow-md">
                        MULAI BELAJAR
                    </button>
                </div>
            </div>

            {/* XP + Progres */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Progres Belajar */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="mb-6">
                        <h2 className="font-bold text-slate-800 text-lg mb-1">Progres Belajarmu</h2>
                        <p className="text-slate-400 text-sm">Tandai selesai di dalam kelas untuk update progres</p>
                    </div>
                    {materials.length > 0 ? (
                        <div className="space-y-4">
                            {[...new Map(materials.map((m) => [m.class_name, m])).values()].slice(0, 3).map((m, i) => {
                                const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500"];
                                const classMaterials = materials.filter((x) => x.class_name === m.class_name);
                                const done = classMaterials.filter((x) => doneIds.has(x.id)).length;
                                const pct = classMaterials.length > 0 ? Math.round((done / classMaterials.length) * 100) : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-bold text-slate-700">{m.class_name}</span>
                                            <span className="text-slate-400 font-medium">{done}/{classMaterials.length} • {pct}%</span>
                                        </div>
                                        <AnimatedProgress progress={pct} color={colors[i % colors.length]} />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-8">
                            <BookOpen className="w-10 h-10 text-slate-200 mb-3" />
                            <p className="text-slate-600 font-bold">Belum ada progres</p>
                            <p className="text-slate-400 text-sm mt-1">Bergabung ke kelas dan tandai materi selesai.</p>
                        </div>
                    )}
                </div>

                {/* Total XP */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden hover:shadow-md transition-shadow">
                    <div className="absolute top-4 right-4 text-7xl opacity-[0.03] pointer-events-none">⭐</div>
                    <h2 className="font-bold text-slate-800 text-lg mb-1 z-10 text-center">Total XP Kamu</h2>
                    <p className="text-slate-400 text-sm mb-4 text-center z-10 px-4">Dari nilai kuis + tugas semua kelas</p>
                    <div className="relative flex items-center justify-center mb-4">
                        <CircleProgress value={xpPercent} size={140} stroke={12} />
                        <div className="absolute flex flex-col items-center">
                            <span className="text-blue-600 font-black text-3xl leading-none">{stats.xp}</span>
                            <span className="text-slate-400 text-xs font-bold mt-1">XP</span>
                        </div>
                    </div>
                    {/* Ranking per kelas — tampilkan semua */}
                    <div className="w-full space-y-2 z-10">
                        {(stats.all_rankings || []).length === 0 ? (
                            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-full flex items-center justify-center gap-1">
                                <Trophy className="w-3.5 h-3.5" /> Belum ada ranking
                            </span>
                        ) : (
                            (stats.all_rankings || []).map((r, i) => (
                                <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold ${r.rank === 1 ? "bg-yellow-50 text-yellow-700 border border-yellow-100" : "bg-slate-50 text-slate-600"}`}>
                                    <span className="flex items-center gap-1.5">
                                        <Trophy className={`w-3.5 h-3.5 ${r.rank === 1 ? "text-yellow-500" : "text-slate-400"}`} />
                                        {r.class_name}
                                    </span>
                                    <span>#{r.rank} dari {r.total_siswa}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Streak + Materi Selesai */}
            <div className="bg-white rounded-3xl p-6 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 shadow-sm border border-slate-100 gap-6">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">
                        {stats.streak >= 3 ? `🔥 ${stats.streak} Hari Beruntun!` : "Kamu Hebat Hari Ini! 🎉"}
                    </h3>
                    <p className="text-slate-500 text-sm">Login tiap hari buat jaga streak kamu • Reset tiap 00:00 WIB</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl px-4 sm:px-6 py-3 min-w-[100px] flex-1 sm:flex-none">
                        <div className="flex items-center gap-1 mb-1">
                            <Flame className={`w-5 h-5 ${stats.streak > 0 ? "text-orange-500" : "text-slate-300"}`} />
                            <span className="text-blue-600 font-black text-3xl">{stats.streak || 0}</span>
                        </div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider text-center">Hari Beruntun</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl px-4 sm:px-6 py-3 min-w-[100px] flex-1 sm:flex-none">
                        <span className="text-blue-600 font-black text-3xl mb-1">{stats.materi_selesai || 0}</span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider text-center">Materi Selesai</span>
                    </div>
                </div>
            </div>

            {/* Daftar Materi — hanya tampil status, Tandai Selesai ada di dalam kelas */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-slate-800 text-xl">Materi Belajar</h2>
                    <button onClick={() => onNavigate("classes")}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Buka Kelas <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                {loading ? (
                    <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : allMaterials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {allMaterials.map((m) => {
                            const isDone = doneIds.has(m.id);
                            return (
                                <div key={m.id}
                                    onClick={() => m.file_url && window.open(m.file_url, "_blank")}
                                    className={`bg-white rounded-3xl p-5 flex items-center gap-4 shadow-sm border transition-all cursor-pointer group hover:shadow-md hover:-translate-y-1 active:scale-95 ${isDone ? "border-emerald-100 bg-emerald-50/20" : "border-slate-100"}`}>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${isDone ? "bg-emerald-100" : "bg-blue-50"}`}>
                                        {isDone
                                            ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            : m.type === "video"
                                                ? <Video className="w-6 h-6 text-blue-500" />
                                                : <FileText className="w-6 h-6 text-blue-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-[15px] mb-1 leading-tight truncate">{m.title}</p>
                                        <p className="text-slate-400 text-xs truncate">{m.guru_name || "Guru"}</p>
                                        {m.class_name && <p className="text-xs text-blue-500 font-bold">{m.class_name}</p>}
                                        {isDone
                                            ? <p className="text-xs text-emerald-500 font-bold mt-0.5">✓ Sudah Selesai</p>
                                            : <p className="text-xs text-slate-400 mt-0.5">Tandai selesai di dalam kelas</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-10 flex flex-col items-center justify-center text-center border-2 border-slate-100 border-dashed">
                        <BookOpen className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="text-slate-600 font-bold">Belum ada materi</p>
                        <p className="text-slate-400 text-sm mt-1 max-w-xs">Bergabung ke kelas untuk mulai belajar.</p>
                    </div>
                )}
            </div>
        </>
    );
}

// =============================================
// Main Home Component
// =============================================
export default function Home({ onNavigate, onLogout }) {
    const [activeNav, setActiveNav] = useState("Home");
    const [user, setUser] = useState({ name: "User", role: "siswa" });
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isUploadPDFOpen, setIsUploadPDFOpen] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [personalMaterials, setPersonalMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ xp: 0, best_ranking: null, all_rankings: [], materi_selesai: 0, streak: 0 });
    const [notifications, setNotifications] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [doneIds, setDoneIds] = useState(new Set()); // ID materi yang sudah selesai
    const notifRef = useRef(null);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchMaterials = useCallback(async () => {
        try {
            const classRes = await fetch(`${API_URL}/api/classes`, { headers });
            if (!classRes.ok) { setLoading(false); return; }
            const classes = await classRes.json();
            const allMaterials = [];
            await Promise.all(classes.map(async (kelas) => {
                const res = await fetch(`${API_URL}/api/materials/class/${kelas.id}`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    data.forEach((m) => allMaterials.push({ ...m, class_name: kelas.name }));
                }
            }));
            setMaterials(allMaterials);
        } catch {}
        finally { setLoading(false); }
    }, []);

    const fetchPersonalMaterials = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/personal-materials`, { headers });
            if (res.ok) setPersonalMaterials((await res.json()).map((m) => ({ ...m, is_personal: true })));
        } catch {}
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/dashboard/stats`, { headers });
            if (res.ok) setStats(await res.json());
        } catch {}
    }, []);

    const fetchDoneIds = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/dashboard/done-materials`, { headers });
            if (res.ok) {
                const data = await res.json();
                setDoneIds(new Set(data.map((d) => d.material_id)));
            }
        } catch {}
    }, []);

    const updateStreak = useCallback(async () => {
        try { await fetch(`${API_URL}/api/dashboard/streak`, { method: "POST", headers }); } catch {}
    }, []);

    const fetchNotifications = useCallback(async () => {
        setNotifLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/dashboard/notifications`, { headers });
            if (res.ok) setNotifications(await res.json());
        } catch {}
        finally { setNotifLoading(false); }
    }, []);

    const handleMarkDone = useCallback(async (materialId) => {
        if (doneIds.has(materialId)) return;
        try {
            const res = await fetch(`${API_URL}/api/dashboard/material-done/${materialId}`, { method: "POST", headers });
            if (res.ok) {
                setDoneIds((prev) => new Set([...prev, materialId]));
                setStats((prev) => ({ ...prev, materi_selesai: (prev.materi_selesai || 0) + 1 }));
            }
        } catch {}
    }, [doneIds]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchMaterials();
        fetchStats();
        updateStreak();
    }, []);

    useEffect(() => {
        if (user.role === "siswa") {
            fetchPersonalMaterials();
            fetchDoneIds();
        }
    }, [user.role]);

    useEffect(() => {
        if (showNotif && user.role === "siswa") fetchNotifications();
    }, [showNotif]);

    // Klik luar tutup notif
    useEffect(() => {
        const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const isGuru = user.role === "guru";
    const unreadCount = notifications.length;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white flex flex-col py-8 px-6 border-r border-slate-100 fixed h-full z-10 hidden sm:flex">
                <div className="mb-10 pl-2"><span className="text-blue-600 font-black text-2xl tracking-tight">KelasKu</span></div>
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = activeNav === item.label;
                        return (
                            <button key={item.id} onClick={() => { setActiveNav(item.label); onNavigate?.(item.id); }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left font-semibold text-[15px] ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
                                <span className={isActive ? "text-blue-600" : "text-slate-400"}>{item.icon}</span>{item.label}
                            </button>
                        );
                    })}
                </nav>
                <div className="mt-auto">
                    <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left font-semibold text-[15px] text-red-500 hover:bg-red-50">
                        <LogOut className="w-5 h-5" />Logout
                    </button>
                </div>
            </aside>

            <main className="sm:ml-64 flex-1 p-6 md:p-8 lg:p-10 w-full pb-24 sm:pb-10">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-sm border border-slate-100 flex-1">
                        <svg width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                        <input type="text" placeholder="Cari materi..." className="bg-transparent border-none outline-none text-[15px] text-slate-700 w-full placeholder-slate-400" />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Bell notif — hanya siswa */}
                        {!isGuru && (
                            <div className="relative" ref={notifRef}>
                                <button onClick={() => setShowNotif(!showNotif)}
                                    className="relative p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors">
                                    <Bell className="w-5 h-5 text-slate-600" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                </button>
                                {showNotif && <NotifDropdown notifications={notifications} loading={notifLoading} onClose={() => setShowNotif(false)} />}
                            </div>
                        )}
                        {/* Profile */}
                        <div className="relative group shrink-0">
                            <button className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden hover:bg-blue-200 transition-colors shadow-sm">
                                {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : "👤"}
                            </button>
                            <div className="absolute top-full right-0 mt-2 bg-white shadow-2xl rounded-2xl p-2 hidden group-hover:block border border-slate-100 min-w-[200px] z-20">
                                <div className="px-4 py-3">
                                    <span className="block font-black text-slate-800 truncate">{user.name}</span>
                                    <span className="block text-xs text-slate-400 capitalize font-bold">{user.role}</span>
                                </div>
                                <hr className="my-1 border-slate-50" />
                                <button onClick={() => setIsEditProfileOpen(true)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2"><User className="w-4 h-4" />Edit Profil</button>
                                <button onClick={onLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Konten berbeda guru vs siswa */}
                {isGuru ? (
                    <DashboardGuru user={user} stats={stats} materials={materials} loading={loading} onNavigate={onNavigate} onUploadOpen={() => setIsUploadOpen(true)} />
                ) : (
                    <DashboardSiswa user={user} stats={stats} materials={materials}
                        loading={loading} onNavigate={onNavigate}
                        doneIds={doneIds} />
                )}
            </main>

            {/* FAB Guru */}
            {isGuru && (
                <button onClick={() => setIsUploadOpen(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center text-3xl transition-all hover:scale-110 active:scale-95 z-50">+</button>
            )}

            <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploadSuccess={fetchMaterials} />
            <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} onUpdateSuccess={(u) => setUser(u)} />

            {/* Bottom Nav Mobile */}
            <BottomNav active="home" onNavigate={onNavigate} onLogout={onLogout} />
        </div>
    );
}