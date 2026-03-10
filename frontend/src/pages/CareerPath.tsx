import { Map as MapIcon, Briefcase, GraduationCap, Award, Star } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { useParams } from 'react-router-dom';

export const CareerPath = () => {
  const { id } = useParams();
  console.log('Career Path for:', id);

  const pathSteps = [
    {
      title: 'Sinh viên / Thực tập sinh',
      duration: 'Năm 3 - Năm 4 Đại học',
      icon: GraduationCap,
      description: 'Học hỏi nền tảng, tham gia các dự án thực tế nhỏ, xây dựng portfolio.',
      skills: ['Lập trình cơ bản', 'Git', 'Làm việc nhóm']
    },
    {
      title: 'Nhân viên (Junior)',
      duration: '1 - 3 năm kinh nghiệm',
      icon: Briefcase,
      description: 'Tham gia phát triển module hệ thống, làm việc dưới sự hướng dẫn của Senior.',
      skills: ['Frameworks', 'Viết code sạch', 'Giao tiếp kỹ thuật']
    },
    {
      title: 'Chuyên viên (Senior)',
      duration: '3 - 5+ năm kinh nghiệm',
      icon: Star,
      description: 'Làm chủ công nghệ, thiết kế kiến trúc hệ thống, hướng dẫn junior.',
      skills: ['System Design', 'Performance Tuning', 'Leadership']
    },
    {
      title: 'Chuyên gia / Quản lý (Lead)',
      duration: '5+ năm kinh nghiệm',
      icon: Award,
      description: 'Quản lý dự án, định hướng công nghệ cho team, làm việc với các bên liên quan.',
      skills: ['Project Management', 'Agile', 'Strategic Thinking']
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 animate-slide-up">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
            <MapIcon size={24} />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">Lộ trình phát triển</h1>
          <p className="text-slate-500">Kỹ sư phần mềm (Software Engineer) - Lộ trình từng bước tiến tới chuyên gia.</p>
        </div>

        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
          {pathSteps.map((step, index) => (
            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">
                <step.icon size={20} />
              </div>

              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass p-6 rounded-2xl border-none shadow-premium hover:-translate-y-1 transition-transform">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{step.title}</h3>
                  <span className="text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">{step.duration}</span>
                </div>
                <p className="text-slate-500 text-sm mb-4">{step.description}</p>
                <div className="flex flex-wrap gap-2">
                  {step.skills.map(skill => (
                    <span key={skill} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
