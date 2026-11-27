import { useRef, useState } from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { sendChat, type ChatTurn } from "@/lib/api";

type ChatMessage = ChatTurn & { id: number; failed?: boolean };

const GREETING: ChatMessage = { id: 0, role: "assistant", content: "Ask me about Hemanshu’s work, stack, or public projects." };
const SUGGESTIONS = ["What do you build?", "What's your stack?", "Show me your GitHub"];

// One id per visit so the backend groups messages into a single conversation.
function newSessionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Downloaded on demand by PortfolioChat. It stays mounted after the first open (only hidden
// when closed), so the conversation survives closing and reopening the panel.
export default function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [pending, setPending] = useState(false);
  const sessionId = useRef<string | null>(null);
  const nextId = useRef(1);

  const submit = async ({ text }: { text: string }) => {
    const content = text.trim();
    if (!content || pending) return;

    const userMessage: ChatMessage = { id: nextId.current++, role: "user", content };
    // The greeting is UI-only; failed replies aren't real model turns either.
    const history: ChatTurn[] = [...messages, userMessage]
      .filter((m) => m.id !== GREETING.id && !m.failed)
      .map(({ role, content }) => ({ role, content }));

    setMessages((m) => [...m, userMessage]);
    setPending(true);
    sessionId.current ??= newSessionId();

    try {
      const reply = await sendChat(history, sessionId.current);
      setMessages((m) => [...m, { id: nextId.current++, role: "assistant", content: reply }]);
    } catch (error) {
      const message =
        error instanceof Error && error.name === "ApiError"
          ? error.message
          : "I couldn't reach the server — it may be waking up. Please try again in a moment.";
      setMessages((m) => [...m, { id: nextId.current++, role: "assistant", content: message, failed: true }]);
    } finally {
      setPending(false);
    }
  };

  return (
    <aside className="chat-panel" aria-label="Ask about Hemanshu's work" style={open ? undefined : { display: "none" }}>
      <header><div><span className="agent-mark"><Bot /></span><div><strong>Ask about my work</strong><small>portfolio.assistant</small></div></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chat"><X /></Button></header>
      <Conversation className="min-h-0"><ConversationContent className="gap-5 p-4">
        {messages.map((message) => (
          <Message key={message.id} from={message.role}>
            <MessageContent className={message.role === "user" ? "bg-primary text-primary-foreground" : message.failed ? "bg-transparent text-muted-foreground" : "bg-transparent"}>
              <MessageResponse>{message.content}</MessageResponse>
            </MessageContent>
          </Message>
        ))}
        {pending && <Message from="assistant"><MessageContent className="bg-transparent"><Shimmer className="font-mono text-xs">Thinking…</Shimmer></MessageContent></Message>}
      </ConversationContent><ConversationScrollButton /></Conversation>
      {messages.length === 1 && <div className="suggestions">{SUGGESTIONS.map((item) => <button key={item} onClick={() => void submit({ text: item })}>{item}</button>)}</div>}
      <PromptInput onSubmit={submit} className="chat-composer w-auto"><PromptInputTextarea placeholder="Ask a question..." maxLength={2000} className="min-h-12" /><PromptInputFooter className="justify-end"><PromptInputSubmit status={pending ? "submitted" : "ready"} disabled={pending} /></PromptInputFooter></PromptInput>
    </aside>
  );
}