import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { DetailNotFound } from "@/components/detail-not-found";
import { MediaEmbed } from "@/components/media-embed";
import { PortfolioShell } from "@/components/portfolio-shell";
import { Button } from "@/components/ui/button";
import { ApiError, getProject, getProjectLinks } from "@/lib/api";
import { AUTHOR, absoluteUrl } from "@/lib/site";

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
    const home = absoluteUrl("/");
    const image = project.imageUrl || project.thumbnailUrl;
    const { liveUrl } = getProjectLinks(project);
    return {
      meta: [
        { title: `${project.title} | Hemanshu Mahajan` },
        { name: "description", content: project.description.slice(0, 160) },
        { property: "og:type", content: "website" },
        { property: "og:title", content: project.title },
        { property: "og:description", content: project.description.slice(0, 200) },
        { property: "og:url", content: url },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CreativeWork",
              "@id": `${url}#project`,
              url,
              name: project.title,
              description: project.description,
              keywords: project.technologies.join(", "),
              dateCreated: project.createdAt,
              ...(image ? { image } : {}),
              sameAs: [project.githubUrl, liveUrl].filter(Boolean),
              author: { "@type": "Person", "@id": `${home}#person`, name: AUTHOR.name, url: home },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: home },
                { "@type": "ListItem", position: 2, name: project.title, item: url },
              ],
            },
          ],
        }),
      }],
    };
  },
  component: ProjectPage,
  notFoundComponent: () => <DetailNotFound section="work" what="project" />,
});

function ProjectPage() {
  const project = Route.useLoaderData();
  const { liveUrl, demoVideoUrl } = getProjectLinks(project);

  return (
    <PortfolioShell openFile={{ name: `${project.title.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "")}.project`, section: "work" }}>
      <article className="detail-page">
        <Link to="/" hash="work" className="detail-back"><ArrowLeft /> All work</Link>
        <div className="file-path">hemanshu / work / {project.title}</div>
        <h1>{project.title}</h1>
        {project.technologies.length > 0 && <div className="pill-row">{project.technologies.map((t) => <span key={t}>{t}</span>)}</div>}

        {demoVideoUrl ? (
          <MediaEmbed url={demoVideoUrl} title={`${project.title} demo video`} />
        ) : project.imageUrl ? (
          <img className="detail-cover" src={project.imageUrl} alt={`${project.title} screenshot`} />
        ) : null}

        <p className="detail-lede">{project.description}</p>

        <div className="project-actions">
          {liveUrl && (
            <Button asChild variant="hero">
              <a href={liveUrl} target="_blank" rel="noreferrer">View live project <ExternalLink /></a>
            </Button>
          )}
          {project.githubUrl && (
            <Button asChild variant="glass">
              <a href={project.githubUrl} target="_blank" rel="noreferrer"><Github /> Code</a>
            </Button>
          )}
        </div>
      </article>
    </PortfolioShell>
  );
}