import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Github, Instagram, Linkedin, Mail, PlayCircle } from "lucide-react";
import { AboutSection } from "@/components/about-section";
import { ContactForm } from "@/components/contact-form";
import { SkillsSection } from "@/components/skills-section";
import { Button } from "@/components/ui/button";
import { formatDate, getBlogPosts, getProjectLinks, getProjects, type BlogPost, type Project } from "@/lib/api";
import { AUTHOR } from "@/lib/site";

export type HomeData = { projects: Project[] | null; posts: BlogPost[] | null };

export function HeroContent({ initial }: { initial: HomeData }) {
  return <>
    <section id="home" className="hero-section content-grid">
      <div className="hero-copy">
        <div className="file-path">hemanshu / portfolio / Program.cs</div>
        <h1>Hemanshu Mahajan</h1>
        <p className="hero-role">Enterprise Software Developer <span>(C#/.NET)</span></p>
        <p className="hero-lede">Builder &amp; Shipper — I ship real, working software.</p>
        <p className="hero-detail">I design dependable backend systems, thoughtful web experiences, and maintainable software that survives beyond the demo.</p>
        <div className="pill-row"><span>React</span><span>C#/.NET</span><span>ASP.NET Core</span></div>
        <div className="cta-row">
          <Button asChild variant="hero" size="lg"><a href="#work" onClick={(e) => { e.preventDefault(); document.getElementById("work")?.scrollIntoView({ behavior: "smooth" }); }}>View My Work</a></Button>
          <Button asChild variant="glass" size="lg"><a href={AUTHOR.x} target="_blank" rel="noreferrer">Connect on X <ExternalLink /></a></Button>
        </div>
      </div>
    </section>
    <div className="section-divider"><span>01</span><span>ABOUT</span></div>
    <AboutSection />
    <div className="section-divider"><span>02</span><span>BUILD OUTPUT</span></div>
    <div id="work" className="scroll-mt-14"><WorkContent initial={initial.projects} /></div>
    <div className="section-divider"><span>03</span><span>SKILLS</span></div>
    <SkillsSection />
    <div className="section-divider"><span>04</span><span>WRITING</span></div>
    <div id="blog" className="scroll-mt-14"><WritingContent initial={initial.posts} /></div>
    <div id="contact" className="scroll-mt-14"><ContactPanel /></div>
  </>;
}

// ---------------------------------------------------------------------------
// Work
// ---------------------------------------------------------------------------

type Status = "live" | "demo" | "progress";
const STATUS_LABEL: Record<Status, string> = { live: "Live", demo: "Demo video", progress: "In Progress" };

type CardModel = {
  key: string;
  title: string;
  description: string;
  technologies: string[];
  status: Status;
  tab: string;
  projectId?: string;
  liveUrl?: string;
  hasDemo?: boolean;
  githubUrl?: string;
};

// Shown only when the API is unreachable or has no projects yet, so the page never renders empty.
const FALLBACK_PROJECTS: CardModel[] = [
  {
    key: "portfolio",
    title: "Developer Portfolio",
    description: "The portfolio you're using now: an IDE-inspired workspace backed by a production-ready service architecture.",
    technologies: ["React/TS", "ASP.NET Core", "MongoDB"],
    status: "live",
    tab: "portfolio.tsx",
    githubUrl: "https://github.com/hemanshumahajan/portfolio",
  },
  {
    key: "resurface",
    title: "Save-for-later resurfacing tool",
    description: "A personal resurfacing engine that brings saved links and thoughts back at the moment they become useful.",
    technologies: ["C#/.NET", "Recommendation logic", "Personal tooling"],
    status: "progress",
    tab: "resurface.cs",
  },
];

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "") || "project";
}

function toCard(project: Project): CardModel {
  const { liveUrl, demoVideoUrl } = getProjectLinks(project);
  const status: Status = liveUrl ? "live" : demoVideoUrl ? "demo" : "progress";
  const isWeb = project.technologies.some((t) => /react|typescript|\bts\b|next|vue|angular/i.test(t));
  const isDotnet = project.technologies.some((t) => /c#|\.net|asp/i.test(t));
  return {
    key: project.id,
    title: project.title,
    description: project.description,
    technologies: project.technologies,
    status,
    tab: `${slugify(project.title)}.${isDotnet && !isWeb ? "cs" : "tsx"}`,
    projectId: project.id,
    hasDemo: !!demoVideoUrl,
    ...(liveUrl ? { liveUrl } : {}),
    ...(project.githubUrl ? { githubUrl: project.githubUrl } : {}),
  };
}

function ProjectCard({ card, index }: { card: CardModel; index: number }) {
  return (
    <article className={`project-card ${index % 2 === 1 ? "cyan" : ""}`}>
      <div className="project-tab">{card.tab}</div>
      <div className="project-body">
        <div className="project-top"><span className={`status ${card.status}`}>{STATUS_LABEL[card.status]}</span><span className="project-index">{String(index + 1).padStart(2, "0")}</span></div>
        <h3>{card.projectId ? <Link to="/projects/$id" params={{ id: card.projectId }}>{card.title}</Link> : card.title}</h3>
        <p>{card.description}</p>
        {card.technologies.length > 0 && <div className="pill-row">{card.technologies.map((t) => <span key={t}>{t}</span>)}</div>}
        <div className="project-actions">
          {card.liveUrl && (
            <Button asChild variant="hero">
              <a href={card.liveUrl} target="_blank" rel="noreferrer">View project <ExternalLink /></a>
            </Button>
          )}
          {card.hasDemo && card.projectId && (
            <Button asChild variant="glass">
              <Link to="/projects/$id" params={{ id: card.projectId }}><PlayCircle /> View demo</Link>
            </Button>
          )}
          {card.githubUrl && (
            <Button asChild variant="glass">
              <a href={card.githubUrl} target="_blank" rel="noreferrer"><Github /> Code</a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function WorkContent({ initial }: { initial: Project[] | null }) {
  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    initialData: initial ?? undefined,
    initialDataUpdatedAt: 0, // prerendered data may be old — refresh in the background
  });
  const cards = data && data.length > 0 ? data.map(toCard) : FALLBACK_PROJECTS;

  return <section className="page-section">
    <div className="section-heading"><h2>What I&apos;ve Shipped</h2><p>Production-minded work, built from problem definition through deployment.</p></div>
    <div className="project-grid">
      {cards.map((card, index) => <ProjectCard key={card.key} card={card} index={index} />)}
    </div>
  </section>;
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

export function WritingContent({ initial }: { initial: BlogPost[] | null }) {
  const { data } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: getBlogPosts,
    initialData: initial ?? undefined,
    initialDataUpdatedAt: 0,
  });

  return <section className="page-section">
    <div className="section-heading"><h2>Writing</h2><p>Notes from building enterprise software in public.<br /><Link to="/blog" className="section-link">View all posts</Link></p></div>
    {data && data.length > 0 ? (
      <div className="writing-grid">
        {data.map((post) => (
          <Link key={post.id} to="/blog/$slug" params={{ slug: post.slug }} className="writing-card">
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            <h3>{post.title}</h3>
            <p>{post.summary}</p>
            {post.tags.length > 0 && <div className="pill-row">{post.tags.map((t) => <span key={t}>{t}</span>)}</div>}
          </Link>
        ))}
      </div>
    ) : (
      <div className="empty-writing"><span className="prompt-symbol">$</span><div><strong>First post coming soon</strong><p>Following the build in public.</p></div><span className="cursor" /></div>
    )}
  </section>;
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export function ContactPanel() {
  return <section className="contact-panel">
    <div className="contact-intro">
      <h2>Let&apos;s build something dependable.</h2>
      <p>{AUTHOR.name}<br /><span>{AUTHOR.jobTitle}</span></p>
      <div className="contact-links">
        <a href="mailto:hemanshumahajan21@gmail.com"><Mail />Email</a>
        <a href={AUTHOR.x} target="_blank" rel="noreferrer">X</a>
        <a href={AUTHOR.linkedin} target="_blank" rel="noreferrer"><Linkedin />LinkedIn</a>
        <a href={AUTHOR.github} target="_blank" rel="noreferrer"><Github />GitHub</a>
        <span className="disabled-link" title="Instagram link coming soon"><Instagram />Instagram</span>
      </div>
    </div>
    <ContactForm />
    <small className="contact-copyright">© {new Date().getFullYear()} {AUTHOR.name}. Built to ship.</small>
  </section>;
}
