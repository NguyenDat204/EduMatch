import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkle,
  BadgeCheck,
  AlertTriangle,
  HeartHandshake,
  AlignJustify,
  Heart,
  Banknote,
  MapPin,
} from 'lucide-react';

// Material Symbols helper (uses Google Fonts loaded in index.html)
const MatIcon = ({ name, className = '' }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const Home = () => {
  return (
    <>
      <main>
        {/* ─── Hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fadeUp}
                className="flex flex-col gap-8"
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                  <MatIcon name="auto_awesome" className="text-sm" />
                  Ứng dụng công nghệ AI tiên phong
                </div>
                <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                  Chọn đúng ngành – Chọn đúng trường –{' '}
                  <span className="text-primary">Chọn đúng tương lai</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                  Nền tảng AI định hướng ngành học và gợi ý trường đại học cá nhân hóa dựa trên năng lực và đam mê của bạn.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2 group"
                  >
                    Bắt đầu định hướng ngay
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                    Khám phá thêm
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="relative"
              >
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl rotate-2 relative">
                  <img
                    alt="Nhóm học sinh đang thảo luận vui vẻ"
                    className="rounded-lg w-full h-[400px] object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIUfYDHrV0pDIuNHM-pIXSrExV_pjy-cEV-Ag-RUeKmjXcp-K8R7njW2xAACikufUqtNyzhAENvqkJ078LTT6kUHit14RF95g2E_3HDlAm4o8_VyF-q-XDHbsq_TPrQymJALpAQPazLhCBZ-t04wEZBKvdukPKFSwikeC5jeF0Dft5SqmvvaSjEdvkSFunBqb5gQxjMaCpHcuXyEfW0IDM71GK9ixOP7OoECqhVT2Te0NZGFchmfaYWOn2XSotzjYDzPFm5p_mmpQH"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700 animate-bounce-slow">
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                      <BadgeCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Độ chính xác</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">98.5%</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Problem ───────────────────────────────────────────── */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900/50" id="problem">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-6">Bạn đang cảm thấy mông lung?</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Hàng năm có đến 60% sinh viên chọn sai ngành nghề do thiếu định hướng từ sớm. Đừng để mình nằm trong con số đó.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <AlignJustify className="w-9 h-9 text-primary" />, title: 'Quá nhiều lựa chọn', desc: 'Hàng trăm ngành học mới xuất hiện khiến bạn không biết đâu là thế mạnh thực sự của mình.' },
                { icon: <HeartHandshake className="w-9 h-9 text-primary" />, title: 'Áp lực từ gia đình', desc: 'Sự khác biệt trong định hướng giữa ba mẹ và con cái tạo nên những rào cản tâm lý khó gỡ.' },
                { icon: <AlertTriangle className="w-9 h-9 text-primary" />, title: 'Rủi ro thất nghiệp', desc: 'Học ngành không phù hợp dẫn đến việc chán nản và khó tìm việc sau khi ra trường.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial="hidden" whileInView="show" viewport={{ once: true }}
                  variants={{ ...fadeUp, show: { ...fadeUp.show, transition: { duration: 0.6, delay: i * 0.1 } } }}
                  className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ──────────────────────────────────────── */}
        <section className="py-20" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-black mb-4">Quy trình thông minh</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">Chỉ với 3 bước đơn giản, EduMatch sẽ giúp bạn phác họa lộ trình tương lai rõ ràng nhất.</p>
              </div>
              <ArrowRight className="hidden md:block w-20 h-20 text-slate-200 dark:text-slate-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
              {[
                { icon: 'person_edit', num: '01', title: 'Nhập thông tin', desc: 'Cung cấp sở thích cá nhân, điểm số các môn học và ngân sách học tập của gia đình bạn.' },
                { icon: 'smart_toy',   num: '02', title: 'AI Phân tích',   desc: 'Thuật toán AI nâng cao sẽ đối chiếu thông tin của bạn với dữ liệu hàng nghìn ngành học và trường đại học.' },
                { icon: 'task_alt',   num: '03', title: 'Nhận kết quả',  desc: 'Nhận báo cáo chi tiết về ngành học phù hợp nhất và danh sách các trường đại học tối ưu cho bạn.' },
              ].map((step, i) => (
                <div key={i} className="relative group">
                  <div className="h-full flex flex-col p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                      <MatIcon name={step.icon} className="text-3xl" />
                    </div>
                    <span className="text-primary font-black text-5xl opacity-10 absolute top-8 right-8 select-none">{step.num}</span>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Personalization ───────────────────────────────────── */}
        <section className="py-20 bg-background-dark text-white rounded-[3rem] mx-4 sm:mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
                  Cá nhân hóa tối đa cho <span className="text-primary">mỗi học sinh</span>
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: <Heart className="text-primary w-5 h-5" />, title: 'Sở thích', desc: 'Khám phá đam mê và sở trường tiềm ẩn của bản thân.' },
                    { icon: <Sparkle className="text-primary w-5 h-5" />,  title: 'Điểm số',  desc: 'Phân tích học lực để chọn trường vừa sức, an toàn.' },
                    { icon: <Banknote className="text-primary w-5 h-5" />, title: 'Học phí',  desc: 'Gợi ý các trường phù hợp với điều kiện kinh tế gia đình.' },
                    { icon: <MapPin className="text-primary w-5 h-5" />,   title: 'Khoảng cách', desc: 'Lựa chọn môi trường học tập tại vị trí thuận lợi nhất.' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <div className="bg-primary/20 p-3 rounded-xl w-fit">{item.icon}</div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mt-8">
                  <img
                    alt="Sinh viên đang học tập"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkvc7L_m3TycX89AwgDNjufBaSSgrnUTR2b62-LM7Ohstz9wPYB51A2n36IvIiR5E1FIHFHgsTzcgHa9ZdTKrypSOPsDHWkKoRmYyNUZGVQgnyaYrV-ucCaNqkZdL1vaMYADwMYdtJtrK362GkEqUf20FSQsjPvC3nHjRYVNlAa69OvgFzCo_AInhV5sffbFmxQ1MyOkhAdq-Fljl7trRpJgY0W7WnN1i10_M1tTtdNf8C2JuMttbf0_T4V2why96A0FsAJlG1fNMg"
                  />
                </div>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    alt="Khuôn viên trường đại học"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoLJasN0OG4IGxNUUi1Tx00hOuiuSh01Dp8hzF3jIUkByq6aWiSb9dYJwgGzdO4fQxDeBmwkoVoyHeGlZ-O-9LwaPYvmJkRZ1ibegCDczGCT4XAd2bYU7FAJ0LplKyCuUdvRpSO_3-B5cKwGpGy5aV7fw2OrqouBnUJddr_bjCmagdT--0h-bP7BI37f_uG9FkL6jsTQaZ3CnAUOCN2aXpNNhJhIKcUHPi5-aOzfqUmlbomPH_SGDVgl1WXiIbtgkf8mKse-dQj9UD"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── For Universities ──────────────────────────────────── */}
        <section className="py-24" id="universities">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary/5 rounded-[2.5rem] p-8 md:p-16 border border-primary/10 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none select-none">
                <MatIcon name="account_balance" className="text-[200px]" />
              </div>
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                    Dành cho các trường Đại học & Cao đẳng
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    Kết nối trực tiếp với những học sinh tiềm năng và phù hợp nhất với tiêu chí tuyển sinh của nhà trường. Gia tăng tỷ lệ nhập học đúng ngành.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg transition-all">Hợp tác ngay</button>
                    <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">Xem giải pháp</button>
                  </div>
                </div>
                <div className="hidden md:grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
                    <p className="text-primary text-2xl font-black mb-1">500+</p>
                    <p className="text-slate-500 text-sm font-medium">Đối tác giáo dục</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm mt-8">
                    <p className="text-primary text-2xl font-black mb-1">10k+</p>
                    <p className="text-slate-500 text-sm font-medium">Hồ sơ/tháng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─────────────────────────────────────────── */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col gap-8 items-center"
            >
              <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                Bạn đã sẵn sàng cho hành trình tương lai chưa?
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
                Tham gia cùng hơn 50,000 học sinh lớp 12 đã tìm thấy con đường sự nghiệp lý tưởng cùng EduMatch.
              </p>
              <Link
                to="/register"
                className="bg-primary hover:bg-primary/90 text-white px-12 py-5 rounded-2xl text-xl font-black transition-all shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95"
              >
                Bắt đầu định hướng ngay – Miễn phí!
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>
    </>
  );
};
