import { useState } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { ListHeader, ListState, errorMessage, formatDateTime, useAdminList } from "./admin-ui";

type SessionSummary = { id: string; sessionId: string; startedAt: string; lastMessageAt: string; messageCount: number; preview: string };
type SessionDetail = {
  id: string;
  sessionId: string;
  startedAt: string;
  lastMessageAt: string;
  messages: { role: "user" | "assistant"; content: string; timestamp: string }[];
};

export function AdminChats() {
  const { authFetch } = useAuth();
  const { items: sessions, error, loading, reload } = useAdminList<SessionSummary>("/api/chat-sessions");
  const [selected, setSelected] = useState<SessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  async function openSession(id: string) {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await authFetch(`/api/chat-sessions/${id}`);
      if (!res.ok) {
        setDetailError(`Server returned ${res.status}.`);
        return;
      }
      setSelected((await res.json()) as SessionDetail);
    } catch (err) {
      const message = errorMessage(err, "Couldn't load this conversation.");
      if (message) setDetailError(message);
    } finally {
      setDetailLoading(false);
    }
  }

  if (selected) {
    return (
      <div>
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => setSelected(null)}><ArrowLeft /> All conversations</Button>
        <p className="admin-eyebrow">// conversation</p>
        <p className="mb-6 font-mono text-xs text-muted-foreground">Started {formatDateTime(selected.startedAt)} — {selected.messages.length} messages</p>
        <div className="max-w-2xl space-y-3">
          {selected.messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={m.role === "user"
                ? "max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                : "max-w-[85%] whitespace-pre-wrap rounded-lg border border-border bg-glass px-3 py-2 text-sm leading-relaxed text-foreground/90"}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ListHeader label="chat_sessions" count={sessions?.length} loading={loading} onRefresh={() => void reload()} />
      {detailError && <p className="admin-error mb-4">{detailError}</p>}
      <ListState items={sessions} error={error} empty="No conversations yet." />
      {sessions && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((s) => (
            <button key={s.id} type="button" onClick={() => void openSession(s.id)} disabled={detailLoading} className="admin-item w-full text-left hover:border-primary/60 disabled:opacity-50">
              <MessageSquare className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground/90">{s.preview}</p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{s.messageCount} messages — last active {formatDateTime(s.lastMessageAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
