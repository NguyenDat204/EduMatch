import { Mail, Lock, User, Phone, ChevronDown, Layout, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { motion } from "framer-motion";

export function Register() {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            {/* Mini Header */}
            <header className="p-6 flex justify-between items-center">
                <a href="/" className="flex items-center gap-2 text-primary font-bold text-lg">
                    <div className="bg-primary text-white p-1.5 rounded-lg">
                        <span className="material-symbols-outlined block">school</span>
                    </div>
                    EduMatch
                </a>
                <div className="text-sm font-medium text-slate-500">
                    Bạn đã có tài khoản? <a href="/login" className="text-primary font-bold hover:underline">Đăng nhập</a>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10"></div>
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>

                {/* Decorative Icons */}
                <div className="absolute hidden xl:block left-[10%] top-1/3 text-slate-200">
                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-white p-4 rounded-2xl shadow-sm"><Layout className="w-8 h-8 text-primary/40" /></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Học tập</span>
                    </div>
                </div>
                <div className="absolute hidden xl:block left-[10%] bottom-1/3 text-slate-200">
                    <div className="flex flex-col items-center gap-2 text-right">
                        <div className="bg-white p-4 rounded-2xl shadow-sm"><Sparkles className="w-8 h-8 text-primary/40" /></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Phát triển</span>
                    </div>
                </div>
                <div className="absolute hidden xl:block right-[10%] top-1/3 text-slate-200">
                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-white p-4 rounded-2xl shadow-sm"><ChevronDown className="w-8 h-8 text-primary/40" /></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Tư duy</span>
                    </div>
                </div>
                <div className="absolute hidden xl:block right-[10%] bottom-1/3 text-slate-200">
                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-white p-4 rounded-2xl shadow-sm"><ShieldCheck className="w-8 h-8 text-primary/40" /></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Tin cậy</span>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-2xl w-full relative"
                >
                    {/* Accent Circle */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full -z-10 animate-pulse"></div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl lg:text-4xl font-black mb-4 leading-tight">Bắt đầu hành trình tương lai <br /> ngay hôm nay</h1>
                        <p className="text-slate-500">Cùng EduMatch định hướng con đường học tập của bạn.</p>
                    </div>

                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Họ và tên</label>
                                <Input placeholder="Nguyễn Văn A" icon={<User className="w-5 h-5" />} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Số điện thoại</label>
                                <Input placeholder="090xxxxxxx" icon={<Phone className="w-5 h-5" />} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                                <Input placeholder="example@email.com" icon={<Mail className="w-5 h-5" />} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Khối lớp</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Layout className="w-5 h-5" /></div>
                                    <select className="h-14 w-full pl-12 pr-4 rounded-xl border border-slate-200 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-700 font-medium">
                                        <option>Lớp 10</option>
                                        <option>Lớp 11</option>
                                        <option>Lớp 12</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Mật khẩu</label>
                            <Input type="password" placeholder="••••••••" icon={<Lock className="w-5 h-5" />} />
                        </div>

                        <div className="flex items-start gap-3 py-2">
                            <input type="checkbox" className="mt-1 rounded border-slate-200 text-primary focus:ring-primary h-4 w-4" />
                            <label className="text-sm text-slate-500 font-medium leading-relaxed">
                                Tôi đồng ý với <a href="#" className="text-primary font-bold hover:underline">Điều khoản & Điều kiện</a> và <a href="#" className="text-primary font-bold hover:underline">Chính sách bảo mật</a> của EduMatch.
                            </label>
                        </div>

                        <Button className="w-full py-8 text-xl shadow-xl shadow-primary/20">
                            Đăng ký ngay
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm font-medium mb-4">Hoặc đăng ký nhanh bằng</p>
                        <Button variant="secondary" className="gap-2 w-full md:w-auto md:px-12">
                            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                            Google
                        </Button>
                    </div>
                </motion.div>
            </main>

            <footer className="py-8 text-center text-slate-400 text-xs">
                © 2024 EduMatch. Tất cả quyền được bảo lưu.
            </footer>
        </div>
    );
}
