import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Github } from "lucide-react";
import { FadeIn } from "./primitives";
import { API_BASE_URL } from "../../lib/api";
import { toDriveEmbedUrl } from "../../lib/drive";

type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
};

function ProjectDemo() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProject(null);
    setError(false);
    fetch(`${API_BASE_URL}/api/projects/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((j) => {
        if (!cancelled) setProject(j);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <p className="font-mono text-sm text-muted-foreground mb-6">
          // Project not found
        </p>
        <Link to="/" className="text-primary font-mono text-sm hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-32 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded-[2px] mb-6" />
        <div className="h-10 w-3/4 bg-muted rounded-[2px] mb-8" />
        <div className="aspect-video w-full bg-muted rounded-[2px]" />
      </div>
    );
  }

  const embedUrl = project.liveUrl ? toDriveEmbedUrl(project.liveUrl) : null;

  return (
    <article className="max-w-4xl mx-auto px-6 py-24 md:py-32">
      <FadeIn>
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>

        <p className="code-label mb-4">// project_demo</p>

        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
          {project.title}
        </h1>

        <div className="flex flex-wrap gap-1.5 mb-8">
          {project.technologies.map((t) => (
            <span
              key={t}
              className="font-mono text-[11px] px-2 py-0.5 bg-background border border-border text-foreground/80 rounded-[2px]"
            >
              {t}
            </span>
          ))}
        </div>

        {embedUrl ? (
          <div className="relative w-full aspect-video rounded-[2px] overflow-hidden border border-primary/40 shadow-[0_0_40px_rgba(0,194,255,0.15)] mb-10">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay"
              allowFullScreen
              title={`${project.title} demo video`}
            />
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-[2px] py-16 text-center mb-10">
            <p className="font-mono text-sm text-muted-foreground">
              // Demo video unavailable
            </p>
          </div>
        )}

        <p className="text-base text-muted-foreground leading-relaxed mb-10">
          {project.description}
        </p>

        <div className="flex items-center gap-6">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 font-mono text-sm text-foreground/80 hover:text-primary transition-colors"
            >
              <Github size={16} /> Code
            </a>
          )}
        </div>
      </FadeIn>
    </article>
  );
}

export default ProjectDemo;