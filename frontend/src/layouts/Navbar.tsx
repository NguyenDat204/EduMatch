import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const MatIcon = ({ name, className = '' }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

import { mockCurrentUser } from '../mock/data';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = false; // Mock state

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <MatIcon name="school" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">EduMatch</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Trang chủ</Link>
            <a href="/#problem" className="text-sm font-medium hover:text-primary transition-colors">Vấn đề</a>
            <a href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">Cách hoạt động</a>
            <a href="/#universities" className="text-sm font-medium hover:text-primary transition-colors">Dành cho Nhà trường</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold leading-tight">{mockCurrentUser.name}</p>
                    <p className="text-xs text-slate-500">{mockCurrentUser.email}</p>
                  </div>
                  <Link to="/profile">
                    <img src={mockCurrentUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm hover:scale-105 transition-transform" />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                  Đăng nhập
                </Link>
                <Link to="/register" className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20">
                  Bắt đầu ngay
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-400 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b animate-fade-in">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-900 dark:text-white hover:text-primary transition-colors">Trang chủ</Link>
            <a href="/#problem" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Vấn đề</a>
            <a href="/#how-it-works" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Cách hoạt động</a>
            <a href="/#universities" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Dành cho Nhà trường</a>
            
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <img src={mockCurrentUser.avatar} alt="User" className="w-10 h-10 rounded-full border border-slate-200" />
                    <div>
                      <p className="text-sm font-bold leading-tight">{mockCurrentUser.name}</p>
                      <p className="text-xs text-slate-500">{mockCurrentUser.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Dashboard</Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Hồ sơ cá nhân</Link>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Đăng nhập</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full px-3 py-2 mt-2 text-center bg-primary text-white font-bold rounded-xl">Bắt đầu ngay</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
