import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="code-label mb-4">
      <span className="text-secondary">//</span> {children}
    </div>
  );
}

export function Section({
  id,
  label,
  heading,
  children,
}: {
  id: string;
  label: string;
  heading?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="section-rule">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-32">
        <SectionLabel>{label}</SectionLabel>
        {heading && (
          <h2 className="text-3xl md:text-5xl font-bold mb-12 md:mb-16">{heading}</h2>
        )}
        {children}
      </div>
    </section>
  );
}

export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Card({
  children,
  coord,
  accent = "default",
  className = "",
}: {
  children: ReactNode;
  coord?: string;
  accent?: "default" | "primary" | "secondary";
  className?: string;
}) {
  const borderColor =
    accent === "primary"
      ? "border-primary/40 hover:border-primary hover:shadow-[0_0_24px_rgba(0,194,255,0.2)]"
      : accent === "secondary"
      ? "border-secondary/40 hover:border-secondary hover:shadow-[0_0_24px_rgba(123,97,255,0.2)]"
      : "border-border hover:border-primary/50";
  return (
    <div
      className={`relative bg-surface border ${borderColor} rounded-[2px] p-6 transition-all duration-300 ${className}`}
    >
      {coord && (
        <span className="coord-label absolute top-2 right-3 opacity-60">{coord}</span>
      )}
      {children}
    </div>
  );
}
