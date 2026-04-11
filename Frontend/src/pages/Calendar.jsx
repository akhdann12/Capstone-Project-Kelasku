import { useState, useEffect, useCallback } from "react";
import { User, LogOut, ChevronLeft, ChevronRight, Plus, X, Clock, Calendar as CalendarIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import EditProfileModal from "../components/EditProfileModal";
import BottomNav from "../components/BottomNav";

const API_URL = import.meta.env.VITE_API_URL;

const DAYS = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Timezone Jakarta (WIB = UTC+7)
const toJakarta = (date) => {
    const d = new Date(date);
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    return new Date(utc + 7 * 3600000);
};

const nowJakarta = () => toJakarta(new Date());

const formatWIB = (isoDate) => {
    if (!isoDate) return "-";
    const d = toJakarta(isoDate);
    return d.toLocaleString("id-ID", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta"
    }) + " WIB";
};

const formatTimeOnly = (isoDate) => {
    if (!isoDate) return "";
    const d = toJakarta(isoDate);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) + " WIB";
};

const navItems = [
    { label: "Home", id: "home", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z" /><path d="M9 22V12h6v10" /></svg> },
    { label: "Calendar", id: "calendar", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> },
    { label: "Classes", id: "classes", icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" /><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" /></svg> },
];

// Tips belajar random
const TIPS = [
    "Teknik Pomodoro: Belajar 25 menit, istirahat 5 menit. Efektif untuk menjaga fokus!",
    "Tulis ulang catatanmu dengan kata-katamu sendiri — ini cara terbaik memahami materi.",
    "Tidur cukup 7-8 jam sebelum ujian lebih efektif dari begadang belajar semalam.",
    "Belajar berkelompok bisa membantu memahami konsep yang sulit lebih cepat.",
    "Istirahat pendek setiap 45 menit dapat meningkatkan daya serap otak hingga 30%.",
];

// =============================================
// Modal Tambah Event Manual
// =============================================
function ModalTambahEvent({ onClose, onSave, selectedDate }) {
    const defaultDate = selectedDate
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
        : new Date().toISOString().split("T")[0];

    const [form, setForm] = useState({ title: "", start_date: defaultDate, end_date: defaultDate, time: "08:00", note: "" });

    const handleSubmit = (e) => {
        e.preventDefault();
        const startISO = new Date(`${form.start_date}T${form.time}:00+07:00`).toISOString();
        const endISO = form.end_date ? new Date(`${form.end_date}T${form.time}:00+07:00`).toISOString() : startISO;
        onSave({ id: `manual-${Date.now()}`, title: form.title, deadline: startISO, end_date: endISO, note: form.note, isManual: true, source: "manual" });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-800">Tambah Agenda</h3>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Judul</label>
                        <input required type="text" placeholder="Contoh: Belajar Matematika" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-blue-400 transition-all font-semibold text-slate-800" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Mulai</label>
                            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none font-semibold text-slate-800" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Selesai</label>
                            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none font-semibold text-slate-800" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Jam (WIB)</label>
                        <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none font-semibold text-slate-800" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Catatan <span className="normal-case font-normal">(opsional)</span></label>
                        <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} placeholder="Catatan tambahan..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 outline-none font-semibold text-slate-800 resize-none" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all">Batal</button>
                        <button type="submit" className="flex-1 bg-blue-600 py-3.5 rounded-2xl font-black text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// =============================================
// Modal Detail Tanggal
// =============================================
function ModalDetailDate({ date, events, onClose }) {
    const label = date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-800">{label}</h3>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                {events.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6">Tidak ada agenda di tanggal ini</p>
                ) : (
                    <div className="space-y-3">
                        {events.map((ev, i) => (
                            <div key={i} className={`p-3 rounded-2xl border ${ev.isManual ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}>
                                <p className="font-bold text-slate-800 text-sm">{ev.title}</p>
                                {ev.source === "assignment" && <p className="text-xs text-orange-500 font-bold mt-0.5">📋 Tugas — Deadline: {formatWIB(ev.deadline)}</p>}
                                {ev.isManual && <p className="text-xs text-blue-500 font-bold mt-0.5">🗓️ Agenda: {formatTimeOnly(ev.deadline)}</p>}
                                {ev.note && <p className="text-xs text-slate-400 mt-1">{ev.note}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================================
// Main Calendar Component
// =============================================
export default function CalendarPage({ onBack, onNavigate, onLogout }) {
    const now = nowJakarta();
    const [currentMonth, setCurrentMonth] = useState(now.getMonth());
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [assignments, setAssignments] = useState([]); // dari backend
    const [manualEvents, setManualEvents] = useState(() => {
        try { return JSON.parse(localStorage.getItem("kelasku_manual_events") || "[]"); } catch { return []; }
    });
    const [user, setUser] = useState({ name: "User", role: "siswa" });
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);
    const [viewMode, setViewMode] = useState("bulan"); // bulan | minggu
    const [weekOffset, setWeekOffset] = useState(0); // 0 = minggu ini

    // Semua events gabungan
    const allEvents = [
        ...assignments.map((a) => ({ ...a, source: "assignment" })),
        ...manualEvents,
    ];

    // Fetch tugas dari semua kelas yang diikuti
    const fetchAssignments = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            // Ambil semua kelas dulu
            const classRes = await fetch(`${API_URL}/api/classes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!classRes.ok) return;
            const classes = await classRes.json();

            // Ambil tugas dari setiap kelas
            const tugasList = [];
            await Promise.all(
                classes.map(async (kelas) => {
                    const res = await fetch(`${API_URL}/api/assignments/class/${kelas.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        data.forEach((t) => tugasList.push({ ...t, class_name: kelas.name }));
                    }
                })
            );
            setAssignments(tugasList);
        } catch (err) {
            console.error("Gagal fetch assignments:", err);
        }
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchAssignments();
    }, [fetchAssignments]);

    useEffect(() => {
        localStorage.setItem("kelasku_manual_events", JSON.stringify(manualEvents));
    }, [manualEvents]);

    // Build calendar grid
    const buildCalendar = () => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        // Hari pertama: 0=Min, 1=Sen, ... ubah ke Senin-based
        let startDow = firstDay.getDay(); // 0=Sun
        startDow = startDow === 0 ? 6 : startDow - 1; // convert ke Mon=0

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();

        const cells = [];
        for (let i = startDow - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, currentMonth: false });
        for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, currentMonth: true });
        const remaining = 42 - cells.length;
        for (let d = 1; d <= remaining; d++) cells.push({ day: d, currentMonth: false });
        return cells;
    };

    const cells = buildCalendar();

    // Cek event di tanggal tertentu
    const getEventsForDate = (day, isCurrentMonth) => {
        if (!isCurrentMonth) return [];
        return allEvents.filter((ev) => {
            const d = toJakarta(ev.deadline);
            return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
    };

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
        else setCurrentMonth(currentMonth - 1);
    };

    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
        else setCurrentMonth(currentMonth + 1);
    };

    const isToday = (day, isCurrentMonth) => {
        return isCurrentMonth && day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
    };

    // Tugas mendatang (belum lewat deadline, diurutkan terdekat)
    const upcomingAssignments = allEvents
        .filter((ev) => new Date(ev.deadline) > now)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);

    // Deadline paling urgent (deadline terdekat yang belum lewat)
    const urgentDeadline = assignments
        .filter((a) => new Date(a.deadline) > now && !a.submission)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0] || null;

    // Hitung sisa waktu
    const getTimeLeft = (deadline) => {
        const diff = new Date(deadline) - now;
        if (diff <= 0) return "Lewat deadline";
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days} hari lagi`;
        return `${hours} jam lagi`;
    };

    const isUrgent = (deadline) => {
        const diff = new Date(deadline) - now;
        return diff > 0 && diff < 48 * 3600000; // < 48 jam
    };

    const handleDateClick = (day, isCurrentMonth) => {
        if (!isCurrentMonth) return;
        const date = new Date(currentYear, currentMonth, day);
        const events = getEventsForDate(day, isCurrentMonth);
        setSelectedDate(date);
        setSelectedDateEvents(events);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white flex flex-col py-8 px-6 border-r border-slate-100 fixed h-full z-10 hidden sm:flex">
                <div className="mb-10 pl-2"><span className="text-blue-600 font-black text-2xl tracking-tight">KelasKu</span></div>
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = item.id === "calendar";
                        return (
                            <button key={item.id} onClick={() => item.id === "home" ? onBack() : onNavigate?.(item.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left font-semibold text-[15px] ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
                                <span className={isActive ? "text-blue-600" : "text-slate-400"}>{item.icon}</span>{item.label}
                            </button>
                        );
                    })}
                </nav>
                <div className="mt-auto">
                    <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left font-semibold text-[15px] text-red-500 hover:bg-red-50">
                        <LogOut className="w-5 h-5" />Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="sm:ml-64 flex-1 p-6 md:p-8 lg:p-10 w-full flex flex-col lg:flex-row gap-8 pb-24 sm:pb-10">

                {/* Left: Calendar */}
                <div className="flex-1">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-2 bg-white rounded-2xl px-5 py-3 shadow-sm border border-slate-100 flex-1">
                            <svg width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                            <input type="text" placeholder="Cari materi atau tugas..." className="bg-transparent border-none outline-none text-[15px] text-slate-700 w-full placeholder-slate-400" />
                        </div>
                        <div className="relative group shrink-0">
                            <button className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden hover:bg-blue-200 transition-colors shadow-sm">
                                {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : "👤"}
                            </button>
                            <div className="absolute top-full right-0 mt-2 bg-white shadow-2xl rounded-2xl p-2 hidden group-hover:block border border-slate-100 min-w-[200px] z-20">
                                <div className="px-4 py-3"><span className="block font-black text-slate-800 truncate">{user.name}</span><span className="block text-xs text-slate-400 capitalize font-bold">{user.role}</span></div>
                                <hr className="my-1 border-slate-50" />
                                <button onClick={() => setIsEditProfileOpen(true)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2"><User className="w-4 h-4" />Edit Profil</button>
                                <button onClick={onLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</button>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-900 mb-1">Jadwal Belajar</h1>
                        <p className="text-slate-400 font-medium">Semua deadline tugas tampil otomatis di kalender • Waktu Jakarta (WIB)</p>
                    </div>

                    {/* Calendar Card */}
                    <div className="bg-white rounded-[24px] sm:rounded-[40px] p-4 sm:p-8 shadow-sm border border-slate-100 mb-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                {viewMode === "bulan" ? (
                                    <>
                                        <h2 className="text-2xl font-black text-slate-800">{MONTHS[currentMonth]} {currentYear}</h2>
                                        <div className="flex gap-1">
                                            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                                            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"><ChevronRight className="w-5 h-5" /></button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex gap-1">
                                            <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
                                            <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"><ChevronRight className="w-5 h-5" /></button>
                                        </div>
                                        <span className="text-sm font-bold text-slate-500">
                                            {(() => {
                                                const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);
                                                const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
                                                return `${mon.getDate()} - ${sun.getDate()} ${MONTHS[sun.getMonth()]}, ${sun.getFullYear()}`;
                                            })()}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => { setCurrentMonth(now.getMonth()); setCurrentYear(now.getFullYear()); setWeekOffset(0); }}
                                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-all">
                                    Hari Ini
                                </button>
                                <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1">
                                    <button onClick={() => setViewMode("bulan")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === "bulan" ? "bg-white shadow-sm text-blue-600 border border-slate-100" : "text-slate-400 hover:text-slate-600"}`}>Bulan</button>
                                    <button onClick={() => setViewMode("minggu")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === "minggu" ? "bg-white shadow-sm text-blue-600 border border-slate-100" : "text-slate-400 hover:text-slate-600"}`}>Minggu</button>
                                </div>
                            </div>
                        </div>

                        {/* ===== TAMPILAN BULAN ===== */}
                        {viewMode === "bulan" && (
                            <>
                                <div className="grid grid-cols-7 gap-y-2">
                                {DAYS.map((d) => <div key={d} className="text-center text-[9px] sm:text-[12px] font-black text-slate-400 tracking-tight sm:tracking-widest py-2">{d}</div>)}
                                    {cells.map((cell, idx) => {
                                        const events = getEventsForDate(cell.day, cell.currentMonth);
                                        const today = isToday(cell.day, cell.currentMonth);
                                        const hasAssignment = events.some((e) => e.source === "assignment");
                                        const hasManual = events.some((e) => e.isManual);
                                        const hasUrgentEvent = events.some((e) => e.source === "assignment" && isUrgent(e.deadline));
                                        return (
                                            <div key={idx} onClick={() => handleDateClick(cell.day, cell.currentMonth)}
                                                className={`flex flex-col items-center py-1 relative ${cell.currentMonth ? "cursor-pointer" : "pointer-events-none"}`}>
                                                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all
                                                    ${today ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40" :
                                                        cell.currentMonth ? "text-slate-700 hover:bg-slate-100" : "text-slate-200"}`}>
                                                    {cell.day}
                                                </div>
                                                {cell.currentMonth && (hasAssignment || hasManual) && (
                                                    <div className="flex gap-0.5 mt-0.5">
                                                        {hasUrgentEvent && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                                                        {hasAssignment && !hasUrgentEvent && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                                                        {hasManual && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-xs text-slate-400 font-medium">Deadline mepet (&lt;48 jam)</span></div>
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400" /><span className="text-xs text-slate-400 font-medium">Deadline tugas</span></div>
                                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /><span className="text-xs text-slate-400 font-medium">Agenda pribadi</span></div>
                                </div>
                            </>
                        )}

                        {/* ===== TAMPILAN MINGGU ===== */}
                        {viewMode === "minggu" && (() => {
                            // Hitung 7 hari minggu ini (Senin-Minggu)
                            const monday = new Date(now);
                            monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);
                            monday.setHours(0, 0, 0, 0);
                            const weekDays = Array.from({ length: 7 }, (_, i) => {
                                const d = new Date(monday);
                                d.setDate(monday.getDate() + i);
                                return d;
                            });

                            // Jam yang ditampilkan (07:00 - 20:00)
                            const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

                            // Warna event berdasarkan sumber
                            const EVENT_COLORS = [
                                "bg-blue-500 text-white",
                                "bg-indigo-500 text-white",
                                "bg-violet-500 text-white",
                                "bg-pink-500 text-white",
                                "bg-emerald-500 text-white",
                                "bg-orange-400 text-white",
                                "bg-cyan-500 text-white",
                            ];

                            // Ambil events untuk hari tertentu
                            const getWeekEvents = (date) => {
                                return allEvents.filter((ev) => {
                                    const d = toJakarta(ev.deadline);
                                    return d.getFullYear() === date.getFullYear() &&
                                        d.getMonth() === date.getMonth() &&
                                        d.getDate() === date.getDate();
                                });
                            };

                            // Besok
                            const tomorrow = new Date(now);
                            tomorrow.setDate(now.getDate() + 1);
                            const tomorrowEvents = getWeekEvents(tomorrow);

                            return (
                                <div>
                                    {/* Header hari */}
                                    <div className="grid grid-cols-8 mb-2">
                                        <div className="w-16" />
                                        {weekDays.map((d, i) => {
                                            const isToday = d.toDateString() === now.toDateString();
                                            return (
                                                <div key={i} className={`flex flex-col items-center py-2 rounded-2xl ${isToday ? "bg-blue-50" : ""}`}>
                                                    <span className={`text-[11px] font-black uppercase tracking-wider ${isToday ? "text-blue-500" : "text-slate-400"}`}>
                                                        {DAYS[i]}
                                                    </span>
                                                    <span className={`text-lg font-black mt-0.5 w-9 h-9 flex items-center justify-center rounded-full ${isToday ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40" : "text-slate-700"}`}>
                                                        {d.getDate()}
                                                    </span>
                                                    {/* Dot jika ada event */}
                                                    {getWeekEvents(d).length > 0 && !isToday && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Grid jam */}
                                    <div className="overflow-y-auto max-h-[500px] relative" style={{ scrollbarWidth: "thin" }}>
                                        <div className="grid grid-cols-8">
                                            {/* Kolom jam */}
                                            <div className="flex flex-col">
                                                {HOURS.map((h) => (
                                                    <div key={h} className="h-16 flex items-start pt-1 pr-3">
                                                        <span className="text-xs font-bold text-slate-400 w-14 text-right">
                                                            {String(h).padStart(2, "0")}:00
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Kolom per hari */}
                                            {weekDays.map((day, dayIdx) => {
                                                const isToday = day.toDateString() === now.toDateString();
                                                const dayEvents = getWeekEvents(day);

                                                return (
                                                    <div key={dayIdx} className={`relative border-l border-slate-100 ${isToday ? "bg-blue-50/30" : ""}`}>
                                                        {/* Grid lines */}
                                                        {HOURS.map((h) => (
                                                            <div key={h} className="h-16 border-t border-slate-100/80" />
                                                        ))}

                                                        {/* Events */}
                                                        {dayEvents.map((ev, evIdx) => {
                                                            const evTime = toJakarta(ev.deadline);
                                                            const hour = evTime.getHours();
                                                            const min = evTime.getMinutes();
                                                            const topOffset = ((hour - 7) + min / 60) * 64; // 64px per jam
                                                            const colorClass = ev.source === "assignment"
                                                                ? (isUrgent(ev.deadline) ? "bg-red-500 text-white" : "bg-orange-400 text-white")
                                                                : EVENT_COLORS[evIdx % EVENT_COLORS.length];

                                                            return (
                                                                <div
                                                                    key={ev.id}
                                                                    style={{ top: `${Math.max(0, topOffset)}px`, minHeight: "52px" }}
                                                                    className={`absolute left-1 right-1 rounded-xl px-2 py-1.5 ${colorClass} shadow-sm cursor-pointer hover:brightness-95 transition-all`}
                                                                >
                                                                    <p className="text-[11px] font-black leading-tight truncate">{ev.title}</p>
                                                                    {ev.class_name && <p className="text-[9px] opacity-80 truncate">{ev.class_name}</p>}
                                                                    <p className="text-[10px] opacity-90 mt-0.5 flex items-center gap-0.5">
                                                                        <Clock className="w-2.5 h-2.5 shrink-0" />
                                                                        {String(hour).padStart(2, "0")}:{String(min).padStart(2, "0")} WIB
                                                                    </p>
                                                                    {ev.source === "assignment" && isUrgent(ev.deadline) && (
                                                                        <span className="text-[9px] font-black bg-white/20 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">⚠ Mepet!</span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Bottom: Besok + Target Minggu */}
                                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                                        {/* Besok */}
                                        <div className="bg-slate-50 rounded-3xl p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-black text-slate-800">Besok</h4>
                                                {tomorrowEvents.length > 0 && (
                                                    <span className="text-xs font-black bg-blue-100 text-blue-600 px-2.5 py-1 rounded-xl">{tomorrowEvents.length} acara</span>
                                                )}
                                            </div>
                                            {tomorrowEvents.length === 0 ? (
                                                <p className="text-xs text-slate-400 font-medium py-2">Tidak ada agenda besok 🎉</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {tomorrowEvents.map((ev, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <div className={`w-1 h-8 rounded-full shrink-0 ${ev.source === "assignment" ? "bg-orange-400" : "bg-blue-400"}`} />
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800 truncate">{ev.title}</p>
                                                                <p className="text-xs text-slate-400">{formatTimeOnly(ev.deadline)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Target Minggu */}
                                        <div className="bg-blue-600 rounded-3xl p-5 text-white">
                                            <h4 className="font-black mb-1">Target Minggu Ini</h4>
                                            <p className="text-blue-200 text-xs mb-4">
                                                {(() => {
                                                    const weekAssign = allEvents.filter((ev) => {
                                                        const d = toJakarta(ev.deadline);
                                                        const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7); mon.setHours(0,0,0,0);
                                                        const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
                                                        return d >= mon && d <= sun;
                                                    });
                                                    const done = weekAssign.filter((ev) => ev.submission?.score !== null && ev.submission?.score !== undefined).length;
                                                    return weekAssign.length === 0
                                                        ? "Tidak ada tugas minggu ini!"
                                                        : `${done} dari ${weekAssign.length} tugas selesai minggu ini.`;
                                                })()}
                                            </p>
                                            {/* Progress bar */}
                                            {(() => {
                                                const weekAssign = allEvents.filter((ev) => {
                                                    const d = toJakarta(ev.deadline);
                                                    const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7); mon.setHours(0,0,0,0);
                                                    const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
                                                    return d >= mon && d <= sun && ev.source === "assignment";
                                                });
                                                const done = weekAssign.filter((ev) => ev.submission).length;
                                                const pct = weekAssign.length > 0 ? Math.round((done / weekAssign.length) * 100) : 0;
                                                return (
                                                    <>
                                                        <div className="flex items-center justify-between text-xs mb-2">
                                                            <span className="text-blue-200">Total Tugas</span>
                                                            <span className="font-black">{done} / {weekAssign.length}</span>
                                                        </div>
                                                        <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                                                            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                            <div className="flex gap-2">
                                                <button onClick={() => onNavigate?.("classes")}
                                                    className="flex-1 bg-white text-blue-600 font-black text-xs py-2.5 rounded-2xl hover:bg-blue-50 transition-all">
                                                    Lihat Kelas
                                                </button>
                                                <button onClick={() => { setShowModal(true); setSelectedDate(null); }}
                                                    className="flex-1 border border-white/30 text-white font-black text-xs py-2.5 rounded-2xl hover:bg-white/10 transition-all">
                                                    + Agenda
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Tugas Bulan Ini */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                        <h3 className="font-black text-slate-800 mb-4">Tugas Bulan {MONTHS[currentMonth]}</h3>
                        {assignments.filter((a) => {
                            const d = toJakarta(a.deadline);
                            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                        }).length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-6">Tidak ada tugas bulan ini 🎉</p>
                        ) : (
                            <div className="space-y-3">
                                {assignments
                                    .filter((a) => { const d = toJakarta(a.deadline); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; })
                                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                                    .map((a) => (
                                        <div key={a.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${isUrgent(a.deadline) ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
                                            <div className={`w-2 h-8 rounded-full shrink-0 ${isUrgent(a.deadline) ? "bg-red-400" : "bg-orange-400"}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate">{a.title}</p>
                                                <p className="text-xs text-slate-400">{a.class_name} • {formatWIB(a.deadline)}</p>
                                            </div>
                                            {a.submission ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                            ) : (
                                                <span className={`text-xs font-bold shrink-0 px-2 py-1 rounded-lg ${isUrgent(a.deadline) ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                                                    {getTimeLeft(a.deadline)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-80 flex flex-col gap-5">
                    {/* Urgent Deadline Card */}
                    <div className={`rounded-[32px] p-7 text-white shadow-xl relative overflow-hidden ${urgentDeadline ? "bg-gradient-to-br from-red-500 to-orange-400" : "bg-gradient-to-br from-blue-600 to-blue-400"}`}>
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute top-4 right-4 text-white opacity-20 text-5xl">⏰</div>
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                            {urgentDeadline ? "Urgent!" : "Deadline"}
                        </span>
                        <h3 className="text-xl font-black mb-1">{urgentDeadline ? urgentDeadline.title : "Deadline"}</h3>
                        <p className="text-white/80 text-sm mb-6">
                            {urgentDeadline ? `${urgentDeadline.class_name} • ${getTimeLeft(urgentDeadline.deadline)}` : "Tidak ada deadline mendesak!"}
                        </p>
                        {urgentDeadline ? (
                            <div className="bg-white/15 rounded-2xl p-4 mb-5">
                                <p className="text-xs text-white/70 font-bold mb-1">Deadline</p>
                                <p className="text-sm font-black">{formatWIB(urgentDeadline.deadline)}</p>
                            </div>
                        ) : (
                            <div className="bg-white/15 rounded-2xl p-4 mb-5 text-center">
                                <p className="text-sm font-bold">Semua tugas sudah teratasi!</p>
                            </div>
                        )}
                        <button
                            onClick={() => urgentDeadline && onNavigate?.("classes")}
                            className={`w-full bg-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${urgentDeadline ? "text-red-500 hover:scale-[1.02] active:scale-95" : "text-blue-600 opacity-50 cursor-not-allowed"}`}
                            disabled={!urgentDeadline}
                        >
                            {user.role === "guru"
                                ? (urgentDeadline ? "Lihat Tugas" : "Aman!")
                                : (urgentDeadline ? "Kerjakan Sekarang" : "Aman!")}
                        </button>
                    </div>

                    {/* Mendatang */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-5">
                            <h4 className="font-black text-slate-800">Mendatang</h4>
                            <span className="text-xs font-bold text-slate-400">{upcomingAssignments.length} agenda</span>
                        </div>
                        {upcomingAssignments.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingAssignments.map((ev, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ev.source === "assignment" ? "bg-orange-50" : "bg-blue-50"}`}>
                                            {ev.source === "assignment" ? <span className="text-lg">📋</span> : <CalendarIcon className="w-5 h-5 text-blue-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 leading-tight truncate">{ev.title}</p>
                                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{formatWIB(ev.deadline)}</p>
                                            {ev.class_name && <p className="text-[10px] text-orange-500 font-bold mt-0.5">{ev.class_name}</p>}
                                        </div>
                                        {isUrgent(ev.deadline) && <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg shrink-0">Mepet!</span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 text-center">
                                <div className="text-3xl mb-2 grayscale opacity-40">🗓️</div>
                                <p className="text-xs font-bold text-slate-400">Belum ada agenda mendatang</p>
                            </div>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">💡</div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Tips Belajar</h4>
                        </div>
                        <p className="text-[13px] text-slate-600 font-medium leading-relaxed italic">"{tip}"</p>
                    </div>
                </div>
            </main>

            {/* FAB */}
            <button onClick={() => { setSelectedDate(null); setShowModal(true); }}
                className="fixed bottom-24 sm:bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40">
                <Plus className="w-7 h-7" />
            </button>

            {/* Modals */}
            {showModal && (
                <ModalTambahEvent
                    onClose={() => setShowModal(false)}
                    onSave={(ev) => setManualEvents([...manualEvents, ev])}
                    selectedDate={selectedDate}
                />
            )}

            {selectedDate && selectedDateEvents !== null && !showModal && (
                <ModalDetailDate
                    date={selectedDate}
                    events={selectedDateEvents}
                    onClose={() => { setSelectedDate(null); setSelectedDateEvents([]); }}
                />
            )}

            <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} onUpdateSuccess={(u) => setUser(u)} />

            {/* Bottom Nav Mobile */}
            <BottomNav active="calendar" onNavigate={onNavigate} onLogout={onLogout} />
        </div>
    );
}