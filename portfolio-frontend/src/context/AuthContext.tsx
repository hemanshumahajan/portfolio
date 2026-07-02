import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { getToken, setToken as persistToken, clearToken, isTokenValid } from "../lib/auth";
import { API_BASE_URL } from "../lib/api";

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (password: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    const stored = getToken();
    return isTokenValid(stored) ? stored : null;
  });

  const login = useCallback(async (password: string): Promise<LoginResult> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { ok: false, error: body.error || "Invalid password." };
      }

      const data = await res.json();
      persistToken(data.token);
      setTokenState(data.token);
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}