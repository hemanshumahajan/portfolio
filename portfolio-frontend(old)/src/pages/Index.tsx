import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

// ✅ Above fold — loads immediately (Navbar + Hero are visible on first paint)

// ✅ Below fold — lazy loaded only when needed
const About = lazy(() => import("@/components/About"));
const Skills = lazy(() => import("@/components/Skills"));
const Projects = lazy(() => import("@/components/Projects"));
const Blog = lazy(() => import("@/components/Blog"));
const Contact = lazy(() => import("@/components/Contact"));
const Footer = lazy(() => import("@/components/Footer"));
const Chatbot = lazy(() => import("@/components/Chatbot"));

// ✅ Section skeleton — matches your dark theme, no white flash
const SectionSkeleton = () => (
  <div
    style={{
      minHeight: "400px",
      background: "hsl(222, 47%, 5%)",
    }}
  />
);

const Index = () => {
  return (
    <main className="bg-background text-foreground min-h-screen overflow-x-hidden">
      {/* Navbar and Hero load instantly — no lazy */}
      <Navbar />
      <Hero />

      {/* Everything below the fold is lazy loaded */}
      <Suspense fallback={<SectionSkeleton />}>
        <About />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <Skills />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <Projects />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <Blog />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <Contact />
      </Suspense>

      <Suspense fallback={<div style={{ minHeight: "80px", background: "hsl(222, 47%, 5%)" }} />}>
        <Footer />
      </Suspense>

      {/* Chatbot loads last — lowest priority */}
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </main>
  );
};

export default Index;