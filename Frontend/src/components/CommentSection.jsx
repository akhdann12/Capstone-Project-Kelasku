import { useState, useEffect, useCallback } from "react";
import { Send, Trash2, Reply, X, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function timeAgo(isoDate) {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} hari lalu`;
    if (hours > 0) return `${hours} jam lalu`;
    if (mins > 0) return `${mins} menit lalu`;
    return "Baru saja";
}

function CommentItem({ comment, currentUserId, onDelete, onReply }) {
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setLoading(true);
        await onReply(replyText.trim(), comment.id);
        setReplyText("");
        setShowReply(false);
        setLoading(false);
    };

    const roleColor = comment.user_role === "guru" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600";
    const roleLabel = comment.user_role === "guru" ? "Guru" : "Siswa";

    return (
        <div className="space-y-2">
            <div className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                    {comment.user_avatar ? <img src={comment.user_avatar} alt={comment.user_name} className="w-full h-full object-cover" /> : "👤"}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="bg-slate-50 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-black text-slate-800">{comment.user_name}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${roleColor}`}>{roleLabel}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{timeAgo(comment.created_at)}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 px-1">
                        <button onClick={() => setShowReply(!showReply)} className="text-xs font-bold text-slate-400 hover:text-blue-500 flex items-center gap-1 transition-colors">
                            <Reply className="w-3 h-3" /> Balas
                        </button>
                        {comment.user_id === currentUserId && (
                            <button onClick={() => onDelete(comment.id)} className="text-xs font-bold text-slate-300 hover:text-red-400 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-3 h-3" /> Hapus
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {comment.replies?.length > 0 && (
                <div className="ml-12 space-y-2">
                    {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3 group">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                                {reply.user_avatar ? <img src={reply.user_avatar} alt={reply.user_name} className="w-full h-full object-cover" /> : "👤"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="bg-white border border-slate-100 rounded-2xl px-3 py-2.5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-black text-slate-800">{reply.user_name}</span>
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${reply.user_role === "guru" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                                            {reply.user_role === "guru" ? "Guru" : "Siswa"}
                                        </span>
                                        <span className="text-[10px] text-slate-400">{timeAgo(reply.created_at)}</span>
                                    </div>
                                    <p className="text-xs text-slate-700">{reply.content}</p>
                                </div>
                                {reply.user_id === currentUserId && (
                                    <button onClick={() => onDelete(reply.id)} className="text-[10px] font-bold text-slate-300 hover:text-red-400 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100 mt-1 px-1">
                                        <Trash2 className="w-3 h-3" /> Hapus
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showReply && (
                <div className="ml-12">
                    <form onSubmit={handleReply} className="flex gap-2">
                        <input autoFocus type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Balas ${comment.user_name}...`}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-sm outline-none focus:border-blue-400 transition-all" />
                        <button type="submit" disabled={loading || !replyText.trim()}
                            className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all">
                            <Send className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => setShowReply(false)} className="px-3 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default function CommentSection({ targetType, targetId, currentUserId }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // collapsed by default
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/comments/${targetType}/${targetId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (res.ok) {
                const data = await res.json();
                setComments(data);
                setTotalCount(data.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0));
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [targetType, targetId]);

    // Fetch saat pertama kali dibuka
    useEffect(() => {
        if (isOpen) fetchComments();
    }, [isOpen, fetchComments]);

    // Fetch count saat mount (biar angka muncul meski belum dibuka)
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch(`${API_URL}/api/comments/${targetType}/${targetId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setTotalCount(data.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0));
                }
            } catch {}
        };
        fetchCount();
    }, [targetType, targetId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/api/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ target_type: targetType, target_id: targetId, content: text.trim() }),
            });
            if (res.ok) {
                const newComment = await res.json();
                setComments((prev) => [...prev, newComment]);
                setTotalCount((prev) => prev + 1);
                setText("");
            }
        } catch (err) { console.error(err); }
        finally { setSending(false); }
    };

    const handleReply = async (content, parentId) => {
        const res = await fetch(`${API_URL}/api/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: JSON.stringify({ target_type: targetType, target_id: targetId, content, parent_id: parentId }),
        });
        if (res.ok) fetchComments();
    };

    const handleDelete = async (id) => {
        const res = await fetch(`${API_URL}/api/comments/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
            setComments((prev) => {
                const filtered = prev.filter((c) => c.id !== id);
                return filtered.map((c) => ({ ...c, replies: c.replies?.filter((r) => r.id !== id) || [] }));
            });
            setTotalCount((prev) => Math.max(0, prev - 1));
        }
    };

    return (
        <div className="mt-4 border-t border-slate-100 pt-4">
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors group"
            >
                <MessageCircle className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
                <span>Komentar</span>
                {totalCount > 0 && (
                    <span className="bg-blue-100 text-blue-600 text-xs font-black px-2 py-0.5 rounded-lg">{totalCount}</span>
                )}
                {isOpen
                    ? <ChevronUp className="w-4 h-4 ml-auto text-slate-400" />
                    : <ChevronDown className="w-4 h-4 ml-auto text-slate-400" />
                }
            </button>

            {/* Content — hanya tampil kalau isOpen */}
            {isOpen && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Input komentar */}
                    <form onSubmit={handleSend} className="flex gap-3">
                        <input type="text" value={text} onChange={(e) => setText(e.target.value)}
                            placeholder="Tulis komentar atau pertanyaan..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-sm outline-none focus:border-blue-400 transition-all" />
                        <button type="submit" disabled={sending || !text.trim()}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all">
                            <Send className="w-4 h-4" />
                        </button>
                    </form>

                    {/* List komentar */}
                    {loading ? (
                        <div className="flex justify-center py-3"><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
                    ) : comments.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-3">Belum ada komentar. Jadilah yang pertama!</p>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((c) => (
                                <CommentItem key={c.id} comment={c} currentUserId={currentUserId} onDelete={handleDelete} onReply={handleReply} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}