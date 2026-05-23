import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  AlignJustify,
  GraduationCap,
  Brain,
  Target,
  Users,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const Home = () => {
  return (
    <>
      <main>
        {/* ─── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-navy-950 text-white py-20 lg:py-28">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex flex-col gap-7"
              >
                <div className="inline-flex items-center gap-2 bg-primary-600/20 border border-primary-500/30 text-primary-300 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider w-fit">
                  <Brain size={13} />
                  Ứng dụng AI định hướng nghề nghiệp
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                  Chọn đúng ngành –{' '}
                  <span className="text-primary-400">Chọn đúng tương lai</span>
                </h1>

                <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                  Nền tảng AI phân tích tính cách, học lực và sở thích để gợi ý ngành học và trường đại học phù hợp nhất với bạn.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-2 px-7 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-colors shadow-lg group"
                  >
                    Bắt đầu miễn phí
                    <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-lg transition-colors"
                  >
                    Đăng nhập
                  </Link>
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-6 pt-2">
                  <div>
                    <p className="text-2xl font-black text-white">50k+</p>
                    <p className="text-xs text-slate-500">Học sinh đã dùng</p>
                  </div>
                  <div className="w-px h-10 bg-navy-700" />
                  <div>
                    <p className="text-2xl font-black text-white">98.5%</p>
                    <p className="text-xs text-slate-500">Độ chính xác AI</p>
                  </div>
                  <div className="w-px h-10 bg-navy-700" />
                  <div>
                    <p className="text-2xl font-black text-white">500+</p>
                    <p className="text-xs text-slate-500">Trường đối tác</p>
                  </div>
                </div>
              </motion.div>

              {/* Hero visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative hidden lg:block"
              >
                <div className="relative rounded-2xl overflow-hidden border border-navy-700 shadow-modal">
                  <img
                    alt="Học sinh định hướng nghề nghiệp"
                    className="w-full h-[420px] object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIUfYDHrV0pDIuNHM-pIXSrExV_pjy-cEV-Ag-RUeKmjXcp-K8R7njW2xAACikufUqtNyzhAENvqkJ078LTT6kUHit14RF95g2E_3HDlAm4o8_VyF-q-XDHbsq_TPrQymJALpAQPazLhCBZ-t04wEZBKvdukPKFSwikeC5jeF0Dft5SqmvvaSjEdvkSFunBqb5gQxjMaCpHcuXyEfW0IDM71GK9ixOP7OoECqhVT2Te0NZGFchmfaYWOn2XSotzjYDzPFm5p_mmpQH"
                  />
                  {/* Overlay card */}
                  <div className="absolute bottom-4 left-4 right-4 bg-navy-950/90 backdrop-blur-sm border border-navy-700 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                      <CheckCircle2 size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Phân tích hoàn tất</p>
                      <p className="text-xs text-slate-400">AI đã tìm thấy 5 ngành nghề phù hợp với bạn</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Problem ──────────────────────────────────────────── */}
        <section className="py-20 bg-white dark:bg-navy-950" id="problem">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 dark:text-white">
                Bạn đang cảm thấy mông lung?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Hàng năm có đến 60% sinh viên chọn sai ngành nghề do thiếu định hướng từ sớm.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <AlignJustify size={24} className="text-primary-600" />,
                  title: 'Quá nhiều lựa chọn',
                  desc: 'Hàng trăm ngành học mới xuất hiện khiến bạn không biết đâu là thế mạnh thực sự của mình.',
                },
                {
                  icon: <HeartHandshake size={24} className="text-primary-600" />,
                  title: 'Áp lực từ gia đình',
                  desc: 'Sự khác biệt trong định hướng giữa ba mẹ và con cái tạo nên những rào cản tâm lý khó gỡ.',
                },
                {
                  icon: <AlertTriangle size={24} className="text-primary-600" />,
                  title: 'Rủi ro thất nghiệp',
                  desc: 'Học ngành không phù hợp dẫn đến việc chán nản và khó tìm việc sau khi ra trường.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={{ ...fadeUp, show: { ...fadeUp.show, transition: { duration: 0.5, delay: i * 0.1 } } }}
                  className="p-7 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                >
                  <div className="w-11 h-11 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-5">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─────────────────────────────────────── */}
        <section className="py-20 bg-slate-50 dark:bg-background-dark" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 dark:text-white">
                Chỉ 3 bước đơn giản
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                EduMatch giúp bạn phác họa lộ trình tương lai rõ ràng trong vài phút.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Users size={24} className="text-white" />,
                  num: '01',
                  title: 'Nhập thông tin',
                  desc: 'Cung cấp sở thích cá nhân, điểm số các môn học và trả lời bài trắc nghiệm tính cách.',
                },
                {
                  icon: <Brain size={24} className="text-white" />,
                  num: '02',
                  title: 'AI Phân tích',
                  desc: 'Thuật toán AI đối chiếu thông tin của bạn với dữ liệu hàng nghìn ngành học và trường đại học.',
                },
                {
                  icon: <Target size={24} className="text-white" />,
                  num: '03',
                  title: 'Nhận kết quả',
                  desc: 'Nhận báo cáo chi tiết về ngành học phù hợp nhất và danh sách các trường đại học tối ưu.',
                },
              ].map((step, i) => (
                <div key={i} className="relative group">
                  <div className="h-full flex flex-col p-7 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 hover:border-primary-400 dark:hover:border-primary-600 transition-colors shadow-card">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-11 h-11 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                        {step.icon}
                      </div>
                      <span className="text-4xl font-black text-slate-100 dark:text-navy-800 select-none">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{step.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features ─────────────────────────────────────────── */}
        <section className="py-20 bg-navy-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight">
                  Cá nhân hóa tối đa cho{' '}
                  <span className="text-primary-400">mỗi học sinh</span>
                </h2>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { icon: <Brain size={18} className="text-primary-400" />, title: 'Tính cách', desc: 'Phân tích MBTI & RIASEC để hiểu bạn là ai.' },
                    { icon: <TrendingUp size={18} className="text-primary-400" />, title: 'Học lực', desc: 'Đối chiếu điểm số để chọn trường phù hợp.' },
                    { icon: <GraduationCap size={18} className="text-primary-400" />, title: 'Trường học', desc: 'Gợi ý trường đại học tốt nhất cho bạn.' },
                    { icon: <MessageSquare size={18} className="text-primary-400" />, title: 'AI Tư vấn', desc: 'Chat trực tiếp với AI Advisor 24/7.' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-2.5">
                      <div className="w-9 h-9 bg-primary-600/20 border border-primary-500/30 rounded-lg flex items-center justify-center">
                        {item.icon}
                      </div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-navy-700 mt-8">
                  <img
                    alt="Sinh viên học tập"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkvc7L_m3TycX89AwgDNjufBaSSgrnUTR2b62-LM7Ohstz9wPYB51A2n36IvIiR5E1FIHFHgsTzcgHa9ZdTKrypSOPsDHWkKoRmYyNUZGVQgnyaYrV-ucCaNqkZdL1vaMYADwMYdtJtrK362GkEqUf20FSQsjPvC3nHjRYVNlAa69OvgFzCo_AInhV5sffbFmxQ1MyOkhAdq-Fljl7trRpJgY0W7WnN1i10_M1tTtdNf8C2JuMttbf0_T4V2why96A0FsAJlG1fNMg"
                  />
                </div>
                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-navy-700">
                  <img
                    alt="Khuôn viên đại học"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoLJasN0OG4IGxNUUi1Tx00hOuiuSh01Dp8hzF3jIUkByq6aWiSb9dYJwgGzdO4fQxDeBmwkoVoyHeGlZ-O-9LwaPYvmJkRZ1ibegCDczGCT4XAd2bYU7FAJ0LplKyCuUdvRpSO_3-B5cKwGpGy5aV7fw2OrqouBnUJddr_bjCmagdT--0h-bP7BI37f_uG9FkL6jsTQaZ3CnAUOCN2aXpNNhJhIKcUHPi5-aOzfqUmlbomPH_SGDVgl1WXiIbtgkf8mKse-dQj9UD"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── For Universities ─────────────────────────────────── */}
        <section className="py-20 bg-white dark:bg-navy-950" id="universities">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-primary-200 dark:border-primary-800/50 bg-primary-50 dark:bg-primary-900/10 p-10 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 dark:bg-primary-800/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="relative grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                    Dành cho các trường Đại học
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-7 leading-relaxed">
                    Kết nối trực tiếp với những học sinh tiềm năng phù hợp nhất với tiêu chí tuyển sinh. Gia tăng tỷ lệ nhập học đúng ngành.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/register"
                      className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Hợp tác ngay
                    </Link>
                    <button className="px-6 py-2.5 border border-slate-300 dark:border-navy-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors">
                      Xem giải pháp
                    </button>
                  </div>
                </div>
                <div className="hidden md:grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6 rounded-xl">
                    <p className="text-primary-600 text-2xl font-black mb-1">500+</p>
                    <p className="text-slate-500 text-sm">Đối tác giáo dục</p>
                  </div>
                  <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-6 rounded-xl mt-6">
                    <p className="text-primary-600 text-2xl font-black mb-1">10k+</p>
                    <p className="text-slate-500 text-sm">Hồ sơ/tháng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ────────────────────────────────────────── */}
        <section className="py-20 bg-slate-50 dark:bg-background-dark">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col gap-6 items-center"
            >
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                Bạn đã sẵn sàng cho hành trình tương lai chưa?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Tham gia cùng hơn 50,000 học sinh đã tìm thấy con đường sự nghiệp lý tưởng cùng EduMatch.
              </p>
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-lg group"
              >
                Bắt đầu định hướng ngay – Miễn phí
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
};
