import { Section, FadeIn } from "./primitives";
import { API_BASE_URL } from "@/lib/api";

const GROUPS = [
  {
    title: "CAD / BIM APIs",
    accent: "primary" as const,
    skills: [
      "Tekla Structures",
      "Tekla Open API",
      "Revit API (Autodesk)",
      "BIM Automation",
      "Structural Detailing",
    ],
  },
  {
    title: "Languages & Frameworks",
    accent: "secondary" as const,
    skills: ["C#", ".NET Framework", "ASP.NET Core", "WinForms / WPF", "REST APIs", "SQL"],
  },
  {
    title: "Tools & Practices",
    accent: "default" as const,
    skills: [
      "Git & GitHub",
      "Visual Studio",
      "SQL Server",
      "SOLID Principles",
      "Clean Architecture",
      "Agile / Scrum",
    ],
  },
];

export function Skills() {
  return (
    <Section id="skills" label="tech_stack" heading="What I Work With">
      <div className="grid md:grid-cols-3 gap-6">
        {GROUPS.map((g, i) => {
          const borderClass =
            g.accent === "primary"
              ? "border-primary/40"
              : g.accent === "secondary"
              ? "border-secondary/40"
              : "border-border";
          const labelClass =
            g.accent === "primary"
              ? "text-primary"
              : g.accent === "secondary"
              ? "text-secondary"
              : "text-muted-foreground";
          return (
            <FadeIn key={g.title} delay={i * 0.08}>
              <div className={`relative bg-surface border ${borderClass} rounded-[2px] p-6 h-full`}>
                <span className="coord-label absolute top-2 right-3 opacity-60">
                  L:{String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={`font-mono text-sm uppercase tracking-wider mb-5 ${labelClass}`}>
                  {g.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {g.skills.map((s) => (
                    <span
                      key={s}
                      className="font-mono text-xs px-3 py-1.5 bg-background border border-border rounded-[2px] text-foreground/90 hover:border-primary/60 hover:text-primary transition-colors"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>

      <FadeIn delay={0.3}>
        <p className="mt-10 text-sm italic text-muted-foreground">
          Domain knowledge: Steel fabrication workflows · Concrete reinforcement
          modelling · Structural BIM standards
        </p>
      </FadeIn>
    </Section>
  );
}
