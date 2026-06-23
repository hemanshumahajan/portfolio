import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT = `You are Hemanshu Mahajan's portfolio assistant.
Hemanshu is a CAD Plugin Developer based in Pune, India, who builds C#/.NET automation tools for Tekla Structures and Revit. He works on BIM automation, structural detailing plugins, WinForms UIs, and the BOMBridge project. He is open to remote work.
Answer concisely (1-3 short paragraphs max), in a friendly, technical tone. If asked something off-topic, gently steer back to Hemanshu's work, skills, or how to get in touch (hemanshumahajan21@gmail.com).`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const incoming: unknown = body?.messages;
          if (!Array.isArray(incoming) || incoming.length === 0) {
            return Response.json({ ok: false, error: "messages required" }, { status: 400 });
          }
          const messages: ChatMessage[] = (incoming as ChatMessage[])
            .filter((m) => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
            .slice(-20)
            .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json({ ok: false, error: "AI not configured" }, { status: 500 });
          }

          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            }),
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            if (res.status === 429) {
              return Response.json({ ok: false, error: "Rate limit — try again in a moment." }, { status: 429 });
            }
            if (res.status === 402) {
              return Response.json({ ok: false, error: "AI credits exhausted." }, { status: 402 });
            }
            console.error("[chat] gateway error", res.status, text);
            return Response.json({ ok: false, error: "AI request failed" }, { status: 500 });
          }

          const json = await res.json();
          const reply: string = json?.choices?.[0]?.message?.content ?? "";
          return Response.json({ ok: true, reply });
        } catch (e) {
          console.error("[chat] error", e);
          return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
        }
      },
    },
  },
});
