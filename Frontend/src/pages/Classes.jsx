import { useState, useEffect, useCallback } from "react";
import { User, LogOut, Plus, X, Copy, Check, Upload, BookOpen } from "lucide-react";
import EditProfileModal from "../components/EditProfileModal";
import BottomNav from "../components/BottomNav";

const API_URL = import.meta.env.VITE_API_URL;

const navItems = [
    {
        label: "Home", id: "home",
        icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" /><path d="M9 22V12h6v10" /></svg>,
    },
    {
        label: "Calendar", id: "calendar",
        icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
    },
    {
        label: "Classes", id: "classes",
        icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" /><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" /></svg>,
    },
];

// =============================================
// Modal Buat Kelas (Guru)
// =============================================
function ModalBuatKelas({ onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        const data = {
            name: formData.get("name"),
            subject: formData.get("subject"),
            description: formData.get("description"),
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/classes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Gagal buat kelas");

            onSuccess(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-800">Buat Kelas Baru</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold border border-red-100">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Nama Kelas</label>
                        <input
                            type="text" name="name"
                            placeholder="Contoh: Matematika 10A"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Mata Pelajaran</label>
                        <input
                            type="text" name="subject"
                            placeholder="Contoh: Matematika"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Deskripsi <span className="text-slate-400 font-normal">(opsional)</span></label>
                        <textarea
                            name="description"
                            placeholder="Deskripsi singkat tentang kelas ini..."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 resize-none"
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className={`w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {loading ? "Membuat..." : <><Plus className="w-5 h-5" /> Buat Kelas</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

// =============================================
// Modal Join Kelas (Siswa)
// =============================================
function ModalJoinKelas({ onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const kode_kelas = new FormData(e.target).get("kode_kelas");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/classes/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ kode_kelas }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Gagal join kelas");

            onSuccess(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-800">Join Kelas</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold border border-red-100">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Kode Kelas</label>
                        <input
                            type="text" name="kode_kelas"
                            placeholder="Contoh: A3F9B2"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 uppercase tracking-widest font-bold text-center text-lg"
                            maxLength={6}
                            required
                        />
                        <p className="text-xs text-slate-400 text-center">Minta kode kelas ke gurumu</p>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className={`w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {loading ? "Bergabung..." : "Bergabung ke Kelas"}
                    </button>
                </form>
            </div>
        </div>
    );
}

// =============================================
// Modal Upload Materi (Guru)
// =============================================
function ModalUploadMateri({ classId, className, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        formData.append("class_id", classId);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/materials`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Gagal upload materi");

            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black text-slate-800">Upload Materi</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <p className="text-sm text-slate-400 font-medium mb-6">ke kelas <span className="text-blue-600 font-bold">{className}</span></p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold border border-red-100">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Judul Materi</label>
                        <input
                            type="text" name="title"
                            placeholder="Contoh: Bab 1 - Pengenalan Aljabar"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Tipe</label>
                        <select
                            name="type"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                        >
                            <option value="pdf">PDF</option>
                            <option value="video">Video</option>
                            <option value="doc">Dokumen Word</option>
                            <option value="pptx">Presentasi</option>
                            <option value="image">Gambar</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">Deskripsi <span className="text-slate-400 font-normal">(opsional)</span></label>
                        <textarea
                            name="description"
                            placeholder="Deskripsi singkat materi..."
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 resize-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">File</label>
                        <label className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 px-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                            <Upload className="w-8 h-8 text-slate-300 mb-2" />
                            <span className="text-sm font-bold text-slate-500">
                                {fileName ? fileName : "Klik untuk pilih file"}
                            </span>
                            <span className="text-xs text-slate-400 mt-1">PDF, Video, Word, PPTX, Gambar (maks 10MB)</span>
                            <input
                                type="file" name="file"
                                className="hidden"
                                onChange={(e) => setFileName(e.target.files[0]?.name || null)}
                            />
                        </label>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className={`w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {loading ? "Mengupload..." : <><Upload className="w-5 h-5" /> Upload Materi</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

// =============================================
// Kartu Kelas — Guru
// =============================================
function KelasCardGuru({ kelas, onUpload, onOpen }) {
    const [copied, setCopied] = useState(false);

    const copyKode = () => {
        navigator.clipboard.writeText(kelas.kode_kelas);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
                    {kelas.subject}
                </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">{kelas.name}</h3>
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{kelas.description || "Tidak ada deskripsi"}</p>

            {/* Kode Kelas */}
            <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between mb-4">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Kode Kelas</p>
                    <p className="text-lg font-black text-slate-800 tracking-widest">{kelas.kode_kelas}</p>
                </div>
                <button
                    onClick={copyKode}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    title="Salin kode"
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onOpen(kelas.id)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
                >
                    Buka Kelas
                </button>
                <button
                    onClick={() => onUpload(kelas)}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm shadow-blue-500/20"
                >
                    <Upload className="w-4 h-4" /> Upload
                </button>
            </div>
        </div>
    );
}

// =============================================
// Kartu Kelas — Siswa
// =============================================
function KelasCardSiswa({ kelas, onOpen }) {
    return (
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg">
                    {kelas.subject}
                </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">{kelas.name}</h3>
            <p className="text-xs text-slate-400 mb-1">Guru: {kelas.guru_name || "—"}</p>
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{kelas.description || "Tidak ada deskripsi"}</p>

            <button
                onClick={() => onOpen(kelas.id)}
                className="w-full py-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-bold text-sm rounded-xl transition-all border border-slate-100 hover:border-blue-100">
                Lihat Materi →
            </button>
        </div>
    );
}

// =============================================
// Main Component
// =============================================
export default function ClassesPage({ onNavigate, onLogout, onOpenClass }) {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({ name: "User", role: "siswa" });
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [showBuatKelas, setShowBuatKelas] = useState(false);
    const [showJoinKelas, setShowJoinKelas] = useState(false);
    const [uploadTarget, setUploadTarget] = useState(null); // kelas yang mau diupload materinya

    const fetchClasses = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/classes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setClasses(data);
            }
        } catch (err) {
            console.error("Gagal ambil kelas:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchClasses();
    }, [fetchClasses]);

    const isGuru = user.role === "guru";

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white flex flex-col py-8 px-6 border-r border-slate-100 fixed h-full z-10 hidden sm:flex">
                <div className="mb-10 pl-2">
                    <span className="text-blue-600 font-black text-2xl tracking-tight">KelasKu</span>
                </div>
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = item.id === "classes";
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left font-semibold text-[15px] ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
                            >
                                <span className={isActive ? "text-blue-600" : "text-slate-400"}>{item.icon}</span>
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
                <div className="mt-auto">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left font-semibold text-[15px] text-red-500 hover:bg-red-50"
                    >
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="sm:ml-64 flex-1 p-6 md:p-8 lg:p-12 w-full pb-24 sm:pb-10">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-10 gap-4">
                    <div className="flex items-center gap-2 bg-white rounded-full px-6 py-3.5 shadow-sm border border-slate-100 flex-1">
                        <svg width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari kelas..."
                            className="bg-transparent border-none outline-none text-[15px] text-slate-700 w-full placeholder-slate-400 font-medium"
                        />
                    </div>
                    <div className="relative group shrink-0 mr-4">
                        <button className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-xl cursor-pointer hover:bg-blue-200 transition-colors shadow-sm overflow-hidden">
                            {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : "👤"}
                        </button>
                        <div className="absolute top-full right-0 mt-2 bg-white shadow-2xl rounded-2xl p-2 hidden group-hover:block border border-slate-100 min-w-[200px] z-20">
                            <div className="px-4 py-3">
                                <span className="block text-[15px] font-black text-slate-800 leading-tight truncate">{user.name}</span>
                                <span className="block text-xs text-slate-400 mt-1 capitalize font-bold">{user.role}</span>
                            </div>
                            <hr className="my-1 border-slate-50" />
                            <button
                                onClick={() => setIsEditProfileOpen(true)}
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <User className="w-4 h-4 text-slate-400" /> Edit Profil
                            </button>
                            <button
                                onClick={onLogout}
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">
                            {isGuru ? "Kelas Saya" : "Kelas Saya"}
                        </h1>
                        <p className="text-slate-500 font-medium text-[15px]">
                            {isGuru ? "Kelola kelas dan upload materi untuk siswamu" : "Kelas yang kamu ikuti"}
                        </p>
                    </div>

                    {/* Tombol aksi utama */}
                    <button
                        onClick={() => isGuru ? setShowBuatKelas(true) : setShowJoinKelas(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 shrink-0"
                    >
                        <Plus className="w-5 h-5" />
                        {isGuru ? "Buat Kelas" : "Join Kelas"}
                    </button>
                </div>

                {/* Konten */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : classes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isGuru
                            ? classes.map((k) => (
                                <KelasCardGuru
                                    key={k.id}
                                    kelas={k}
                                    onUpload={(kelas) => setUploadTarget(kelas)}
                                    onOpen={onOpenClass}
                                />
                            ))
                            : classes.map((k) => (
                                <KelasCardSiswa key={k.id} kelas={k} onOpen={onOpenClass} />
                            ))
                        }
                    </div>
                ) : (
                    // Empty state
                    <div className="w-full rounded-[40px] border-2 border-slate-200 border-dashed bg-slate-50 flex flex-col justify-center items-center text-center py-24 px-10 relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="text-6xl mb-6">📚</div>
                        <h3 className="text-[26px] font-black text-slate-800 mb-3 relative z-10 tracking-tight">
                            {isGuru ? "Belum ada kelas" : "Belum bergabung ke kelas"}
                        </h3>
                        <p className="text-slate-500 text-[15px] font-medium mb-8 relative z-10 max-w-sm leading-relaxed">
                            {isGuru
                                ? "Buat kelas pertamamu dan mulai bagikan materi ke siswamu."
                                : "Minta kode kelas ke gurumu dan bergabung sekarang."}
                        </p>
                        <button
                            onClick={() => isGuru ? setShowBuatKelas(true) : setShowJoinKelas(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 relative z-10 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            {isGuru ? "Buat Kelas Sekarang" : "Join Kelas Sekarang"}
                        </button>
                    </div>
                )}
            </main>

            {/* FAB — hanya mobile */}
            <button
                onClick={() => isGuru ? setShowBuatKelas(true) : setShowJoinKelas(true)}
                className="sm:hidden fixed bottom-24 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center text-3xl transition-all hover:scale-110 active:scale-95 z-40"
            >
                +
            </button>

            {/* Modals */}
            {showBuatKelas && (
                <ModalBuatKelas
                    onClose={() => setShowBuatKelas(false)}
                    onSuccess={(newKelas) => {
                        setClasses((prev) => [newKelas, ...prev]);
                        setShowBuatKelas(false);
                    }}
                />
            )}

            {showJoinKelas && (
                <ModalJoinKelas
                    onClose={() => setShowJoinKelas(false)}
                    onSuccess={(joinedKelas) => {
                        fetchClasses();
                        setShowJoinKelas(false);
                    }}
                />
            )}

            {uploadTarget && (
                <ModalUploadMateri
                    classId={uploadTarget.id}
                    className={uploadTarget.name}
                    onClose={() => setUploadTarget(null)}
                    onSuccess={() => {
                        setUploadTarget(null);
                        alert("Materi berhasil diupload!");
                    }}
                />
            )}

            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                onUpdateSuccess={(updatedUser) => setUser(updatedUser)}
            />

            {/* Bottom Nav Mobile */}
            <BottomNav active="classes" onNavigate={onNavigate} onLogout={onLogout} />
        </div>
    );
}