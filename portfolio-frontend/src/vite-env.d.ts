/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the ASP.NET Core backend, e.g. https://portfoliobackend-mhx0.onrender.com */
  readonly VITE_API_URL?: string;
  /** Public site origin for canonical/OG URLs. Defaults to https://hemanshumahajan.com */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
