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
  isStreaming?: boolean;
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
  const customerSuggestions = [
    'What is my remaining coverage?',
    'Show my claim statuses.',
    'How do I submit a claim?',
    'What happens when a claim is rejected?',
  ];
  const adminSuggestions = [
    'Show portfolio summary',
    'Which claims are pending review?',
    'Which customer has the highest claims?',
    'List expired policies',
  ];
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(customerSuggestions);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or reset chat when user changes or logs out
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    setSuggestedQuestions(user.role === 'Administrator' ? adminSuggestions : customerSuggestions);
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

  // Keep the drawer mounted during its exit animation
  const [rendered, setRendered] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      setClosing(false);
    } else if (rendered) {
      setClosing(true);
      const t = setTimeout(() => {
        setRendered(false);
        setClosing(false);
      }, 260);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: messages.some((m) => m.isStreaming) ? 'auto' : 'smooth' });
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

  const isAdminUser = user.role === 'Administrator';
  const busy = isLoading || messages.some((m) => m.isStreaming);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || busy) return;

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

    const asstId = `asst-${Date.now()}`;
    let started = false;

    try {
      const historyPayload = messages
        .filter((m) => !m.isError && m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await api.chatWithAIStream(
        { message: textToSend, history: historyPayload },
        (token) => {
          if (!started) {
            started = true;
            // First token: hide the "thinking" indicator and create the streaming bubble
            setIsLoading(false);
            setMessages((prev) => [
              ...prev,
              {
                id: asstId,
                role: 'assistant',
                content: token,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isStreaming: true,
              },
            ]);
          } else {
            setMessages((prev) =>
              prev.map((m) => (m.id === asstId ? { ...m, content: m.content + token } : m))
            );
          }
        }
      );

      setMessages((prev) => prev.map((m) => (m.id === asstId ? { ...m, isStreaming: false } : m)));

      if (res.suggestedQuestions && res.suggestedQuestions.length > 0) {
        setSuggestedQuestions(res.suggestedQuestions);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev.filter((m) => !(m.id === asstId && !m.content)),
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
      {rendered && (
        <aside
          role="complementary"
          aria-label="AI Policy & Claims Assistant"
          className={`anim-drawer ${closing ? 'anim-drawer-out' : 'anim-drawer-in'} fixed inset-y-0 right-0 z-40 md:relative md:inset-auto md:z-0 w-full sm:w-[410px] xl:w-[440px] h-screen shrink-0 flex flex-col bg-slate-50 border-l border-slate-200/90 shadow-2xl md:shadow-none overflow-hidden relative`}
        >
          {/* Unified 64px Header - Matches TopBar height & styling for a seamless top navigation band */}
          <div className="relative z-10 shrink-0 h-16 px-4 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#008f4c] shrink-0 shadow-2xs">
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

          {/* Compact quick actions: single horizontally-scrollable row (saves vertical space) */}
          <div className="relative z-10 shrink-0 px-3 py-2 bg-white border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => handleSend('Show policy summary and total coverage')}
              className="shrink-0 h-8 pl-1.5 pr-3 rounded-full bg-white border border-slate-200 hover:border-emerald-300 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#008f4c] flex items-center justify-center"><FileText className="w-3 h-3" /></span>
              Policy Summary
            </button>
            <button
              type="button"
              onClick={() => handleSend('What is the coverage balance and remaining sum insured?')}
              className="shrink-0 h-8 pl-1.5 pr-3 rounded-full bg-white border border-slate-200 hover:border-blue-300 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><ShieldCheck className="w-3 h-3" /></span>
              Coverage
            </button>
            <button
              type="button"
              onClick={() => handleSend('Show status of all submitted claims')}
              className="shrink-0 h-8 pl-1.5 pr-3 rounded-full bg-white border border-slate-200 hover:border-amber-300 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><Clock className="w-3 h-3" /></span>
              Claims
            </button>
            {isAdminUser && (
            <button
              type="button"
              onClick={() => handleSend('Provide customer-wise insights')}
              className="shrink-0 h-8 pl-1.5 pr-3 rounded-full bg-white border border-slate-200 hover:border-purple-300 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Users className="w-3 h-3" /></span>
              Insights
            </button>
            )}
          </div>

          {/* Messages Flow Area with Markdown Rendering */}
          <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4 bg-[#f8fafc] scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`anim-msg flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-[#011f17] text-[#00c569] flex items-center justify-center shrink-0 mb-4 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className={`flex flex-col min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-3.5 py-2.5 text-[12.5px] leading-relaxed break-words ${
                        isUser
                          ? 'bg-gradient-to-br from-[#022c21] to-[#011f17] text-white font-medium rounded-2xl rounded-br-md shadow-sm'
                          : msg.isError
                          ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-2xl rounded-bl-md'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-2xl rounded-bl-md shadow-2xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-line">{msg.content}</p>
                      ) : (
                        <>
                          <MarkdownMessage content={msg.content} />
                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-3.5 ml-0.5 -mb-0.5 bg-[#00ba63] rounded-sm animate-pulse" />
                          )}
                        </>
                      )}
                    </div>

                    {msg.timestamp && (
                      <span className="text-[10px] text-slate-400 px-1 mt-1 font-medium">
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
                </div>
              );
            })}

            {/* In-flight typing indicator */}
            {isLoading && (
              <div className="anim-msg flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-[#011f17] text-[#00c569] flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-2xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Pill Suggestions */}
          {!busy && suggestedQuestions.length > 0 && (
            <div className="relative z-10 px-3 py-2 bg-white border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="shrink-0 text-[10px] font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Chat Composer Input Form */}
          <div className="relative z-10 shrink-0 p-3 bg-white border-t border-slate-200/80">
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
                  disabled={busy}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00ba63]/25 focus:border-[#00ba63] text-xs font-medium text-slate-900 bg-slate-50/80 focus:bg-white placeholder:text-slate-400 shadow-2xs transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="w-10 h-10 rounded-xl bg-[#011f17] hover:bg-[#032e22] text-[#00c569] hover:text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#011f17]/20 transition-all cursor-pointer"
              >
                {busy ? (
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
