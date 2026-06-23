import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const roles = [
  "Full Stack Developer",
  ".NET Backend Engineer",
  "C# Developer",
  "Building Scalable APIs",
  "I Build AI-Powered .NET Applications",
  "AI Integration Developer",
  "Problem Solver",
  "Code. Build. Deploy. Repeat.",
  "Coding the Future",
  "Learning. Building. Improving every day",
];

const Hero = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex];
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting && text.length < currentRole.length) {
      timer = setTimeout(() => setText(currentRole.slice(0, text.length + 1)), 80);
    } else if (!isDeleting && text.length === currentRole.length) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && text.length > 0) {
      timer = setTimeout(() => setText(currentRole.slice(0, text.length - 1)), 40);
    } else if (isDeleting && text.length === 0) {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, roleIndex]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 grid-bg opacity-40"
        style={{ contentVisibility: "auto" }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]"
        style={{ contentVisibility: "auto" }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]"
        style={{ contentVisibility: "auto" }}
      />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ willChange: "transform, opacity" }}
        >
          <p className="font-mono text-primary text-sm md:text-base tracking-widest uppercase mb-4">
            {"// Welcome to my digital space"}
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-mono leading-tight mb-6">
            <span className="text-foreground">Hi, I'm </span>
            <span className="text-gradient">Hemanshu Mahajan</span>
          </h1>

          <div className="h-12 md:h-14 flex items-center justify-center mb-8">
            <span className="font-mono text-xl md:text-3xl text-muted-foreground">
              {"<"}
            </span>
            <span className="font-mono text-xl md:text-3xl text-primary mx-2">
              {text}
            </span>

            {/* ✅ GPU composited cursor using opacity, not border-color */}
            <span
              className="font-mono text-xl md:text-3xl text-primary animate-typing-cursor"
              aria-hidden="true"
            >
              |
            </span>

            <span className="font-mono text-xl md:text-3xl text-muted-foreground ml-1">
              {"/ >"}
            </span>
          </div>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            A developer passionate about learning .NET, AI, and new technologies.
            Building projects and transforming ideas into real, working software.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollTo("projects")}
              className="px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm tracking-wide hover:glow-primary transition-all duration-300 hover:scale-105"
            >
              View Projects
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="px-8 py-3.5 rounded-lg glow-border text-foreground font-mono font-semibold text-sm tracking-wide hover:bg-primary/10 transition-all duration-300 hover:scale-105"
            >
              Contact Me
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;