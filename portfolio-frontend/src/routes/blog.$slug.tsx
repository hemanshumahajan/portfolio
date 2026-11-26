import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { code } from "@streamdown/code";
import { ArrowLeft } from "lucide-react";
import { Streamdown } from "streamdown";
import { DetailNotFound } from "@/components/detail-not-found";
import { MediaEmbed } from "@/components/media-embed";
import { PortfolioChat } from "@/components/portfolio-chat";
import { PortfolioShell } from "@/components/portfolio-shell";
import { ApiError, formatDate, getBlogPost } from "@/lib/api";
import { AUTHOR, absoluteUrl } from "@/lib/site";

const markdownPlugins = { code };

export const Route = createFileRoute("/blog/$slug")({
  // Server-rendered, so crawlers get the full article, meta tags and JSON-LD.
  loader: async ({ params }) => {
    try {
      return await getBlogPost(params.slug);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) throw notFound();
      throw error;
    }
  },
  // Let Vercel's CDN absorb repeat crawler/visitor hits instead of waking the backend each time.
  headers: () => ({ "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=86400" }),
  head: ({ loaderData: post, params }) => {
    if (!post) return { meta: [{ title: "Post not found | Hemanshu Mahajan" }, { name: "robots", content: "noindex" }] };
    const url = absoluteUrl(`/blog/${params.slug}`);
    const image = post.coverImageUrl || post.thumbnailUrl;
    return {
      meta: [
        { title: `${post.title} | Hemanshu Mahajan` },
        { name: "description", content: post.summary },
        { property: "og:type", content: "article" },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.summary },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { property: "article:published_time", content: post.createdAt },
        { property: "article:modified_time", content: post.updatedAt },
        ...post.tags.map((tag) => ({ property: "article:tag", content: tag })),
        { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.summary },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.summary,
          datePublished: post.createdAt,
          dateModified: post.updatedAt,
          ...(image ? { image } : {}),
          keywords: post.tags.join(", "),
          mainEntityOfPage: url,
          author: { "@type": "Person", name: AUTHOR.name, url: absoluteUrl("/"), sameAs: [AUTHOR.github, AUTHOR.x, AUTHOR.linkedin] },
        }),
      }],
    };
  },
  component: BlogPostPage,
  notFoundComponent: () => <DetailNotFound section="blog" what="post" />,
});

function BlogPostPage() {
  const post = Route.useLoaderData();

  return (
    <PortfolioShell openFile={{ name: `${post.slug}.md`, section: "blog" }}>
      <article className="detail-page">
        <Link to="/" hash="blog" className="detail-back"><ArrowLeft /> All writing</Link>
        <div className="file-path">hemanshu / writing / {post.slug}.md</div>
        <h1>{post.title}</h1>
        <div className="detail-meta">
          <time dateTime={post.createdAt}>{formatDate(post.createdAt, "long")}</time>
          {post.updatedAt && formatDate(post.updatedAt) !== formatDate(post.createdAt) && (
            <span>Updated {formatDate(post.updatedAt, "long")}</span>
          )}
        </div>
        {post.tags.length > 0 && <div className="pill-row">{post.tags.map((t) => <span key={t}>{t}</span>)}</div>}
        {post.coverImageUrl && <img className="detail-cover" src={post.coverImageUrl} alt={post.title} />}
        <div className="blog-prose">
          <Streamdown plugins={markdownPlugins}>{post.content}</Streamdown>
        </div>
        {(post.images.length > 0 || post.videos.length > 0) && (
          <div className="detail-media">
            {post.images.map((src, i) => <img key={src} src={src} alt={`${post.title} — image ${i + 1}`} loading="lazy" />)}
            {post.videos.map((src, i) => <MediaEmbed key={src} url={src} title={`${post.title} — video ${i + 1}`} />)}
          </div>
        )}
      </article>
      <PortfolioChat />
    </PortfolioShell>
  );
}
