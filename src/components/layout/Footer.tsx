import { GraduationCap, Facebook, Mail, Phone } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 sm:gap-16 mb-20">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2.5 mb-8">
                            <div className="bg-primary text-white p-2 rounded-xl">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter">EduMatch</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                            Nền tảng định hướng nghề nghiệp cá nhân hóa bằng AI hàng đầu Việt Nam. Đồng hành cùng sĩ tử chinh phục ước mơ.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white mb-8 tracking-tight">Liên kết</h4>
                        <ul className="flex flex-col gap-5 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <li><a className="hover:text-primary transition-colors" href="#">Về EduMatch</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Dành cho học sinh</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Cẩm nang tuyển sinh</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Hợp tác trường học</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white mb-8 tracking-tight">Hỗ trợ</h4>
                        <ul className="flex flex-col gap-5 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <li><a className="hover:text-primary transition-colors" href="#">Câu hỏi thường gặp</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Trung tâm trợ giúp</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Điều khoản dịch vụ</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Chính sách bảo mật</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white mb-8 tracking-tight">Kết nối</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                <Mail className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                <Phone className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="pt-10 border-t border-slate-100 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 text-xs font-bold tracking-tight">
                    © 2024 EduMatch. All rights reserved. Made for Vietnamese Students.
                </div>
            </div>
        </footer>
    );
}
