import { useState, useEffect, useRef } from "react";
import { X, User, Phone, FileText, Calendar, Users, AlertCircle, CheckCircle2, Camera } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditProfileModal({ isOpen, onClose, onUpdateSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        bio: "",
        gender: "",
        birth_date: ""
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/auth/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const formattedDate = data.birth_date ? data.birth_date.split('T')[0] : "";
                setFormData({
                    name: data.name || "",
                    phone: data.phone || "",
                    bio: data.bio || "",
                    gender: data.gender || "",
                    birth_date: formattedDate
                });
                if (data.avatar) {
                    setAvatarPreview(`${API_URL}/${data.avatar}`);
                }
            }
        } catch (err) {
            console.error("Gagal load profil:", err);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            const data = new FormData();
            data.append("name", formData.name);
            data.append("phone", formData.phone);
            data.append("bio", formData.bio);
            data.append("gender", formData.gender);
            data.append("birth_date", formData.birth_date);
            if (avatar) {
                data.append("avatar", avatar);
            }

            const response = await fetch(`${API_URL}/api/auth/profile`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Gagal update profil");
            }

            setSuccess(true);

            // Update data di localStorage
            localStorage.setItem("user", JSON.stringify(result.user));

            if (onUpdateSuccess) onUpdateSuccess(result.user);

            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Edit Profil</h2>
                            <p className="text-slate-500">Sesuaikan informasi pribadimu di sini.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 border border-red-100">
                            <AlertCircle className="w-5 h-5" /> {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 border border-emerald-100">
                            <CheckCircle2 className="w-5 h-5" /> Profil berhasil diperbarui!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Profile Picture Upload */}
                        <div className="flex flex-col items-center justify-center mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-[2rem] bg-blue-100 flex items-center justify-center text-4xl overflow-hidden border-4 border-white shadow-xl">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        "👤"
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Ketuk ikon kamera untuk ganti foto</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nama kamu"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">No. HP</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="0812..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Gender</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 appearance-none cursor-pointer"
                                    >
                                        <option value="">Pilih</option>
                                        <option value="laki-laki">Laki-laki</option>
                                        <option value="perempuan">Perempuan</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Lahir</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Bio</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Ceritakan sedikit tentang kamu..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 min-h-[80px] resize-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className={`w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 ${(loading || success) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Menyimpan...
                                </>
                            ) : success ? (
                                'Berhasil Disimpan!'
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
