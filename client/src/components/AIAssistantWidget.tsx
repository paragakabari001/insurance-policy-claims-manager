import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { User } from '../types';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  RefreshCw,
  HelpCircle,
  MessageSquare,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface AIAssistantWidgetProps {
  user: User | null;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'What is my remaining coverage?',
    'Show my claim statuses.',
    'How do I submit a claim?',
    'What happens when a claim is rejected?',
  ]);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or reset chat when user changes or logs out
  useEffect(() => {
    if (!user) {
      setMessages([]);
      setIsOpen(false);
      return;
    }

    // Set introductory greeting tailored to user role
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          user.role === 'Administrator'
            ? `Hello ${user.name}! I am your AI Policy & Claims Assistant. You can ask me about portfolio statistics, customer coverage balances, or claim adjudications.`
            : `Hello ${user.name}! I am your AI Policy & Claims Assistant. How can I help with your coverage, remaining sum insured, or claim history today?`,
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

  // Handle Escape key to close and return focus to launcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!user) return null;

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: MessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history excluding welcome and errors
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
      {/* Floating Launcher Button */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open AI Assistant"
        title="Open AI Assistant"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-2xl bg-[#06241b] hover:bg-[#0a382b] text-white border border-emerald-500/40 shadow-xl shadow-emerald-950/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <span className="relative flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-emerald-300 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse border-2 border-[#06241b]" />
        </span>
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="AI Policy & Claims Assistant"
          className="fixed right-4 md:right-20 top-1/2 -translate-y-1/2 z-50 flex flex-col overflow-hidden bg-white border border-slate-200/90 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          style={{
            width: 'min(380px, calc(100vw - 24px))',
            height: 'min(520px, calc(100dvh - 24px))',
          }}
        >
          {/* Panel Header */}
          <div className="shrink-0 px-4 py-3.5 bg-[#06241b] text-white flex items-center justify-between border-b border-emerald-950">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-white tracking-tight truncate flex items-center gap-1.5">
                  AI Assistant
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Online
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-200/70 truncate">
                  Policy & Claims Support
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                launcherRef.current?.focus();
              }}
              aria-label="Close AI Assistant"
              className="p-1.5 rounded-xl text-emerald-200/70 hover:text-white hover:bg-emerald-900/50 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex flex-1 min-h-0 flex-col overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-[#06241b] text-white rounded-br-xs font-medium'
                      : msg.isError
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.isError && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-1 text-[11px] font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry question
                  </button>
                )}
              </div>
            ))}

            {/* In-flight typing indicator */}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-2xs flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  <span>Checking authorized coverage...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Chips (Shown when not loading) */}
          {!isLoading && suggestedQuestions.length > 0 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                Suggested:
              </span>
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="shrink-0 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 px-2.5 py-1 rounded-full border border-slate-200/70 transition-colors whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Composer Input Form */}
          <div className="shrink-0 p-3 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="ai-chat-input" className="sr-only">
                Ask a question about your policies or claims
              </label>
              <textarea
                id="ai-chat-input"
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about coverage, claims..."
                disabled={isLoading}
                className="flex-1 resize-none px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs font-medium text-slate-900 bg-slate-50/50 placeholder:text-slate-400 leading-normal max-h-24 shadow-2xs"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="w-9 h-9 rounded-xl bg-[#06241b] hover:bg-[#0a382b] text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
            <p className="text-[10px] text-slate-400 mt-1 text-center font-medium">
              Press Enter to send &bull; Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
};
