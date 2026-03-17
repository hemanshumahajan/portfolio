import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ArrowRight, Tag, Loader2, X, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBlogPosts, type BlogPost } from "@/lib/api";

// ── Blog Modal ─────────────────────────────────────────────
const BlogModal = ({ post, onClose }: { post: BlogPost; onClose: () => void }) => {
  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useState(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // Render markdown-like content (bold, headings, lists)
  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## "))
        return <h2 key={i} className="text-xl font-bold font-mono text-foreground mt-8 mb-3">{line.slice(3)}</h2>;
      if (line.startsWith("### "))
        return <h3 key={i} className="text-lg font-bold font-mono text-foreground mt-6 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith("# "))
        return <h1 key={i} className="text-2xl font-bold font-mono text-foreground mt-8 mb-4">{line.slice(2)}</h1>;
      if (line.startsWith("- "))
        return <li key={i} className="text-muted-foreground text-sm leading-relaxed ml-4 list-disc">{line.slice(2)}</li>;
      if (line.trim() === "")
        return <div key={i} className="h-3" />;
      return <p key={i} className="text-muted-foreground text-sm leading-relaxed">{line}</p>;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdrop}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="glass rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between p-6 border-b border-border">
            <div className="flex-1 pr-4">
              {post.featured && (
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs mb-2">
                  Featured
                </span>
              )}
              <h2 className="text-xl md:text-2xl font-bold font-mono text-foreground leading-tight">
                {post.title}
              </h2>
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
                {post.category && (
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                    {post.category}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors shrink-0"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-6">

            {/* Thumbnail */}
            {post.thumbnailUrl && (
              <div className="mb-6 rounded-xl overflow-hidden">
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                  onError={e => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}

            {/* Excerpt */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 p-4 rounded-xl bg-secondary/50 border border-border italic">
              {post.excerpt}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-xs font-mono"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Main Content */}
            <div className="space-y-1">
              {renderContent(post.content || "")}
            </div>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-mono font-semibold text-foreground mb-3 uppercase tracking-wider">
                  Images
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {post.images.map((img, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-border">
                      <img
                        src={img}
                        alt={`Image ${i + 1}`}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                        onError={e => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {post.videos && post.videos.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-mono font-semibold text-foreground mb-3 uppercase tracking-wider">
                  Videos
                </h3>
                <div className="space-y-4">
                  {post.videos.map((video, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-border aspect-video">
                      <iframe
                        src={video}
                        title={`Video ${i + 1}`}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-border flex justify-between items-center">
            <span className="text-xs text-muted-foreground font-mono">
              Press Esc to close
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-mono hover:bg-secondary/80 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Main Blog Component ────────────────────────────────────
const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const { data: blogPosts = [], isLoading, isError } = useQuery<BlogPost[]>({
    queryKey: ["blogPosts"],
    queryFn: fetchBlogPosts,
  });

  const categories = ["All", ...Array.from(new Set(blogPosts.map((p) => p.category)))];

  const filtered = activeCategory === "All"
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <section id="blog" className="py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-primary text-sm tracking-widest uppercase mb-2">
            {"// Blog"}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold font-mono text-gradient">
            Thoughts & Articles
          </h2>
        </motion.div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-mono text-sm">
              Unable to load blog posts. Please try again later.
            </p>
          </div>
        )}

        {!isLoading && !isError && blogPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-mono text-sm">
              No blog posts found.
            </p>
          </div>
        )}

        {!isLoading && !isError && blogPosts.length > 0 && (
          <>
            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-mono text-xs tracking-wide transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground glow-primary"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* Blog Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filtered.map((post, i) => (
                <motion.article
                  key={post.id || post.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  onClick={() => setSelectedPost(post)}
                  className={`glass rounded-2xl p-6 group cursor-pointer hover:glow-border transition-all duration-300 flex flex-col ${
                    post.featured ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  {/* Thumbnail */}
                  {post.thumbnailUrl && (
                    <div className="mb-4 rounded-xl overflow-hidden">
                      <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  )}

                  {post.featured && (
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs mb-3 w-fit">
                      Featured
                    </span>
                  )}

                  <h3 className="text-lg font-bold font-mono text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-xs font-mono"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono group-hover:text-primary transition-colors">
                      Read more
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Blog Modal */}
      {selectedPost && (
        <BlogModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </section>
  );
};

export default Blog;