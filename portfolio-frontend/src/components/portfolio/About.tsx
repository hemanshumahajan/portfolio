import { Section, FadeIn } from "./primitives";

const TIMELINE = [
  {
    year: "Oct 2024 – Present",
    title: "Software Development Engineer I",
    company: "PanGulf Technologies Limited",
    detail: "Building production Tekla & Revit plugins in C#",
    accent: "primary" as const,
  },
  {
    year: "Apr 2024 – Sep 2024",
    title: "Trainee Software Developer",
    company: "PanGulf Technologies Limited",
    detail: "First professional C# plugin development role",
    accent: "primary" as const,
  },
  {
    year: "Nov 2023 – Mar 2024",
    title: "Project Intern",
    company: "Bosch Chassis Systems",
    detail: "Reduced OEM traceability defects by 90% via PLC automation",
    accent: "secondary" as const,
  },
  {
    year: "Dec 2021 – Jun 2024",
    title: "B.Tech — Mechanical Engineering",
    company: "JSPM's Rajarshi Shahu College of Engineering",
    detail: "8.61 CGPA",
    accent: "secondary" as const,
  },
];


function About() {
  return (
    <Section id="about" label="about_me">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Who I Am</h2>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              I build C# plugins for Tekla Structures and Revit that automate
              structural detailing and BIM workflows. My background is Mechanical
              Engineering — I understand what's happening inside the model, not
              just in the code.
            </p>
            <p>
              In 2+ years of professional plugin development, I've shipped 4
              Tekla concrete modelling plugins in daily production use, a Revit
              Sheet Creator that reduced a 50-sheet project from 2–3 hours to
              under 5 minutes, and an automated drawing generator currently in
              progress.
            </p>
            <p>
              Right now I'm building in public — documenting what I learn about
              CAD software, BIM automation, and the niche world of AEC plugin
              development. If you're in this space, let's connect.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="relative pl-6 border-l border-border">
            {TIMELINE.map((t, i) => (
              <div key={i} className="relative mb-10 last:mb-0">
                <span
                  className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full ${
                    t.accent === "primary"
                      ? "bg-primary shadow-[0_0_12px_rgba(0,194,255,0.7)]"
                      : "bg-secondary shadow-[0_0_12px_rgba(123,97,255,0.6)]"
                  }`}
                />
                <p className="font-mono text-xs text-muted-foreground mb-1">
                  {t.year}
                </p>
                <h3 className="text-lg font-semibold text-foreground">
                  {t.title}
                </h3>
                <p
                  className={`text-sm font-mono mb-1 ${
                    t.accent === "primary" ? "text-primary" : "text-secondary"
                  }`}
                >
                  {t.company}
                </p>
                <p className="text-sm text-muted-foreground">{t.detail}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

export default About;