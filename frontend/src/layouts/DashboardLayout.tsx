import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { mockCurrentUser } from '../lib/mockData';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
      <Sidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <header className="h-16 glass border-b flex items-center px-8 sticky top-0 z-30">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Student Workspace</h1>
          <div className="ml-auto flex items-center gap-4">
            <div className="w-8 h-8 rounded-full premium-gradient" />
            <span className="text-sm font-medium">{mockCurrentUser.name}</span>
          </div>
        </header>
        <main className="p-8">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {/* Supports both children (legacy) and Outlet (nested routing) */}
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
