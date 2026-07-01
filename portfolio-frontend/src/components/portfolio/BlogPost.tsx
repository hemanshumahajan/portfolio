import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { FadeIn } from "./primitives";
import { API_BASE_URL } from "../../lib/api";

type Post = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  thumbnailUrl: string | null;
  coverImageUrl: string | null;
  images: string[];
  createdAt: string;
};

function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPost(null);
    setError(false);
    fetch(`${API_BASE_URL}/api/blog/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((j) => {
        if (!cancelled) setPost(j);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const dateStr = post
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <p className="font-mono text-sm text-muted-foreground mb-6">
          // Post not found
        </p>
        <Link to="/" className="text-primary font-mono text-sm hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded-[2px] mb-6" />
        <div className="h-10 w-3/4 bg-muted rounded-[2px] mb-4" />
        <div className="h-10 w-1/2 bg-muted rounded-[2px] mb-8" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-muted rounded-[2px]" />
          <div className="h-4 w-full bg-muted rounded-[2px]" />
          <div className="h-4 w-2/3 bg-muted rounded-[2px]" />
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-24 md:py-32">
      <FadeIn>
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>

        <p className="code-label mb-4">// thoughts</p>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {post.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[11px] uppercase tracking-wider px-2 py-1 bg-secondary/10 border border-secondary/40 text-secondary rounded-[2px]"
            >
              {t}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
          {post.title}
        </h1>

        <p className="font-mono text-xs text-muted-foreground mb-12">{dateStr}</p>

        {post.coverImageUrl && (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full rounded-[2px] border border-border mb-12"
          />
        )}

        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </FadeIn>
    </article>
  );
}

export default BlogPost;