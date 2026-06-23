import { createFileRoute } from "@tanstack/react-router";

const POSTS = [
  {
    slug: "tekla-open-api-hidden-capabilities",
    title:
      "What the Tekla Open API can actually do — and what most developers don't know",
    summary: "A deep dive into capabilities most Tekla developers never explore.",
    tags: ["Tekla API"],
    coord: "POST:01",
  },
  {
    slug: "bim-data-in-steel-fabrication",
    title:
      "5 things that surprised me about how BIM data moves through a steel fabrication project",
    summary: "Real insights from talking to fabricators and detailers.",
    tags: ["BIM Automation"],
    coord: "POST:02",
  },
  {
    slug: "building-bombridge-in-public",
    title:
      "Why I'm building a SaaS product in the Tekla niche — and doing it publicly",
    summary: "The thinking behind BOMBridge and why niche beats general.",
    tags: ["Build in Public"],
    coord: "POST:03",
  },
];

export const Route = createFileRoute("/api/blog")({
  server: {
    handlers: {
      GET: async () => Response.json({ posts: POSTS }),
    },
  },
});
