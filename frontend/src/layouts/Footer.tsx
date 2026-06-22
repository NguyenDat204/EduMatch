import { Link } from 'react-router-dom';
import { Facebook, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-800 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/edumatch_logo.jpg" alt="EduMatch" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-lg font-bold text-white">EduMatch</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500">
              Nền tảng định hướng nghề nghiệp kết hợp RIASEC, dữ liệu học tập và AI dành cho học sinh Việt Nam.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Liên kết</h4>
            <ul className="space-y-3 text-sm">
              {[
                ['Về EduMatch', '/#edumatch'],
                ['RIASEC', '/#riasec'],
                ['Cách hoạt động', '/#how-it-works'],
                ['Hợp tác trường học', '/#universities'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="hover:text-primary-400 transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-3 text-sm">
              {[
                ['Đăng nhập', '/login'],
                ['Tạo tài khoản', '/register'],
                ['AI tư vấn', '/chat'],
                ['Đóng góp ý kiến', '/feedback'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="hover:text-primary-400 transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Kết nối</h4>
            <div className="flex gap-3">
              {[
                { icon: <Facebook size={16} />, label: 'Facebook' },
                { icon: <Mail size={16} />, label: 'Email' },
                { icon: <Phone size={16} />, label: 'Phone' },
              ].map((item) => (
                <a
                  key={item.label}
                  href="#"
                  aria-label={item.label}
                  className="w-9 h-9 rounded-lg bg-navy-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-navy-800 text-center text-xs text-slate-600">
          © 2025 EduMatch. All rights reserved. Made for Vietnamese Students.
        </div>
      </div>
    </footer>
  );
};
