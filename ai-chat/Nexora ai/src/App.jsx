// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   lazy,
//   Suspense,
//   memo,
// } from "react";
// import ReactMarkdown from "react-markdown";
// import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
// import {
//   ArrowUpCircleIcon,
//   StopCircleIcon,
// } from "@heroicons/react/24/solid";

// const SyntaxHighlighter = lazy(() =>
//   import("react-syntax-highlighter").then((m) => ({ default: m.Prism }))
// );

// const STORAGE_KEY = "chatHistory";

// const MessageBubble = memo(({ msg }) => (
//   <div
//     className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
//   >
//     <div
//       className={`flex gap-3 w-full max-w-3xl ${
//         msg.role === "user" ? "flex-row-reverse" : "flex-row"
//       }`}
//     >
//       <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold">
//         {msg.role === "user" ? "U" : "AI"}
//       </div>

//       <div
//         className={`flex-1 rounded-2xl px-5 py-3 leading-relaxed border ${
//           msg.role === "user"
//             ? "bg-[#007AFF] text-white border-[#007AFF]"
//             : "bg-[#2f2f2f] border-gray-700 text-gray-100"
//         }`}
//       >
//         <ReactMarkdown
//           components={{
//             code({ inline, children, node, ...props }) {
//               const match = /language-(\w+)/.exec(
//                 node.properties?.className?.[0] || ""
//               );

//               return !inline && match ? (
//                 <div className="my-3">
//                   <div className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded-t-lg border border-gray-700 font-mono">
//                     {match[1].toUpperCase()} FILE
//                   </div>
//                   <Suspense
//                     fallback={
//                       <div className="text-xs text-gray-400 bg-gray-900 px-2 py-1 rounded-lg border border-gray-700 font-mono">
//                         Loading code...
//                       </div>
//                     }
//                   >
//                     <SyntaxHighlighter
//                       style={oneDark}
//                       language={match[1]}
//                       PreTag="div"
//                       className="rounded-b-lg border border-gray-700 text-sm"
//                     >
//                       {String(children).replace(/\n$/, "")}
//                     </SyntaxHighlighter>
//                   </Suspense>
//                 </div>
//               ) : (
//                 <code className="bg-gray-900 px-1 py-0.5 rounded text-sm">
//                   {children}
//                 </code>
//               );
//             },
//             p: ({ node, ...props }) => (
//               <p className="my-2 leading-relaxed text-gray-100" {...props} />
//             ),
//           }}
//         >
//           {msg.content}
//         </ReactMarkdown>
//       </div>
//     </div>
//   </div>
// ));

// export default function App() {
//   const [messages, setMessages] = useState(() => {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     return saved ? JSON.parse(saved) : [];
//   });
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [model, setModel] = useState("llama3.2");
//   const messageEndRef = useRef(null);
//   const prevMsgCount = useRef(messages.length);
//   const saveTimeout = useRef(null);
//   const controllerRef = useRef(null);

//   // Debounced localStorage save
//   useEffect(() => {
//     clearTimeout(saveTimeout.current);
//     saveTimeout.current = setTimeout(() => {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
//     }, 500);
//   }, [messages]);

//   // Auto-scroll when messages change
//   useEffect(() => {
//     if (messages.length !== prevMsgCount.current) {
//       messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
//       prevMsgCount.current = messages.length;
//     }
//   }, [messages]);

//   const stopResponse = useCallback(() => {
//     if (controllerRef.current) {
//       controllerRef.current.abort();
//       setLoading(false);
//     }
//   }, []);

// const sendMessage = useCallback(async () => {
//   if (!input.trim() || loading) return;

//   const userMsg = { role: "user", content: input };
//   const updated = [...messages, userMsg];
//   setMessages(updated);
//   setInput("");
//   setLoading(true);

//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), 30000);

//   try {
//     const response = await fetch("http://localhost:5000/api/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ messages: updated, model }),
//       signal: controller.signal,
//     });

//     clearTimeout(timeout);
//     if (!response.ok || !response.body) throw new Error("Bad response");

//     const reader = response.body.getReader();
//     const decoder = new TextDecoder("utf-8");
//     let firstTokenReceived = false;

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;

//       const chunk = decoder.decode(value, { stream: true });
//       const lines = chunk.split("\n").filter(Boolean);

//       for (const line of lines) {
//         if (!line.startsWith("data:")) continue;
//         const data = JSON.parse(line.replace("data: ", ""));

//         if (data.token) {
//           if (!firstTokenReceived) {
//             // Only add assistant once the first token arrives
//             setMessages((prev) => [
//               ...prev,
//               { role: "assistant", content: data.token },
//             ]);
//             firstTokenReceived = true;
//           } else {
//             setMessages((prev) => {
//               const last = { ...prev[prev.length - 1] };
//               last.content += data.token;
//               return [...prev.slice(0, -1), last];
//             });
//           }
//         }

//         if (data.done) setLoading(false);
//       }
//     }
//   } catch (err) {
//     console.error("Stream failed:", err);
//     setMessages((prev) => [
//       ...prev,
//       { role: "assistant", content: "⚠️ Error during stream." },
//     ]);
//   } finally {
//     setLoading(false);
//   }
// }, [input, messages, model, loading]);

//   const clearChat = useCallback(() => {
//     setMessages([]);
//     localStorage.removeItem(STORAGE_KEY);
//   }, []);

//   return (
//     <div className="flex flex-col h-screen bg-[#212121] text-white">
//       {/* Header */}
//       <header className="flex items-center justify-between p-3 bg-[#2f2f2f] border-b border-gray-700">
//         <h1 className="text-lg font-semibold">Nexora AI</h1>
//         <div className="flex items-center gap-2">
//           <select
//             className="bg-[#3a3a3a] border border-gray-600 rounded-md px-2 py-1 text-sm text-gray-200"
//             value={model}
//             onChange={(e) => setModel(e.target.value)}
//           >
//             <option value="llama3.2">Llama 3.2</option>
//             <option value="codellama">CodeLlama</option>
//             <option value="deepseek-coder">DeepSeek Coder</option>
//           </select>
//           <button
//             onClick={clearChat}
//             className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
//           >
//             Clear
//           </button>
//         </div>
//       </header>

//       {/* Chat messages */}
//       <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
//         {messages.map((msg, i) => (
//           <MessageBubble key={i} msg={msg} />
//         ))}

//         {loading && (
//           <div className="flex gap-3 items-center text-gray-400">
//             <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold">
//               AI
//             </div>
//             <div className="bg-[#2f2f2f] border border-gray-700 rounded-2xl px-5 py-3">
//               <span className="animate-pulse">Thinking</span>
//               <span className="inline-block animate-bounce ml-1">.</span>
//               <span className="inline-block animate-bounce ml-1 delay-100">.</span>
//               <span className="inline-block animate-bounce ml-1 delay-200">.</span>
//             </div>
//           </div>
//         )}
//         <div ref={messageEndRef} />
//       </main>

//       {/* Input */}
//       <footer className="p-4 bg-[#2f2f2f] border-t border-gray-700">
//         <div className="flex items-center gap-2 max-w-3xl mx-auto w-full bg-[#3a3a3a] rounded-xl">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//             placeholder="Ask me anything..."
//             className="flex-1 bg-[#3a3a3a] rounded-xl px-5 py-3 focus:outline-none text-gray-200"
//           />

//           {loading ? (
//             <button
//               onClick={stopResponse}
//               className="px-5 py-3 text-red-400 hover:text-red-500"
//               title="Stop generating"
//             >
//               <StopCircleIcon className="w-8 h-8" />
//             </button>
//           ) : (
//             <button
//               onClick={sendMessage}
//               disabled={!input.trim()}
//               className="px-5 py-3 text-white hover:text-blue-400"
//             >
//               <ArrowUpCircleIcon className="w-8 h-8" />
//             </button>
//           )}
//         </div>
//         <p className="text-center text-gray-500 text-xs mt-2">
//           Running locally with Ollama · Model: {model}
//         </p>
//       </footer>
//     </div>
//   );
// }




import React, { useState, useEffect, useRef, useCallback, lazy, Suspense, memo } from "react";
import ReactMarkdown from "react-markdown";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ArrowUpCircleIcon, Square3Stack3DIcon, StopCircleIcon, UserIcon } from "@heroicons/react/24/solid";

const SyntaxHighlighter = lazy(() =>
  import("react-syntax-highlighter").then((m) => ({ default: m.Prism }))
);

const STORAGE_KEY = "chatHistory";

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("llama3.2");
  const [controller, setController] = useState(null); // 👈 track AbortController
  const messageEndRef = useRef(null);

  // Debounced localStorage save
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }, 400);
    return () => clearTimeout(timeout);
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🚀 Send message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    const newController = new AbortController();
    setController(newController);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, model }),
        signal: newController.signal,
      });

      if (!response.ok || !response.body) throw new Error("Bad response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let firstTokenReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = JSON.parse(line.replace("data: ", ""));

          if (data.token) {
            if (!firstTokenReceived) {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.token },
              ]);
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
      if (err.name === "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⏹️ Generation stopped." },
        ]);
      } else {
        console.error("Stream failed:", err);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ Error during stream." },
        ]);
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

  return (
    <div className="flex flex-col h-screen bg-[#2f2f2f] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-3 bg-[#2f2f2f] border-b border-gray-700">
        <h1 className="text-lg font-semibold">Nexora AI</h1>
        <div className="flex items-center gap-2">
          <select
            className="bg-[#3a3a3a] border border-gray-600 rounded-md px-2 py-1 text-sm text-gray-200"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="llama3.2">Llama 3.2</option>
            <option value="codellama">CodeLlama</option>
            <option value="deepseek-coder">DeepSeek Coder</option>
          </select>
          <button
            onClick={clearChat}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
          >
            Clear
          </button>
        </div>
      </header>

      {/* Chat messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 w-[80%] mx-auto
">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex gap-3 w-full max-w-3xl ${
                msg.role === "user" ? "flex-row-reverse mb-4 mt-4" : "flex-row"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold">
                {msg.role === "user" ? <UserIcon className="px-2 py-2"/>: <Square3Stack3DIcon className="px-2 py-2"/> }
              </div>
              <div
                className={`flex-1 rounded-2xl px-5 py-3 leading-relaxed border ${
                  msg.role === "user"
                    ? "bg-[#333333] text-white border-0"
                    : "bg-[#212121] border-gray-700 text-gray-100"
                }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-center text-gray-400">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold">
              AI
            </div>
            <div className="bg-[#2f2f2f] border border-gray-700 rounded-2xl px-5 py-3">
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
      <footer className="p-4 bg-[#2f2f2f] border-t border-gray-700">
        <div className="flex items-center gap-2 max-w-3xl mx-auto w-full bg-[#3a3a3a] rounded-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 bg-[#3a3a3a] border-none rounded-xl px-4 py-2 focus:outline-none text-gray-200"
          />
          {loading ? (
            <button
              onClick={stopResponse}
              className=" px-4 py-2 rounded-xl font-medium"
            >
              <StopCircleIcon className="w-6 h-6 text-white" />
            </button>
          ) : (
            <button
              onClick={sendMessage}
              className=" px-4 py-2 rounded-xl font-medium"
            >
              <ArrowUpCircleIcon className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
        <p className="text-center text-gray-500 text-xs mt-2">
          Running locally with Ollama · Model: {model}
        </p>
      </footer>
    </div>
  );
}
