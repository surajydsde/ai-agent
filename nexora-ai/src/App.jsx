import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ArrowUpCircleIcon,
  MoonIcon,
  Square3Stack3DIcon,
  StopCircleIcon,
  SunIcon,
  UserIcon,
} from '@heroicons/react/24/solid';

const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then((m) => ({ default: m.Prism })),
);

const STORAGE_KEY = 'chatHistory';
const THEME_KEY = 'nexora-theme';

const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';

  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return getSystemTheme();
};

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('llama3.2');
  const [theme, setTheme] = useState(getInitialTheme);
  const [controller, setController] = useState(null); // 👈 track AbortController
  const messageEndRef = useRef(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event) => {
      if (localStorage.getItem(THEME_KEY) === null) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }

    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, []);

  // Debounced localStorage save
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }, 400);
    return () => clearTimeout(timeout);
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, nextTheme);
      return nextTheme;
    });
  }, []);

  // 🚀 Send message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    const newController = new AbortController();
    setController(newController);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated, model }),
        signal: newController.signal,
      });

      if (!response.ok || !response.body) throw new Error('Bad response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let firstTokenReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = JSON.parse(line.replace('data: ', ''));

          if (data.token) {
            if (!firstTokenReceived) {
              setMessages((prev) => [...prev, { role: 'assistant', content: data.token }]);
              firstTokenReceived = true;
            } else {
              setMessages((prev) => {
                const last = { ...prev[prev.length - 1] };
                last.content += data.token;
                return [...prev.slice(0, -1), last];
              });
            }
          }
          if (data.done) setLoading(false);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages((prev) => [...prev, { role: 'assistant', content: '⏹️ Generation stopped.' }]);
      } else {
        console.error('Stream failed:', err);
        setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Error during stream.' }]);
      }
    } finally {
      setLoading(false);
      setController(null);
    }
  }, [input, messages, model, loading]);

  // 🟥 Stop the response stream
  const stopResponse = useCallback(() => {
    if (controller) {
      controller.abort();
      setController(null);
      setLoading(false);
    }
  }, [controller]);

  // 🧹 Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const shellClasses = isDark ? 'bg-[#1f1f1f] text-white' : 'bg-[#f3f5f9] text-slate-900';
  const headerClasses = isDark ? 'bg-[#2f2f2f] border-gray-700' : 'bg-white/90 border-slate-200';
  const selectClasses = isDark
    ? 'border-gray-600 bg-[#3a3a3a] text-gray-200'
    : 'border-slate-300 bg-white text-slate-800';
  const panelClasses = isDark ? 'bg-[#2f2f2f] border-gray-700' : 'bg-white border-slate-200';
  const inputSurfaceClasses = isDark ? 'bg-[#3a3a3a]' : 'bg-slate-200';
  const inputTextClasses = isDark ? 'text-gray-200 placeholder:text-gray-400' : 'text-slate-800 placeholder:text-slate-500';
  const mutedTextClasses = isDark ? 'text-gray-500' : 'text-slate-500';
  const toggleClasses = isDark
    ? 'border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700'
    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100';
  const iconBadgeClasses = isDark ? 'bg-gray-600 text-white' : 'bg-slate-200 text-slate-700';
  const assistantBubbleClasses = isDark ? 'bg-[#212121] border-gray-700 text-gray-100' : 'bg-white border-slate-200 text-slate-800';
  const userBubbleClasses = isDark ? 'bg-[#333333] text-white border-transparent' : 'bg-[#e4ebff] text-slate-900 border-transparent';

  return (
    <div className={`flex flex-col h-screen ${shellClasses} transition-colors duration-200`}>
      {/* Header */}
      <header className={`flex items-center justify-between p-3 border-b ${headerClasses}`}>
        <h1 className="text-lg font-semibold">Nexora AI</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${toggleClasses}`}
          >
            {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>
          <select
            aria-label="Select model"
            className={`border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${selectClasses}`}
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="llama3.2">Llama 3.2</option>
            <option value="codellama">CodeLlama</option>
            <option value="deepseek-coder">DeepSeek Coder</option>
          </select>
          <button
            type="button"
            onClick={clearChat}
            className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md text-sm text-white transition-colors"
          >
            Clear
          </button>
        </div>
      </header>

      {/* Chat messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 w-[80%] mx-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`flex gap-3 w-full max-w-3xl items-center ${
                msg.role === 'user' ? 'flex-row-reverse mb-4 mt-4' : 'flex-row'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${iconBadgeClasses}`}>
                {msg.role === 'user' ? (
                  <UserIcon className="h-4 w-4" />
                ) : (
                  <Square3Stack3DIcon className="h-4 w-4" />
                )}
              </div>
              <div
                className={`flex-1 rounded-2xl px-5 py-3 leading-relaxed border ${
                  msg.role === 'user' ? userBubbleClasses : assistantBubbleClasses
                }`}
              >
                <ReactMarkdown
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');

                      return match ? (
                        <Suspense fallback={<code {...props}>{children}</code>}>
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </Suspense>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className={`flex gap-3 items-center ${mutedTextClasses}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${iconBadgeClasses}`}>
              AI
            </div>
            <div className={`border rounded-2xl px-5 py-3 ${panelClasses}`}>
              <span className="animate-pulse">Thinking</span>
              <span className="inline-block animate-bounce ml-1">.</span>
              <span className="inline-block animate-bounce ml-1 delay-100">.</span>
              <span className="inline-block animate-bounce ml-1 delay-200">.</span>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </main>

      {/* Footer */}
      <footer className={`p-4 border-t ${headerClasses}`}>
        <div className={`flex items-center gap-2 max-w-3xl mx-auto w-full rounded-xl ${inputSurfaceClasses}`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            aria-label="Type your message"
            className={`flex-1 border-none rounded-xl px-4 py-2 focus:outline-none ${inputTextClasses} ${inputSurfaceClasses}`}
          />
          {loading ? (
            <button
              type="button"
              onClick={stopResponse}
              aria-label="Stop generation"
              className="px-4 py-2 rounded-xl font-medium"
            >
              <StopCircleIcon className={`h-6 w-6 ${isDark ? 'text-white' : 'text-slate-700'}`} />
            </button>
          ) : (
            <button
              type="button"
              onClick={sendMessage}
              aria-label="Send message"
              className="px-4 py-2 rounded-xl font-medium"
            >
              <ArrowUpCircleIcon className={`h-6 w-6 ${isDark ? 'text-white' : 'text-slate-700'}`} />
            </button>
          )}
        </div>
        <p className={`text-center text-xs mt-2 ${mutedTextClasses}`}>
          Running locally with Ollama · Model: {model}
        </p>
      </footer>
    </div>
  );
}
