import { createFileRoute } from "@tanstack/react-router";
import { HeroContent, type HomeData } from "@/components/portfolio-content";
import { PortfolioShell } from "@/components/portfolio-shell";
import { PortfolioChat } from "@/components/portfolio-chat";
import { getBlogPosts, getProjects, orNull } from "@/lib/api";
import { AUTHOR, SITE_URL } from "@/lib/site";

const title = "Hemanshu Mahajan — Enterprise Software Developer (C#/.NET)";
const description = "Hemanshu Mahajan is an enterprise C#/.NET developer who builds and ships dependable production software.";

export const Route = createFileRoute("/")({
  // Runs at build time for the prerendered page (so crawlers get real content)
  // and on client navigation. Failures fall back to client-side fetching.
  loader: async (): Promise<HomeData> => {
    const [projects, posts] = await Promise.all([orNull(getProjects()), orNull(getBlogPosts())]);
    return { projects, posts };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: "Hemanshu Mahajan — Enterprise Software Developer" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: AUTHOR.name,
        jobTitle: AUTHOR.jobTitle,
        url: `${SITE_URL}/`,
        sameAs: [AUTHOR.github, AUTHOR.x, AUTHOR.linkedin],
      }),
    }],
  }),
  component: HomePage,
});

function HomePage() {
  const initial = Route.useLoaderData();
  return <PortfolioShell><HeroContent initial={initial} /><PortfolioChat /></PortfolioShell>;
}
