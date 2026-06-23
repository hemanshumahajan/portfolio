import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const name = String(body?.name ?? "").trim();
          const email = String(body?.email ?? "").trim();
          const message = String(body?.message ?? "").trim();

          if (!name || name.length > 100) {
            return Response.json({ ok: false, error: "Invalid name" }, { status: 400 });
          }
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
            return Response.json({ ok: false, error: "Invalid email" }, { status: 400 });
          }
          if (!message || message.length > 2000) {
            return Response.json({ ok: false, error: "Invalid message" }, { status: 400 });
          }

          console.log("[contact]", { name, email, length: message.length });
          return Response.json({ ok: true });
        } catch {
          return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
        }
      },
    },
  },
});
