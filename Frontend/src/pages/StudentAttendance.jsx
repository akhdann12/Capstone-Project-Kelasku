import { useState, useEffect } from "react";
import { ArrowLeft, Flame, CheckCircle2, AlertCircle, Download, Loader2, User as UserIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function StudentAttendance({ studentId, onBack }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        fetch(`${API_URL}/api/attendance/student/${studentId}`, { headers })
            .then(async (res) => {
                const body = await res.json();
                if (!res.ok) throw new Error(body.message || "Gagal memuat data absensi");
                return body;
            })
            .then((body) => { if (active) setData(body); })
            .catch((e) => { if (active) setError(e.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [studentId]);

    const handleExport = async () => {
        setExporting(true);
        try {
            // Export pakai endpoint absen siswa sendiri gak bisa dipakai guru (beda user),
            // jadi kita generate CSV-nya langsung di sisi frontend dari data yang udah ke-load.
            const rows = [["Tanggal", "Jam Check-in", "Jam Check-out", "Status"]];
            (data?.history || []).forEach((h) => {
                rows.push([
                    new Date(h.attendance_date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
                    h.check_in_time ? new Date(h.check_in_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) : "-",
                    h.check_out_time ? new Date(h.check_out_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) : "-",
                    h.check_out_time ? "Lengkap" : (h.check_in_time ? "Belum Check-out" : "-"),
                ]);
            });
            const csv = "\uFEFF" + rows.map((r) => r.map((f) => {
                const s = String(f ?? "");
                return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
            }).join(",")).join("\r\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `riwayat-absen-${(data?.student?.name || "siswa").replace(/\s+/g, "_")}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) : "-";

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-xl font-black text-slate-800 leading-tight">Rekap Absensi Siswa</h1>
                        <p className="text-xs text-slate-400 font-medium truncate">Riwayat check-in, check-out, dan streak</p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : error ? (
                    <div className="bg-white rounded-3xl p-10 flex flex-col items-center text-center border border-red-100">
                        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                        <p className="font-bold text-slate-700">{error}</p>
                    </div>
                ) : (
                    <>
                        {/* Profil siswa + streak */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                                    {data.student.avatar ? <img src={data.student.avatar} alt={data.student.name} className="w-full h-full object-cover" /> : <UserIcon className="w-7 h-7 text-blue-500" />}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="font-black text-slate-800 text-lg truncate">{data.student.name}</h2>
                                    <p className="text-slate-400 text-sm capitalize">{data.student.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 shrink-0">
                                <Flame className={`w-6 h-6 ${data.streak > 0 ? "text-orange-500" : "text-slate-300"}`} />
                                <div>
                                    <p className="text-2xl font-black text-orange-600">{data.streak}</p>
                                    <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Hari Beruntun</p>
                                </div>
                            </div>
                        </div>

                        {/* Riwayat absen */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-5 gap-3">
                                <h2 className="font-bold text-slate-800 text-lg">Riwayat Absen</h2>
                                <button
                                    onClick={handleExport}
                                    disabled={exporting || (data.history || []).length === 0}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                >
                                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export CSV
                                </button>
                            </div>

                            {(data.history || []).length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-center py-10">
                                    <AlertCircle className="w-10 h-10 text-slate-200 mb-3" />
                                    <p className="text-slate-600 font-bold">Belum ada riwayat absen</p>
                                    <p className="text-slate-400 text-sm mt-1">Siswa ini belum pernah check-in.</p>
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
                                            {data.history.map((h) => (
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
    );
}