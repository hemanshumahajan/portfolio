import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, Minus, Send, Loader2 } from "lucide-react";
import { sendChatMessage, type ChatMessage } from "@/lib/api";

interface TerminalMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isTyping?: boolean;
}

const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-US", { hour12: false });
};

const TYPING_SPEED = 18; // ms per character

const TypingText = ({ text, onDone }: { text: string; onDone: () => void }) => {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const scrollParent = useRef<HTMLElement | null>(null);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        clearInterval(interval);
        onDone();
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, TYPING_SPEED);

    return () => clearInterval(interval);
  }, [text, onDone]);

  // Auto-scroll while typing
  useEffect(() => {
    if (!scrollParent.current) {
      const el = document.getElementById("chatbot-scroll");
      if (el) scrollParent.current = el;
    }
    if (scrollParent.current) {
      scrollParent.current.scrollTop = scrollParent.current.scrollHeight;
    }
  }, [displayed]);

  return (
    <>
      {displayed}
      <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse ml-0.5 align-middle" />
    </>
  );
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<TerminalMessage[]>([
    {
      role: "system",
      content: "hemanshu@portfolio:~$ Welcome! I'm Hemanshu's AI assistant. Ask me anything about his work, skills, or experience.",
      timestamp: getTimestamp(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleTypingDone = useCallback(() => {
    setTypingIndex(null);
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || typingIndex !== null) return;

    const userMsg: TerminalMessage = {
      role: "user",
      content: trimmed,
      timestamp: getTimestamp(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const history: ChatMessage[] = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    history.push({ role: "user", content: trimmed });

    try {
      const data = await sendChatMessage(history);
      setMessages((prev) => {
        const newMsg: TerminalMessage = {
          role: "assistant",
          content: data.reply,
          timestamp: getTimestamp(),
          isTyping: true,
        };
        setTypingIndex(prev.length);
        return [...prev, newMsg];
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "Error: Connection to server failed. Try again later.",
          timestamp: getTimestamp(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center glow-primary hover:scale-110 transition-transform"
            aria-label="Open chat"
          >
            <Terminal className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] h-[520px] flex flex-col rounded-xl overflow-hidden border border-border shadow-2xl"
            style={{
              background: "hsl(var(--background))",
              boxShadow: "0 0 40px hsl(var(--primary) / 0.15), 0 20px 60px hsl(0 0% 0% / 0.5)",
            }}
          >
            {/* Title bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-secondary border-b border-border select-none">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <button onClick={() => setIsOpen(false)} className="w-3 h-3 rounded-full bg-destructive hover:brightness-125 transition-all" />
                  <button className="w-3 h-3 rounded-full bg-yellow-500 hover:brightness-125 transition-all" />
                  <button className="w-3 h-3 rounded-full bg-green-500 hover:brightness-125 transition-all" />
                </div>
                <span className="font-mono text-xs text-muted-foreground ml-2">
                  hemanshu@portfolio ~ chat
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={scrollRef}
              id="chatbot-scroll"
              className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm"
            >
              {messages.map((msg, i) => (
                <div key={i} className="leading-relaxed">
                  {msg.role === "user" ? (
                    <div>
                      <span className="text-green-400">visitor</span>
                      <span className="text-muted-foreground">@portfolio</span>
                      <span className="text-primary">:</span>
                      <span className="text-accent">~</span>
                      <span className="text-primary">$</span>{" "}
                      <span className="text-foreground">{msg.content}</span>
                    </div>
                  ) : msg.role === "assistant" ? (
                    <div className="pl-2 border-l-2 border-primary/30">
                      <span className="text-primary/60 text-xs">[{msg.timestamp}] </span>
                      <span className="text-foreground/90">
                        {typingIndex === i ? (
                          <TypingText text={msg.content} onDone={handleTypingDone} />
                        ) : (
                          msg.content
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground/70 text-xs">
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 pl-2 border-l-2 border-primary/30">
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  <span className="text-muted-foreground text-xs font-mono animate-pulse">
                    processing request...
                  </span>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-border px-4 py-3 bg-secondary/50">
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-mono text-sm shrink-0">❯</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  disabled={isLoading || typingIndex !== null}
                  maxLength={500}
                  className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim() || typingIndex !== null}
                  className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
