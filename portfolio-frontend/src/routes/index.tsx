import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/portfolio/Nav";
import { Hero } from "@/components/portfolio/Hero";
import { About } from "@/components/portfolio/About";
import { Skills } from "@/components/portfolio/Skills";
import { Projects } from "@/components/portfolio/Projects";
import { Blog } from "@/components/portfolio/Blog";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";
import { ChatWidget } from "@/components/portfolio/ChatWidget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hemanshu Mahajan — CAD Plugin Developer" },
      {
        name: "description",
        content:
          "I build C# plugins that automate Tekla Structures & Revit workflows for structural engineers and BIM teams.",
      },
      { property: "og:title", content: "Hemanshu Mahajan — CAD Plugin Developer" },
      {
        property: "og:description",
        content: "C# plugins that automate Tekla & Revit workflows.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Blog />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
