import { useEffect, useState } from "react";
import { Section, FadeIn, Card } from "./primitives";
import { ArrowRight, Github, ExternalLink } from "lucide-react";
import { API_BASE_URL } from "../lib/api";

type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  status?: string;
  statusIcon?: string;
  coord?: string;
  githubUrl?: string | null;
  liveUrl?: string | null;
};

export function Projects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/projects`)
      .then((r) => r.json())
      // Backend's ProjectsController returns a raw array directly,
      // not wrapped in { projects: [...] }.
      .then((j) => {
        if (!cancelled) setProjects(Array.isArray(j) ? j : []);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setProjects([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Section id="projects" label="featured_work" heading="Projects">
      {projects === null ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState message={error ? "Failed to load projects." : "Projects coming soon"} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.08}>
              <Card coord={p.coord} accent="primary" className="h-full flex flex-col group">
                {p.status && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-1 bg-primary/10 border border-primary/40 text-primary rounded-[2px]">
                      {p.statusIcon} {p.status}
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-3 leading-snug group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {p.technologies.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[11px] px-2 py-0.5 bg-background border border-border text-foreground/80 rounded-[2px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground/80 hover:text-primary transition-colors"
                    >
                      <Github size={14} /> Code
                    </a>
                  )}
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:gap-2.5 transition-all"
                    >
                      Live <ExternalLink size={14} />
                    </a>
                  )}
                  {!p.githubUrl && !p.liveUrl && (
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                      Proprietary <ArrowRight size={14} />
                    </span>
                  )}
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      )}
    </Section>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-[2px] p-6 h-full animate-pulse">
      <div className="h-5 w-24 bg-muted rounded-[2px] mb-4" />
      <div className="h-6 w-3/4 bg-muted rounded-[2px] mb-3" />
      <div className="space-y-2 mb-5">
        <div className="h-3 w-full bg-muted rounded-[2px]" />
        <div className="h-3 w-5/6 bg-muted rounded-[2px]" />
        <div className="h-3 w-2/3 bg-muted rounded-[2px]" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-12 bg-muted rounded-[2px]" />
        <div className="h-5 w-16 bg-muted rounded-[2px]" />
        <div className="h-5 w-10 bg-muted rounded-[2px]" />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-border rounded-[2px] py-16 text-center">
      <p className="font-mono text-sm text-muted-foreground">// {message}</p>
    </div>
  );
}