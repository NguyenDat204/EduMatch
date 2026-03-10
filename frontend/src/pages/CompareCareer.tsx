import { Scale, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { DashboardLayout } from '../layouts';

const careersToCompare = [
  {
    id: 1,
    name: 'Kỹ sư phần mềm',
    salary: '15M - 40M VNĐ',
    difficulty: 'Cao',
    outlook: 'Rất tốt',
    skills: ['Lập trình', 'Giải quyết vấn đề', 'Tư duy logic', 'Tiếng Anh'],
  },
  {
    id: 2,
    name: 'Thiết kế đồ họa',
    salary: '10M - 25M VNĐ',
    difficulty: 'Trung bình',
    outlook: 'Tốt',
    skills: ['Sáng tạo', 'Thẩm mỹ', 'Sử dụng công cụ thiết kế', 'Giao tiếp'],
  }
];

export const CompareCareer = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl mb-4">
            <Scale size={24} />
          </div>
          <h1 className="text-3xl font-display font-bold mb-2">So sánh nghề nghiệp</h1>
          <p className="text-slate-500">So sánh lên đến 3 nghề nghiệp để tìm ra con đường phù hợp nhất với bạn.</p>
        </div>

        <div className="overflow-x-auto pb-6">
          <div className="min-w-[800px] grid grid-cols-3 gap-6">
            {/* Header Column */}
            <div className="space-y-6 pt-16 font-bold text-slate-700 dark:text-slate-300">
              <div className="h-20 flex items-center">Mức lương dự kiến</div>
              <div className="h-20 flex items-center">Độ khó năng lực</div>
              <div className="h-20 flex items-center">Triển vọng tương lai</div>
              <div className="py-4">Kỹ năng cốt lõi</div>
            </div>

            {/* Career Columns */}
            {careersToCompare.map(career => (
              <div key={career.id} className="glass p-6 rounded-[2rem] border-none shadow-premium animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-2xl font-bold font-display text-center mb-6 h-10">{career.name}</h3>
                
                <div className="space-y-6">
                  <div className="h-20 flex flex-col justify-center items-center bg-green-50 dark:bg-green-900/20 rounded-2xl">
                    <DollarSign size={20} className="text-green-600 mb-1" />
                    <span className="font-bold text-green-700 dark:text-green-400">{career.salary}</span>
                  </div>
                  
                  <div className="h-20 flex flex-col justify-center items-center bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                    <span className="font-bold text-amber-700 dark:text-amber-400">{career.difficulty}</span>
                  </div>

                  <div className="h-20 flex flex-col justify-center items-center bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <TrendingUp size={20} className="text-blue-600 mb-1" />
                    <span className="font-bold text-blue-700 dark:text-blue-400">{career.outlook}</span>
                  </div>

                  <div className="pt-4 space-y-3">
                    {career.skills.map(skill => (
                      <div key={skill} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 size={16} className="text-primary-500 shrink-0 mt-0.5" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
