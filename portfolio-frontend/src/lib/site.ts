// Canonical public origin, used for absolute canonical/OG URLs and JSON-LD.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://hemanshumahajan.com").replace(/\/+$/, "");

export const AUTHOR = {
  name: "Hemanshu Mahajan",
  jobTitle: "Enterprise Software Developer (C#/.NET)",
  github: "https://github.com/hemanshumahajan",
  x: "https://x.com/the_hemanshu",
  linkedin: "https://www.linkedin.com/in/hemanshumahajan21",
} as const;

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
