import React from 'react';
import { cn } from '../../lib/utils';
import { Sparkles } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'ai';
  content: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isAI = role === 'ai';

  return (
    <div className={cn(
      "flex w-full mb-6 animate-slide-up",
      isAI ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "flex max-w-[80%] gap-3",
        isAI ? "flex-row" : "flex-row-reverse"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-lg",
          isAI ? "premium-gradient text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
        )}>
          {isAI ? <Sparkles size={18} /> : <div className="font-bold text-xs">YOU</div>}
        </div>
        
        <div className={cn(
          "p-4 rounded-2xl text-sm leading-relaxed",
          isAI 
            ? "glass text-slate-700 dark:text-slate-200 rounded-tl-none border-none shadow-premium" 
            : "bg-primary-600 text-white rounded-tr-none shadow-lg shadow-primary-500/10"
        )}>
          {content}
        </div>
      </div>
    </div>
  );
};
