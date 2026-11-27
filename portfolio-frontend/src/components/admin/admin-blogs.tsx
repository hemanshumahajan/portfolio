import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, type BlogPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Field, ListHeader, ListState, errorMessage, nullIfBlank, splitList, useAdminList } from "./admin-ui";

type FormState = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string;
  coverImageUrl: string;
  thumbnailUrl: string;
  images: string;
  videos: string;
  isPublished: boolean;
};

const EMPTY_FORM: FormState = {
  title: "", slug: "", summary: "", content: "", tags: "", coverImageUrl: "", thumbnailUrl: "", images: "", videos: "", isPublished: true,
};

const toForm = (p: BlogPost): FormState => ({
  title: p.title,
  slug: p.slug,
  summary: p.summary,
  content: p.content,
  tags: p.tags.join(", "),
  coverImageUrl: p.coverImageUrl ?? "",
  thumbnailUrl: p.thumbnailUrl ?? "",
  images: p.images.join("\n"),
  videos: p.videos.join("\n"),
  isPublished: p.isPublished,
});

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
}

export function AdminBlogs() {
  const { authFetch } = useAuth();
  // Admin endpoint includes drafts; the public /api/blog only returns published posts.
  const { items: posts, setItems, error: loadError, loading, reload } = useAdminList<BlogPost>("/api/blog/admin/all");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  function onTitleChange(value: string) {
    setForm((f) => ({ ...f, title: value, slug: slugTouched || editing ? f.slug : slugify(value) }));
  }

  function startEdit(post: BlogPost) {
    setEditing(post);
    setForm(toForm(post));
    setSlugTouched(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setError(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const slug = slugify(form.slug);
    if (!form.title.trim() || !slug || !form.summary.trim() || !form.content.trim()) {
      setError("Title, slug, summary, and content are required.");
      return;
    }
    const clash = posts?.find((p) => p.slug === slug && p.id !== editing?.id);
    if (clash) {
      setError(`Another post already uses the slug "${slug}".`);
      return;
    }

    const fields = {
      title: form.title.trim(),
      slug,
      summary: form.summary.trim(),
      content: form.content,
      tags: splitList(form.tags),
      coverImageUrl: nullIfBlank(form.coverImageUrl),
      thumbnailUrl: nullIfBlank(form.thumbnailUrl),
      images: splitList(form.images, /\n/),
      videos: splitList(form.videos, /\n/),
      isPublished: form.isPublished,
    };

    setSubmitting(true);
    try {
      // PUT replaces the whole document, so start from the original to keep createdAt.
      const res = editing
        ? await authFetch(`/api/blog/${editing.id}`, { method: "PUT", body: JSON.stringify({ ...editing, ...fields }) })
        : await authFetch("/api/blog", { method: "POST", body: JSON.stringify(fields) });
      if (!res.ok) {
        setError((await res.text().catch(() => "")) || `Failed to save post (${res.status}).`);
        return;
      }
      resetForm();
      await reload();
    } catch (err) {
      const message = errorMessage(err);
      if (message) setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(post: BlogPost) {
    if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    setDeletingId(post.id);
    try {
      const res = await authFetch(`/api/blog/${post.id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev?.filter((p) => p.id !== post.id) ?? prev);
        if (editing?.id === post.id) resetForm();
      }
    } catch (err) {
      const message = errorMessage(err);
      if (message) setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[460px_1fr]">
      <form onSubmit={onSubmit} className="admin-panel h-fit space-y-4">
        <p className="admin-eyebrow">// {editing ? "edit_post" : "new_post"}</p>
        <Field id="b-title" label="Title *"><Input id="b-title" value={form.title} onChange={(e) => onTitleChange(e.target.value)} /></Field>
        <Field id="b-slug" label="Slug *" hint={`URL: /blog/${slugify(form.slug) || "…"}`}>
          <Input id="b-slug" value={form.slug} onChange={(e) => { setSlugTouched(true); update("slug", e.target.value); }} />
        </Field>
        <Field id="b-summary" label="Summary *" hint="Shown on cards and as the search/OG description"><Textarea id="b-summary" rows={2} value={form.summary} onChange={(e) => update("summary", e.target.value)} /></Field>
        <Field id="b-content" label="Content (Markdown) *">
          <Textarea id="b-content" rows={12} className="font-mono text-xs" placeholder={"# Heading\n\nWrite your post in Markdown..."} value={form.content} onChange={(e) => update("content", e.target.value)} />
        </Field>
        <Field id="b-tags" label="Tags" hint="Comma-separated"><Input id="b-tags" placeholder=".NET, build in public" value={form.tags} onChange={(e) => update("tags", e.target.value)} /></Field>
        <Field id="b-cover" label="Cover image URL"><Input id="b-cover" value={form.coverImageUrl} onChange={(e) => update("coverImageUrl", e.target.value)} /></Field>
        <Field id="b-thumb" label="Thumbnail URL"><Input id="b-thumb" value={form.thumbnailUrl} onChange={(e) => update("thumbnailUrl", e.target.value)} /></Field>
        <Field id="b-images" label="Extra images" hint="One URL per line, shown below the article"><Textarea id="b-images" rows={2} value={form.images} onChange={(e) => update("images", e.target.value)} /></Field>
        <Field id="b-videos" label="Videos" hint="One URL per line — Google Drive links or .mp4/.webm files"><Textarea id="b-videos" rows={2} value={form.videos} onChange={(e) => update("videos", e.target.value)} /></Field>
        <label className="flex cursor-pointer items-center gap-3">
          <Switch checked={form.isPublished} onCheckedChange={(checked) => update("isPublished", checked)} />
          <span className="font-mono text-xs text-muted-foreground">{form.isPublished ? "Published" : "Draft (hidden from the site)"}</span>
        </label>
        {error && <p role="alert" className="admin-error">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" variant="hero" className="flex-1" disabled={submitting}>
            {editing ? <Save /> : <Plus />} {submitting ? "Saving…" : editing ? "Save changes" : "Add post"}
          </Button>
          {editing && <Button type="button" variant="glass" onClick={resetForm}><X /> Cancel</Button>}
        </div>
      </form>

      <div>
        <ListHeader label="posts" count={posts?.length} loading={loading} onRefresh={() => void reload()} />
        <ListState items={posts} error={loadError} empty="No posts yet." />
        {posts && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map((p) => (
              <div key={p.id} className={`admin-item ${editing?.id === p.id ? "admin-item-active" : ""}`}>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{p.title}</h3>
                    {p.isPublished
                      ? <span className="status live inline-flex items-center gap-1"><Eye className="size-3" /> Published</span>
                      : <span className="status progress inline-flex items-center gap-1"><EyeOff className="size-3" /> Draft</span>}
                  </div>
                  <p className="mb-2 font-mono text-[11px] text-muted-foreground">
                    {p.isPublished ? <Link to="/blog/$slug" params={{ slug: p.slug }} className="hover:text-primary">/blog/{p.slug}</Link> : `/blog/${p.slug}`} — {formatDate(p.createdAt)}
                  </p>
                  <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{p.summary}</p>
                  <div className="pill-row mt-0">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" aria-label={`Edit ${p.title}`} onClick={() => startEdit(p)}><Pencil /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${p.title}`} className="hover:text-destructive" disabled={deletingId === p.id} onClick={() => void onDelete(p)}><Trash2 /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
