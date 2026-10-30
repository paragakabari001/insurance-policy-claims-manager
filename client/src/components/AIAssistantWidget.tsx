import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { User } from '../types';
import { MarkdownMessage } from './MarkdownMessage';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  RefreshCw,
  FileText,
  ShieldCheck,
  Clock,
  Users,
  Minus,
  ArrowRight,
} from 'lucide-react';

interface AIAssistantWidgetProps {
  user: User | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isError?: boolean;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  user,
  isOpen,
  onToggle,
  onClose,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'suggestions' | 'insights'>('chat');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'What is my remaining coverage?',
    'Show claim statistics',
    'List active policies',
    'Total sum insured',
  ]);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or reset chat when user changes or logs out
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        timestamp: '10:24 AM',
        content:
          user.role === 'Administrator'
            ? `Hello **Administrator**!\n\nI am your AI Policy & Claims Assistant. You can ask me about **portfolio statistics**, **customer coverage balances**, or **claim adjudications**.`
            : `Hello **${user.name}**!\n\nI am your AI Policy & Claims Assistant. You can ask me about your **policies**, **remaining coverage balances**, or **claim statuses**.`,
      },
    ]);
  }, [user?.id]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
        launcherRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!user) return null;

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: MessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: timeStr,
    };

    setActiveTab('chat');
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => !m.isError && m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await api.chatWithAI({
        message: textToSend,
        history: historyPayload,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (res.suggestedQuestions && res.suggestedQuestions.length > 0) {
        setSuggestedQuestions(res.suggestedQuestions);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            err.message ||
            'Unable to reach the assistant service. Please check your connection and try again.',
          isError: true,
          timestamp: timeStr,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      handleSend(lastUserMessage.content);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Edge launcher when panel is closed) */}
      {!isOpen && (
        <button
          ref={launcherRef}
          type="button"
          onClick={onToggle}
          aria-label="Open AI Assistant"
          title="Open AI Assistant"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 h-14 pl-3.5 pr-2 rounded-l-2xl bg-[#011f17] hover:bg-[#032e22] text-white border-y border-l border-[#00ba63]/50 shadow-2xl flex items-center justify-center transition-all hover:pl-4 group cursor-pointer"
        >
          <span className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#00ba63] transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00ba63] rounded-full animate-pulse border-2 border-[#011f17]" />
          </span>
        </button>
      )}

      {/* Right-Side AI Assistant Panel: Clean, integrated Copilot Rail aligned with TopBar */}
      {isOpen && (
        <aside
          role="complementary"
          aria-label="AI Policy & Claims Assistant"
          className="fixed inset-y-0 right-0 z-40 md:relative md:inset-auto md:z-0 w-full sm:w-[410px] xl:w-[440px] h-screen shrink-0 flex flex-col bg-[#eafaf2] border-l border-slate-200/80 shadow-2xl md:shadow-none overflow-hidden relative"
        >
          {/* Background Wallpaper Image with lowered opacity */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none"
            style={{
              backgroundImage: 'url(/chat-bg.png)',
              opacity: 0.28,
            }}
          />

          {/* Unified 64px Header - Matches TopBar height & styling for a seamless top navigation band */}
          <div className="relative z-10 shrink-0 h-16 px-4 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-[#00ba63]/15 border border-[#00ba63]/30 flex items-center justify-center text-[#008f4c] shrink-0 shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#008f4c]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-slate-900 tracking-tight truncate">
                    AI Assistant
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-[#008f4c] border border-emerald-200/80 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ba63] animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  Policy & Claims Support
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onClose}
                aria-label="Minimize"
                title="Minimize"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                title="Close"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tabs: Chat, Suggestions, Insights (Matching Image 2 Right Rail) */}
          <div className="relative z-10 px-4 py-2 bg-white/95 backdrop-blur-sm border-b border-emerald-900/10 flex items-center gap-1.5 shrink-0">
            {[
              { id: 'chat', label: 'Chat' },
              { id: 'suggestions', label: 'Suggestions' },
              { id: 'insights', label: 'Insights' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: CHAT */}
          {activeTab === 'chat' && (
            <>
              {/* Quick Action Top Cards (Translucent glass floating directly on wallpaper) */}
              <div className="relative z-10 p-3 bg-white/20 backdrop-blur-xs border-b border-emerald-900/10 shrink-0">
                {/* Rounded 3D-effect Avatar Card */}
                <div className="flex flex-col items-center justify-center text-center py-1">
                  <div className="w-12 h-12 rounded-2xl bg-white/95 p-1 shadow-md shadow-emerald-950/10 border border-emerald-200/70 mb-2 flex items-center justify-center transition-transform hover:scale-105">
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#011f17] via-[#022c21] to-[#011f17] flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#00c569]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <rect x="4" y="6" width="16" height="12" rx="3.5" stroke="#00c569" strokeWidth="1.75" />
                        <circle cx="9" cy="11" r="1.5" fill="#00c569" />
                        <circle cx="15" cy="11" r="1.5" fill="#00c569" />
                        <path d="M10 14h4" stroke="#00c569" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="12" y1="2" x2="12" y2="6" stroke="#00c569" strokeWidth="1.75" strokeLinecap="round" />
                        <circle cx="12" cy="2" r="1" fill="#00c569" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 tracking-tight">
                    Hello {user.role === 'Administrator' ? 'Administrator' : user.name}!
                  </h4>
                  <p className="text-[10px] text-slate-600 font-medium max-w-[280px] mt-0.5 leading-snug">
                    {user.role === 'Administrator'
                      ? 'Ask about portfolio statistics, coverage balances, or claim adjudications.'
                      : 'Ask about coverage, remaining sum insured, or claim history.'}
                  </p>
                </div>

                {/* 4 Interactive Feature Tiles */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleSend('Show policy summary and total coverage')}
                    className="p-2 rounded-xl bg-white/85 hover:bg-white border border-emerald-100/90 hover:border-emerald-300 text-left transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileText className="w-3 h-3 text-[#008f4c]" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-800 leading-tight">
                        Summary
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">Portfolio stats</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSend('What is the coverage balance and remaining sum insured?')}
                    className="p-2 rounded-xl bg-white/85 hover:bg-white border border-emerald-100/90 hover:border-emerald-300 text-left transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3 h-3 text-[#008f4c]" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-800 leading-tight">
                        Coverage
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">Remaining balance</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSend('Show status of all submitted claims')}
                    className="p-2 rounded-xl bg-white/85 hover:bg-white border border-emerald-100/90 hover:border-emerald-300 text-left transition-all shadow-2xs group hover:shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock className="w-3 h-3" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-800 leading-tight">
                        Claims
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">Track & analyze</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSend('Provide customer-wise insights')}
                    className="p-2 rounded-xl bg-white/85 hover:bg-white border border-emerald-100/90 hover:border-emerald-300 text-left transition-all shadow-2xs group hover:shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Users className="w-3 h-3 text-[#008f4c]" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-800 leading-tight">
                        Insights
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">Customer details</p>
                  </button>
                </div>
              </div>

              {/* Messages Flow Area with Markdown Rendering */}
              <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 bg-transparent scrollbar-thin scrollbar-thumb-emerald-200/60">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs transition-all ${
                          isUser
                            ? 'bg-slate-900 text-white shadow-xs'
                            : msg.isError
                            ? 'bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs'
                            : 'bg-white/95 text-slate-800 border border-slate-200/80 shadow-xs backdrop-blur-md'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-line leading-relaxed font-medium">{msg.content}</p>
                        ) : (
                          <MarkdownMessage content={msg.content} />
                        )}
                      </div>

                      {msg.timestamp && (
                        <span className="text-[9px] text-slate-400 px-1 mt-0.5 font-medium">
                          {msg.timestamp}
                        </span>
                      )}

                      {msg.isError && (
                        <button
                          type="button"
                          onClick={handleRetry}
                          className="mt-1 text-[11px] font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Retry question
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* In-flight typing indicator */}
                {isLoading && (
                  <div className="flex items-start">
                    <div className="bg-white/95 backdrop-blur-md border border-emerald-100 rounded-2xl px-3.5 py-2 shadow-2xs flex items-center gap-2 text-slate-600 text-xs font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00ba63]" />
                      <span>Analyzing authoritative policy data...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Query Pill Suggestions */}
              {!isLoading && suggestedQuestions.length > 0 && (
                <div className="relative z-10 px-3 py-2 bg-white/40 backdrop-blur-xs border-t border-emerald-900/10 flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto shrink-0">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSend(q)}
                      className="shrink-0 text-[10px] font-bold text-slate-700 bg-white/90 hover:bg-emerald-50 hover:text-emerald-900 px-3 py-1.5 rounded-full border border-emerald-100/90 shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 2: SUGGESTIONS (Structured Action Cards matching Image 2 Right Rail) */}
          {activeTab === 'suggestions' && (
            <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-white/40">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Recommended Inquiries
              </p>

              {[
                {
                  title: 'Policy Coverage Audit',
                  desc: 'Audit total sum insured and remaining limits across all active policies.',
                  tag: 'Coverage',
                  tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  prompt: 'What is the coverage balance and remaining sum insured?',
                },
                {
                  title: 'Pending Claims Review',
                  desc: 'Check all claims currently submitted and awaiting adjudication decision.',
                  tag: 'Claims',
                  tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
                  prompt: 'Show status of all submitted claims',
                },
                {
                  title: 'Portfolio Performance Analysis',
                  desc: 'Generate complete breakdown of active policies and claim ratio.',
                  tag: 'Analytics',
                  tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
                  prompt: 'Show policy summary and total coverage',
                },
                {
                  title: 'Customer Protection Insights',
                  desc: 'Evaluate customer-level claim history and policy coverage health.',
                  tag: 'Customers',
                  tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
                  prompt: 'Provide customer-wise insights',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  onClick={() => handleSend(item.prompt)}
                  className="p-3.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/80 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                      {item.title}
                    </h5>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {item.desc}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-2">
                    <span>Ask Assistant</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: INSIGHTS (Engine Info & Stats) */}
          {activeTab === 'insights' && (
            <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-white/40">
              <div className="p-4 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">AI Intelligence Core</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  TailVaR Policy & Claims Copilot is powered by Gemini 2.5 Flash via OpenRouter with deterministic rule-based financial calculation fallback.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-900">Security & Isolation</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  All queries enforce strict multi-tenant customer isolation. Customers can only view their own policies and claims.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSend('Provide customer-wise insights')}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#00c569]" />
                <span>Run Portfolio Deep Analysis</span>
              </button>
            </div>
          )}

            {/* Chat Composer Input Form */}
            <div className="relative z-10 shrink-0 p-3 bg-white/70 backdrop-blur-md border-t border-emerald-900/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={textareaRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about coverage, or policies..."
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-[#00ba63] text-xs font-medium text-slate-900 bg-white/95 placeholder:text-slate-400 shadow-2xs transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-2xl bg-[#011f17] hover:bg-[#032e22] text-[#00ba63] hover:text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#011f17]/20 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#00ba63]" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
              <p className="text-[10px] text-slate-400 mt-1.5 text-center font-medium">
                Press Enter to send &bull; Shift+Enter for newline
              </p>
            </div>
        </aside>
      )}
    </>
  );
};
