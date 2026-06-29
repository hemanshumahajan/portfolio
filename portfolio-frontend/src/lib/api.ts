// Central place for the backend base URL.
// Local dev defaults to your local backend; production reads from
// the VITE_API_URL env var (set this in Vercel's project settings).
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";