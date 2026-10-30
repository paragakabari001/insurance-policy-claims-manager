import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { User } from '../types';
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
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'What is my remaining coverage?',
    'Show claim statistics',
    'List active policies',
    'Total sum insured',
  ]);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
            ? `Hello Administrator!\nI am your AI Policy & Claims Assistant. You can ask me about portfolio statistics, customer coverage balances, or claim adjudications.`
            : `Hello ${user.name}!\nI am your AI Policy & Claims Assistant. You can ask me about your policies, remaining coverage balances, or claim statuses.`,
      },
    ]);
  }, [user?.id]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus textarea when panel opens
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
      {/* Floating Toggle Button (Edge launcher if closed) */}
      {!isOpen && (
        <button
          ref={launcherRef}
          type="button"
          onClick={onToggle}
          aria-label="Open AI Assistant"
          title="Open AI Assistant"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 h-14 pl-3.5 pr-2 rounded-l-2xl bg-[#031d16] hover:bg-[#072d22] text-white border-y border-l border-[#00c569]/40 shadow-2xl flex items-center justify-center transition-all hover:pl-4 group cursor-pointer"
        >
          <span className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#00c569] transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00c569] rounded-full animate-pulse border-2 border-[#031d16]" />
          </span>
        </button>
      )}

      {/* Right-Side Full Height Layout Panel (Figma Match) */}
      {isOpen && (
        <aside
          role="complementary"
          aria-label="AI Policy & Claims Assistant"
          className="fixed inset-y-0 right-0 z-40 md:relative md:inset-auto md:z-0 w-full sm:w-[380px] xl:w-[410px] h-screen shrink-0 flex flex-col bg-gradient-to-b from-[#e8faf1] via-[#f3fdf8] to-[#dff5ea] border-l border-emerald-100 md:rounded-l-[28px] shadow-2xl md:shadow-none animate-in slide-in-from-right duration-200 overflow-hidden"
        >
          {/* Header (Figma Match: Dark Green Header with Badge and Window Controls) */}
          <div className="shrink-0 h-16 px-4 bg-[#031d16] text-white flex items-center justify-between border-b border-[#093529]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#00c569]/20 border border-[#00c569]/30 flex items-center justify-center text-[#00c569] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white tracking-tight truncate">
                    AI Assistant
                  </h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#00c569]/20 text-[#00c569] border border-[#00c569]/30 uppercase">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-emerald-300/70 truncate">
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
                className="p-1.5 rounded-lg text-emerald-300/70 hover:text-white hover:bg-[#072d22] transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                title="Close"
                className="p-1.5 rounded-lg text-emerald-300/70 hover:text-white hover:bg-[#072d22] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Cards (Shown at top like in Figma design) */}
          <div className="p-3 bg-gradient-to-b from-[#d6f7e6]/70 to-transparent border-b border-emerald-100/80 shrink-0">
            {/* Robot Avatar Illustration */}
            <div className="flex flex-col items-center justify-center text-center py-2">
              <div className="w-14 h-14 rounded-full bg-white shadow-md border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                <svg className="w-8 h-8 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <rect x="4" y="6" width="16" height="12" rx="4" fill="#031d16" />
                  <circle cx="9" cy="11" r="1.5" fill="#00c569" />
                  <circle cx="15" cy="11" r="1.5" fill="#00c569" />
                  <path d="M10 14h4" stroke="#00c569" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="12" y1="2" x2="12" y2="6" stroke="#031d16" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="2" r="1" fill="#00c569" />
                </svg>
              </div>
              <h4 className="text-sm font-black text-slate-900">
                Hello {user.role === 'Administrator' ? 'Administrator' : user.name}!
              </h4>
              <p className="text-[11px] text-slate-500 font-medium max-w-[280px] mt-0.5">
                {user.role === 'Administrator'
                  ? 'I am your AI Policy & Claims Assistant. You can ask me about portfolio statistics, customer coverage balances, or claim adjudications.'
                  : 'I am your AI Policy & Claims Assistant. Ask me about your coverage, remaining sum insured, or claim history.'}
              </p>
            </div>

            {/* 4 Interactive Feature Tiles (Figma Match) */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleSend('Show policy summary and total coverage')}
                className="p-2.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200/90 text-left transition-all shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 leading-tight">
                    Policy Summary
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">View portfolio stats</p>
              </button>

              <button
                type="button"
                onClick={() => handleSend('What is the coverage balance and remaining sum insured?')}
                className="p-2.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200/90 text-left transition-all shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 leading-tight">
                    Coverage Details
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Check remaining balance</p>
              </button>

              <button
                type="button"
                onClick={() => handleSend('Show status of all submitted claims')}
                className="p-2.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200/90 text-left transition-all shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 leading-tight">
                    Claims Status
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Track & analyze claims</p>
              </button>

              <button
                type="button"
                onClick={() => handleSend('Provide customer-wise insights')}
                className="p-2.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200/90 text-left transition-all shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 leading-tight">
                    Customer Insights
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Customer-wise analysis</p>
              </button>
            </div>
          </div>

          {/* Messages Flow Area (flex-1 overflow-y-auto) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 bg-transparent scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-[#031d16] text-white rounded-tr-xs font-medium'
                        : msg.isError
                        ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200/70 rounded-tl-xs whitespace-pre-line'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.timestamp && (
                    <span className="text-[9px] text-slate-400 px-1 mt-1 font-medium">
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
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00c569]" />
                  <span>Checking authorized coverage...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Pill Suggestions (Figma Match) */}
          {!isLoading && suggestedQuestions.length > 0 && (
            <div className="px-3 py-2 bg-white/40 border-t border-emerald-100/70 flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto shrink-0">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="shrink-0 text-[10px] font-bold text-slate-700 bg-white hover:bg-emerald-50 hover:text-emerald-800 px-2.5 py-1 rounded-full border border-slate-200 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Chat Composer Input Form (Figma Match) */}
          <div className="shrink-0 p-3 bg-white/60 backdrop-blur-sm border-t border-emerald-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about coverage, or policies..."
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00c569] text-xs font-medium text-slate-900 bg-white placeholder:text-slate-400 shadow-2xs transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="w-10 h-10 rounded-xl bg-[#031d16] hover:bg-[#072d22] text-[#00c569] hover:text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#031d16]/20 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#00c569]" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
            <p className="text-[10px] text-slate-400 mt-1 text-center font-medium">
              Press Enter to send &bull; Shift+Enter for newline
            </p>
          </div>
        </aside>
      )}
    </>
  );
};
