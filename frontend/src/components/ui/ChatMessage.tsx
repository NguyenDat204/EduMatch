import React from 'react';
import { cn } from '../../lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'ai';
  content: string;
}

// Simple markdown-like renderer for bold and bullet points
const renderContent = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );
    // Bullet
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      return (
        <li key={i} className="ml-4 list-disc">
          {rendered}
        </li>
      );
    }
    if (line.trim() === '') return <br key={i} />;
    return <p key={i}>{rendered}</p>;
  });
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isAI = role === 'ai';

  return (
    <div className={cn('flex gap-3 mb-4', isAI ? 'justify-start' : 'justify-end')}>
      {isAI && (
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={16} className="text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[78%] px-4 py-3 rounded-xl text-sm leading-relaxed space-y-1',
          isAI
            ? 'bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 text-slate-700 dark:text-slate-200 rounded-tl-none'
            : 'bg-primary-600 text-white rounded-tr-none'
        )}
      >
        {renderContent(content)}
      </div>

      {!isAI && (
        <div className="w-8 h-8 bg-slate-200 dark:bg-navy-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <User size={16} className="text-slate-600 dark:text-slate-300" />
        </div>
      )}
    </div>
  );
};
