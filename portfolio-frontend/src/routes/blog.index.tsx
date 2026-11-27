import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Rss } from "lucide-react";
import { PortfolioShell } from "@/components/portfolio-shell";
import { formatDate, getBlogPosts, orNull } from "@/lib/api";
import { AUTHOR, absoluteUrl } from "@/lib/site";

const title = "Writing | Hemanshu Mahajan";
const description = "Articles by Hemanshu Mahajan on enterprise C#/.NET development, ASP.NET Core, full-stack web development, and building in public.";

export const Route = createFileRoute("/blog/")({
  // Server-rendered list of every post, so each article is one click from a crawlable page.
  loader: () => orNull(getBlogPosts()),
  headers: () => ({ "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=86400" }),
  head: ({ loaderData: posts }) => {
    const url = absoluteUrl("/blog");
    const home = absoluteUrl("/");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Blog",
              "@id": `${url}#blog`,
              url,
              name: `Writing by ${AUTHOR.name}`,
              description,
              inLanguage: "en",
              author: { "@type": "Person", "@id": `${home}#person`, name: AUTHOR.name, url: home },
              blogPost: (posts ?? []).map((post) => ({
                "@type": "BlogPosting",
                headline: post.title,
                url: absoluteUrl(`/blog/${post.slug}`),
                datePublished: post.createdAt,
                dateModified: post.updatedAt,
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: home },
                { "@type": "ListItem", position: 2, name: "Writing", item: url },
              ],
            },
          ],
        }),
      }],
    };
  },
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const posts = Route.useLoaderData();

  return (
    <PortfolioShell openFile={{ name: "writing/", section: "blog" }}>
      <section className="page-section">
        <Link to="/" className="detail-back"><ArrowLeft /> Home</Link>
        <div className="section-heading">
          <h1>Writing</h1>
          <p>
            Notes from building enterprise software in public.<br />
            <a className="section-link" href="/rss.xml"><Rss className="inline size-3.5" /> RSS feed</a>
          </p>
        </div>
        {posts && posts.length > 0 ? (
          <div className="writing-grid">
            {posts.map((post) => (
              <Link key={post.id} to="/blog/$slug" params={{ slug: post.slug }} className="writing-card">
                <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                <h2>{post.title}</h2>
                <p>{post.summary}</p>
                {post.tags.length > 0 && <div className="pill-row">{post.tags.map((t) => <span key={t}>{t}</span>)}</div>}
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-writing">
            <span className="prompt-symbol">$</span>
            <div>
              <strong>{posts ? "First post coming soon" : "Posts couldn't load right now"}</strong>
              <p>{posts ? "Following the build in public." : "Please refresh in a moment."}</p>
            </div>
            <span className="cursor" />
          </div>
        )}
      </section>
    </PortfolioShell>
  );
}