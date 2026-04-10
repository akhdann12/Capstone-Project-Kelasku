import { useState } from "react";
import { BookOpen, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;
export default function Login({ onNavigate, successMessage }) {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        const data = {
            email: formData.get("email"),
            password: formData.get("password"),
        };

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Login gagal");
            }

            // Simpan token dan data user ke localStorage
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));

            // Berhasil login, arahkan ke dashboard
            onNavigate("home");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] pointer-events-none opacity-60" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-100 rounded-full blur-[100px] pointer-events-none opacity-60" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <button
                            onClick={() => onNavigate("landing")}
                            className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 hover:scale-105 transition-transform"
                        >
                            <BookOpen className="text-white w-8 h-8" />
                        </button>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Selamat Datang Kembali</h1>
                        <p className="text-slate-500">Masuk ke akun KelasKu kamu di sini.</p>
                    </div>

                    {successMessage && (
                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 border border-emerald-100">
                            ✅ {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 border border-red-100">
                            ⚠️ {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
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

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-bold text-slate-700">Password</label>
                                <button type="button" onClick={() => onNavigate("forgot-password")} className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">Lupa Password?</button>
                            </div>
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

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Masuk...' : <>Masuk Sekarang <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 text-sm">
                        Belum punya akun? <button onClick={() => onNavigate("register")} className="text-blue-600 font-bold hover:underline">Daftar Sekarang</button>
                    </p>
                </div>

                <div className="mt-10 flex items-center justify-center gap-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <button onClick={() => onNavigate("landing")} className="hover:text-slate-600">Beranda</button>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <p>© 2026 KelasKu</p>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <button className="hover:text-slate-600">Bantuan</button>
                </div>
            </div>
        </div>
    );
}