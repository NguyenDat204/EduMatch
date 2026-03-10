import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Plus, Image as ImageIcon, Mic } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { ChatMessage } from '../components/ui';

export const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your AI Career Advisor. I've analyzed your assessment results. You seem to have a strong affinity for logical structures and problem solving. Would you like to explore Software Architecture or Data Science first?" },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `That's a great question about ${input.toLowerCase()}. Based on current market trends, this field is growing at 15% annually. I recommend looking at Stanford's Computer Science program for the best curriculum in this area.` 
      }]);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-12rem)] flex flex-col glass rounded-[2.5rem] overflow-hidden border-none shadow-premium">
        {/* Chat Header */}
        <header className="px-8 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-bold">AI Career Advisor</h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-accent-500 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                Online & Analyzing
              </div>
            </div>
          </div>
          <button className="text-xs font-bold text-primary-600 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 transition-colors">
            View Analytics
          </button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-premium">
          <div className="max-w-3xl mx-auto space-y-2">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role as 'user' | 'ai'} content={msg.content} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <footer className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSend} className="relative flex items-center gap-3">
              <div className="flex gap-2">
                <button type="button" className="p-3 text-slate-400 hover:text-primary-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="flex-1 relative group">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your career path..."
                  className="w-full pl-6 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                   <button type="button" className="text-slate-400 hover:text-slate-600"><ImageIcon size={18} /></button>
                   <button type="button" className="text-slate-400 hover:text-slate-600"><Mic size={18} /></button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!input.trim()}
                className="p-4 premium-gradient text-white rounded-2xl shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                <Send size={20} />
              </button>
            </form>
            <p className="text-[10px] text-center mt-4 text-slate-400 font-medium uppercase tracking-widest">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
};
