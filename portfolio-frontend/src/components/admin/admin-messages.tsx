import { Mail } from "lucide-react";
import { ListHeader, ListState, formatDateTime, useAdminList } from "./admin-ui";

type ContactMessage = { id: string; name: string; email: string; message: string; sentAt: string };

export function AdminMessages() {
  const { items: messages, error, loading, reload } = useAdminList<ContactMessage>("/api/contact");

  return (
    <div>
      <ListHeader label="contact_messages" count={messages?.length} loading={loading} onRefresh={() => void reload()} />
      <ListState items={messages} error={error} empty="No messages yet." />
      {messages && messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="admin-item flex-col">
              <div className="flex w-full items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{m.name}</h3>
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline">
                    <Mail className="size-3" /> {m.email}
                  </a>
                </div>
                <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">{formatDateTime(m.sentAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
