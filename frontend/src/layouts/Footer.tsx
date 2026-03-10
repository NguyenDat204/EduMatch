import { Facebook, Mail, Phone } from 'lucide-react';

const MatIcon = ({ name, className = '' }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <MatIcon name="school" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EduMatch</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Nền tảng định hướng nghề nghiệp cá nhân hóa bằng AI hàng đầu Việt Nam. Đồng hành cùng sĩ tử chinh phục ước mơ.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Liên kết</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 dark:text-slate-400">
              {['Về EduMatch', 'Dành cho học sinh', 'Cẩm nang tuyển sinh', 'Hợp tác trường học'].map(l => (
                <li key={l}><a className="hover:text-primary transition-colors" href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Hỗ trợ</h4>
            <ul className="flex flex-col gap-4 text-sm text-slate-500 dark:text-slate-400">
              {['Câu hỏi thường gặp', 'Trung tâm trợ giúp', 'Điều khoản dịch vụ', 'Chính sách bảo mật'].map(l => (
                <li key={l}><a className="hover:text-primary transition-colors" href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-900 dark:text-white">Kết nối</h4>
            <div className="flex gap-4">
              {[<Facebook className="w-5 h-5" />, <Mail className="w-5 h-5" />, <Phone className="w-5 h-5" />].map((icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-xs">
          © 2024 EduMatch. All rights reserved. Made for Vietnamese Students.
        </div>
      </div>
    </footer>
  );
};
