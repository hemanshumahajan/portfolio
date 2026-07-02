import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AdminProjects from "./AdminProjects";
import AdminBlogs from "./AdminBlogs";
import AdminMessages from "./AdminMessages";
import AdminChats from "./AdminChats";

type Tab = "projects" | "blogs" | "messages" | "chats";

const TABS: { id: Tab; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "blogs", label: "Blogs" },
  { id: "messages", label: "Messages" },
  { id: "chats", label: "Chats" },
];

function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>("projects");

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="code-label mb-1">// admin_panel</p>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary transition-colors border border-border hover:border-primary/60 rounded-[2px] px-3 py-2"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>

      <div className="flex gap-1 mb-8 border-b border-border overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-mono text-xs uppercase tracking-wider px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "projects" && <AdminProjects />}
      {tab === "blogs" && <AdminBlogs />}
      {tab === "messages" && <AdminMessages />}
      {tab === "chats" && <AdminChats />}
    </div>
  );
}

export default AdminDashboard;