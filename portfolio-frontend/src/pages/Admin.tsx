import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

const ADMIN_PASSWORD = "Hemanshu@123"; 

// ── Types ──────────────────────────────────────────────────
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

// ── Helper ─────────────────────────────────────────────────
const api = (path: string, options?: RequestInit) =>
  fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

// ── Main Component ─────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<"projects" | "blogs" | "messages">("projects");

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectForm, setProjectForm] = useState<Project>(emptyProject);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Blogs state
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogForm, setBlogForm] = useState<BlogPost>(emptyBlog);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  // Messages state
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Load data after login
  useEffect(() => {
    if (!authed) return;
    loadProjects();
    loadBlogs();
    loadMessages();
  }, [authed]);

  // Auto-generate slug from title
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
    const data = await res.json();
    setProjects(data);
  };

  const loadBlogs = async () => {
    const res = await api("/blog");
    const data = await res.json();
    setBlogs(data);
  };

  const loadMessages = async () => {
    const res = await api("/contact");
    const data = await res.json();
    setMessages(data);
  };

  // ── Auth ─────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={styles.loginWrap}>
        <div style={styles.loginCard}>
          <h1 style={styles.loginTitle}>Admin Panel</h1>
          <p style={styles.loginSub}>Enter password to continue</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && password === ADMIN_PASSWORD && setAuthed(true)}
            placeholder="Password"
            style={styles.input}
          />
          <button
            onClick={() => password === ADMIN_PASSWORD ? setAuthed(true) : alert("Wrong password")}
            style={styles.btnPrimary}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // ── Project handlers ──────────────────────────────────────
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

  // ── Blog handlers ─────────────────────────────────────────
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

  const editBlog = (b: BlogPost & { excerpt?: string; date?: string }) => {
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

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={styles.wrap}>
      {toast && <div style={styles.toast}>{toast}</div>}

      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Admin Panel</h1>
        <button onClick={() => setAuthed(false)} style={styles.btnDanger}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(["projects", "blogs", "messages"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── PROJECTS TAB ── */}
      {tab === "projects" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {editingProjectId ? "✏️ Edit Project" : "➕ Add Project"}
          </h2>
          <div style={styles.form}>
            {(["title", "description", "githubUrl", "liveUrl", "imageUrl", "thumbnailUrl"] as const).map(field => (
              <div key={field} style={styles.formGroup}>
                <label style={styles.label}>{field}</label>
                {field === "description"
                  ? <textarea value={projectForm[field]} rows={3}
                      onChange={e => setProjectForm({ ...projectForm, [field]: e.target.value })}
                      style={styles.textarea} />
                  : <input value={projectForm[field]}
                      onChange={e => setProjectForm({ ...projectForm, [field]: e.target.value })}
                      style={styles.input} />
                }
              </div>
            ))}
            <div style={styles.formGroup}>
              <label style={styles.label}>Technologies (comma separated)</label>
              <input
                value={projectForm.technologies.join(", ")}
                onChange={e => setProjectForm({
                  ...projectForm,
                  technologies: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                })}
                style={styles.input}
                placeholder="React, TypeScript, MongoDB"
              />
            </div>
            <div style={styles.btnRow}>
              <button onClick={saveProject} disabled={loading} style={styles.btnPrimary}>
                {loading ? "Saving..." : editingProjectId ? "Update Project" : "Add Project"}
              </button>
              {editingProjectId && (
                <button onClick={() => { setProjectForm(emptyProject); setEditingProjectId(null); }}
                  style={styles.btnSecondary}>Cancel</button>
              )}
            </div>
          </div>

          <h2 style={{ ...styles.sectionTitle, marginTop: 32 }}>📁 All Projects ({projects.length})</h2>
          {projects.map(p => (
            <div key={p.id} style={styles.card}>
              <div style={styles.cardContent}>
                <strong style={styles.cardTitle}>{p.title}</strong>
                <p style={styles.cardSub}>{p.description?.slice(0, 100)}...</p>
                <div style={styles.tags}>
                  {(p.technologies as unknown as string[])?.map(t => (
                    <span key={t} style={styles.tag}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={styles.cardActions}>
                <button onClick={() => editProject(p)} style={styles.btnSecondary}>Edit</button>
                <button onClick={() => deleteProject(p.id!)} style={styles.btnDanger}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BLOGS TAB ── */}
      {tab === "blogs" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {editingBlogId ? "✏️ Edit Blog Post" : "➕ Add Blog Post"}
          </h2>
          <div style={styles.form}>
            {(["title", "slug", "summary", "thumbnailUrl"] as const).map(field => (
              <div key={field} style={styles.formGroup}>
                <label style={styles.label}>{field}</label>
                <input value={blogForm[field]}
                  onChange={e => setBlogForm({ ...blogForm, [field]: e.target.value })}
                  style={styles.input} />
              </div>
            ))}
            <div style={styles.formGroup}>
              <label style={styles.label}>Content (Markdown)</label>
              <textarea value={blogForm.content} rows={10}
                onChange={e => setBlogForm({ ...blogForm, content: e.target.value })}
                style={styles.textarea} placeholder="## Heading&#10;Your content here..." />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tags (comma separated)</label>
              <input
                value={blogForm.tags.join(", ")}
                onChange={e => setBlogForm({
                  ...blogForm,
                  tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                })}
                style={styles.input} placeholder="React, ASP.NET, MongoDB" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Images (one URL per line)</label>
              <textarea value={blogForm.images.join("\n")} rows={3}
                onChange={e => setBlogForm({
                  ...blogForm,
                  images: e.target.value.split("\n").map(s => s.trim()).filter(Boolean)
                })}
                style={styles.textarea} placeholder="https://..." />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Videos (one YouTube embed URL per line)</label>
              <textarea value={blogForm.videos.join("\n")} rows={3}
                onChange={e => setBlogForm({
                  ...blogForm,
                  videos: e.target.value.split("\n").map(s => s.trim()).filter(Boolean)
                })}
                style={styles.textarea} placeholder="https://www.youtube.com/embed/..." />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input type="checkbox" checked={blogForm.isPublished}
                  onChange={e => setBlogForm({ ...blogForm, isPublished: e.target.checked })}
                  style={{ marginRight: 8 }} />
                Published (visible on site)
              </label>
            </div>
            <div style={styles.btnRow}>
              <button onClick={saveBlog} disabled={loading} style={styles.btnPrimary}>
                {loading ? "Saving..." : editingBlogId ? "Update Post" : "Add Post"}
              </button>
              {editingBlogId && (
                <button onClick={() => { setBlogForm(emptyBlog); setEditingBlogId(null); }}
                  style={styles.btnSecondary}>Cancel</button>
              )}
            </div>
          </div>

          <h2 style={{ ...styles.sectionTitle, marginTop: 32 }}>📝 All Posts ({blogs.length})</h2>
          {blogs.map((b: any) => (
            <div key={b.id} style={styles.card}>
              <div style={styles.cardContent}>
                <strong style={styles.cardTitle}>{b.title}</strong>
                <p style={styles.cardSub}>{b.excerpt || b.summary}</p>
                <div style={styles.tags}>
                  {b.tags?.map((t: string) => <span key={t} style={styles.tag}>{t}</span>)}
                  <span style={{ ...styles.tag, background: b.isPublished ? "#16a34a22" : "#dc262622", color: b.isPublished ? "#16a34a" : "#dc2626" }}>
                    {b.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div style={styles.cardActions}>
                <button onClick={() => editBlog(b)} style={styles.btnSecondary}>Edit</button>
                <button onClick={() => deleteBlog(b.id!)} style={styles.btnDanger}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MESSAGES TAB ── */}
      {tab === "messages" && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📬 Contact Messages ({messages.length})</h2>
          {messages.length === 0 && <p style={styles.cardSub}>No messages yet.</p>}
          {messages.map(m => (
            <div key={m.id} style={styles.card}>
              <div style={styles.cardContent}>
                <strong style={styles.cardTitle}>{m.name}</strong>
                <a href={"mailto:" + m.email} style={styles.emailLink}>{m.email}</a>
                <p style={{ ...styles.cardSub, marginTop: 8 }}>{m.message}</p>
                <p style={{ ...styles.cardSub, fontSize: 11, marginTop: 4 }}>
                  {new Date(m.sentAt).toLocaleString()}
                </p>
              </div>
              <div style={styles.cardActions}>
                <a href={"mailto:" + m.email + "?subject=Re: Your message"}
                  style={styles.btnPrimary}>Reply</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 800, margin: "0 auto", padding: "24px 16px", fontFamily: "system-ui, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, margin: 0 },
  tabs: { display: "flex", gap: 8, marginBottom: 24, borderBottom: "2px solid #e5e7eb", paddingBottom: 0 },
  tab: { padding: "10px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#6b7280", borderBottom: "2px solid transparent", marginBottom: -2 },
  tabActive: { color: "#6366f1", borderBottom: "2px solid #6366f1" },
  section: { display: "flex", flexDirection: "column", gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 600, margin: "0 0 8px" },
  form: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 },
  formGroup: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "capitalize" },
  input: { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, outline: "none" },
  textarea: { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "monospace" },
  btnRow: { display: "flex", gap: 8, marginTop: 4 },
  btnPrimary: { padding: "9px 18px", background: "#6366f1", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500, textDecoration: "none" },
  btnSecondary: { padding: "9px 18px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: 14 },
  btnDanger: { padding: "9px 18px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 },
  card: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, gap: 12 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: 600, display: "block", marginBottom: 4 },
  cardSub: { fontSize: 13, color: "#6b7280", margin: 0 },
  cardActions: { display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 },
  tags: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 },
  tag: { fontSize: 11, padding: "2px 8px", background: "#ede9fe", color: "#6366f1", borderRadius: 99 },
  toast: { position: "fixed", top: 20, right: 20, background: "#18181b", color: "white", padding: "12px 20px", borderRadius: 8, fontSize: 14, zIndex: 9999 },
  loginWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" },
  loginCard: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 32, width: 320, display: "flex", flexDirection: "column", gap: 12 },
  loginTitle: { fontSize: 22, fontWeight: 700, margin: 0 },
  loginSub: { fontSize: 14, color: "#6b7280", margin: 0 },
  emailLink: { fontSize: 13, color: "#6366f1" },
};