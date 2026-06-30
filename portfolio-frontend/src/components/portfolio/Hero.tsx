import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";


const TITLES = [
  "CAD Plugin Developer",
  "Tekla · Revit Automation",
  "Building in Public",
];

const TICKER = [
  "Tekla Open API",
  "Revit API",
  "C#",
  ".NET",
  "WinForms",
  "BIM Automation",
  "Plugin Development",
  "Structural Detailing",
  "ASP.NET Core",
  "SQL",
];

function Hero() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
    const full = TITLES[idx];
    let timeout: number;
    if (phase === "typing") {
      if (text.length < full.length) {
        timeout = window.setTimeout(() => setText(full.slice(0, text.length + 1)), 60);
      } else {
        timeout = window.setTimeout(() => setPhase("deleting"), 1800);
      }
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timeout = window.setTimeout(() => setText(text.slice(0, -1)), 30);
      } else {
        setIdx((i) => (i + 1) % TITLES.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [text, phase, idx]);

  return (
    <section id="top" className="relative min-h-screen flex flex-col justify-center pt-16 blueprint-bg">
      {/* corner marks */}
      <span className="coord-label absolute top-20 left-6 lg:left-10">X:001 Y:001</span>
      <span className="coord-label absolute top-20 right-6 lg:right-10">REV/A</span>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full flex justify-center items-center">
        <div className="text-center">
          <p className="code-label mb-6">
            <span className="text-secondary">//</span> initializing profile...
          </p>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold leading-[0.95] mb-6">
            Hemanshu Mahajan
          </h1>

          <div className="font-mono text-lg md:text-2xl text-primary mb-6 min-h-[2em] glow-text">
            {text}
            <span className="cursor-blink" aria-hidden>&nbsp;</span>
          </div>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            I build C# plugins that automate what structural engineers do by hand.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-mono text-sm font-semibold px-6 py-3 rounded-[2px] hover:shadow-[0_0_28px_rgba(0,194,255,0.5)] transition-all"
            >
              View My Work
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border border-primary/60 text-primary font-mono text-sm font-semibold px-6 py-3 rounded-[2px] hover:bg-primary/10 hover:border-primary transition-all"
            >
              Contact <ArrowRight size={16} />
            </a>
          </div>
        </div>

      </div>


      {/* ticker */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border py-3 overflow-hidden bg-background/40">
        <div className="ticker-track flex whitespace-nowrap font-mono text-xs text-muted-foreground/70">
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="px-6 flex items-center gap-6">
              {t}
              <span className="text-primary/40">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;