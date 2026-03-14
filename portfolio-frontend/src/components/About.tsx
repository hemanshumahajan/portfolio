import { motion } from "framer-motion";
import { Code2, Briefcase, GraduationCap } from "lucide-react";

const timeline = [
  {
    year: "2025 – Present",
    title: "Software Development Engineer I (SDE I)",
    description: "Working on backend development using .NET and C#, building scalable APIs and exploring AI-powered applications.",
    icon: Briefcase,
  },
  {
    year: "2024 – 2025",
    title: "Trainee Software Developer",
    description: "Started my professional journey in software development and gained hands-on experience in software development and backend technologies.",
    icon: Code2,
  },
  {
    year: "2024",
    title: "Graduated in Mechanical Engineering",
    description: "Completed my B.Tech and transitioned into the field of software development.",
    icon: GraduationCap,
  },
];

const About = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/50 to-background" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-primary text-sm tracking-widest uppercase mb-2">
            {"// About Me"}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold font-mono text-gradient">
            Who I Am
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass rounded-2xl p-8 space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Code2 className="w-10 h-10 text-primary" />
              </div>
              <p className="text-foreground/90 leading-relaxed text-lg">
                I'm a curious developer who enjoys learning and building with modern technologies like .NET and AI. I like turning ideas into working software while continuously improving my skills through real projects and experimentation.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                My journey in tech started with curiosity about how software works, and it gradually turned into a passion for building useful tools and applications. I believe the best way to learn is by building real things, solving problems, and sharing the journey.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Right now, I'm focused on improving my skills in backend development, AI integrations, and building practical software that solves real-world problems.
              </p>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="flex gap-6 group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="w-px h-full bg-border mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <span className="font-mono text-primary text-sm">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-semibold font-mono text-foreground mt-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
