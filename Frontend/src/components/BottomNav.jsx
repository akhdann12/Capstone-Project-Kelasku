import { Home, Calendar, BookOpen, LogOut } from "lucide-react";

const tabs = [
    {
        id: "home",
        label: "Home",
        icon: <Home className="w-5 h-5" />,
    },
    {
        id: "calendar",
        label: "Jadwal",
        icon: <Calendar className="w-5 h-5" />,
    },
    {
        id: "classes",
        label: "Kelas",
        icon: <BookOpen className="w-5 h-5" />,
    },
];

export default function BottomNav({ active, onNavigate, onLogout }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
            {/* Blur backdrop */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-t border-slate-100" />

            <div className="relative flex items-center justify-around px-2 pb-safe">
                {tabs.map((tab) => {
                    const isActive = active === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onNavigate(tab.id)}
                            className="flex flex-col items-center justify-center gap-1 py-3 px-5 min-w-[64px] transition-all active:scale-90"
                        >
                            {/* Icon container */}
                            <span className={`relative flex items-center justify-center w-10 h-7 rounded-2xl transition-all duration-200 ${
                                isActive
                                    ? "text-blue-600"
                                    : "text-slate-400"
                            }`}>
                                {/* Active pill background */}
                                {isActive && (
                                    <span className="absolute inset-0 bg-blue-50 rounded-2xl" />
                                )}
                                <span className="relative z-10">{tab.icon}</span>
                            </span>
                            <span className={`text-[10px] font-bold transition-colors ${
                                isActive ? "text-blue-600" : "text-slate-400"
                            }`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="flex flex-col items-center justify-center gap-1 py-3 px-5 min-w-[64px] transition-all active:scale-90"
                >
                    <span className="flex items-center justify-center w-10 h-7 rounded-2xl text-red-400">
                        <LogOut className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold text-red-400">Keluar</span>
                </button>
            </div>
        </nav>
    );
}