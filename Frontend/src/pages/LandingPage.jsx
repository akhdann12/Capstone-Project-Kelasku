import { useState, useEffect } from "react";
import {
    BookOpen,
    CheckCircle,
    Clock,
    Layout,
    Menu,
    X,
    ArrowRight,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    HelpCircle,
    Mail,
    Instagram,
    Twitter,
    Linkedin
} from "lucide-react";

const Navbar = ({ onNavigate }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Beranda", href: "#hero" },
        { name: "Fitur", href: "#fitur" },
        { name: "Tentang", href: "#tentang" },
        { name: "FAQ", href: "#faq" },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md py-3 shadow-sm" : "bg-transparent py-5"
            }`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <BookOpen className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-800 tracking-tight">KelasKu</span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-slate-600 hover:text-blue-600 font-semibold transition-colors text-sm"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={() => onNavigate("login")}
                        className="px-6 py-2.5 text-slate-700 font-bold hover:text-blue-600 transition-colors text-sm"
                    >
                        Masuk
                    </button>
                    <button
                        onClick={() => onNavigate("register")}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 text-sm active:scale-95"
                    >
                        Daftar Gratis
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-slate-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-slate-600 font-semibold py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                    <hr className="border-slate-100" />
                    <button onClick={() => onNavigate("login")} className="w-full py-3 text-slate-700 font-bold text-left">Masuk</button>
                    <button onClick={() => onNavigate("register")} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold">Daftar Gratis</button>
                </div>
            )}
        </nav>
    );
};

const Hero = ({ onNavigate }) => {
    return (
        <section id="hero" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-50">
            {/* Decorative blobs */}
            <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-slate-200/50 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold mb-6 animate-bounce">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        #1 LMS dengan Fitur Paling Lengkap
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-800 leading-[1.1] mb-8 tracking-tight">
                        Platform Belajar <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Terbaik & Efisien
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
                        Kelola materi, pantau progres, dan raih prestasi dengan
                        pengalaman belajar yang menyenangkan dan terorganisir di KelasKu.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => onNavigate("login")} className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2">
                            Mulai Belajar Gratis <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                            Lihat Demo Video
                        </button>
                    </div>

                    {/* Hero Image Mockup Placeholder */}
                    <div className="mt-16 relative mx-auto max-w-5xl group">
                        <div className="absolute inset-0 bg-blue-600/10 rounded-[2.5rem] rotate-1 scale-[1.02] -z-10 transition-transform group-hover:rotate-0" />
                        <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                            <div className="aspect-video bg-slate-100 rounded-[2rem] flex items-center justify-center relative overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000"
                                    alt="Dashboard Preview"
                                    className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30 text-white cursor-pointer hover:scale-110 transition-transform">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-xl">
                                            <ChevronRight className="w-8 h-8 fill-current" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Fitur = () => {
    const fiturList = [
        {
            title: "Upload Materi",
            desc: "Guru dapat dengan mudah mengunggah materi dalam format PDF, Video, maupun dokumen lainnya.",
            icon: <Layout className="w-7 h-7" />,
            color: "bg-blue-100 text-blue-600"
        },
        {
            title: "Quiz Interaktif",
            desc: "Uji pemahamanmu dengan fitur kuis yang seru dan dapatkan poin XP setiap menyelesaikannya.",
            icon: <CheckCircle className="w-7 h-7" />,
            color: "bg-indigo-100 text-indigo-600"
        },
        {
            title: "Pantau Progres",
            desc: "Visualisasi progres belajarmu secara real-time untuk memastikan target harian tetap tercapai.",
            icon: <TrendingUp className="w-7 h-7" />,
            color: "bg-emerald-100 text-emerald-600"
        },
        {
            title: "Jadwal Belajar",
            desc: "Integrasi kalender pintar yang membantumu mengatur waktu belajar agar tidak ada tugas yang terlewat.",
            icon: <Clock className="w-7 h-7" />,
            color: "bg-orange-100 text-orange-600"
        }
    ];

    return (
        <section id="fitur" className="py-24 bg-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-4">Fitur Utama</h2>
                <h3 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 font-sans">
                    Segala Kebutuhan Belajar dalam Satu Genggaman
                </h3>
                <p className="text-slate-500 max-w-2xl mx-auto mb-16 text-lg">
                    Kami merancang fitur yang memudahkan interaksi antara guru dan siswa untuk hasil belajar yang maksimal.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {fiturList.map((f, i) => (
                        <div key={i} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-left group">
                            <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                {f.icon}
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h4>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Tentang = ({ onNavigate }) => {
    return (
        <section id="tentang" className="py-24 bg-slate-50">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2 relative">
                        <div className="absolute inset-0 bg-blue-600 rounded-[3rem] rotate-3 scale-[0.98] -z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000"
                            alt="About KelasKu"
                            className="rounded-[3rem] shadow-2xl"
                        />
                        <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 hidden sm:block">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-800">100%</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aman & Terpercaya</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2">
                        <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-4">Tentang Kami</h2>
                        <h3 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-8 leading-tight">
                            Membangun Masa Depan Pendidikan di Indonesia
                        </h3>
                        <p className="text-slate-600 text-lg leading-relaxed mb-6">
                            KelasKu lahir dari semangat untuk mempermudah akses belajar antara guru dan siswa di era digital. Kami mengerti bahwa manajemen materi dan pemantauan tugas seringkali menjadi kendala.
                        </p>
                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                            Misi kami adalah menyediakan infrastruktur belajar yang intuitif, powerful, namun tetap mudah digunakan bahkan oleh pengguna yang baru mengenal teknologi pembelajaran online.
                        </p>

                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <div>
                                <h4 className="text-3xl font-black text-blue-600 mb-1">50K+</h4>
                                <p className="text-sm font-bold text-slate-500">Siswa Aktif</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-black text-blue-600 mb-1">1000+</h4>
                                <p className="text-sm font-bold text-slate-500">Sekolah Mitra</p>
                            </div>
                        </div>

                        <button onClick={() => onNavigate("login")} className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2">
                            Pelajari Selengkapnya <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const FAQ = () => {
    const questions = [
        { q: "Apakah KelasKu gratis untuk digunakan?", a: "Ya, kami menyediakan paket dasar gratis untuk siswa dan guru untuk mulai belajar dan mengajar." },
        { q: "Bagaimana cara mendaftar sebagai guru?", a: "Cukup pilih opsi 'Guru' pada saat pendaftaran dan lengkapi data administratif yang dibutuhkan." },
        { q: "Dapatkah saya mengakses KelasKu di HP?", a: "Tentu! KelasKu didesain responsif sehingga nyaman diakses melalui browser HP maupun tablet." },
        { q: "Format file apa saja yang didukung?", a: "Saat ini kami mendukung PDF, Video (MP4), dan dokumen Word (DOC/DOCX)." }
    ];

    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section id="faq" className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-4">Punya Pertanyaan?</h2>
                    <h3 className="text-4xl font-extrabold text-slate-800">Frequently Asked Questions</h3>
                </div>

                <div className="space-y-4">
                    {questions.map((q, i) => (
                        <div key={i} className={`border rounded-2xl transition-all ${openIndex === i ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100 bg-white'}`}>
                            <button
                                className="w-full flex items-center justify-between p-6 text-left"
                                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                            >
                                <span className="font-bold text-slate-800 flex items-center gap-3">
                                    <HelpCircle className={`w-5 h-5 ${openIndex === i ? 'text-blue-600' : 'text-slate-400'}`} />
                                    {q.q}
                                </span>
                                <div className={`transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}>
                                    <ChevronRight className="rotate-90" />
                                </div>
                            </button>
                            {openIndex === i && (
                                <div className="px-6 pb-6 pt-0 text-slate-500 leading-relaxed text-[15px] animate-in fade-in duration-500">
                                    {q.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const Footer = () => {
    return (
        <footer className="bg-slate-900 pt-20 pb-10 text-slate-400">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 lg:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="text-white w-5 h-5" />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight">KelasKu</span>
                        </div>
                        <p className="leading-relaxed mb-8">
                            Solusi lengkap untuk manajemen pembelajaran online yang modern dan efisien bagi institusi pendidikan masa depan.
                        </p>
                        <div className="flex items-center gap-4">
                            <button className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Instagram className="w-5 h-5 text-white" />
                            </button>
                            <button className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Twitter className="w-5 h-5 text-white" />
                            </button>
                            <button className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Linkedin className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Navigasi</h4>
                        <ul className="space-y-4">
                            <li><a href="#hero" className="hover:text-blue-500 transition-colors">Beranda</a></li>
                            <li><a href="#fitur" className="hover:text-blue-500 transition-colors">Fitur Utama</a></li>
                            <li><a href="#tentang" className="hover:text-blue-500 transition-colors">Tentang Kami</a></li>
                            <li><a href="#faq" className="hover:text-blue-500 transition-colors">Pusat Bantuan</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Legal</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Kebijakan Privasi</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Syarat & Ketentuan</a></li>
                            <li><a href="#" className="hover:text-blue-500 transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Newsletter</h4>
                        <p className="text-sm mb-6">Dapatkan tips belajar terbaru langsung di emailmu.</p>
                        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl">
                            <Mail className="w-5 h-5 ml-2" />
                            <input type="email" placeholder="Email kamu" className="bg-transparent border-none outline-none text-sm w-full py-1" />
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">Kirim</button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 text-center text-sm">
                    <p>© {new Date().getFullYear()} KelasKu. All rights reserved. Made with ❤️ for Indonesia.</p>
                </div>
            </div>
        </footer>
    );
};

export default function LandingPage({ onNavigate }) {
    useEffect(() => {
        // Smooth scroll handling for anchor links
        const handleAnchorClick = (e) => {
            const target = e.target.closest('a');
            if (target && target.hash && target.origin === window.location.origin) {
                e.preventDefault();
                const element = document.querySelector(target.hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };
        document.addEventListener('click', handleAnchorClick);
        return () => document.removeEventListener('click', handleAnchorClick);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-800">
            <Navbar onNavigate={onNavigate} />
            <Hero onNavigate={onNavigate} />
            <Fitur />
            <Tentang onNavigate={onNavigate} />
            <FAQ />
            <Footer />
        </div>
    );
}
