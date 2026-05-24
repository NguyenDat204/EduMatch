import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Bot, Loader2, Plus, Pencil, Trash2,
  Check, X, MessageSquare, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { ChatMessage } from '../components/ui';
import { aiApiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp?: string;
}

interface ConversationMeta {
  conversationId: string;
  title: string;
  lastMessageTime: string;
  preview: string;
  messageCount: number;
  isArchived: boolean;
}

const buildGreeting = (user: any): string => {
  const name      = user?.name?.split(' ').pop() || 'bạn';
  const archetype = user?.personalityTest?.archetype;
  const school    = user?.academicInfo?.school;
  const major     = user?.academicInfo?.majorInterest;

  let g = `Chào **${name}**! Mình là **EduMatch AI Advisor** — người đồng hành định hướng nghề nghiệp của bạn. 🎯\n\n`;
  if (archetype) g += `Bạn thuộc nhóm **"${archetype}"** — một lợi thế rõ ràng để định hướng nghề nghiệp.\n\n`;
  if (school) {
    g += `Mình biết bạn đang học tại **${school}**`;
    if (major) g += ` và quan tâm đến **${major}**`;
    g += `.\n\n`;
  }
  g += `Bạn đang băn khoăn điều gì? Chọn ngành, chọn trường, hay lên lộ trình kỹ năng?`;
  return g;
};

const SUGGESTIONS = [
  'Tôi nên học ngành gì phù hợp với tôi?',
  'Ngành AI Engineer cần học những gì?',
  'So sánh ĐH FPT và ĐH Bách Khoa',
  'Lộ trình trở thành Software Engineer',
];

export const Chat = () => {
  const { user } = useAuth();

  // ── Conversations list ─────────────────────────────────────
  const [conversations, setConversations]   = useState<ConversationMeta[]>([]);
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [loadingConvs, setLoadingConvs]     = useState(true);
  const [renamingId, setRenamingId]         = useState<string | null>(null);
  const [renameValue, setRenameValue]       = useState('');
  const [deletingId, setDeletingId]         = useState<string | null>(null);

  // ── Active conversation ────────────────────────────────────
  const [messages, setMessages]             = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput]                   = useState('');
  const [isTyping, setIsTyping]             = useState(false);
  const [isLoadingMsgs, setIsLoadingMsgs]   = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Load conversations list ────────────────────────────────
  useEffect(() => {
    if (!user) return;
    aiApiService.getConversations()
      .then((res) => { if (res.success) setConversations(res.data); })
      .catch(() => {})
      .finally(() => setLoadingConvs(false));
  }, [user]);

  // ── Load most recent active conversation on mount ──────────
  useEffect(() => {
    if (!user) return;
    const loadActive = async () => {
      setIsLoadingMsgs(true);
      try {
        const res = await aiApiService.getChatHistory();
        if (res.success && res.data?.length > 0) {
          setMessages(res.data);
          setConversationId(res.conversationId);
        } else {
          setMessages([{ role: 'ai', content: buildGreeting(user) }]);
        }
      } catch {
        setMessages([{ role: 'ai', content: buildGreeting(user) }]);
      } finally {
        setIsLoadingMsgs(false);
      }
    };
    loadActive();
  }, [user]);

  // ── Auto scroll ────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Switch to a conversation ───────────────────────────────
  const handleSelectConversation = async (convId: string) => {
    if (convId === conversationId) return;
    setIsLoadingMsgs(true);
    try {
      const res = await aiApiService.getConversationById(convId);
      if (res.success) {
        setMessages(res.data);
        setConversationId(res.conversationId);
      }
    } catch { /* silent */ }
    finally { setIsLoadingMsgs(false); }
  };

  // ── New conversation ───────────────────────────────────────
  const handleNewConversation = () => {
    setConversationId(undefined);
    setMessages([{ role: 'ai', content: buildGreeting(user) }]);
  };

  // ── Send message ───────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date().toISOString() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsTyping(true);

    try {
      const res = await aiApiService.sendMessage(updated, conversationId);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, { role: 'ai', content: res.data.content, timestamp: new Date().toISOString() }]);
        if (res.conversationId) {
          setConversationId(res.conversationId);
          // Refresh conversations list
          const listRes = await aiApiService.getConversations();
          if (listRes.success) setConversations(listRes.data);
        }
      } else throw new Error();
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Xin lỗi, kết nối AI đang gián đoạn. Vui lòng thử lại.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Rename conversation ────────────────────────────────────
  const handleRename = async (convId: string) => {
    if (!renameValue.trim()) return;
    try {
      await aiApiService.renameConversation(convId, renameValue.trim());
      setConversations((prev) => prev.map((c) => c.conversationId === convId ? { ...c, title: renameValue.trim() } : c));
    } catch { /* silent */ }
    setRenamingId(null);
  };

  // ── Delete conversation ────────────────────────────────────
  const handleDelete = async (convId: string) => {
    try {
      await aiApiService.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.conversationId !== convId));
      if (convId === conversationId) handleNewConversation();
    } catch { /* silent */ }
    setDeletingId(null);
  };

  const isFirstSession = messages.length <= 1;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-4 animate-fade-in">

        {/* ── Conversations Sidebar ── */}
        <div className={`${sidebarOpen ? 'w-56' : 'w-0'} transition-all duration-300 overflow-hidden shrink-0`}>
          <div className="w-56 h-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl flex flex-col shadow-card overflow-hidden">
            {/* Sidebar header */}
            <div className="px-3 py-3 border-b border-slate-100 dark:border-navy-700 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cuộc trò chuyện</span>
              <button
                onClick={handleNewConversation}
                title="Tạo cuộc trò chuyện mới"
                className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
              >
                <Plus size={15} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
              {loadingConvs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 px-3">
                  <MessageSquare size={20} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Chưa có cuộc trò chuyện nào</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive   = conv.conversationId === conversationId;
                  const isRenaming = renamingId === conv.conversationId;
                  const isDeleting = deletingId === conv.conversationId;

                  return (
                    <div key={conv.conversationId} className={`group mx-1 mb-0.5 rounded-lg transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-slate-50 dark:hover:bg-navy-800'}`}>
                      {isRenaming ? (
                        <div className="flex items-center gap-1 p-2">
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(conv.conversationId); if (e.key === 'Escape') setRenamingId(null); }}
                            className="flex-1 text-xs bg-white dark:bg-navy-800 border border-primary-400 rounded px-2 py-1 focus:outline-none"
                          />
                          <button onClick={() => handleRename(conv.conversationId)} className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"><Check size={12} /></button>
                          <button onClick={() => setRenamingId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors"><X size={12} /></button>
                        </div>
                      ) : isDeleting ? (
                        <div className="p-2 space-y-1.5">
                          <p className="text-[10px] text-red-500 font-medium">Xóa cuộc trò chuyện này?</p>
                          <div className="flex gap-1.5">
                            <button onClick={() => handleDelete(conv.conversationId)} className="flex-1 py-1 bg-red-600 text-white text-[10px] font-semibold rounded transition-colors hover:bg-red-700">Xóa</button>
                            <button onClick={() => setDeletingId(null)} className="flex-1 py-1 bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded transition-colors">Hủy</button>
                          </div>
                        </div>
                      ) : (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSelectConversation(conv.conversationId)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectConversation(conv.conversationId); }}
                          className="w-full text-left p-2 cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className={`text-xs font-semibold truncate flex-1 ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>
                              {conv.title}
                            </p>
                            {/* Action buttons — show on hover */}
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); setRenamingId(conv.conversationId); setRenameValue(conv.title); }}
                                className="p-0.5 text-slate-400 hover:text-primary-600 rounded transition-colors"
                              ><Pencil size={11} /></button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeletingId(conv.conversationId); }}
                                className="p-0.5 text-slate-400 hover:text-red-500 rounded transition-colors"
                              ><Trash2 size={11} /></button>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{conv.preview || '...'}</p>
                          <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">{fmtDate(conv.lastMessageTime)}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Main Chat Area ── */}
        <div className="flex-1 flex flex-col bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl overflow-hidden shadow-card min-w-0">

          {/* Header */}
          <header className="px-4 py-3 border-b border-slate-200 dark:border-navy-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {/* Toggle sidebar */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
                title={sidebarOpen ? 'Ẩn danh sách' : 'Hiện danh sách'}
              >
                {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>

              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Career Advisor</h2>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-green-500 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Trực tuyến · Cá nhân hóa
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user?.personalityTest?.archetype && (
                <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full border border-primary-100 dark:border-primary-800/50">
                  {user.personalityTest.archetype}
                </span>
              )}
              <button
                onClick={handleNewConversation}
                title="Cuộc trò chuyện mới"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors border border-primary-100 dark:border-primary-800/50"
              >
                <Plus size={13} /> Mới
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
            {isLoadingMsgs ? (
              <div className="flex items-center justify-center h-full gap-2 text-slate-400">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Đang tải...</span>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                {messages.map((msg, i) => (
                  <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-navy-800 w-fit px-3 py-2 rounded-xl border border-slate-100 dark:border-navy-700 mb-4">
                    <Loader2 size={12} className="animate-spin text-primary-500" />
                    AI đang soạn phản hồi...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Suggestions */}
          {isFirstSession && !isLoadingMsgs && (
            <div className="px-5 pb-3 shrink-0">
              <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
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
          <footer className="p-4 border-t border-slate-200 dark:border-navy-700 shrink-0">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isTyping || isLoadingMsgs}
                  placeholder={user?.name ? `${user.name.split(' ').pop()}, hỏi mình bất cứ điều gì...` : 'Hỏi về ngành học, trường đại học, lộ trình...'}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-400 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping || isLoadingMsgs}
                  className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none shrink-0"
                >
                  <Send size={16} />
                </button>
              </form>
              <p className="text-[10px] text-center mt-2 text-slate-400 uppercase tracking-wider">
                Lịch sử lưu tự động · AI có thể mắc lỗi
              </p>
            </div>
          </footer>
        </div>
      </div>
    </DashboardLayout>
  );
};
