import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth";

// Admin is client-only: the JWT lives in localStorage, and none of it should be indexed.
export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin | Hemanshu Mahajan" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AuthProvider>
      <div className="admin-root workspace">
        <Outlet />
      </div>
    </AuthProvider>
  );
}
