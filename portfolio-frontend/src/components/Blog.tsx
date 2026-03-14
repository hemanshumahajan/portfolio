import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Tag, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBlogPosts, type BlogPost } from "@/lib/api";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("All");

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
                  className={`glass rounded-2xl p-6 group cursor-pointer hover:glow-border transition-all duration-300 flex flex-col ${
                    post.featured ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
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
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Blog;
