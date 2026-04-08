import { useState } from "react";
import { BookOpen, Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword({ onNavigate }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const email = new FormData(e.target).get("email");

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Gagal mengirim email reset");
            }

            setSuccess(true);
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

                    {!success ? (
                        <>
                            <div className="flex flex-col items-center mb-10 text-center">
                                <button
                                    onClick={() => onNavigate("landing")}
                                    className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 hover:scale-105 transition-transform"
                                >
                                    <BookOpen className="text-white w-8 h-8" />
                                </button>
                                <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Lupa Password?</h1>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Masukkan email kamu dan kami akan kirim link untuk reset password.
                                </p>
                            </div>

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

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? "Mengirim..." : <>Kirim Link Reset <ArrowRight className="w-5 h-5" /></>}
                                </button>
                            </form>
                        </>
                    ) : (
                        // Tampilan setelah sukses kirim email
                        <div className="flex flex-col items-center text-center py-4">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-3">Email Terkirim!</h2>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                Cek inbox kamu dan klik link yang kami kirim untuk reset password. Cek folder <strong>Spam</strong> jika tidak masuk.
                            </p>
                            <button
                                onClick={() => onNavigate("login")}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
                            >
                                Kembali ke Login
                            </button>
                        </div>
                    )}

                    {!success && (
                        <button
                            onClick={() => onNavigate("login")}
                            className="mt-8 w-full flex items-center justify-center gap-2 text-slate-500 text-sm font-bold hover:text-slate-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}