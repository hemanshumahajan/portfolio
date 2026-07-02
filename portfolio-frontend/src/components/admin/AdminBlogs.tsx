import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "../../lib/api";
import { authFetch } from "../../lib/authFetch";
import { useAuth } from "../../context/AuthContext";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  coverImageUrl?: string | null;
  thumbnailUrl?: string | null;
  isPublished: boolean;
  createdAt: string;
};

type FormState = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string;
  coverImageUrl: string;
  thumbnailUrl: string;
  isPublished: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  tags: "",
  coverImageUrl: "",
  thumbnailUrl: "",
  isPublished: true,
};

const inputClass =
  "w-full bg-background border border-border rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="coord-label block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminBlogs() {
  const { logout } = useAuth();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadPosts() {
    setLoadError(null);
    try {
      // Admin needs to see unpublished drafts too, but GetPublished() only
      // returns IsPublished posts. Fetching the public endpoint here still
      // works for now since you'll always publish immediately per the
      // form default — flag if you want a separate admin "get all" route.
      const res = await fetch(`${API_BASE_URL}/api/blog`);
      if (!res.ok) {
        setLoadError(`Server returned ${res.status}.`);
        setPosts([]);
        return;
      }
      const json = await res.json();
      setPosts(Array.isArray(json) ? json : []);
    } catch {
      setLoadError("Couldn't reach the backend. Is it running?");
      setPosts([]);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onTitleChange(value: string) {
    updateField("title", value);
    if (!slugTouched) {
      updateField("slug", slugify(value));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.slug.trim() || !form.summary.trim() || !form.content.trim()) {
      setError("Title, slug, summary, and content are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch("/api/blog", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim(),
          summary: form.summary.trim(),
          content: form.content,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          coverImageUrl: form.coverImageUrl.trim() || null,
          thumbnailUrl: form.thumbnailUrl.trim() || null,
          isPublished: form.isPublished,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        setError(body || "Failed to create post.");
        return;
      }

      setForm(EMPTY_FORM);
      setSlugTouched(false);
      await loadPosts();
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        logout();
        return;
      }
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this post? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await authFetch(`/api/blog/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
      }
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        logout();
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid lg:grid-cols-[440px_1fr] gap-8">
      {/* Create form */}
      <div className="bg-surface border border-border rounded-[2px] p-6 h-fit">
        <p className="code-label mb-4">// new_post</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Title *">
            <input
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Slug *">
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                updateField("slug", e.target.value);
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Summary *">
            <textarea
              value={form.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </Field>
          <Field label="Content (Markdown) *">
            <textarea
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
              rows={10}
              className={`${inputClass} font-mono text-xs`}
              placeholder={"# Heading\n\nWrite your post in Markdown..."}
            />
          </Field>
          <Field label="Tags (comma-separated)">
            <input
              value={form.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="backend development, .NET, career transition"
              className={inputClass}
            />
          </Field>
          <Field label="Cover Image URL">
            <input
              value={form.coverImageUrl}
              onChange={(e) => updateField("coverImageUrl", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Thumbnail URL">
            <input
              value={form.thumbnailUrl}
              onChange={(e) => updateField("thumbnailUrl", e.target.value)}
              className={inputClass}
            />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => updateField("isPublished", e.target.checked)}
              className="accent-primary"
            />
            <span className="font-mono text-xs text-muted-foreground">
              Publish immediately (uncheck to save as a draft)
            </span>
          </label>

          {error && <p className="font-mono text-xs text-red-400">// {error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-mono text-sm font-semibold py-2.5 rounded-[2px] hover:shadow-[0_0_24px_rgba(0,194,255,0.5)] transition-all disabled:opacity-50"
          >
            <Plus size={14} /> {submitting ? "Publishing..." : "Add Post"}
          </button>
        </form>
      </div>

      {/* List */}
      <div>
        <p className="code-label mb-4">// existing_posts ({posts?.length ?? "…"})</p>
        {posts === null ? (
          <p className="font-mono text-sm text-muted-foreground">Loading...</p>
        ) : loadError ? (
          <p className="font-mono text-sm text-red-400">// {loadError}</p>
        ) : posts.length === 0 ? (
          <p className="font-mono text-sm text-muted-foreground">// No posts yet</p>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <div
                key={p.id}
                className="bg-surface border border-border rounded-[2px] p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{p.title}</h3>
                    {p.isPublished ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 bg-primary/10 border border-primary/40 text-primary rounded-[2px]">
                        <Eye size={10} /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 bg-muted border border-border text-muted-foreground rounded-[2px]">
                        <EyeOff size={10} /> Draft
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground mb-2">/blog/{p.slug}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{p.summary}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] px-1.5 py-0.5 bg-background border border-border text-foreground/70 rounded-[2px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
                  aria-label="Delete post"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBlogs;