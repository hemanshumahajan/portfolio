import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { SingleUpload, MultiUpload } from "@/components/ImageUpload";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

interface Project {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string;
  thumbnailUrl: string;
}

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  thumbnailUrl: string;
  images: string[];
  videos: string[];
  isPublished: boolean;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  sentAt: string;
}

const emptyProject: Project = {
  title: "", description: "", technologies: [],
  githubUrl: "", liveUrl: "", imageUrl: "", thumbnailUrl: ""
};

const emptyBlog: BlogPost = {
  title: "", slug: "", summary: "", content: "",
  tags: [], thumbnailUrl: "", images: [], videos: [], isPublished: false
};

const api = (path: string, options?: RequestInit) =>
  fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState<"projects" | "blogs" | "messages">("projects");

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectForm, setProjectForm] = useState<Project>(emptyProject);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogForm, setBlogForm] = useState<BlogPost>(emptyBlog);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    if (!authed) return;
    loadProjects();
    loadBlogs();
    loadMessages();
  }, [authed]);

  useEffect(() => {
    if (!editingBlogId) {
      setBlogForm(f => ({
        ...f,
        slug: f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      }));
    }
  }, [blogForm.title]);

  const loadProjects = async () => {
    const res = await api("/projects");
    setProjects(await res.json());
  };

  const loadBlogs = async () => {
    const res = await api("/blog");
    setBlogs(await res.json());
  };

  const loadMessages = async () => {
    const res = await api("/contact");
    setMessages(await res.json());
  };

  // ── Login page ─────────────────────────────────────────
  if (!authed) {
    return (
      <div style={s.loginWrap}>
        <div style={s.loginCard}>
          <h1 style={s.loginTitle}>⚙️ Admin Panel</h1>
          <p style={s.loginSub}>Enter password to continue</p>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (password === ADMIN_PASSWORD ? setAuthed(true) : alert("Wrong password"))}
              placeholder="Password"
              style={{ ...s.input, paddingRight: 44 }}
            />
            <button
              onClick={() => setShowPassword(p => !p)}
              style={s.eyeBtn}
              type="button"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <button
            onClick={() => password === ADMIN_PASSWORD ? setAuthed(true) : alert("Wrong password")}
            style={s.btnPrimary}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // ── Project handlers ───────────────────────────────────
  const saveProject = async () => {
    setLoading(true);
    try {
      if (editingProjectId) {
        await api(`/projects/${editingProjectId}`, {
          method: "PUT",
          body: JSON.stringify({ ...projectForm, id: editingProjectId }),
        });
        showToast("✅ Project updated");
      } else {
        await api("/projects", { method: "POST", body: JSON.stringify(projectForm) });
        showToast("✅ Project added");
      }
      setProjectForm(emptyProject);
      setEditingProjectId(null);
      loadProjects();
    } catch { showToast("❌ Failed to save project"); }
    setLoading(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await api(`/projects/${id}`, { method: "DELETE" });
    showToast("🗑️ Project deleted");
    loadProjects();
  };

  const editProject = (p: Project) => {
    setProjectForm(p);
    setEditingProjectId(p.id!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Blog handlers ──────────────────────────────────────
  const saveBlog = async () => {
    setLoading(true);
    try {
      if (editingBlogId) {
        await api(`/blog/${editingBlogId}`, {
          method: "PUT",
          body: JSON.stringify({ ...blogForm, id: editingBlogId }),
        });
        showToast("✅ Blog post updated");
      } else {
        await api("/blog", { method: "POST", body: JSON.stringify(blogForm) });
        showToast("✅ Blog post added");
      }
      setBlogForm(emptyBlog);
      setEditingBlogId(null);
      loadBlogs();
    } catch { showToast("❌ Failed to save blog post"); }
    setLoading(false);
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    await api(`/blog/${id}`, { method: "DELETE" });
    showToast("🗑️ Blog post deleted");
    loadBlogs();
  };

  const editBlog = (b: any) => {
    setBlogForm({
      id: b.id,
      title: b.title,
      slug: b.slug || "",
      summary: b.summary || b.excerpt || "",
      content: b.content || "",
      tags: b.tags || [],
      thumbnailUrl: b.thumbnailUrl || "",
      images: b.images || [],
      videos: b.videos || [],
      isPublished: b.isPublished ?? true,
    });
    setEditingBlogId(b.id!);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={s.wrap}>
      {toast && <div style={s.toast}>{toast}</div>}

      <div style={s.header}>
        <h1 style={s.title}>⚙️ Admin Panel</h1>
        <button onClick={() => setAuthed(false)} style={s.btnDanger}>Logout</button>
      </div>

      <div style={s.tabs}>
        {(["projects", "blogs", "messages"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── PROJECTS ── */}
      {tab === "projects" && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>{editingProjectId ? "✏️ Edit Project" : "➕ Add Project"}</h2>
          <div style={s.form}>
            {/* Text fields only — no image fields in the loop */}
            {(["title", "description", "githubUrl", "liveUrl"] as const).map(field => (
              <div key={field} style={s.formGroup}>
                <label style={s.label}>{field}</label>
                {field === "description"
                  ? <textarea value={projectForm[field]} rows={3}
                      onChange={e => setProjectForm({ ...projectForm, [field]: e.target.value })}
                      style={s.textarea} />
                  : <input value={projectForm[field]}
                      onChange={e => setProjectForm({ ...projectForm, [field]: e.target.value })}
                      style={s.input} />
                }
              </div>
            ))}

              {/* Image uploads */}
              <SingleUpload
                label="Thumbnail Image"
                value={projectForm.thumbnailUrl}
                onChange={url => setProjectForm({ ...projectForm, thumbnailUrl: url })}
              />
              <SingleUpload
                label="Main Image"
                value={projectForm.imageUrl}
                onChange={url => setProjectForm({ ...projectForm, imageUrl: url })}
              />
            <div style={s.formGroup}>
              <label style={s.label}>Technologies (comma separated)</label>
              <input
                value={projectForm.technologies.join(", ")}
                onChange={e => setProjectForm({
                  ...projectForm,
                  technologies: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                })}
                style={s.input}
                placeholder="React, TypeScript, MongoDB"
              />
            </div>
            <div style={s.btnRow}>
              <button onClick={saveProject} disabled={loading} style={s.btnPrimary}>
                {loading ? "Saving..." : editingProjectId ? "Update Project" : "Add Project"}
              </button>
              {editingProjectId && (
                <button onClick={() => { setProjectForm(emptyProject); setEditingProjectId(null); }}
                  style={s.btnSecondary}>Cancel</button>
              )}
            </div>
          </div>

          <h2 style={{ ...s.sectionTitle, marginTop: 24 }}>📁 All Projects ({projects.length})</h2>
          {projects.length === 0 && <p style={s.empty}>No projects yet. Add one above.</p>}
          {projects.map(p => (
            <div key={p.id} style={s.card}>
              <div style={s.cardContent}>
                <strong style={s.cardTitle}>{p.title}</strong>
                <p style={s.cardSub}>{p.description?.slice(0, 120)}...</p>
                <div style={s.tagRow}>
                  {(p.technologies as unknown as string[])?.map(t => (
                    <span key={t} style={s.tag}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={s.cardActions}>
                <button onClick={() => editProject(p)} style={s.btnSecondary}>Edit</button>
                <button onClick={() => deleteProject(p.id!)} style={s.btnDanger}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BLOGS ── */}
      {tab === "blogs" && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>{editingBlogId ? "✏️ Edit Post" : "➕ Add Blog Post"}</h2>
          <div style={s.form}>
            {(["title", "slug", "summary"] as const).map(field => (
            <div key={field} style={s.formGroup}>
              <label style={s.label}>{field}</label>
              <input value={blogForm[field]}
                onChange={e => setBlogForm({ ...blogForm, [field]: e.target.value })}
                style={s.input} />
            </div>
          ))}

              {/* Thumbnail upload */}
              <SingleUpload
                label="Thumbnail Image"
                value={blogForm.thumbnailUrl}
                onChange={url => setBlogForm({ ...blogForm, thumbnailUrl: url })}
              />
            <div style={s.formGroup}>
              <label style={s.label}>Content (Markdown)</label>
              <textarea value={blogForm.content} rows={12}
                onChange={e => setBlogForm({ ...blogForm, content: e.target.value })}
                style={s.textarea} placeholder="## Heading&#10;Your content here..." />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Tags (comma separated)</label>
              <input
                value={blogForm.tags.join(", ")}
                onChange={e => setBlogForm({
                  ...blogForm,
                  tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                })}
                style={s.input} placeholder="React, ASP.NET, MongoDB" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Images (one URL per line)</label>
              <MultiUpload
                label="Images"
                values={blogForm.images}
                onChange={urls => setBlogForm({ ...blogForm, images: urls })}
                accept="image/*"
              />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Videos (one YouTube embed URL per line)</label>
              <MultiUpload
                label="Videos (upload or paste YouTube embed URLs)"
                values={blogForm.videos}
                onChange={urls => setBlogForm({ ...blogForm, videos: urls })}
                accept="video/*"
              />
            </div>
            <div style={s.formGroup}>
              <label style={{ ...s.label, flexDirection: "row", alignItems: "center", gap: 8, display: "flex" }}>
                <input type="checkbox" checked={blogForm.isPublished}
                  onChange={e => setBlogForm({ ...blogForm, isPublished: e.target.checked })} />
                Published (visible on site)
              </label>
            </div>
            <div style={s.btnRow}>
              <button onClick={saveBlog} disabled={loading} style={s.btnPrimary}>
                {loading ? "Saving..." : editingBlogId ? "Update Post" : "Add Post"}
              </button>
              {editingBlogId && (
                <button onClick={() => { setBlogForm(emptyBlog); setEditingBlogId(null); }}
                  style={s.btnSecondary}>Cancel</button>
              )}
            </div>
          </div>

          <h2 style={{ ...s.sectionTitle, marginTop: 24 }}>📝 All Posts ({blogs.length})</h2>
          {blogs.length === 0 && <p style={s.empty}>No blog posts yet. Add one above.</p>}
          {blogs.map((b: any) => (
            <div key={b.id} style={s.card}>
              <div style={s.cardContent}>
                <strong style={s.cardTitle}>{b.title}</strong>
                <p style={s.cardSub}>{b.excerpt || b.summary}</p>
                <div style={s.tagRow}>
                  {b.tags?.map((t: string) => <span key={t} style={s.tag}>{t}</span>)}
                  <span style={{
                    ...s.tag,
                    background: b.isPublished ? "#dcfce7" : "#fee2e2",
                    color: b.isPublished ? "#16a34a" : "#dc2626"
                  }}>
                    {b.isPublished ? "✅ Published" : "📝 Draft"}
                  </span>
                </div>
              </div>
              <div style={s.cardActions}>
                <button onClick={() => editBlog(b)} style={s.btnSecondary}>Edit</button>
                <button onClick={() => deleteBlog(b.id!)} style={s.btnDanger}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MESSAGES ── */}
      {tab === "messages" && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>📬 Contact Messages ({messages.length})</h2>
          {messages.length === 0 && <p style={s.empty}>No messages yet.</p>}
          {messages.map(m => (
            <div key={m.id} style={s.card}>
              <div style={s.cardContent}>
                <strong style={s.cardTitle}>{m.name}</strong>
                <p style={{ ...s.cardSub, color: "#6366f1", marginTop: 2 }}>{m.email}</p>
                <p style={{ ...s.cardSub, marginTop: 8, lineHeight: 1.6 }}>{m.message}</p>
                <p style={{ ...s.cardSub, fontSize: 11, marginTop: 6, color: "#9ca3af" }}>
                  {new Date(m.sentAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 800, margin: "0 auto", padding: "24px 16px", fontFamily: "system-ui,sans-serif", background: "#ffffff", minHeight: "100vh", color: "#111827" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, margin: 0, color: "#111827" },
  tabs: { display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid #e5e7eb", paddingBottom: 0 },
  tab: { padding: "10px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#6b7280", borderBottom: "2px solid transparent", marginBottom: -2 },
  tabActive: { color: "#6366f1", borderBottom: "2px solid #6366f1" },
  section: { display: "flex", flexDirection: "column", gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 600, margin: "0 0 4px", color: "#111827" },
  form: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 14 },
  formGroup: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "capitalize" },
  input: { padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, color: "#111827", background: "#ffffff", outline: "none" },
  textarea: { padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, color: "#111827", background: "#ffffff", outline: "none", resize: "vertical", fontFamily: "monospace" },
  btnRow: { display: "flex", gap: 8, marginTop: 4 },
  btnPrimary: { padding: "9px 18px", background: "#6366f1", color: "#ffffff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500 },
  btnSecondary: { padding: "9px 18px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: 14 },
  btnDanger: { padding: "9px 18px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 },
  card: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, gap: 12 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: 600, display: "block", marginBottom: 4, color: "#111827" },
  cardSub: { fontSize: 13, color: "#6b7280", margin: 0 },
  cardActions: { display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 },
  tag: { fontSize: 11, padding: "2px 8px", background: "#ede9fe", color: "#6366f1", borderRadius: 99 },
  toast: { position: "fixed", top: 20, right: 20, background: "#18181b", color: "#ffffff", padding: "12px 20px", borderRadius: 8, fontSize: 14, zIndex: 9999 },
  loginWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" },
  loginCard: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 32, width: 320, display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" },
  loginTitle: { fontSize: 22, fontWeight: 700, margin: 0, color: "#111827" },
  loginSub: { fontSize: 14, color: "#6b7280", margin: 0 },
  eyeBtn: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 4 },
  empty: { fontSize: 14, color: "#9ca3af", textAlign: "center", padding: "24px 0" },
};