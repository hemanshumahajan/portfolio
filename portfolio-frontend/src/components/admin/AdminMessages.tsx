import { useEffect, useState } from "react";
import { Mail, RefreshCw } from "lucide-react";
import { authFetch } from "../../lib/authFetch";
import { useAuth } from "../../context/AuthContext";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  sentAt: string;
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

function AdminMessages() {
  const { logout } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadMessages() {
    setLoadError(null);
    try {
      const res = await authFetch("/api/contact");
      if (!res.ok) {
        setLoadError(`Server returned ${res.status}.`);
        setMessages([]);
        return;
      }
      const json = await res.json();
      setMessages(Array.isArray(json) ? json : []);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        logout();
        return;
      }
      setLoadError("Couldn't reach the backend. Is it running?");
      setMessages([]);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="code-label">// contact_messages ({messages?.length ?? "…"})</p>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors border border-border hover:border-primary/60 rounded-[2px] px-3 py-1.5 disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {messages === null ? (
        <p className="font-mono text-sm text-muted-foreground">Loading...</p>
      ) : loadError ? (
        <p className="font-mono text-sm text-red-400">// {loadError}</p>
      ) : messages.length === 0 ? (
        <p className="font-mono text-sm text-muted-foreground">// No messages yet</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="bg-surface border border-border rounded-[2px] p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-semibold">{m.name}</h3>
                  <a
                    href={`mailto:${m.email}`}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline"
                  >
                    <Mail size={12} /> {m.email}
                  </a>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                  {formatDate(m.sentAt)}
                </span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminMessages;