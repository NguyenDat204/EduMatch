import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { ChatMessage } from '../components/ui';
import { aiApiService } from '../services/api';

export const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content:
        'Xin chào! Mình là AI Advisor định hướng nghề nghiệp của bạn. Mình sẵn sàng hỗ trợ bạn tìm câu trả lời cho các băn khoăn về chọn ngành, chọn trường hoặc lên lộ trình phát triển. Bạn muốn bắt đầu từ đâu?',
    },
  ]);
  const [input, setInput]       = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef          = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage    = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await aiApiService.sendMessage(updatedMessages);
      if (response.success && response.data) {
        setMessages((prev) => [...prev, { role: 'ai', content: response.data.content }]);
      } else {
        throw new Error(response.message || 'Lỗi phản hồi');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Xin lỗi, kết nối AI đang gián đoạn. Vui lòng thử lại sau.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    'Tôi nên học ngành gì với điểm Toán cao?',
    'Ngành AI Engineer cần kỹ năng gì?',
    'Trường FPT có tốt không?',
  ];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl overflow-hidden shadow-card animate-fade-in">
        {/* Header */}
        <header className="px-5 py-3.5 border-b border-slate-200 dark:border-navy-700 flex items-center gap-3 bg-white dark:bg-navy-900">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Career Advisor</h2>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-green-500 uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Trực tuyến
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          <div className="max-w-2xl mx-auto">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role as 'user' | 'ai'} content={msg.content} />
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-navy-800 w-fit px-3 py-2 rounded-xl border border-slate-100 dark:border-navy-700 mb-4">
                <Loader2 size={12} className="animate-spin text-primary-500" />
                AI đang soạn phản hồi...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggestions (only when few messages) */}
        {messages.length <= 2 && (
          <div className="px-5 pb-3">
            <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-navy-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 border border-slate-200 dark:border-navy-600 rounded-full font-medium transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <footer className="p-4 border-t border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                placeholder="Hỏi về ngành học, trường đại học, lộ trình nghề nghiệp..."
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
            <p className="text-[10px] text-center mt-2.5 text-slate-400 uppercase tracking-wider">
              AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
            </p>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
};
