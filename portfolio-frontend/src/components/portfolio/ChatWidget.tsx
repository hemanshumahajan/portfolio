import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { API_BASE_URL } from "../../lib/api";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What do you build?",
  "Tell me about Tekla plugins",
  "Are you open to remote work?",
];

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hey! Ask me anything about Hemanshu's work, plugins, or availability." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      // Backend expects { messages: [{ role, content }] } and on success
      // returns { reply } directly (no "ok" field) — non-2xx means error.
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `⚠ ${errText || "Something went wrong."}` },
        ]);
        return;
      }

      const json = await res.json().catch(() => ({}));
      setMessages((m) => [...m, { role: "assistant", content: json.reply || "(no response)" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "⚠ Network error." }]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <>
      {/* floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_24px_rgba(0,194,255,0.45)] hover:shadow-[0_0_40px_rgba(0,194,255,0.8)] hover:scale-105 transition-all"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[min(380px,calc(100vw-3rem))] h-[min(560px,calc(100vh-8rem))] bg-surface border border-border rounded-[4px] shadow-2xl flex flex-col overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/60">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-semibold">Ask me anything</h3>
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-primary/15 text-primary border border-primary/40 rounded-[2px] tracking-wider">
                AI
              </span>
            </div>
            <span className="coord-label">CHAT/01</span>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] bg-primary text-primary-foreground font-mono text-xs px-3 py-2 rounded-[2px]"
                      : "max-w-[85%] bg-background border border-border text-foreground/90 text-sm px-3 py-2 rounded-[2px] leading-relaxed"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-background border border-border px-3 py-2.5 rounded-[2px] flex items-center gap-1">
                  <Dot /> <Dot delay={0.2} /> <Dot delay={0.4} />
                </div>
              </div>
            )}
          </div>

          {/* suggestions */}
          {messages.length <= 1 && !loading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="font-mono text-[11px] px-2.5 py-1 border border-border text-muted-foreground hover:text-primary hover:border-primary/60 rounded-[2px] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* input */}
          <form onSubmit={onSubmit} className="border-t border-border p-3 flex gap-2 bg-background/60">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background border border-border rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-primary text-primary-foreground px-3 rounded-[2px] hover:shadow-[0_0_18px_rgba(0,194,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-primary"
      style={{ animation: `chatpulse 1.2s ease-in-out ${delay}s infinite` }}
    />
  );
}

export default ChatWidget;