'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Send,
  Stethoscope,
  Trash2,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeft,
} from 'lucide-react';

interface MessageItem {
  role: 'user' | 'assistant';
  content: string;
}

const LOCAL_STORAGE_KEY = 'dr_care_chat_messages';

export default function FullScreenChatbot() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat history from LocalStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      } catch (err) {
        console.error('Failed to parse chat history:', err);
      }
    }
  }, []);

  const saveAndSetMessages = (newMsgs: MessageItem[]) => {
    setMessages(newMsgs);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newMsgs));
    } catch (err) {
      console.error('Failed to save chat history:', err);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  async function sendMessage() {
    const content = message.trim();
    if (!content || loading) return;

    const userMessage: MessageItem = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];

    // Optimistically update UI and storage with user message
    saveAndSetMessages(updatedMessages);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch response');
      }

      const assistantMessage: MessageItem = {
        role: 'assistant',
        content: data?.text || 'I could not process that request.',
      };

      saveAndSetMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      saveAndSetMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content:
            'Sorry, the assistant is temporarily unavailable. Please try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 md:static ${
          sidebarOpen
            ? 'w-80 translate-x-0 opacity-100'
            : 'w-0 -translate-x-full opacity-0 overflow-hidden border-r-0 md:translate-x-0'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4 whitespace-nowrap">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Conversations
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              title="Clear Chat History"
            >
              <Trash2 size={18} />
            </button>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Hide Sidebar"
            >
              <X size={20} className="md:hidden" />
              <PanelLeftClose size={20} className="hidden md:block" />
            </button>
          </div>
        </div>

        <div className="p-3 whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/40">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Stethoscope size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                Dr. Morgan&apos;s Assistant
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Active Chat
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex flex-1 flex-col min-w-0 bg-white dark:bg-slate-900">
        <div className="flex h-16 items-center justify-between border-b bg-emerald-600 px-4 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white/30"
              title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 shrink-0">
              <Stethoscope size={20} />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">
                Dr. Morgan&apos;s Assistant
              </h1>
              <p className="text-xs text-emerald-100">
                Online • Full Screen Consultation
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/30 sm:text-sm"
            title="Back to Site"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Site</span>
          </Link>
        </div>

        {/* MESSAGES CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-slate-400">
              No previous messages. Start a conversation!
            </div>
          )}

          {messages.map((item, i) => (
            <div
              key={i}
              className={`flex ${
                item.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 text-sm leading-6 shadow-sm ${
                  item.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-emerald-50 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none'
                }`}
              >
                {item.content}
              </div>
            </div>
          ))}

          {/* ANIMATED BOUNCING DOTS TYPING INDICATOR */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none bg-emerald-50 px-4 py-3 dark:bg-slate-800">
                <span
                  className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce dark:bg-emerald-400"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce dark:bg-emerald-400"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce dark:bg-emerald-400"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="border-t bg-white p-4 dark:bg-slate-950 dark:border-slate-800">
          <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10">
            <input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Type your message..."
              className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60 text-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!message.trim() || loading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}