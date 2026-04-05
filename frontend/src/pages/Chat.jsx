import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../context/StudentContext.jsx";
import { sendMessage } from "../api/client.js";

export default function Chat() {
  const navigate = useNavigate();
  const { student, sessionId, chatHistory, setChatHistory } = useStudent();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setChatHistory(h => [...h, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await sendMessage(sessionId, userMsg, student);
      setChatHistory(h => [...h, { role: "model", text: res.data.reply }]);
    } catch (err) {
      setChatHistory(h => [...h, { role: "model", text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const PERSONA_LABELS = {
    dora: "🗺️ Dora Explorer", sherlock: "🔍 Detective",
    storyteller: "📖 Storyteller", coach: "🏆 Coach",
    scientist: "🔬 Mad Scientist", custom: "✨ Custom",
  };

  return (
    <div className="min-h-screen bg-violet-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-violet-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-lg">
            {student?.persona === "dora" ? "🗺️" :
             student?.persona === "sherlock" ? "🔍" :
             student?.persona === "storyteller" ? "📖" :
             student?.persona === "coach" ? "🏆" :
             student?.persona === "scientist" ? "🔬" : "✨"}
          </div>
          <div>
            <p className="font-bold text-slate-700 text-sm">
              {PERSONA_LABELS[student?.persona] || "AI Tutor"}
            </p>
            <p className="text-xs text-slate-400">
              Teaching: {student?.topic} · {student?.subject}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Live</span>
          </div>
          <button
            onClick={() => navigate("/quiz")}
            className="bg-violet-400 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-full transition-all"
          >
            Take Quiz →
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "model" && (
              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-sm mr-2 mt-1 flex-shrink-0">
                {student?.persona === "dora" ? "🗺️" :
                 student?.persona === "sherlock" ? "🔍" :
                 student?.persona === "storyteller" ? "📖" :
                 student?.persona === "coach" ? "🏆" :
                 student?.persona === "scientist" ? "🔬" : "✨"}
              </div>
            )}
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-violet-400 text-white rounded-br-sm"
                : "bg-white border border-violet-100 text-slate-700 rounded-bl-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0">
              {student?.persona === "dora" ? "🗺️" : "✨"}
            </div>
            <div className="bg-white border border-violet-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-violet-300 rounded-full animate-bounce" style={{animationDelay:"0ms"}} />
                <span className="w-2 h-2 bg-violet-300 rounded-full animate-bounce" style={{animationDelay:"150ms"}} />
                <span className="w-2 h-2 bg-violet-300 rounded-full animate-bounce" style={{animationDelay:"300ms"}} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-violet-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything or answer the tutor..."
            rows={1}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 resize-none transition-all"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-violet-400 hover:bg-violet-500 disabled:opacity-40 text-white p-3 rounded-2xl transition-all flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-slate-300 mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

    </div>
  );
}