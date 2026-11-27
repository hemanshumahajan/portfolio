# Studio Of Work

Portfolio Redesign Prompt for Lovable (v2 — Complete)

Identity & Brief

Redesign the portfolio site for Hemanshu, an Enterprise Software Developer (C#/.NET) — a builder and shipper, not just a coder. The old site was built around a CAD/Tekla-plugin identity; this redesign moves to a broader enterprise C#/.NET identity. Same backend and overall structure — this is a frontend redesign, with backend additions only where needed for GitHub data and SEO rendering.

Tech stack (unchanged):

Frontend: React + TypeScript (Vite)

Backend: ASP.NET Core

Database: MongoDB

Hosting: Vercel (frontend), existing backend host

Design Concept: "The IDE"

The core idea: borrow the actual structural language of Visual Studio — not just its color — so the site reads unmistakably like a developer's workspace rather than a generic dark portfolio. Every IDE-inspired element below is functional (real navigation, real state), not decorative skin.

Design Tokens

Color:

--bg-base: #0D0D0D — primary background (matches existing site's theme color)

--glass-surface: rgba(255,255,255,0.04) — glass panel fill, used with backdrop-blur

--glass-border: rgba(255,255,255,0.08) — glass panel edges

--accent-primary: #8B5CF6 — Visual Studio–inspired violet-purple (primary accent, active states, links)

--accent-secondary: #22D3EE — cool cyan, used sparingly for gradient pairing and glass highlight edges

--text-primary: #F5F5F7

--text-muted: #9CA3AF

Type:

Display/headings/body: Geist Sans (clean, geometric, not the overused Inter default)

Code, stats, labels, terminal panel: JetBrains Mono

Clear role separation: Geist for anything read as prose, JetBrains Mono for anything read as data/code

Layout concept (ASCII):

┌──┬─────────────────────────────────────────┬──────┐
│▪ │ [Hero.tsx] [Work.tsx] [Blog.tsx]         │      │  ← tab bar (section nav)
│▪ │                                           │      │
│▪ │        main content (glass panels          │      │  ← activity bar
│▪ │        floating over soft gradient blobs)   │      │    (left, icon nav)
│▪ │                                           │      │
├──┴─────────────────────────────────────────┴──────┤
│ ● Available for opportunities   Enterprise Dev (C#)│  ← status bar (footer)
└─────────────────────────────────────────────────────┘


Left-aligned content within panels (code-editor reading convention), generous negative space

Asymmetric layout — the activity bar intentionally breaks pure symmetry

Small consistent corner radius (6–8px) on all panels — not sharp, not the generic rounded-SaaS-card look

Principles:

IDE chrome is structural, not decorative — the activity bar is real navigation, the status bar shows real state

Glassmorphism applied specifically to floating content panels over a slow-moving, soft gradient-blob background — not slapped on everything

One orchestrated load sequence (see Animations) — not scattered per-element effects

No template chrome: no ALL-CAPS eyebrow labels, no middle-dot meta strings, no arrow appended to every link

Page Sections

1. Activity Bar (Left, Desktop Only)

Fixed vertical strip, 60px wide, full height

Icon-only nav: Home, Work, Blog, Contact, GitHub (external link icon)

Active section: accent-primary left border (3px) + icon brightens

Mobile: collapses to a bottom tab bar (same icons, horizontal)

2. Tab Bar (Top)

Shows current section styled as an open editor tab: Hero.tsx, Work.tsx, Blog.tsx, Contact.tsx

Active tab: subtle glass fill + accent-primary top border (2px)

Sticky on scroll

3. Hero Section

Headline: "Enterprise Software Developer (C#/.NET)"

Subhead: "Builder & Shipper — I ship real, working software"

Skill pills: React, C#/.NET, ASP.NET Core — small glass pills, not heavy borders

CTAs: "View My Work" (filled, accent-primary), "Connect on X" (glass/ghost style)

GitHub terminal panel (right side on desktop, below text on mobile):

Styled like a terminal/output window: three small dots top-left, label "output — github-stats"

Monospace stats grid: contributions this year, total repos, current streak, lines committed (whichever GitHub API actually provides cleanly — don't force numbers the API can't give)

Compact contribution heatmap below the stats, same terminal panel

Glass panel: backdrop-filter: blur(20px), subtle inner highlight border

4. Featured Work

Headline: "What I've Shipped"

Exactly two projects — no placeholders, no filler cards:

This portfolio site — React/TS, ASP.NET Core, MongoDB — status: Live

Save-for-later resurfacing tool — personal project, resurfacing engine for saved links/thoughts — status: In Progress

Card style: glass panel, tab-styled top edge (small colored strip like an open file tab), tech-stack pills, status badge, "View" link (only if actually deployed/public).

5. GitHub Activity (Full Contribution Graph)

Headline: "Coding Activity"

Full-width contribution heatmap, GitHub-style, styled inside a larger terminal-panel treatment

Color scale: muted gray (none) → accent-primary → accent-secondary (most active)

Legend: "Less → More"

6. Blog

Headline: "Writing"

2-column grid (1 column mobile) of glass cards: title, date, excerpt, tags

Fallback if empty: "First post coming soon — following the build in public."

7. AI Chatbot (Floating)

Floating glass button, bottom-right, accent-primary glow on hover

Opens a glass chat panel (blur + translucency, matches the rest of the design language — not a separate visual style)

Header: "Ask about my work"

Suggested prompts on open: "What do you build?", "What's your stack?", "Show me your GitHub"

Backend: existing Gemini integration, unchanged — just reskinned to match the glass/IDE aesthetic

8. Status Bar (Bottom, Fixed)

Thin strip (28px), full width, glass background

Left: "● Available for opportunities" (green dot)

Right: current section name + "Enterprise Software Developer (C#/.NET)"

9. Footer / Contact

Simple glass panel, not heavy: name, role, links (X, LinkedIn, GitHub, Email), copyright line

SEO Implementation (full scope — this is a requirement, not an afterthought)

Pre-render static pages at build time — Home/Hero, Featured Work, and About-type content should be generated as real static HTML via a Vite pre-rendering step (e.g., a prerender plugin or build script), so crawlers get instant, fully-formed HTML for the pages people actually search your name to find. These pages change rarely, so baking them in at build time costs little.

Server-render blog posts for crawlers — in the ASP.NET Core backend, add middleware that checks the request's user-agent. If it matches a known crawler (Googlebot, Bingbot, LinkedInBot, Twitterbot, facebookexternalhit, etc.) and the route is a blog post, render and return a full HTML page (title, complete article content from MongoDB, proper meta tags, Open Graph tags, JSON-LD Article schema) instead of the SPA shell. Regular browser visitors still get the normal React app.

Dynamic per-page meta tags in the React app via React Helmet Async — unique title/description/OG tags per route as a fallback for the client-rendered path.

Structured data (JSON-LD):

Person schema on the homepage (name, jobTitle, sameAs: GitHub/X/LinkedIn)

Article schema on each blog post (headline, datePublished, author)

sitemap.xml — generated dynamically by an ASP.NET Core endpoint, listing all static routes plus every blog post URL pulled live from MongoDB, so it updates automatically as posts are added.

robots.txt — standard allow-all, pointing to the sitemap.

Performance / Core Web Vitals: lazy-load images, code-split routes, font-display: swap, cache GitHub API responses server-side (don't call GitHub's API directly from the client — proxy and cache in ASP.NET Core, ~1 hour TTL, to avoid rate limits and speed up load).

On-page basics: single <h1> per page, descriptive alt text on all images, canonical URLs, internal links between blog posts and the work section.

Animations

On load: one orchestrated sequence — activity bar slides in from left (200ms), tab bar fades in (100ms delay), status bar slides up from bottom (150ms delay), main content fades/slides up last (250ms delay). Feels like the workspace "booting up" — a single deliberate moment, not per-card scatter.

On hover: glass panels get a subtle brightness/border lift (accent-primary edge), no heavy shadow-drop clichés

No scroll-triggered fade-ins on every section, no parallax

Responsive Behavior

Desktop (>1024px): full layout as described — activity bar, tab bar, status bar all visible

Tablet (768–1024px): activity bar collapses into the tab bar area (icon + label combined nav)

Mobile (<768px): activity bar becomes a bottom tab bar; status bar can collapse to a single-line summary or hide on scroll down, reappear on scroll up; hero stacks vertically, terminal panel goes full-width below the text

What NOT to Do

No ALL-CAPS eyebrow labels above headings

No middle-dot separated meta strings ("A · B · C")

No arrow (→) appended to every single link — reserve it for cases that genuinely signal "external" or "next"

No identical rounded-card-with-soft-shadow treatment applied uniformly — vary panel treatment by content type (terminal panel for stats, tab-card for projects, plain glass for blog)

No placeholder projects — only the two real, shippable projects listed above

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4f62f4e7-ade6-49d4-872b-be9aeb89807e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
