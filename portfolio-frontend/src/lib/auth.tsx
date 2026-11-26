import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

const TOKEN_KEY = "portfolio_admin_token";

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  return isTokenValid(token) ? token : null;
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
  } catch {
    return null;
  }
}

/** Client-side convenience only — the backend still enforces [Authorize] on every request. */
export function isTokenValid(token: string | null): token is string {
  if (!token) return false;
  const exp = decodeJwtPayload(token)?.exp;
  return typeof exp === "number" && exp * 1000 > Date.now();
}

export class UnauthenticatedError extends Error {
  constructor() {
    super("UNAUTHENTICATED");
    this.name = "UnauthenticatedError";
  }
}

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (password: string) => Promise<LoginResult>;
  logout: () => void;
  /** fetch() against the backend with the admin JWT attached. Throws UnauthenticatedError on 401. */
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const login = useCallback(async (password: string): Promise<LoginResult> => {
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
      if (!res.ok || !body.token) return { ok: false, error: body.error || "Invalid password." };
      window.localStorage.setItem(TOKEN_KEY, body.token);
      setToken(body.token);
      return { ok: true };
    } catch {
      return { ok: false, error: "Couldn't reach the backend. It may be waking up — try again." };
    }
  }, []);

  const authFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      if (!isTokenValid(token)) {
        logout();
        throw new UnauthenticatedError();
      }
      const res = await apiFetch(path, {
        ...init,
        headers: {
          ...(typeof init.body === "string" ? { "Content-Type": "application/json" } : {}),
          ...(init.headers as Record<string, string> | undefined),
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        logout();
        throw new UnauthenticatedError();
      }
      return res;
    },
    [token, logout],
  );

  const value = useMemo(
    () => ({ isAuthenticated: !!token, login, logout, authFetch }),
    [token, login, logout, authFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
