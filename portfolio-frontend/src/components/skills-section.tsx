type SkillLevel = "pro" | "growing";

type SkillGroup = {
  file: string;
  title: string;
  summary: string;
  skills: [name: string, level: SkillLevel][];
};

// "pro" = used professionally, "growing" = used in personal projects.
const SKILL_GROUPS: SkillGroup[] = [
  {
    file: "backend.cs",
    title: "Backend & .NET",
    summary: "Where I spend most of my day: services, APIs and data.",
    skills: [
      ["C#", "pro"],
      [".NET / .NET Framework", "pro"],
      ["ASP.NET Core", "pro"],
      ["REST APIs", "pro"],
      ["SQL Server", "pro"],
      ["MongoDB", "growing"],
    ],
  },
  {
    file: "platform.xaml",
    title: "Desktop & Platform Extensions",
    summary: "Tools that plug into and extend larger engineering platforms.",
    skills: [
      ["WinForms", "pro"],
      ["WPF", "pro"],
      ["MVVM", "pro"],
      ["CAD/BIM platform APIs", "pro"],
      ["Plugin architecture", "pro"],
    ],
  },
  {
    file: "frontend.tsx",
    title: "Web Frontend",
    summary: "Full-stack work I'm shipping in public, like this site.",
    skills: [
      ["React", "growing"],
      ["TypeScript", "growing"],
      ["Tailwind CSS", "growing"],
      ["Vercel & Render deployment", "growing"],
    ],
  },
  {
    file: "workflow.md",
    title: "Tools & Practices",
    summary: "How I keep software maintainable long after the demo.",
    skills: [
      ["Git & GitHub", "pro"],
      ["Visual Studio", "pro"],
      ["SOLID principles", "pro"],
      ["Clean architecture", "pro"],
      ["Agile / Scrum", "pro"],
      ["AI-assisted development", "pro"],
    ],
  },
];

export function SkillsSection() {
  return (
    <section id="skills" className="page-section scroll-mt-14" aria-labelledby="skills-heading">
      <div className="section-heading">
        <h2 id="skills-heading">Skills</h2>
        <div>
          <p>The stack I use to design, build and ship — at work and in public.</p>
          <div className="skills-legend" aria-hidden="true">
            <span><i className="pro" /> Used professionally</span>
            <span><i className="growing" /> Personal projects</span>
          </div>
        </div>
      </div>

      <div className="skills-grid">
        {SKILL_GROUPS.map((group, index) => (
          <article key={group.file} className={`skill-card ${index % 2 === 1 ? "cyan" : ""}`}>
            <div className="project-tab">{group.file}</div>
            <div className="skill-card-body">
              <h3>{group.title}</h3>
              <p>{group.summary}</p>
              <ul className="skill-list">
                {group.skills.map(([name, level]) => (
                  <li key={name} className={`skill ${level}`}>
                    {name}
                    <span className="sr-only">{level === "pro" ? " (used professionally)" : " (used in personal projects)"}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}