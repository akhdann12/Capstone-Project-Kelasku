import { useState } from "react";
import { X, Upload, FileText, Video as VideoIcon, Layers, Hash, AlertCircle, CheckCircle2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);

    if (!isOpen) return null;

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        if (file) {
            formData.set("file", file);
        }

        // Default class_id = 1 if not specified (bisa dikembangkan nanti)
        if (!formData.get("class_id")) {
            formData.set("class_id", "1");
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/materials`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Gagal upload materi");
            }

            setSuccess(true);
            if (onUploadSuccess) onUploadSuccess(result.data);

            setTimeout(() => {
                setSuccess(false);
                setFile(null);
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                <div className="p-8 md:p-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Upload Materi</h2>
                            <p className="text-slate-500">Bagikan pengetahuan baru ke siswamu hari ini.</p>
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
                            <CheckCircle2 className="w-5 h-5" /> Materi berhasil diupload!
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Judul Materi</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Contoh: Dasar Aljabar Linear"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Tipe</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <select
                                        name="type"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 appearance-none cursor-pointer"
                                    >
                                        <option value="pdf">📄 PDF</option>
                                        <option value="video">🎥 Video</option>
                                        <option value="doc">📝 Document</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Urutan</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Hash className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="number"
                                        name="order"
                                        placeholder="1"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                                        defaultValue={1}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">File Materi</label>
                            <div
                                className={`relative border-2 border-dashed rounded-[2rem] p-8 transition-all flex flex-col items-center justify-center text-center group cursor-pointer ${dragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-white"
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById("file-upload").click()}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    name="file"
                                    className="hidden"
                                    onChange={handleChange}
                                    required={!file}
                                />

                                {file ? (
                                    <div className="animate-in fade-in scale-95 duration-300">
                                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 mx-auto">
                                            {file.type.includes('video') ? <VideoIcon className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                                        </div>
                                        <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{file.name}</p>
                                        <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="mt-4 text-xs font-bold text-red-500 hover:underline"
                                        >
                                            Hapus File
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 group-hover:text-blue-500 transition-all">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <p className="font-bold text-slate-700 text-sm mb-1">Pilih atau Seret File ke Sini</p>
                                        <p className="text-xs text-slate-400">PDF, MP4, atau DOCX (Maks. 10MB)</p>
                                    </>
                                )}
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
                                    Mengunggah...
                                </>
                            ) : success ? (
                                'Behasil!'
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" /> Upload Sekarang
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
