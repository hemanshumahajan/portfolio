import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Trash2, Plus, Github, PlayCircle } from "lucide-react";
import { API_BASE_URL } from "../../lib/api";
import { authFetch } from "../../lib/authFetch";
import { useAuth } from "../../context/AuthContext";

type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
};

type FormState = {
  title: string;
  description: string;
  technologies: string;
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  thumbnailUrl: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  technologies: "",
  githubUrl: "",
  liveUrl: "",
  imageUrl: "",
  thumbnailUrl: "",
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

function AdminProjects() {
  const { logout } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadProjects() {
    setLoadError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`);
      if (!res.ok) {
        setLoadError(`Server returned ${res.status}. Check the backend logs.`);
        setProjects([]);
        return;
      }
      const json = await res.json();
      setProjects(Array.isArray(json) ? json : []);
    } catch {
      setLoadError("Couldn't reach the backend. Is it running?");
      setProjects([]);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          technologies: form.technologies
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          githubUrl: form.githubUrl.trim() || null,
          liveUrl: form.liveUrl.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
          thumbnailUrl: form.thumbnailUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        setError(body || "Failed to create project.");
        return;
      }

      setForm(EMPTY_FORM);
      await loadProjects();
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
    if (!confirm("Delete this project? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await authFetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
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
    <div className="grid lg:grid-cols-[400px_1fr] gap-8">
      {/* Create form */}
      <div className="bg-surface border border-border rounded-[2px] p-6 h-fit">
        <p className="code-label mb-4">// new_project</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Title *">
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Description *">
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>
          <Field label="Technologies (comma-separated)">
            <input
              value={form.technologies}
              onChange={(e) => updateField("technologies", e.target.value)}
              placeholder="React, ASP.NET Core, MongoDB"
              className={inputClass}
            />
          </Field>
          <Field label="GitHub URL">
            <input
              value={form.githubUrl}
              onChange={(e) => updateField("githubUrl", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Live URL / Demo Video (Google Drive link)">
            <input
              value={form.liveUrl}
              onChange={(e) => updateField("liveUrl", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Image URL">
            <input
              value={form.imageUrl}
              onChange={(e) => updateField("imageUrl", e.target.value)}
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

          {error && <p className="font-mono text-xs text-red-400">// {error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-mono text-sm font-semibold py-2.5 rounded-[2px] hover:shadow-[0_0_24px_rgba(0,194,255,0.5)] transition-all disabled:opacity-50"
          >
            <Plus size={14} /> {submitting ? "Adding..." : "Add Project"}
          </button>
        </form>
      </div>

      {/* List */}
      <div>
        <p className="code-label mb-4">
          // existing_projects ({projects?.length ?? "…"})
        </p>
        {projects === null ? (
          <p className="font-mono text-sm text-muted-foreground">Loading...</p>
        ) : loadError ? (
          <p className="font-mono text-sm text-red-400">// {loadError}</p>
        ) : projects.length === 0 ? (
          <p className="font-mono text-sm text-muted-foreground">// No projects yet</p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-surface border border-border rounded-[2px] p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {p.technologies.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] px-1.5 py-0.5 bg-background border border-border text-foreground/70 rounded-[2px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                    {p.githubUrl && (
                      <span className="inline-flex items-center gap-1">
                        <Github size={12} /> repo
                      </span>
                    )}
                    {p.liveUrl && (
                      <span className="inline-flex items-center gap-1">
                        <PlayCircle size={12} /> demo
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
                  aria-label="Delete project"
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

export default AdminProjects;