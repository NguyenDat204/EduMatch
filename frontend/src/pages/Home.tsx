import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Compass,
  GraduationCap,
  HeartHandshake,
  Layers3,
  MessageSquare,
  Route,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const riasecTypes = [
  { code: 'R', name: 'Realistic', label: 'Thực tế', desc: 'Thích làm việc với công cụ, máy móc, kỹ thuật hoặc hoạt động thực hành.', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { code: 'I', name: 'Investigative', label: 'Nghiên cứu', desc: 'Tò mò, thích phân tích, tìm nguyên nhân và giải quyết vấn đề bằng dữ liệu.', color: 'bg-sky-50 text-sky-700 border-sky-100' },
  { code: 'A', name: 'Artistic', label: 'Nghệ thuật', desc: 'Ưa sáng tạo, biểu đạt ý tưởng, thiết kế, nội dung hoặc trải nghiệm mới.', color: 'bg-rose-50 text-rose-700 border-rose-100' },
  { code: 'S', name: 'Social', label: 'Xã hội', desc: 'Muốn hỗ trợ, giảng dạy, giao tiếp và tạo ảnh hưởng tích cực đến người khác.', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { code: 'E', name: 'Enterprising', label: 'Quản lý', desc: 'Có xu hướng dẫn dắt, thuyết phục, kinh doanh hoặc thúc đẩy dự án.', color: 'bg-violet-50 text-violet-700 border-violet-100' },
  { code: 'C', name: 'Conventional', label: 'Quy củ', desc: 'Thích cấu trúc rõ ràng, số liệu, quy trình, kế hoạch và tính chính xác.', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

const methodSteps = [
  {
    icon: <SearchCheck size={20} />,
    title: 'Khám phá bản thân',
    desc: 'Bài khảo sát ghi nhận sở thích, cách bạn xử lý vấn đề, môi trường học tập và kiểu hoạt động khiến bạn có năng lượng.',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Chấm điểm có cấu trúc',
    desc: 'EduMatch tính điểm theo các nhóm RIASEC, năng lực học tập và mức độ nhất quán của câu trả lời trước khi đưa vào AI diễn giải.',
  },
  {
    icon: <Route size={20} />,
    title: 'Gợi ý có lộ trình',
    desc: 'Kết quả không chỉ là tên ngành, mà còn có lý do phù hợp, kỹ năng cần bồi dưỡng và hướng đi tiếp theo.',
  },
];

const features = [
  { icon: <Brain size={18} />, title: 'RIASEC + AI', desc: 'Kết hợp mô hình hướng nghiệp phổ biến với khả năng diễn giải cá nhân hóa.' },
  { icon: <Target size={18} />, title: 'Điểm phù hợp rõ ràng', desc: 'Hiển thị mức độ phù hợp và lý do, giúp bạn hiểu vì sao ngành đó được đề xuất.' },
  { icon: <GraduationCap size={18} />, title: 'Gắn với học tập', desc: 'Xem xét học lực, sở thích và kỹ năng để gợi ý hướng đi thực tế hơn.' },
  { icon: <MessageSquare size={18} />, title: 'AI tư vấn sau khảo sát', desc: 'Tiếp tục đặt câu hỏi, so sánh ngành và làm rõ lựa chọn sau khi có kết quả.' },
];

export const Home = () => {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section id="top" className="relative min-h-[calc(100vh-4rem)] bg-navy-950 text-white flex items-center">
        <img
          src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1800&q=80"
          alt="Học sinh thảo luận định hướng tương lai"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.34]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/88 to-navy-950/35" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-navy-950 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 w-full">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky-100 backdrop-blur">
              <Sparkles size={13} />
              EduMatch AI Career Guidance
            </motion.div>

            <motion.h1 variants={fadeUp} className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] text-white">
              Hiểu mình hơn trước khi chọn ngành.
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-slate-200">
              EduMatch giúp học sinh khám phá nhóm tính cách nghề nghiệp RIASEC, kết hợp học lực và sở thích để gợi ý ngành học, kỹ năng và lộ trình phù hợp hơn.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-950/20 transition-colors hover:bg-primary-500"
              >
                Bắt đầu trắc nghiệm
                <ArrowRight size={17} />
              </Link>
              <a
                href="#riasec"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/15"
              >
                Tìm hiểu RIASEC
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {[
                ['6 nhóm', 'RIASEC'],
                ['3 lớp', 'Phân tích'],
                ['1 lộ trình', 'Cá nhân hóa'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-300">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="bg-white py-20 dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} variants={fadeUp} className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wider text-primary-600">Vấn đề</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Chọn ngành không nên chỉ dựa vào cảm tính.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              Một lựa chọn ngành học tốt cần nhìn cùng lúc vào sở thích, năng lực, môi trường làm việc mong muốn và cơ hội phát triển. EduMatch biến những yếu tố đó thành một bức tranh dễ hiểu hơn.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={stagger} className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { icon: <Compass size={21} />, title: 'Nhiều lựa chọn nhưng thiếu hướng', desc: 'Ngành học thay đổi nhanh, học sinh dễ bị cuốn theo xu hướng mà chưa hiểu điểm mạnh thật sự.' },
              { icon: <HeartHandshake size={21} />, title: 'Kỳ vọng từ nhiều phía', desc: 'Gia đình, bạn bè và xã hội đều có ảnh hưởng, khiến quyết định cá nhân trở nên khó rõ ràng.' },
              { icon: <ShieldCheck size={21} />, title: 'Cần một cách nhìn khách quan', desc: 'Một hệ thống chấm điểm minh bạch giúp học sinh có thêm cơ sở để trao đổi và tự quyết.' },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp} className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-navy-700 dark:bg-navy-900">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm dark:bg-navy-800">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* RIASEC */}
      <section id="riasec" className="bg-slate-50 py-20 dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} variants={fadeUp} className="lg:sticky lg:top-24">
              <p className="text-sm font-bold uppercase tracking-wider text-primary-600">RIASEC là gì?</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                Một ngôn ngữ đơn giản để hiểu xu hướng nghề nghiệp.
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
                RIASEC chia sở thích nghề nghiệp thành 6 nhóm: Realistic, Investigative, Artistic, Social, Enterprising và Conventional. Thay vì gắn nhãn cứng, EduMatch dùng RIASEC như bản đồ tham chiếu để hiểu bạn nghiêng về kiểu hoạt động nào.
              </p>
              <div className="mt-6 rounded-xl border border-primary-100 bg-white p-5 dark:border-primary-900/40 dark:bg-navy-900">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 text-primary-600" size={19} />
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Kết quả tốt nhất không phải là một chữ cái duy nhất, mà là tổ hợp điểm giúp bạn thấy ngành nào phù hợp, ngành nào nên khám phá thêm.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid gap-4 sm:grid-cols-2">
              {riasecTypes.map((type) => (
                <motion.div key={type.code} variants={fadeUp} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-navy-700 dark:bg-navy-900">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-lg border text-lg font-black ${type.color}`}>
                      {type.code}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{type.label}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{type.name}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{type.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Method */}
      <section id="how-it-works" className="bg-white py-20 dark:bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} variants={fadeUp} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-primary-600">Cách EduMatch hoạt động</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Từ câu trả lời đến gợi ý có thể hành động.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Hệ thống không để AI tự đoán toàn bộ. Điểm số được tính có cấu trúc trước, sau đó AI giúp diễn giải thành lời khuyên dễ hiểu.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={stagger} className="mt-12 grid gap-5 md:grid-cols-3">
            {methodSteps.map((step, index) => (
              <motion.div key={step.title} variants={fadeUp} className="relative rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-navy-700 dark:bg-navy-900">
                <span className="absolute right-5 top-5 text-4xl font-black text-slate-200 dark:text-navy-800">
                  0{index + 1}
                </span>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-600 text-white">
                  {step.icon}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About EduMatch */}
      <section id="edumatch" className="bg-navy-950 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} variants={fadeUp}>
              <p className="text-sm font-bold uppercase tracking-wider text-sky-300">Về EduMatch</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-black leading-tight">
                Một người bạn định hướng, không phải chiếc máy phán quyết.
              </h2>
              <p className="mt-4 leading-relaxed text-slate-300">
                EduMatch được xây dựng để giúp học sinh có thêm cơ sở suy nghĩ về tương lai. Kết quả gợi ý là điểm bắt đầu cho việc khám phá, trao đổi với gia đình, thầy cô và tiếp tục kiểm chứng bằng trải nghiệm thực tế.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {features.map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-300">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.6 }} className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur">
              <div className="rounded-xl bg-white p-5 text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kết quả mẫu</p>
                    <h3 className="mt-1 text-lg font-black">Holland Code: I-A-S</h3>
                  </div>
                  <Brain className="text-primary-600" size={26} />
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    ['Investigative', 88],
                    ['Artistic', 76],
                    ['Social', 72],
                  ].map(([label, score]) => (
                    <div key={label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-semibold">{label}</span>
                        <span className="text-slate-500">{score}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-primary-600" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-bold">Gợi ý phù hợp</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    Nhóm ngành phân tích dữ liệu, thiết kế trải nghiệm hoặc giáo dục công nghệ có thể là hướng đáng khám phá.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section id="universities" className="bg-slate-50 py-20 dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="grid gap-5 lg:grid-cols-2">
            <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-navy-700 dark:bg-navy-900">
              <Users className="text-primary-600" size={28} />
              <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">Dành cho học sinh</h2>
              <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
                Làm trắc nghiệm, xem nhóm RIASEC nổi bật, lưu ngành yêu thích, chat với AI Advisor và từng bước xây dựng hồ sơ học tập rõ ràng hơn.
              </p>
              <Link to="/register" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700">
                Khám phá ngay
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-navy-700 dark:bg-navy-900">
              <BookOpenCheck className="text-emerald-600" size={28} />
              <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">Dành cho nhà trường</h2>
              <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
                EduMatch giúp trường đại học tiếp cận học sinh đang có xu hướng phù hợp với ngành đào tạo, từ đó tư vấn tuyển sinh đúng nhu cầu hơn.
              </p>
              <a href="#edumatch" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-navy-600 dark:text-slate-200 dark:hover:bg-navy-800">
                Xem cách hệ thống hoạt động
                <Layers3 size={16} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 dark:bg-navy-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              Bắt đầu bằng việc hiểu mình.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-400">
              Một bài khảo sát tốt không chọn ngành thay bạn. Nó giúp bạn có thêm dữ liệu để tự tin hơn khi ra quyết định.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-primary-700">
                Làm trắc nghiệm miễn phí
                <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-7 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-navy-700 dark:text-slate-200 dark:hover:bg-navy-900">
                Đăng nhập
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};
