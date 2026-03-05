import { GraduationCap, Menu, X, Bell, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";

export function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.location.href = '/'}>
                        <div className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">EduMatch</span>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-10">
                        <a className="text-sm font-bold text-slate-500 hover:text-primary transition-colors" href="/">Trang chủ</a>
                        <a className="text-sm font-bold text-slate-500 hover:text-primary transition-colors" href="#problem">Về chúng tôi</a>
                        <a className="text-sm font-bold text-slate-500 hover:text-primary transition-colors" href="#how-it-works">Dành cho học sinh</a>
                        <a className="text-sm font-bold text-slate-500 hover:text-primary transition-colors" href="#universities">Dành cho nhà trường</a>
                    </nav>

                    <div className="flex items-center gap-6">
                        <a href="/login" className="hidden sm:block text-sm font-black text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
                            Đăng nhập
                        </a>
                        <Button size="md" onClick={() => window.location.href = '/register'} className="rounded-xl px-6 font-black shadow-lg shadow-primary/25">
                            Bắt đầu ngay
                        </Button>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-8 space-y-6 animate-in slide-in-from-top duration-300">
                    <a className="block text-lg font-bold text-slate-700" href="/">Trang chủ</a>
                    <a className="block text-lg font-bold text-slate-700" href="#problem">Về chúng tôi</a>
                    <a className="block text-lg font-bold text-slate-700" href="#how-it-works">Dành cho học sinh</a>
                    <a className="block text-lg font-bold text-slate-700" href="#universities">Dành cho nhà trường</a>
                    <hr className="border-slate-100 dark:border-slate-800" />
                    <Button onClick={() => window.location.href = '/login'} variant="outline" className="w-full justify-center text-lg font-black">Đăng nhập</Button>
                    <Button onClick={() => window.location.href = '/register'} className="w-full justify-center text-lg font-black">Bắt đầu ngay</Button>
                </div>
            )}
        </header>
    );
}
