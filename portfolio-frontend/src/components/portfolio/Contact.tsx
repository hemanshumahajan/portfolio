import { useState, type FormEvent } from "react";
import { Section, FadeIn } from "./primitives";
import { Mail, Phone, MapPin, Linkedin, Github, Twitter } from "lucide-react";
import { API_BASE_URL } from "../../lib/api";

type Status = "idle" | "submitting" | "success" | "error";

function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      // Backend returns { success: true, message } on success,
      // or { errors: {...} } with a 400 on validation failure.
      if (!res.ok || !json.success) {
        setStatus("error");
        const firstError =
          json?.errors && typeof json.errors === "object"
            ? Object.values(json.errors).flat()[0]
            : undefined;
        setErrorMsg((firstError as string) ?? json?.message ?? "Something went wrong");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMsg("Network error");
    }
  }

  const contactItems = [
    { Icon: Mail, label: "hemanshumahajan21@gmail.com", href: "mailto:hemanshumahajan21@gmail.com" },
    { Icon: Phone, label: "+91 84118 32224", href: "tel:+918411832224" },
    { Icon: MapPin, label: "Pune, India · Open to Remote" },
    { Icon: Linkedin, label: "linkedin.com/in/hemanshumahajan21", href: "https://linkedin.com/in/hemanshumahajan21" },
    { Icon: Github, label: "github.com/hemanshumahajan21", href: "https://github.com/hemanshumahajan21" },
  ];

  return (
    <Section id="contact" label="get_in_touch" heading="Let's Connect">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        <FadeIn>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Whether you're building AEC software, looking for a CAD plugin
            developer, or curious about BOMBridge — I'd love to hear from you.
          </p>

          <ul className="space-y-4 mb-10">
            {contactItems.map(({ Icon, label, href }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="w-9 h-9 flex items-center justify-center border border-border rounded-[2px] text-primary">
                  <Icon size={16} />
                </span>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer noopener"
                    className="font-mono text-sm text-foreground/90 hover:text-primary transition-colors break-all"
                  >
                    {label}
                  </a>
                ) : (
                  <span className="font-mono text-sm text-foreground/90">{label}</span>
                )}
              </li>
            ))}
          </ul>

          <div className="flex gap-3">
            {[
              { Icon: Linkedin, href: "https://linkedin.com/in/hemanshumahajan21" },
              { Icon: Github, href: "https://github.com/hemanshumahajan21" },
              { Icon: Twitter, href: "https://x.com/hemanshumahajan21" },
            ].map(({ Icon, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="w-10 h-10 flex items-center justify-center border border-border rounded-[2px] text-foreground/80 hover:text-primary hover:border-primary hover:shadow-[0_0_18px_rgba(0,194,255,0.3)] transition-all"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <form
            onSubmit={onSubmit}
            className="relative bg-surface border border-border rounded-[2px] p-6 md:p-8"
          >
            <span className="coord-label absolute top-2 right-3 opacity-60">FORM/01</span>

            <div className="space-y-5">
              <Field name="name" label="Name" required maxLength={100} />
              <Field name="email" label="Email" type="email" required maxLength={255} />
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  maxLength={2000}
                  rows={5}
                  className="w-full bg-background border border-border rounded-[2px] px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,194,255,0.1)] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-primary text-primary-foreground font-mono text-sm font-semibold px-6 py-3 rounded-[2px] hover:shadow-[0_0_28px_rgba(0,194,255,0.5)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? "Sending..." : "Send Message"}
              </button>

              {status === "success" && (
                <p className="font-mono text-xs text-primary">
                  ✓ Message sent. I'll reply soon.
                </p>
              )}
              {status === "error" && (
                <p className="font-mono text-xs text-destructive">
                  ✗ {errorMsg || "Failed to send message"}
                </p>
              )}
              {status !== "success" && status !== "error" && (
                <p className="font-mono text-xs text-muted-foreground">
                  Typically reply within 24 hours
                </p>
              )}
            </div>
          </form>
        </FadeIn>
      </div>
    </Section>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  maxLength,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        maxLength={maxLength}
        className="w-full bg-background border border-border rounded-[2px] px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,194,255,0.1)] transition-all"
      />
    </div>
  );
}

export default Contact;