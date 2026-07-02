import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen p-8">
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
      <p className="font-mono text-sm text-muted-foreground">
        // Tabs for Projects / Blogs / Messages / Chats coming next
      </p>
    </div>
  );
}

export default AdminDashboard;