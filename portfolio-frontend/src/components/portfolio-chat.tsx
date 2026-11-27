import { lazy, Suspense, useState } from "react";
import { MessageSquareText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// The chat UI (Markdown renderer, code highlighting, diagrams) is the heaviest code on the
// site, so it's downloaded only when a visitor first reaches for the chat — not on page load.
const loadChatPanel = () => import("@/components/chat-panel");
const ChatPanel = lazy(loadChatPanel);

export function PortfolioChat() {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);

  const toggle = () => {
    setRequested(true);
    setOpen((value) => !value);
  };

  return <>
    {requested && (
      <Suspense fallback={open ? <aside className="chat-panel" aria-busy="true" aria-label="Loading chat"><p className="m-auto font-mono text-xs text-muted-foreground">Loading…</p></aside> : null}>
        <ChatPanel open={open} onClose={() => setOpen(false)} />
      </Suspense>
    )}
    <Button
      variant="hero"
      size="icon"
      className="chat-trigger"
      onClick={toggle}
      onPointerEnter={() => void loadChatPanel()}
      onFocus={() => void loadChatPanel()}
      aria-label={open ? "Close assistant" : "Ask about my work"}
    >
      {open ? <X /> : <MessageSquareText />}
    </Button>
  </>;
}