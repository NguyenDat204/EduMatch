import { motion } from "framer-motion";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/Button";
import { Download, BarChart3, Briefcase, GraduationCap, ArrowRight, Bookmark } from "lucide-react";

// Helper for Material Symbols
const MaterialIcon = ({ name, className }: { name: string; className?: string }) => (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export function Result() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header />

            <main className="flex-grow">
                {/* Banner Section */}
                <section className="px-4 py-12 lg:py-16">
                    <div className="max-w-5xl mx-auto bg-[#eff6ff] rounded-[2.5rem] p-10 lg:p-16 relative overflow-hidden text-center lg:text-left">
                        <div className="relative z-10 flex flex-col gap-6 lg:max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest w-fit mx-auto lg:mx-0">
                                AI Phân tích hoàn tất
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                Chúc mừng! Đây là bản đồ tương lai của bạn
                            </h1>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                Dựa trên 50 câu hỏi khảo sát tâm lý và năng lực, chúng tôi đã tìm thấy những lối đi phù hợp nhất với con người bạn.
                            </p>
                            <Button size="lg" className="gap-2 w-fit mx-auto lg:mx-0 px-8 h-14 rounded-2xl shadow-xl shadow-primary/25">
                                <Download className="w-5 h-5" />
                                Tải báo cáo PDF
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Dashboard Section */}
                <section className="px-4 pb-20">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">

                        {/* Left Column: Strengths & Chart */}
                        <div className="flex-grow lg:w-2/3">
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-10 h-full">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-xl">
                                            <BarChart3 className="text-primary w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900">Thế mạnh & Sở thích</h2>
                                    </div>
                                    <button className="text-sm font-bold text-primary hover:underline">Chi tiết biểu đồ</button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10 items-center">
                                    {/* Radar Chart Placeholder (Custom SVG) */}
                                    <div className="relative aspect-square flex items-center justify-center">
                                        <svg viewBox="0 0 200 200" className="w-full h-full text-slate-200">
                                            {/* Grid Lines */}
                                            <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                            <polygon points="100,40 150,70 150,130 100,160 50,130 50,70" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                            <polygon points="100,60 130,80 130,120 100,140 70,120 70,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                            {/* Data Shape */}
                                            <polygon
                                                points="100,40 160,80 140,130 100,150 50,120 60,70"
                                                fill="rgba(0, 82, 204, 0.2)"
                                                stroke="#0052cc"
                                                strokeWidth="2"
                                            />
                                            {/* Labels (Conceptual) */}
                                            <text x="100" y="15" textAnchor="middle" className="text-[10px] fill-slate-400 font-bold uppercase">Công nghệ</text>
                                            <text x="180" y="70" textAnchor="start" className="text-[10px] fill-slate-400 font-bold uppercase">Kỹ thuật</text>
                                            <text x="180" y="140" textAnchor="start" className="text-[10px] fill-slate-400 font-bold uppercase">Kinh doanh</text>
                                            <text x="100" y="195" textAnchor="middle" className="text-[10px] fill-slate-400 font-bold uppercase">Xã hội</text>
                                            <text x="20" y="140" textAnchor="end" className="text-[10px] fill-slate-400 font-bold uppercase">Khoa học</text>
                                            <text x="20" y="70" textAnchor="end" className="text-[10px] fill-slate-400 font-bold uppercase">Nghệ thuật</text>
                                        </svg>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        <div className="bg-[#f0f9ff] p-8 rounded-[1.5rem] border border-blue-50/50">
                                            <h4 className="font-black text-slate-900 mb-3">Nhận xét tổng quan</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                Bạn có xu hướng mạnh về logic và giải quyết vấn đề. Bạn thích làm việc với các hệ thống phức tạp nhưng cũng có khả năng kết nối con người tốt.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-[#f0fdf4] p-5 rounded-2xl border border-green-50">
                                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Ưu điểm lớn nhất</p>
                                                <p className="text-sm font-black text-slate-900 leading-tight">Tư duy hệ thống</p>
                                            </div>
                                            <div className="bg-[#eff6ff] p-5 rounded-2xl border border-blue-50">
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Môi trường lý tưởng</p>
                                                <p className="text-sm font-black text-slate-900 leading-tight">Làm việc nhóm</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Careers */}
                        <div className="lg:w-1/3">
                            <div className="flex items-center gap-3 mb-8 px-2">
                                <div className="bg-primary/10 p-2 rounded-xl">
                                    <Briefcase className="text-primary w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900">Top 3 Nghề nghiệp</h2>
                            </div>

                            <div className="flex flex-col gap-5">
                                {[
                                    { job: "Kỹ sư Phần mềm", fitness: "98%", desc: "Phù hợp với tư duy logic và khả năng tự học công nghệ...", color: "bg-blue-500", icon: "code" },
                                    { job: "Chuyên gia Phân tích Dữ liệu", fitness: "92%", desc: "Kết hợp giữa toán học và sự nhạy bén trong kinh doanh.", color: "bg-primary", icon: "monitoring" },
                                    { job: "Thiết kế Sản phẩm (UX/UI)", fitness: "87%", desc: "Tận dụng khả năng thấu hiểu người dùng và sự sáng tạo sẵn có.", color: "bg-blue-600", icon: "architecture" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex gap-5 items-center group"
                                    >
                                        <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                            <MaterialIcon name={item.icon} className="text-3xl" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-black text-slate-900 leading-tight">{item.job}</h4>
                                                <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.fitness}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Universities Section */}
                <section className="px-4 py-20 bg-[#f8fafc]/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-between items-end mb-12">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-xl">
                                    <GraduationCap className="text-primary w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900">Đại học Khuyên dùng</h2>
                            </div>
                            <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors group">
                                Xem tất cả
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    name: "Đại học FPT",
                                    tag: "FPT",
                                    loc: "Hòa Lạc, Hà Nội",
                                    fee: "~25-30 triệu/kỳ",
                                    standard: "TOP 30% SchoolRank",
                                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkvc7L_m3TycX89AwgDNjufBaSSgrnUTR2b62-LM7Ohstz9wPYB51A2n36IvIiR5E1FIHFHgsTzcgHa9ZdTKrypSOPsDHWkKoRmYyNUZGVQgnyaYrV-ucCaNqkZdL1vaMYADwMYdtJtrK362GkEqUf20FSQsjPvC3nHjRYVNlAa69OvgFzCo_AInhV5sffbFmxQ1MyOkhAdq-Fljl7trRpJgY0W7WnN1i10_M1tTtdNf8C2JuMttbf0_T4V2why96A0FsAJlG1fNMg"
                                },
                                {
                                    name: "ĐH Bách Khoa Hà Nội",
                                    tag: "HUST",
                                    loc: "Hai Bà Trưng, Hà Nội",
                                    fee: "~22-45 triệu/năm",
                                    standard: "26.5 - 29.0 điểm",
                                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIUfYDHrV0pDIuNHM-pIXSrExV_pjy-cEV-Ag-RUeKmjXcp-K8R7njW2xAACikufUqtNyzhAENvqkJ078LTT6kUHit14RF95g2E_3HDlAm4o8_VyF-q-XDHbsq_TPrQymJALpAQPazLhCBZ-t04wEZBKvdukPKFSwikeC5jeF0Dft5SqmvvaSjEdvkSFunBqb5gQxjMaCpHcuXyEfW0IDM71GK9ixOP7OoECqhVT2Te0NZGFchmfaYWOn2XSotzjYDzPFm5p_mmpQH"
                                },
                                {
                                    name: "Đại học RMIT Việt Nam",
                                    tag: "RMIT",
                                    loc: "Quận 7, TP. HCM",
                                    fee: "~300 triệu/năm",
                                    standard: "Xét học bạ & Tiếng Anh",
                                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoLJasN0OG4IGxNUUi1Tx00hOuiuSh01Dp8hzF3jIUkByq6aWiSb9dYJwgGzdO4fQxDeBmwkoVoyHeGlZ-O-9LwaPYvmJkRZ1ibegCDczGCT4XAd2bYU7FAJ0LplKyCuUdvRpSO_3-B5cKwGpGy5aV7fw2OrqouBnUJddr_bjCmagdT--0h-bP7BI37f_uG9FkL6jsTQaZ3CnAUOCN2aXpNNhJhIKcUHPi5-aOzfqUmlbomPH_SGDVgl1WXiIbtgkf8mKse-dQj9UD"
                                }
                            ].map((uni, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -10 }}
                                    className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm flex flex-col group"
                                >
                                    <div className="relative h-60 overflow-hidden">
                                        <img src={uni.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt={uni.name} />
                                        <div className="absolute top-4 left-4 bg-white px-4 py-1.5 rounded-full shadow-lg">
                                            <span className="text-primary font-black tracking-widest text-xs">{uni.tag}</span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col gap-6">
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 mb-1">{uni.name}</h4>
                                            <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                                <MaterialIcon name="location_on" className="text-sm" />
                                                {uni.loc}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Học phí</p>
                                                <p className="text-xs font-black text-slate-900">{uni.fee}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Điểm chuẩn</p>
                                                <p className="text-xs font-black text-slate-900">{uni.standard}</p>
                                            </div>
                                        </div>
                                        <Button variant="secondary" className="w-full rounded-2xl h-12 font-black">Tìm hiểu thêm</Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA Footer */}
                <section className="px-4 pb-20">
                    <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
                        <div className="relative z-10 flex flex-col items-center gap-8">
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                Vẫn chưa chắc chắn về lựa chọn?
                            </h2>
                            <p className="text-lg text-slate-400 font-medium max-w-2xl leading-relaxed">
                                Bạn có thể lưu kết quả này để xem lại sau hoặc so sánh trực tiếp các tiêu chí giữa các trường đại học bạn quan tâm.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" className="gap-3 px-10 rounded-2xl h-14 shadow-lg shadow-primary/25">
                                    <MaterialIcon name="compare_arrows" />
                                    So sánh các trường
                                </Button>
                                <Button variant="secondary" size="lg" className="gap-3 px-10 rounded-2xl h-14 bg-white/10 text-white hover:bg-white/20 border-none">
                                    <Bookmark className="w-5 h-5" />
                                    Lưu kết quả
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
