import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ExternalLink, LogOut } from "lucide-react";
import { AdminBlogs } from "@/components/admin/admin-blogs";
import { AdminChats } from "@/components/admin/admin-chats";
import { AdminMessages } from "@/components/admin/admin-messages";
import { AdminProjects } from "@/components/admin/admin-projects";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { isAuthenticated, logout } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="mx-auto w-[min(1180px,calc(100%-32px))] py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="admin-eyebrow">// admin_panel</p>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="glass" size="sm"><Link to="/">View site <ExternalLink /></Link></Button>
          <Button variant="glass" size="sm" onClick={logout}><LogOut /> Log out</Button>
        </div>
      </header>

      <Tabs defaultValue="projects">
        <TabsList className="mb-6">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="chats">Chats</TabsTrigger>
        </TabsList>
        <TabsContent value="projects"><AdminProjects /></TabsContent>
        <TabsContent value="blogs"><AdminBlogs /></TabsContent>
        <TabsContent value="messages"><AdminMessages /></TabsContent>
        <TabsContent value="chats"><AdminChats /></TabsContent>
      </Tabs>
    </div>
  );
}
