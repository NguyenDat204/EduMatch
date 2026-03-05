import { Button } from "../components/ui/Button";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { motion } from "framer-motion";

// Helper for Material Symbols since some don't have direct Lucide equivalents or look different
const MaterialIcon = ({ name, className }: { name: string; className?: string }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                className="flex flex-col gap-10"
                            >
                                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest w-fit">
                                    <MaterialIcon name="auto_awesome" className="text-sm" />
                                    Ứng dụng công nghệ AI tiên phong
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white">
                                    Chọn đúng ngành – <br /> Chọn đúng trường – <br /> <span className="text-primary italic">Chọn đúng tương lai</span>
                                </h1>
                                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
                                    Nền tảng AI định hướng ngành học và gợi ý trường đại học cá nhân hóa dựa trên năng lực và đam mê của bạn.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-5">
                                    <Button size="lg" className="gap-3 px-10 shadow-xl shadow-primary/30">
                                        Bắt đầu ngay
                                        <MaterialIcon name="arrow_forward" />
                                    </Button>
                                    <Button variant="secondary" size="lg" className="px-10">
                                        Khám phá thêm
                                    </Button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative lg:ml-auto"
                            >
                                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/25 rounded-full blur-[120px]"></div>
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] -rotate-3 relative group transition-transform duration-500 hover:rotate-0">
                                    <img
                                        alt="Nhóm học sinh đang thảo luận vui vẻ"
                                        className="rounded-[1.5rem] w-full h-[450px] object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIUfYDHrV0pDIuNHM-pIXSrExV_pjy-cEV-Ag-RUeKmjXcp-K8R7njW2xAACikufUqtNyzhAENvqkJ078LTT6kUHit14RF95g2E_3HDlAm4o8_VyF-q-XDHbsq_TPrQymJALpAQPazLhCBZ-t04wEZBKvdukPKFSwikeC5jeF0Dft5SqmvvaSjEdvkSFunBqb5gQxjMaCpHcuXyEfW0IDM71GK9ixOP7OoECqhVT2Te0NZGFchmfaYWOn2XSotzjYDzPFm5p_mmpQH"
                                    />
                                    <div className="absolute -bottom-8 -left-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-5 rounded-[1.5rem] shadow-2xl flex items-center gap-4 border border-white/50 dark:border-slate-700 animate-bounce-slow">
                                        <div className="bg-green-500 text-white p-2.5 rounded-xl shadow-lg shadow-green-200">
                                            <MaterialIcon name="verified" className="text-xl" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Độ chính xác</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">98.5%</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Problem Section */}
                <section className="py-24 bg-[#f8fafc] dark:bg-slate-900/50" id="problem">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Bạn đang cảm thấy mông lung?</h2>
                            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
                                Hàng năm có đến 60% sinh viên chọn sai ngành nghề do thiếu định hướng từ sớm. Đừng để mình nằm trong con số đó.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-10">
                            {[
                                { icon: "psychology_alt", title: "Quá nhiều lựa chọn", desc: "Hàng trăm ngành học mới xuất hiện khiến bạn không biết đâu là thế mạnh thực sự của mình." },
                                { icon: "family_restroom", title: "Áp lực từ gia đình", desc: "Sự khác biệt trong định hướng giữa ba mẹ và con cái tạo nên những rào cản tâm lý khó gỡ." },
                                { icon: "warning", title: "Rủi ro thất nghiệp", desc: "Học ngành không phù hợp dẫn đến việc chán nản và khó tìm việc sau khi ra trường." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15, duration: 0.5 }}
                                    className="bg-white dark:bg-slate-800 p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                                >
                                    <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                                        <MaterialIcon name={item.icon} className="text-3xl text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4">{item.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-24" id="how-it-works">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                            <div className="max-w-2xl">
                                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Quy trình thông minh</h2>
                                <p className="text-xl text-slate-500 dark:text-slate-400">Chỉ với 3 bước đơn giản, EduMatch sẽ giúp bạn phác họa lộ trình tương lai rõ ràng nhất.</p>
                            </div>
                            <div className="hidden md:block">
                                <MaterialIcon name="trending_flat" className="text-slate-100 dark:text-slate-800 text-9xl leading-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { step: "01", icon: "person_edit", title: "Nhập thông tin", desc: "Cung cấp sở thích cá nhân, điểm số các môn học và ngân sách học tập của gia đình bạn." },
                                { step: "02", icon: "smart_toy", title: "AI Phân tích", desc: "Thuật toán AI nâng cao sẽ đối chiếu thông tin của bạn với dữ liệu hàng nghìn ngành học và trường đại học." },
                                { step: "03", icon: "task_alt", title: "Nhận kết quả", desc: "Nhận báo cáo chi tiết về ngành học phù hợp nhất và danh sách các trường đại học tối ưu cho bạn." }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="relative group h-full flex flex-col p-10 rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)]"
                                >
                                    <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-primary/25 group-hover:scale-110 transition-transform">
                                        <MaterialIcon name={item.icon} className="text-3xl" />
                                    </div>
                                    <span className="text-slate-100 dark:text-slate-700 font-black text-6xl absolute top-10 right-10 leading-none group-hover:text-primary transition-colors duration-500">{item.step}</span>
                                    <h3 className="text-3xl font-black mb-5 tracking-tight group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-lg">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* USP / Personalization Factors */}
                <section className="py-12">
                    <div className="mx-4 sm:mx-8 bg-slate-900 text-white rounded-[3.5rem] relative overflow-hidden px-8 py-24">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] -z-0"></div>
                        <div className="max-w-7xl mx-auto relative z-10">
                            <div className="grid lg:grid-cols-2 gap-20 items-center">
                                <div>
                                    <h2 className="text-4xl md:text-6xl font-black mb-12 leading-[1.1] tracking-tight">Cá nhân hóa tối đa cho <br /> <span className="text-primary italic">mỗi học sinh</span></h2>
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                        {[
                                            { icon: "favorite", title: "Sở thích", desc: "Khám phá đam mê và sở trường tiềm ẩn." },
                                            { icon: "grade", title: "Điểm số", desc: "Phân tích học lực để chọn trường vừa sức." },
                                            { icon: "payments", title: "Học phí", desc: "Phù hợp với điều kiện kinh tế gia đình." },
                                            { icon: "distance", title: "Khoảng cách", desc: "Vị trí học tập thuận lợi, tối ưu nhất." }
                                        ].map((item, i) => (
                                            <div key={i} className="flex flex-col gap-4 group">
                                                <div className="bg-primary/20 p-3 rounded-xl w-fit group-hover:bg-primary/30 transition-colors">
                                                    <MaterialIcon name={item.icon} className="text-primary text-2xl" />
                                                </div>
                                                <h4 className="font-black text-xl tracking-tight">{item.title}</h4>
                                                <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6 h-[500px]">
                                    <div className="rounded-[2rem] overflow-hidden shadow-2xl mt-12 h-full">
                                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkvc7L_m3TycX89AwgDNjufBaSSgrnUTR2b62-LM7Ohstz9wPYB51A2n36IvIiR5E1FIHFHgsTzcgHa9ZdTKrypSOPsDHWkKoRmYyNUZGVQgnyaYrV-ucCaNqkZdL1vaMYADwMYdtJtrK362GkEqUf20FSQsjPvC3nHjRYVNlAa69OvgFzCo_AInhV5sffbFmxQ1MyOkhAdq-Fljl7trRpJgY0W7WnN1i10_M1tTtdNf8C2JuMttbf0_T4V2why96A0FsAJlG1fNMg" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Sinh viên" />
                                    </div>
                                    <div className="rounded-[2rem] overflow-hidden shadow-2xl h-full">
                                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoLJasN0OG4IGxNUUi1Tx00hOuiuSh01Dp8hzF3jIUkByq6aWiSb9dYJwgGzdO4fQxDeBmwkoVoyHeGlZ-O-9LwaPYvmJkRZ1ibegCDczGCT4XAd2bYU7FAJ0LplKyCuUdvRpSO_3-B5cKwGpGy5aV7fw2OrqouBnUJddr_bjCmagdT--0h-bP7BI37f_uG9FkL6jsTQaZ3CnAUOCN2aXpNNhJhIKcUHPi5-aOzfqUmlbomPH_SGDVgl1WXiIbtgkf8mKse-dQj9UD" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Trường đại học" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* For Universities Section */}
                <section className="py-24" id="universities">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-[#eff6ff] rounded-[3rem] p-12 lg:p-20 relative overflow-hidden">
                            <MaterialIcon name="account_balance" className="absolute -bottom-10 -right-10 text-[20rem] text-slate-200/50 leading-none select-none" />
                            <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                                <div>
                                    <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight text-slate-900">
                                        Dành cho các trường Đại học & Cao đẳng
                                    </h2>
                                    <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                                        Kết nối trực tiếp với những học sinh tiềm năng và phù hợp nhất với tiêu chí tuyển sinh của nhà trường. Gia tăng tỷ lệ nhập học đúng ngành.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-5">
                                        <Button size="lg" className="px-10">Hợp tác ngay</Button>
                                        <Button variant="outline" size="lg" className="px-10 bg-white border-none shadow-sm hover:shadow-md">Xem giải pháp</Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white p-8 rounded-[2rem] shadow-sm text-center transform hover:-translate-y-2 transition-transform duration-300">
                                        <p className="text-4xl font-black text-primary mb-2 tracking-tighter">500+</p>
                                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Đối tác đào tạo</p>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] shadow-sm text-center transform hover:-translate-y-2 transition-transform duration-300 lg:mt-12">
                                        <p className="text-4xl font-black text-primary mb-2 tracking-tighter">10k+</p>
                                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Hồ sơ/tháng</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-32">
                    <div className="max-w-5xl mx-auto px-4 text-center">
                        <h2 className="text-5xl md:text-7xl font-black mb-10 leading-[1.05] tracking-tight">
                            Bạn đã sẵn sàng cho hành trình tương lai chưa?
                        </h2>
                        <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
                            Tham gia cùng hơn 50,000 học sinh lớp 12 đã tìm thấy con đường sự nghiệp lý tưởng cùng EduMatch.
                        </p>
                        <Button size="lg" className="px-14 py-10 rounded-2xl text-2xl font-black transition-all shadow-[0_20px_60px_-15px_rgba(0,82,204,0.4)] scale-100 hover:scale-105 active:scale-95">
                            Bắt đầu định hướng ngay - Miễn phí!
                        </Button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
