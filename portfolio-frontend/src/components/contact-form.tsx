import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContact, type ContactPayload } from "@/lib/api";

type FieldErrors = Partial<Record<keyof ContactPayload, string>>;

const EMPTY: ContactPayload = { name: "", email: "", message: "" };

// Mirrors ContactMessageValidator on the backend so most mistakes are caught before a round trip.
function validate(values: ContactPayload): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  const message = values.message.trim();
  if (name.length < 2) errors.name = "Name must be at least 2 characters";
  else if (name.length > 100) errors.name = "Name is too long";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Please enter a valid email address";
  if (message.length < 10) errors.message = "Message must be at least 10 characters";
  else if (message.length > 1000) errors.message = "Message must be under 1000 characters";
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<ContactPayload>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [notice, setNotice] = useState<string | null>(null);

  const update = (key: keyof ContactPayload) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _removed, ...rest }) => rest);
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const clientErrors = validate(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setStatus("sending");
    setNotice(null);
    const result = await sendContact({
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    });

    if (result.ok) {
      setStatus("sent");
      setNotice(result.message);
      setValues(EMPTY);
      return;
    }

    const serverErrors: FieldErrors = {};
    for (const [key, messages] of Object.entries(result.fieldErrors) as [keyof ContactPayload, string[]][]) {
      if (messages[0]) serverErrors[key] = messages[0];
    }
    setErrors(serverErrors);
    setStatus("error");
    setNotice(result.error);
  }

  if (status === "sent") {
    return (
      <div className="contact-form contact-form-sent" role="status">
        <CheckCircle2 className="size-6 text-success" />
        <div>
          <strong>Message sent</strong>
          <p>{notice}</p>
        </div>
        <Button variant="glass" size="sm" onClick={() => setStatus("idle")}>Send another</Button>
      </div>
    );
  }

  const field = (key: keyof ContactPayload) => ({
    id: `contact-${key}`,
    value: values[key],
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `contact-${key}-error` : undefined,
  });

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate aria-label="Contact form">
      <div className="terminal-titlebar -mx-6 -mt-6 mb-6">
        <span className="dot dot-red" /><span className="dot dot-amber" /><span className="dot dot-green" />
        <span className="ml-2">POST /api/contact</span>
      </div>
      <div className="contact-form-row">
        <div className="contact-field">
          <Label htmlFor="contact-name">Name</Label>
          <Input {...field("name")} autoComplete="name" onChange={(e) => update("name")(e.target.value)} />
          {errors.name && <small id="contact-name-error">{errors.name}</small>}
        </div>
        <div className="contact-field">
          <Label htmlFor="contact-email">Email</Label>
          <Input {...field("email")} type="email" autoComplete="email" onChange={(e) => update("email")(e.target.value)} />
          {errors.email && <small id="contact-email-error">{errors.email}</small>}
        </div>
      </div>
      <div className="contact-field">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea {...field("message")} rows={5} maxLength={1000} onChange={(e) => update("message")(e.target.value)} placeholder="What are you building?" />
        {errors.message && <small id="contact-message-error">{errors.message}</small>}
      </div>
      <div className="contact-form-footer">
        {notice && status === "error" ? <p role="alert">{notice}</p> : <span>{values.message.trim().length}/1000</span>}
        <Button type="submit" variant="hero" disabled={status === "sending"}>
          <Send /> {status === "sending" ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
