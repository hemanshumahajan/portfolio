import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(password);
    setLoading(false);
    if (result.ok) void navigate({ to: "/admin", replace: true });
    else setError(result.error);
  }

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-lg border border-primary/40 bg-primary/10">
            <Lock className="size-5 text-primary" />
          </div>
          <p className="admin-eyebrow">// admin_access</p>
          <h1 className="text-2xl font-semibold">Restricted area</h1>
        </div>
        <form onSubmit={onSubmit} className="admin-panel space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoFocus autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p role="alert" className="admin-error">{error}</p>}
          <Button type="submit" variant="hero" className="w-full" disabled={loading || !password}>
            {loading ? "Verifying…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
