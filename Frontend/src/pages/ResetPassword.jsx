import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function ResetPassword({ token, onNavigate }) {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        // Set session dari token yang ada di URL
        if (token) {
            supabase.auth.setSession({
                access_token: token,
                refresh_token: '',
            })
        }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (password.length < 6) return setError('Password minimal 6 karakter')
        if (password !== confirm) return setError('Konfirmasi password tidak cocok')

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            setSuccess(true)
            // Redirect ke login setelah 2 detik
            setTimeout(() => onNavigate('login'), 2000)
        } catch (err) {
            setError(err.message || 'Gagal reset password, coba lagi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 sm:p-10 w-full max-w-md border border-slate-100">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-2xl font-black text-slate-800 text-center mb-2">Buat Password Baru</h1>
                <p className="text-slate-400 text-sm text-center mb-8">Masukkan password baru untuk akunmu.</p>

                {success ? (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                        <p className="font-bold text-emerald-600 text-center">Password berhasil diubah!</p>
                        <p className="text-slate-400 text-sm text-center">Mengalihkan ke halaman login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                <p className="text-red-600 text-sm font-bold">{error}</p>
                            </div>
                        )}

                        {/* Password baru */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Password Baru</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Lock className="w-4 h-4 text-slate-400" />
                                </div>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-11 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-sm"
                                    required
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Konfirmasi password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Konfirmasi Password</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Lock className="w-4 h-4 text-slate-400" />
                                </div>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="Ulangi password baru"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-11 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-sm"
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                            {loading
                                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
                                : 'Simpan Password Baru'}
                        </button>

                        <button type="button" onClick={() => onNavigate('login')}
                            className="w-full py-3 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors">
                            ← Kembali ke Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}