type TimelineEntry = {
  dates: string;
  role: string;
  org: string;
  description: string;
  // cyan = current employer, purple = earlier roles / education
  track: "cyan" | "purple";
};

const TIMELINE: TimelineEntry[] = [
  {
    dates: "Oct 2024 – Present",
    role: "Software Development Engineer I",
    org: "PanGulf Technologies Limited",
    description: "Enterprise C#/.NET development across CAD and web platforms",
    track: "cyan",
  },
  {
    dates: "Apr 2024 – Sep 2024",
    role: "Trainee Software Developer",
    org: "PanGulf Technologies Limited",
    description: "First professional C#/.NET development role",
    track: "cyan",
  },
  {
    dates: "Nov 2023 – Mar 2024",
    role: "Project Intern",
    org: "Bosch Chassis Systems",
    description: "Reduced OEM traceability defects by 90% via PLC automation",
    track: "purple",
  },
  {
    dates: "Dec 2021 – Jun 2024",
    role: "B.Tech — Mechanical Engineering",
    org: "JSPM's Rajarshi Shahu College of Engineering",
    description: "8.61 CGPA",
    track: "purple",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="page-section about-section scroll-mt-14" aria-labelledby="about-heading">
      <div className="about-grid">
        <div className="about-copy">
          <p className="about-eyebrow">// about_me</p>
          <h2 id="about-heading">Who I Am</h2>
          <p>
            I&apos;m an <strong>Enterprise Software Developer</strong> working in <strong>C#/.NET</strong> — building tools
            that plug into and extend larger platforms rather than starting from a blank canvas every time. My background is{" "}
            <strong>Mechanical Engineering</strong>, so I came into software already understanding how real systems get
            built, not just how to write code for them.
          </p>
          <p>
            Over <strong>2+ years</strong> of professional development, I&apos;ve shipped{" "}
            <strong>production software used daily</strong> inside engineering workflows, and I&apos;m now expanding into{" "}
            <strong>full-stack web development</strong> alongside that. I work efficiently by directing AI tooling for
            implementation while <strong>owning the architecture, review, and integration</strong> myself.
          </p>
          <p>
            Right now I&apos;m <strong>building in public</strong> — shipping small personal projects, sharing what I learn
            along the way, and documenting the process instead of keeping it to myself. If you&apos;re building something
            similar, <strong>let&apos;s connect</strong>.
          </p>
        </div>

        <ol className="timeline" aria-label="Experience and education">
          {TIMELINE.map((entry) => (
            <li key={`${entry.role}-${entry.dates}`} className={`timeline-item ${entry.track}`}>
              <span className="timeline-dot" aria-hidden="true" />
              <time>{entry.dates}</time>
              <h3>{entry.role}</h3>
              <p className="timeline-org">{entry.org}</p>
              <p>{entry.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
