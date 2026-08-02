import { useState, useEffect, useRef, useCallback } from "react";
import {
    ArrowLeft, Camera, CheckCircle2, XCircle, Download, Flame,
    Loader2, AlertCircle, LogIn, LogOut as LogOutIcon, RefreshCcw, User as UserIcon,
} from "lucide-react";
import * as faceapi from "@vladmandic/face-api";
import BottomNav from "../components/BottomNav";
import EditProfileModal from "../components/EditProfileModal";

const API_URL = import.meta.env.VITE_API_URL;
const MODEL_URL = "/models";
// Ambang jarak wajah (euclidean distance) dari face-api.js.
// Makin kecil = makin mirip. 0.5 itu cukup ketat & umum dipakai buat verifikasi.
const FACE_MATCH_THRESHOLD = 0.5;

const sidebarNavItems = [
    { label: "Home", id: "home", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" /><path d="M9 22V12h6v10" /></svg> },
    { label: "Absen", id: "attendance", icon: <Camera className="w-5 h-5" /> },
    { label: "Calendar", id: "calendar", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> },
    { label: "Classes", id: "classes", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" /><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" /></svg> },
];

// Model cuma perlu di-load sekali per sesi browser
let modelsLoadedPromise = null;
function loadModels() {
    if (!modelsLoadedPromise) {
        modelsLoadedPromise = Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
    }
    return modelsLoadedPromise;
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Gagal memuat gambar"));
        img.src = url;
    });
}

async function getFaceDescriptor(imgEl) {
    const result = await faceapi
        .detectSingleFace(imgEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
    return result?.descriptor || null;
}

// =============================================
// Modal kamera — dipakai buat check-in & check-out
// =============================================
function CameraModal({ mode, user, onClose, onSuccess }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [status, setStatus] = useState("loading"); // loading | ready | captured | verifying | submitting | error
    const [errorMsg, setErrorMsg] = useState("");
    const [preview, setPreview] = useState(null);
    const [retryKey, setRetryKey] = useState(0);
    const capturedBlobRef = useRef(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw Object.assign(new Error("Browser tidak mendukung akses kamera, atau situs ini diakses lewat koneksi yang tidak aman (bukan https/localhost)."), { name: "UnsupportedError" });
                }
                await loadModels();
                if (!active) return; // efek ini udah di-cleanup (mis. StrictMode double-invoke di dev), jangan lanjut minta kamera

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user", width: 480, height: 480 },
                });
                if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
                if (!active) return;
                setStatus("ready");
            } catch (e) {
                if (!active) return; // ini hasil dari invocation lama yang udah gak relevan, JANGAN timpa status yang udah sukses
                console.error("[Absen] Gagal inisialisasi kamera/model:", e); // biar kelihatan detailnya di DevTools Console
                const friendly =
                    e.name === "NotAllowedError"
                        ? "Izin kamera ditolak. Aktifkan akses kamera di pengaturan browser kamu (klik ikon 🔒/kamera di address bar)."
                        : e.name === "NotFoundError"
                        ? "Kamera tidak ditemukan di perangkat ini."
                        : e.name === "NotReadableError"
                        ? "Kamera sedang dipakai aplikasi lain. Tutup aplikasi/tab lain yang pakai kamera, lalu coba lagi."
                        : e.name === "UnsupportedError"
                        ? e.message
                        : "Gagal memuat kamera atau model verifikasi wajah.";
                // Detail teknis ditampilin juga langsung di layar, biar gak perlu buka DevTools buat lihat error aslinya
                setErrorMsg(`${friendly}\n\n[Detail teknis: ${e.name || "Error"} — ${e.message || "tidak ada pesan"}]`);
                setStatus("error");
            }
        })();
        return () => {
            active = false;
            streamRef.current?.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        };
    }, [retryKey]);

    const capture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        // Preview kamera sengaja di-mirror (scale-x-[-1]) biar berasa kayak ngaca —
        // foto yang disimpan juga di-mirror sama biar HASILNYA SAMA PERSIS kayak yang
        // diliat user di layar pas ambil foto (sebelumnya kebalik, bikin bingung).
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        ctx.restore();
        canvas.toBlob((blob) => {
            capturedBlobRef.current = blob;
            setPreview(canvas.toDataURL("image/jpeg"));
            setStatus("captured");
        }, "image/jpeg", 0.9);
    };

    const retake = () => {
        capturedBlobRef.current = null;
        setPreview(null);
        setErrorMsg("");
        setStatus("ready");
    };

    const verifyAndSubmit = async () => {
        if (!user.avatar) {
            setErrorMsg("Kamu belum punya foto profil. Upload foto profil dulu lewat menu Edit Profil sebelum bisa absen.");
            setStatus("error");
            return;
        }
        setStatus("verifying");
        setErrorMsg("");
        try {
            const capturedImg = await loadImage(preview);
            const capturedDescriptor = await getFaceDescriptor(capturedImg);
            if (!capturedDescriptor) {
                setErrorMsg("Wajah tidak terdeteksi di foto. Pastikan wajah terlihat jelas & pencahayaan cukup, lalu coba lagi.");
                setStatus("captured");
                return;
            }

            const profileImg = await loadImage(user.avatar);
            const profileDescriptor = await getFaceDescriptor(profileImg);
            if (!profileDescriptor) {
                setErrorMsg("Wajah tidak terdeteksi di foto profil kamu. Ganti foto profil dengan foto wajah yang lebih jelas.");
                setStatus("captured");
                return;
            }

            const distance = faceapi.euclideanDistance(capturedDescriptor, profileDescriptor);
            if (distance > FACE_MATCH_THRESHOLD) {
                setErrorMsg("Wajah tidak cocok dengan foto profil kamu. Coba lagi dengan posisi wajah yang lebih jelas.");
                setStatus("captured");
                return;
            }

            setStatus("submitting");
            const formData = new FormData();
            formData.append("photo", capturedBlobRef.current, "absen.jpg");
            formData.append("similarity", distance.toFixed(4));

            const token = localStorage.getItem("token");
            const endpoint = mode === "checkin" ? "check-in" : "check-out";
            const res = await fetch(`${API_URL}/api/attendance/${endpoint}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Gagal menyimpan absen");

            onSuccess(result);
        } catch (e) {
            setErrorMsg(e.message || "Terjadi kesalahan, coba lagi.");
            setStatus("captured");
        }
    };

    const title = mode === "checkin" ? "Absen Masuk" : "Absen Pulang";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                        <Camera className="w-5 h-5 text-blue-600" /> {title}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-900 mb-4">
                        {/* Video kamera SELALU di-render (gak dibongkar-pasang kayak sebelumnya) —
                           kalau di-unmount terus di-mount lagi, srcObject-nya ilang & jadi layar
                           hitam pas user pencet "Ulangi". Sekarang cuma disembunyiin pakai CSS. */}
                        <video ref={videoRef} muted playsInline
                            className={`w-full h-full object-cover scale-x-[-1] ${preview || status === "error" ? "hidden" : ""}`} />

                        {status === "error" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                                <p className="text-white text-sm font-bold whitespace-pre-line">{errorMsg}</p>
                            </div>
                        )}

                        {preview && !["error"].includes(status) && (
                            <img src={preview} alt="Preview absen" className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        {status === "loading" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}
                        {(status === "verifying" || status === "submitting") && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/70 gap-2">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                                <p className="text-white text-xs font-bold">
                                    {status === "verifying" ? "Memverifikasi wajah..." : "Menyimpan absen..."}
                                </p>
                            </div>
                        )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />

                    {errorMsg && status === "captured" && (
                        <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errorMsg}
                        </div>
                    )}

                    {status === "ready" && (
                        <button onClick={capture} className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                            <Camera className="w-4 h-4" /> Ambil Foto
                        </button>
                    )}

                    {status === "captured" && (
                        <div className="flex gap-3">
                            <button onClick={retake} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 flex items-center justify-center gap-2">
                                <RefreshCcw className="w-4 h-4" /> Ulangi
                            </button>
                            <button onClick={verifyAndSubmit} className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Konfirmasi
                            </button>
                        </div>
                    )}

                    {status === "error" && !preview && (
                        <div className="flex gap-3">
                            <button onClick={onClose} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200">
                                Tutup
                            </button>
                            <button onClick={() => { setErrorMsg(""); setStatus("loading"); setRetryKey((k) => k + 1); }}
                                className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                                <RefreshCcw className="w-4 h-4" /> Coba Lagi
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// =============================================
// Halaman Absen
// =============================================
export default function Attendance({ onBack, onLogout, onNavigate }) {
    const [user, setUser] = useState({ name: "User", role: "siswa", avatar: null });
    const [today, setToday] = useState(null);
    const [history, setHistory] = useState([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [cameraMode, setCameraMode] = useState(null); // "checkin" | "checkout" | null
    const [toast, setToast] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const profileMenuRef = useRef(null);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // Tutup dropdown profile kalau user klik di luar area-nya —
    // dipakai klik (bukan hover) biar jalan juga di HP/layar sentuh
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    const fetchAll = useCallback(async () => {
        try {
            const [todayRes, historyRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/api/attendance/today`, { headers }),
                fetch(`${API_URL}/api/attendance/history`, { headers }),
                fetch(`${API_URL}/api/dashboard/stats`, { headers }),
            ]);
            if (todayRes.ok) setToday(await todayRes.json());
            if (historyRes.ok) setHistory(await historyRes.json());
            if (statsRes.ok) setStreak((await statsRes.json()).streak || 0);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchAll();
    }, [fetchAll]);

    const handleSuccess = (result) => {
        setCameraMode(null);
        setToast(result.message);
        setTimeout(() => setToast(null), 3000);
        if (result.streak) setStreak(result.streak);
        fetchAll();
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await fetch(`${API_URL}/api/attendance/export`, { headers });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "riwayat-absen.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            setToast("Gagal export riwayat absen");
            setTimeout(() => setToast(null), 3000);
        } finally {
            setExporting(false);
        }
    };

    const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) : "-";
    const formatDate = (d) => new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    const hasCheckedIn = !!today?.check_in_time;
    const hasCheckedOut = !!today?.check_out_time;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Sidebar Desktop */}
            <aside className="w-64 bg-white flex-col py-8 px-6 border-r border-slate-100 fixed h-full z-10 hidden sm:flex">
                <div className="mb-10 pl-2"><span className="text-blue-600 font-black text-2xl tracking-tight">KelasKu</span></div>
                <nav className="flex flex-col gap-2">
                    {sidebarNavItems.map((item) => {
                        const isActive = item.id === "attendance";
                        return (
                            <button key={item.id} onClick={() => onNavigate?.(item.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left font-semibold text-[15px] ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
                                <span className={isActive ? "text-blue-600" : "text-slate-400"}>{item.icon}</span>{item.label}
                            </button>
                        );
                    })}
                </nav>
                <div className="mt-auto">
                    <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left font-semibold text-[15px] text-red-500 hover:bg-red-50">
                        <LogOutIcon className="w-5 h-5" />Logout
                    </button>
                </div>
            </aside>

            <div className="sm:ml-64 flex-1 pb-20 sm:pb-8 w-full">
                {/* Header */}
                <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
                    <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                            <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 shrink-0 sm:hidden">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="min-w-0">
                                <h1 className="text-xl font-black text-slate-800 leading-tight">Absen</h1>
                                <p className="text-xs text-slate-400 font-medium truncate">Check-in & check-out harian pakai verifikasi wajah</p>
                            </div>
                        </div>
                        <div className="relative shrink-0" ref={profileMenuRef}>
                            <button onClick={() => setShowProfileMenu((v) => !v)}
                                className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center overflow-hidden hover:bg-blue-200 transition-colors">
                                {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-blue-500" />}
                            </button>
                            {showProfileMenu && (
                                <div className="absolute top-full right-0 mt-2 bg-white shadow-2xl rounded-2xl p-2 border border-slate-100 min-w-[190px] z-30">
                                    <div className="px-4 py-3">
                                        <span className="block font-black text-slate-800 truncate">{user.name}</span>
                                        <span className="block text-xs text-slate-400 capitalize font-bold">{user.role}</span>
                                    </div>
                                    <hr className="my-1 border-slate-50" />
                                    <button onClick={() => { setIsEditProfileOpen(true); setShowProfileMenu(false); }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                                        <UserIcon className="w-4 h-4" />Edit Profil
                                    </button>
                                    <button onClick={onLogout}
                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2">
                                        <LogOutIcon className="w-4 h-4" />Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-6 py-8">
                    {loading ? (
                        <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                    ) : (
                        <>
                            {/* Streak */}
                            <div className="bg-white rounded-3xl p-6 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 shadow-sm border border-slate-100 gap-4">
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-800 text-lg mb-1">
                                        {streak >= 3 ? `🔥 ${streak} Hari Beruntun Absen!` : "Yuk mulai absen hari ini! 💪"}
                                    </h3>
                                    <p className="text-slate-500 text-sm">Streak naik tiap kamu check-in • Gak reset pas Sabtu/Minggu</p>
                                </div>
                                <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 shrink-0">
                                    <Flame className={`w-6 h-6 ${streak > 0 ? "text-orange-500" : "text-slate-300"}`} />
                                    <div>
                                        <p className="text-2xl font-black text-orange-600">{streak}</p>
                                        <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Hari</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status hari ini + tombol absen */}
                            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-6">
                                <h2 className="font-bold text-slate-800 text-lg mb-1">Absen Hari Ini</h2>
                                <p className="text-slate-400 text-sm mb-6">{formatDate(new Date())}</p>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className={`rounded-2xl p-4 border ${hasCheckedIn ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Check-in</p>
                                        <p className={`text-xl font-black ${hasCheckedIn ? "text-emerald-600" : "text-slate-300"}`}>{formatTime(today?.check_in_time)}</p>
                                    </div>
                                    <div className={`rounded-2xl p-4 border ${hasCheckedOut ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Check-out</p>
                                        <p className={`text-xl font-black ${hasCheckedOut ? "text-emerald-600" : "text-slate-300"}`}>{formatTime(today?.check_out_time)}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => setCameraMode("checkin")}
                                        disabled={hasCheckedIn}
                                        className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                                    >
                                        <LogIn className="w-4 h-4" /> {hasCheckedIn ? "Sudah Check-in" : "Absen Masuk"}
                                    </button>
                                    <button
                                        onClick={() => setCameraMode("checkout")}
                                        disabled={!hasCheckedIn || hasCheckedOut}
                                        className="flex-1 py-3.5 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                                    >
                                        <LogOutIcon className="w-4 h-4" /> {hasCheckedOut ? "Sudah Check-out" : "Absen Pulang"}
                                    </button>
                                </div>
                            </div>

                            {/* Riwayat absen */}
                            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-5 gap-3">
                                    <h2 className="font-bold text-slate-800 text-lg">Riwayat Absen</h2>
                                    <button
                                        onClick={handleExport}
                                        disabled={exporting || history.length === 0}
                                        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                    >
                                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export CSV
                                    </button>
                                </div>

                                {history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-center py-10">
                                        <Camera className="w-10 h-10 text-slate-200 mb-3" />
                                        <p className="text-slate-600 font-bold">Belum ada riwayat absen</p>
                                        <p className="text-slate-400 text-sm mt-1">Mulai absen masuk buat catat kehadiranmu.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto -mx-2">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                    <th className="px-2 py-2">Tanggal</th>
                                                    <th className="px-2 py-2">Check-in</th>
                                                    <th className="px-2 py-2">Check-out</th>
                                                    <th className="px-2 py-2">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.map((h) => (
                                                    <tr key={h.id} className="border-t border-slate-50">
                                                        <td className="px-2 py-3 font-bold text-slate-700 whitespace-nowrap">
                                                            {new Date(h.attendance_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                                        </td>
                                                        <td className="px-2 py-3 text-slate-600">{formatTime(h.check_in_time)}</td>
                                                        <td className="px-2 py-3 text-slate-600">{formatTime(h.check_out_time)}</td>
                                                        <td className="px-2 py-3">
                                                            {h.check_out_time ? (
                                                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-full text-xs"><CheckCircle2 className="w-3 h-3" /> Lengkap</span>
                                                            ) : h.check_in_time ? (
                                                                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 font-bold px-2.5 py-1 rounded-full text-xs"><AlertCircle className="w-3 h-3" /> Belum Pulang</span>
                                                            ) : (
                                                                <span className="text-slate-300">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {cameraMode && (
                <CameraModal mode={cameraMode} user={user} onClose={() => setCameraMode(null)} onSuccess={handleSuccess} />
            )}

            {toast && (
                <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
                </div>
            )}

            {/* Bottom Nav Mobile */}
            <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} onUpdateSuccess={(u) => setUser(u)} />

            <BottomNav active="attendance" onNavigate={onNavigate} onLogout={onLogout} />
        </div>
    );
}