// Client for the ASP.NET Core backend (portfolio-backend).
// Set VITE_API_URL in Vercel's project settings; local dev falls back to the
// backend's default `dotnet run` address.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5059").replace(/\/+$/, "");

// Render's free tier can take a while to wake up, so be patient but bounded.
const DEFAULT_TIMEOUT_MS = 20_000;

export type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  demoVideoUrl?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  createdAt: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  coverImageUrl?: string | null;
  thumbnailUrl?: string | null;
  images: string[];
  videos: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GithubStats = {
  publicRepos: number | null;
  followers: number | null;
  commits: number | null;
  estimatedLines: number | null;
  stars: number | null;
  totalContributions: number | null;
  weeks: number[][];
  updatedAt?: string;
};

export type ContactPayload = { name: string; email: string; message: string };
export type ContactResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors: Partial<Record<keyof ContactPayload, string[]>> };

export type ChatTurn = { role: "user" | "assistant"; content: string };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(path: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = init;
  return fetch(apiUrl(path), {
    ...rest,
    signal: rest.signal ?? AbortSignal.timeout(timeoutMs),
  });
}

async function getJson<T>(path: string): Promise<T> {
  const res = await apiFetch(path, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new ApiError(res.status, `GET ${path} failed with ${res.status}`);
  return (await res.json()) as T;
}

export const getProjects = () => getJson<Project[]>("/api/projects");
export const getProject = (id: string) => getJson<Project>(`/api/projects/${encodeURIComponent(id)}`);
export const getBlogPosts = () => getJson<BlogPost[]>("/api/blog");
export const getBlogPost = (slug: string) => getJson<BlogPost>(`/api/blog/${encodeURIComponent(slug)}`);
export const getGithubStats = () => getJson<GithubStats>("/api/github");

/** Resolves to null instead of throwing, for loaders that should still render the page. */
export async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

export async function sendContact(payload: ContactPayload): Promise<ContactResult> {
  try {
    const res = await apiFetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as {
      message?: string;
      errors?: Partial<Record<keyof ContactPayload, string[]>>;
    };
    if (res.ok) return { ok: true, message: body.message || "Thanks! I'll get back to you soon." };
    return {
      ok: false,
      error: res.status === 400 ? "Please fix the highlighted fields." : "Something went wrong. Please try again.",
      fieldErrors: body.errors ?? {},
    };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Please try again in a moment.", fieldErrors: {} };
  }
}

export async function sendChat(messages: ChatTurn[], sessionId: string): Promise<string> {
  const res = await apiFetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, sessionId }),
    timeoutMs: 45_000,
  });
  const body = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
  if (!res.ok) throw new ApiError(res.status, body.error || "The assistant is unavailable right now.");
  return body.reply || "(no response)";
}

/** Converts a Google Drive share link into an embeddable /preview URL. */
export function toDriveEmbedUrl(url: string): string | null {
  if (!/drive\.google\.com/.test(url)) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
}

/**
 * Splits a project's links into the live site and the demo video.
 * Older projects stored their Google Drive demo in liveUrl, so a Drive link
 * there still counts as the demo until it's moved to demoVideoUrl in admin.
 */
export function getProjectLinks(project: Pick<Project, "liveUrl" | "demoVideoUrl">) {
  const live = project.liveUrl?.trim() || null;
  const liveIsVideo = !!live && !!toDriveEmbedUrl(live);
  return {
    liveUrl: liveIsVideo ? null : live,
    demoVideoUrl: project.demoVideoUrl?.trim() || (liveIsVideo ? live : null),
  };
}

export function formatDate(iso: string, month: "short" | "long" = "short") {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month, day: "numeric" });
}
