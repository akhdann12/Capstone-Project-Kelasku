import { useState } from "react";
import { BookOpen, Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
export default function Register({ onNavigate }) {
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("siswa"); // guru | siswa
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.target);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            role: role
        };

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Registrasi gagal");
            }

            setSuccess(true);
            setTimeout(() => onNavigate("login"), 2000); // Tunggu 2 detik lalu pindah ke login
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] pointer-events-none opacity-60" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-100 rounded-full blur-[100px] pointer-events-none opacity-60" />

            <div className="w-full max-w-xl relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <button
                            onClick={() => onNavigate("landing")}
                            className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 hover:scale-105 transition-transform"
                        >
                            <BookOpen className="text-white w-8 h-8" />
                        </button>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">Mulai Akun Baru</h1>
                        <p className="text-slate-500">Dapatkan akses penuh ke seluruh fitur KelasKu.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 border border-red-100">
                            ⚠️ {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 border border-emerald-100 animate-bounce">
                            ✅ Register Berhasil! Mengalihkan ke halaman login...
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 mb-8">
                            <button
                                type="button"
                                onClick={() => setRole("siswa")}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${role === "siswa" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                            >
                                <User className="w-4 h-4" /> Siswa
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("guru")}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${role === "guru" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                            >
                                <ShieldCheck className="w-4 h-4" /> Guru
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="nama@email.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Min. 8 karakter"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 px-1 border-t border-slate-100 pt-6">
                            <input type="checkbox" id="terms" className="w-4 h-4 mt-1 accent-blue-600" required />
                            <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
                                Saya setuju dengan <button type="button" className="text-blue-600 font-bold hover:underline">Syarat Layanan</button> dan <button type="button" className="text-blue-600 font-bold hover:underline">Kebijakan Privasi</button> KelasKu.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Mendaftarkan Akun...' : <>Daftar Sekarang <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-slate-500 text-sm">
                        Sudah punya akun? <button onClick={() => onNavigate("login")} className="text-blue-600 font-bold hover:underline">Masuk Sekarang</button>
                    </p>
                </div>
            </div>
        </div>
    );
}
