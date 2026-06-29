import { Section, FadeIn } from "./primitives";
import { ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export function BuildInPublic() {
  return (
    <Section id="build" label="build_in_public" heading="What I'm Building">
      <FadeIn>
        <div
          className="relative max-w-3xl mx-auto p-8 md:p-12 rounded-[2px] border border-primary/40 shadow-[0_0_40px_rgba(0,194,255,0.15)] text-center"
          style={{ background: "linear-gradient(180deg, #1A1A2E 0%, #14142A 100%)" }}
        >
          <span className="coord-label absolute top-3 left-4 opacity-70">SAAS/01</span>
          <span className="coord-label absolute top-3 right-4 opacity-70">REV/A</span>

          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4 glow-text">
            Coming Soon
          </p>
          <h3 className="text-4xl md:text-6xl font-bold mb-5 glow-text">BOMBridge</h3>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl mx-auto">
            A SaaS tool that exports Tekla BOMs directly to any ERP system
            (SAP, Tally, custom Excel) in one click — eliminating hours of
            manual reformatting per project. Building this in public and
            documenting every step.
          </p>
          <p className="font-mono text-xs text-muted-foreground mb-8">
            <span className="text-primary">●</span> Status: Validation phase · Launching soon
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-mono text-sm font-semibold px-6 py-3 rounded-[2px] hover:shadow-[0_0_28px_rgba(0,194,255,0.5)] transition-all"
            >
              Join the Waitlist
            </a>
            <a
              href="https://linkedin.com/in/hemanshumahajan21"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 border border-primary/60 text-primary font-mono text-sm font-semibold px-6 py-3 rounded-[2px] hover:bg-primary/10 transition-all"
            >
              Follow the Journey on LinkedIn <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}
