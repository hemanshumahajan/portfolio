import { useCallback, useEffect, useState, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UnauthenticatedError, useAuth } from "@/lib/auth";

export function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="font-mono text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const splitList = (value: string, separator: RegExp = /,/) =>
  value.split(separator).map((s) => s.trim()).filter(Boolean);

export const nullIfBlank = (value: string) => value.trim() || null;

export function errorMessage(error: unknown, fallback = "Couldn't reach the backend. It may be waking up — try again.") {
  // Unauthenticated errors already logged the user out; the dashboard redirects.
  if (error instanceof UnauthenticatedError) return null;
  return fallback;
}

/** Loads a list from the backend (with the admin token) and exposes reload/setItems. */
export function useAdminList<T>(path: string) {
  const { authFetch } = useAuth();
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(path);
      if (!res.ok) {
        setError(`Server returned ${res.status}.`);
        setItems([]);
        return;
      }
      const json: unknown = await res.json();
      setItems(Array.isArray(json) ? (json as T[]) : []);
    } catch (err) {
      const message = errorMessage(err);
      if (message) {
        setError(message);
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [authFetch, path]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, setItems, error, loading, reload: load };
}

export function ListHeader({ label, count, loading, onRefresh }: { label: string; count: number | undefined; loading: boolean; onRefresh: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="admin-eyebrow mb-0">// {label} ({count ?? "…"})</p>
      <Button variant="glass" size="sm" onClick={onRefresh} disabled={loading}>
        <RefreshCw className={loading ? "animate-spin" : ""} /> Refresh
      </Button>
    </div>
  );
}

export function ListState({ items, error, empty }: { items: unknown[] | null; error: string | null; empty: string }) {
  if (items === null) return <p className="admin-muted">Loading…</p>;
  if (error) return <p className="admin-error">{error}</p>;
  if (items.length === 0) return <p className="admin-muted">{empty}</p>;
  return null;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
