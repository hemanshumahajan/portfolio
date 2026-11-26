import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { DetailNotFound } from "@/components/detail-not-found";
import { MediaEmbed } from "@/components/media-embed";
import { PortfolioChat } from "@/components/portfolio-chat";
import { PortfolioShell } from "@/components/portfolio-shell";
import { ApiError, getProject, toDriveEmbedUrl } from "@/lib/api";
import { absoluteUrl } from "@/lib/site";

const OBJECT_ID = /^[a-f\d]{24}$/i;

export const Route = createFileRoute("/projects/$id")({
  loader: async ({ params }) => {
    // The backend 500s on ids that aren't Mongo ObjectIds, so treat those as missing up front.
    if (!OBJECT_ID.test(params.id)) throw notFound();
    try {
      return await getProject(params.id);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) throw notFound();
      throw error;
    }
  },
  headers: () => ({ "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=86400" }),
  head: ({ loaderData: project, params }) => {
    if (!project) return { meta: [{ title: "Project not found | Hemanshu Mahajan" }, { name: "robots", content: "noindex" }] };
    const url = absoluteUrl(`/projects/${params.id}`);
    const image = project.imageUrl || project.thumbnailUrl;
    return {
      meta: [
        { title: `${project.title} | Hemanshu Mahajan` },
        { name: "description", content: project.description },
        { property: "og:type", content: "website" },
        { property: "og:title", content: project.title },
        { property: "og:description", content: project.description },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ProjectPage,
  notFoundComponent: () => <DetailNotFound section="work" what="project" />,
});

function ProjectPage() {
  const project = Route.useLoaderData();
  const isDemoVideo = !!project.liveUrl && !!toDriveEmbedUrl(project.liveUrl);

  return (
    <PortfolioShell openFile={{ name: `${project.title.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "")}.project`, section: "work" }}>
      <article className="detail-page">
        <Link to="/" hash="work" className="detail-back"><ArrowLeft /> All work</Link>
        <div className="file-path">hemanshu / work / {project.title}</div>
        <h1>{project.title}</h1>
        {project.technologies.length > 0 && <div className="pill-row">{project.technologies.map((t) => <span key={t}>{t}</span>)}</div>}

        {isDemoVideo && project.liveUrl ? (
          <MediaEmbed url={project.liveUrl} title={`${project.title} demo video`} />
        ) : project.imageUrl ? (
          <img className="detail-cover" src={project.imageUrl} alt={`${project.title} screenshot`} />
        ) : null}

        <p className="detail-lede">{project.description}</p>

        <div className="project-links">
          {project.liveUrl && !isDemoVideo && <a className="text-link" href={project.liveUrl} target="_blank" rel="noreferrer">View live <ExternalLink /></a>}
          {project.githubUrl && <a className="text-link" href={project.githubUrl} target="_blank" rel="noreferrer"><Github /> Code</a>}
        </div>
      </article>
      <PortfolioChat />
    </PortfolioShell>
  );
}
