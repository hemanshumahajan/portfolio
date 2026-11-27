import { createFileRoute } from "@tanstack/react-router";
import { HeroContent, type HomeData } from "@/components/portfolio-content";
import { PortfolioShell } from "@/components/portfolio-shell";
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
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: `${SITE_URL}/`,
            name: AUTHOR.name,
            description,
            inLanguage: "en",
            publisher: { "@id": `${SITE_URL}/#person` },
          },
          {
            "@type": "Person",
            "@id": `${SITE_URL}/#person`,
            name: AUTHOR.name,
            url: `${SITE_URL}/`,
            image: `${SITE_URL}/og-image.png`,
            jobTitle: AUTHOR.jobTitle,
            description,
            worksFor: { "@type": "Organization", name: "PanGulf Technologies Limited" },
            alumniOf: { "@type": "CollegeOrUniversity", name: "JSPM's Rajarshi Shahu College of Engineering" },
            address: { "@type": "PostalAddress", addressLocality: "Pune", addressRegion: "Maharashtra", addressCountry: "IN" },
            knowsAbout: ["C#", ".NET", "ASP.NET Core", "REST APIs", "SQL Server", "React", "TypeScript", "MongoDB"],
            sameAs: [AUTHOR.github, AUTHOR.x, AUTHOR.linkedin],
          },
        ],
      }),
    }],
  }),
  component: HomePage,
});

function HomePage() {
  const initial = Route.useLoaderData();
    return <PortfolioShell><HeroContent initial={initial} /></PortfolioShell>;
}
