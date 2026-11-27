import { useState, type FormEvent } from "react";
import { ExternalLink, Github, Pencil, PlayCircle, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getProjectLinks, type Project } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Field, ListHeader, ListState, errorMessage, nullIfBlank, splitList, useAdminList } from "./admin-ui";

type FormState = {
  title: string;
  description: string;
  technologies: string;
  githubUrl: string;
  liveUrl: string;
  demoVideoUrl: string;
  imageUrl: string;
  thumbnailUrl: string;
};

const EMPTY_FORM: FormState = { title: "", description: "", technologies: "", githubUrl: "", liveUrl: "", demoVideoUrl: "", imageUrl: "", thumbnailUrl: "" };

// Older projects kept their Drive demo in liveUrl; getProjectLinks moves it into the
// demo field here, so saving the project once migrates it.
const toForm = (p: Project): FormState => {
  const links = getProjectLinks(p);
  return {
    title: p.title,
    description: p.description,
    technologies: p.technologies.join(", "),
    githubUrl: p.githubUrl ?? "",
    liveUrl: links.liveUrl ?? "",
    demoVideoUrl: links.demoVideoUrl ?? "",
    imageUrl: p.imageUrl ?? "",
    thumbnailUrl: p.thumbnailUrl ?? "",
  };
};

export function AdminProjects() {
  const { authFetch } = useAuth();
  const { items: projects, setItems, error: loadError, loading, reload } = useAdminList<Project>("/api/projects");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editing, setEditing] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const update = (key: keyof FormState) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  function startEdit(project: Project) {
    setEditing(project);
    setForm(toForm(project));
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    const fields = {
      title: form.title.trim(),
      description: form.description.trim(),
      technologies: splitList(form.technologies),
      githubUrl: nullIfBlank(form.githubUrl),
      liveUrl: nullIfBlank(form.liveUrl),
      demoVideoUrl: nullIfBlank(form.demoVideoUrl),
      imageUrl: nullIfBlank(form.imageUrl),
      thumbnailUrl: nullIfBlank(form.thumbnailUrl),
    };

    setSubmitting(true);
    try {
      // PUT replaces the whole document, so start from the original to keep createdAt etc.
      const res = editing
        ? await authFetch(`/api/projects/${editing.id}`, { method: "PUT", body: JSON.stringify({ ...editing, ...fields }) })
        : await authFetch("/api/projects", { method: "POST", body: JSON.stringify(fields) });
      if (!res.ok) {
        setError((await res.text().catch(() => "")) || `Failed to save project (${res.status}).`);
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

  async function onDelete(project: Project) {
    if (!window.confirm(`Delete "${project.title}"? This can't be undone.`)) return;
    setDeletingId(project.id);
    try {
      const res = await authFetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev?.filter((p) => p.id !== project.id) ?? prev);
        if (editing?.id === project.id) resetForm();
      }
    } catch (err) {
      const message = errorMessage(err);
      if (message) setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
      <form onSubmit={onSubmit} className="admin-panel h-fit space-y-4">
        <p className="admin-eyebrow">// {editing ? "edit_project" : "new_project"}</p>
        <Field id="p-title" label="Title *"><Input id="p-title" value={form.title} onChange={(e) => update("title")(e.target.value)} /></Field>
        <Field id="p-description" label="Description *"><Textarea id="p-description" rows={4} value={form.description} onChange={(e) => update("description")(e.target.value)} /></Field>
        <Field id="p-tech" label="Technologies" hint="Comma-separated"><Input id="p-tech" placeholder="React, ASP.NET Core, MongoDB" value={form.technologies} onChange={(e) => update("technologies")(e.target.value)} /></Field>
        <Field id="p-github" label="GitHub URL"><Input id="p-github" value={form.githubUrl} onChange={(e) => update("githubUrl")(e.target.value)} /></Field>
        <Field id="p-live" label="Live URL" hint="The deployed app — shown as the “View project” button"><Input id="p-live" placeholder="https://my-app.vercel.app" value={form.liveUrl} onChange={(e) => update("liveUrl")(e.target.value)} /></Field>
        <Field id="p-demo" label="Demo video URL" hint="Google Drive share link or .mp4/.webm — shown as “View demo” and embedded on the project page"><Input id="p-demo" value={form.demoVideoUrl} onChange={(e) => update("demoVideoUrl")(e.target.value)} /></Field>
        <Field id="p-image" label="Image URL"><Input id="p-image" value={form.imageUrl} onChange={(e) => update("imageUrl")(e.target.value)} /></Field>
        <Field id="p-thumb" label="Thumbnail URL"><Input id="p-thumb" value={form.thumbnailUrl} onChange={(e) => update("thumbnailUrl")(e.target.value)} /></Field>
        {error && <p role="alert" className="admin-error">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" variant="hero" className="flex-1" disabled={submitting}>
            {editing ? <Save /> : <Plus />} {submitting ? "Saving…" : editing ? "Save changes" : "Add project"}
          </Button>
          {editing && <Button type="button" variant="glass" onClick={resetForm}><X /> Cancel</Button>}
        </div>
      </form>

      <div>
        <ListHeader label="projects" count={projects?.length} loading={loading} onRefresh={() => void reload()} />
        <ListState items={projects} error={loadError} empty="No projects yet — the public site shows its two built-in projects until you add some." />
        {projects && projects.length > 0 && (
          <div className="space-y-3">
            {projects.map((p) => {
              const links = getProjectLinks(p);
              return (
                <div key={p.id} className={`admin-item ${editing?.id === p.id ? "admin-item-active" : ""}`}>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 font-semibold">{p.title}</h3>
                    <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                    <div className="pill-row mt-0">{p.technologies.map((t) => <span key={t}>{t}</span>)}</div>
                    <div className="mt-2 flex gap-3 font-mono text-xs text-muted-foreground">
                      {p.githubUrl && <span className="inline-flex items-center gap-1"><Github className="size-3" /> repo</span>}
                      {links.liveUrl && <span className="inline-flex items-center gap-1"><ExternalLink className="size-3" /> live</span>}
                      {links.demoVideoUrl && <span className="inline-flex items-center gap-1"><PlayCircle className="size-3" /> demo</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${p.title}`} onClick={() => startEdit(p)}><Pencil /></Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${p.title}`} className="hover:text-destructive" disabled={deletingId === p.id} onClick={() => void onDelete(p)}><Trash2 /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}