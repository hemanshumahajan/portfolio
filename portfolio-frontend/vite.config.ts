// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Deployed on Vercel (SSR for /blog/* and /projects/*, prerendered home page).
  // Lovable's own builds pin their preset and ignore this override.
  nitro: { preset: "vercel" },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    pages: [{ path: "/" }],
    // Only the home page is baked at build time. Blog posts and projects stay
    // server-rendered (CDN-cached ~10 min) so admin edits show up without a redeploy.
    prerender: { enabled: true, autoStaticPathsDiscovery: false, crawlLinks: false },
  },
});
