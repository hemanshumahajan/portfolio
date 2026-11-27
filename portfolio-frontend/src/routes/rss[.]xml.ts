import { createFileRoute } from "@tanstack/react-router";
import { getBlogPosts } from "@/lib/api";
import { AUTHOR, absoluteUrl } from "@/lib/site";

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// RSS 2.0 feed of published posts, for feed readers and aggregators.
export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const posts = await getBlogPosts();
          const lastChange = posts.length > 0
            ? new Date(Math.max(...posts.map((p) => Date.parse(p.updatedAt || p.createdAt))))
            : new Date();

          const items = posts.map((post) => {
            const url = absoluteUrl(`/blog/${post.slug}`);
            return [
              "    <item>",
              `      <title>${escapeXml(post.title)}</title>`,
              `      <link>${url}</link>`,
              `      <guid isPermaLink="true">${url}</guid>`,
              `      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>`,
              `      <description>${escapeXml(post.summary)}</description>`,
              ...post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
              "    </item>",
            ].join("\n");
          });

          const xml = [
            `<?xml version="1.0" encoding="UTF-8"?>`,
            `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
            "  <channel>",
            `    <title>${escapeXml(`${AUTHOR.name} — Writing`)}</title>`,
            `    <link>${absoluteUrl("/blog")}</link>`,
            "    <description>Notes from building enterprise C#/.NET software in public.</description>",
            "    <language>en</language>",
            `    <lastBuildDate>${lastChange.toUTCString()}</lastBuildDate>`,
            `    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />`,
            ...items,
            "  </channel>",
            "</rss>",
          ].join("\n");

          return new Response(xml, {
            headers: {
              "Content-Type": "application/rss+xml; charset=utf-8",
              "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
            },
          });
        } catch {
          return new Response("Feed unavailable", { status: 502 });
        }
      },
    },
  },
});