import { useEffect, useState } from "react";
import { Section, FadeIn, Card } from "./primitives";
import { ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../lib/api";

type Post = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  coord?: string;
};

export function Blog() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/blog`)
      .then((r) => r.json())
      // Backend's BlogsController returns a raw array directly,
      // not wrapped in { posts: [...] }.
      .then((j) => {
        if (!cancelled) setPosts(Array.isArray(j) ? j : []);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setPosts([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Section id="blog" label="thoughts" heading="Learn in Public">
      {posts === null ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <SkeletonPost key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="border border-dashed border-border rounded-[2px] py-16 text-center">
          <p className="font-mono text-sm text-muted-foreground">
            // {error ? "Failed to load posts." : "Posts coming soon"}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <FadeIn key={p.slug} delay={i * 0.08}>
              <a href={`/blog/${p.slug}`} className="block h-full">
                <Card coord={p.coord} className="h-full flex flex-col group cursor-pointer">
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[11px] uppercase tracking-wider px-2 py-1 bg-secondary/10 border border-secondary/40 text-secondary rounded-[2px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 leading-snug group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                    {p.summary}
                  </p>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-primary group-hover:gap-2.5 transition-all">
                    Read More <ArrowRight size={14} />
                  </span>
                </Card>
              </a>
            </FadeIn>
          ))}
        </div>
      )}
    </Section>
  );
}

function SkeletonPost() {
  return (
    <div className="bg-surface border border-border rounded-[2px] p-6 h-full animate-pulse">
      <div className="h-6 w-20 bg-muted rounded-[2px] mb-5" />
      <div className="h-5 w-5/6 bg-muted rounded-[2px] mb-2" />
      <div className="h-5 w-2/3 bg-muted rounded-[2px] mb-4" />
      <div className="space-y-2 mb-5">
        <div className="h-3 w-full bg-muted rounded-[2px]" />
        <div className="h-3 w-4/5 bg-muted rounded-[2px]" />
      </div>
      <div className="h-3 w-20 bg-muted rounded-[2px]" />
    </div>
  );
}