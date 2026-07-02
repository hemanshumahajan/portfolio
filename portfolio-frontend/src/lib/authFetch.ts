import { getToken, isTokenValid, clearToken } from "./auth";
import { API_BASE_URL } from "./api";

/**
 * Wrapper around fetch for authenticated admin requests.
 * Attaches the stored JWT as a Bearer token automatically.
 *
 * Throws Error("UNAUTHENTICATED") if the token is missing/expired
 * locally, or if the server responds 401 (e.g. token was valid
 * client-side but rejected server-side). Callers should catch this
 * and redirect to /admin/login — see AdminDashboard usage.
 */
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!isTokenValid(token)) {
    clearToken();
    throw new Error("UNAUTHENTICATED");
  }

  const isJsonBody = typeof options.body === "string";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    clearToken();
    throw new Error("UNAUTHENTICATED");
  }

  return res;
}