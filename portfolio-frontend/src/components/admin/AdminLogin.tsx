import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from || "/admin";

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  async function onSubmit(e: FormEvent) {
  e.preventDefault();
  setError(null);
  setLoading(true);
  const result = await login(password);
  setLoading(false);
  if ("error" in result) {
    setError(result.error);
  } else {
    navigate(from, { replace: true });
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[2px] border border-primary/40 bg-primary/10 mb-4">
            <Lock size={20} className="text-primary" />
          </div>
          <p className="code-label mb-2">// admin_access</p>
          <h1 className="text-2xl font-bold">Restricted Area</h1>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-surface border border-border rounded-[2px] p-6 space-y-4"
        >
          <div>
            <label htmlFor="password" className="coord-label block mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-[2px] px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="font-mono text-xs text-red-400">// {error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-primary text-primary-foreground font-mono text-sm font-semibold py-2.5 rounded-[2px] hover:shadow-[0_0_24px_rgba(0,194,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;