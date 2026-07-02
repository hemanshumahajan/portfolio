import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, RefreshCw } from "lucide-react";
import { authFetch } from "../../lib/authFetch";
import { useAuth } from "../../context/AuthContext";

type SessionSummary = {
  id: string;
  sessionId: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  preview: string;
};

type ChatMessageLog = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type SessionDetail = {
  id: string;
  sessionId: string;
  startedAt: string;
  lastMessageAt: string;
  messages: ChatMessageLog[];
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminChats() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [selected, setSelected] = useState<SessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  async function loadSessions() {
    setLoadError(null);
    try {
      const res = await authFetch("/api/chat-sessions");
      if (!res.ok) {
        setLoadError(`Server returned ${res.status}.`);
        setSessions([]);
        return;
      }
      const json = await res.json();
      setSessions(Array.isArray(json) ? json : []);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        logout();
        return;
      }
      setLoadError("Couldn't reach the backend. Is it running?");
      setSessions([]);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  }

  async function openSession(id: string) {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await authFetch(`/api/chat-sessions/${id}`);
      if (!res.ok) {
        setDetailError(`Server returned ${res.status}.`);
        return;
      }
      const json = await res.json();
      setSelected(json);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        logout();
        return;
      }
      setDetailError("Couldn't load this conversation.");
    } finally {
      setDetailLoading(false);
    }
  }

  // --- Transcript view ---
  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to all conversations
        </button>

        <p className="code-label mb-1">// conversation</p>
        <p className="font-mono text-xs text-muted-foreground mb-6">
          Started {formatDate(selected.startedAt)} · {selected.messages.length} messages
        </p>

        <div className="space-y-3 max-w-2xl">
          {selected.messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] bg-primary text-primary-foreground font-mono text-xs px-3 py-2 rounded-[2px]"
                    : "max-w-[85%] bg-surface border border-border text-foreground/90 text-sm px-3 py-2 rounded-[2px] leading-relaxed"
                }
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Session list view ---
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="code-label">// chat_sessions ({sessions?.length ?? "…"})</p>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors border border-border hover:border-primary/60 rounded-[2px] px-3 py-1.5 disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {detailError && <p className="font-mono text-xs text-red-400 mb-4">// {detailError}</p>}

      {sessions === null ? (
        <p className="font-mono text-sm text-muted-foreground">Loading...</p>
      ) : loadError ? (
        <p className="font-mono text-sm text-red-400">// {loadError}</p>
      ) : sessions.length === 0 ? (
        <p className="font-mono text-sm text-muted-foreground">// No conversations yet</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => openSession(s.id)}
              disabled={detailLoading}
              className="w-full text-left bg-surface border border-border hover:border-primary/60 rounded-[2px] p-4 flex items-start justify-between gap-4 transition-colors disabled:opacity-50"
            >
              <div className="flex items-start gap-3 min-w-0">
                <MessageSquare size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground/90 truncate max-w-md">{s.preview}</p>
                  <p className="font-mono text-[11px] text-muted-foreground mt-1">
                    {s.messageCount} messages · last active {formatDate(s.lastMessageAt)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminChats;