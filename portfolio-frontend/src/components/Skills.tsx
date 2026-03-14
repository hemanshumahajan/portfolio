import { motion } from "framer-motion";

const categories = [
  {
    title: "Backend Development",
    skills: [
      { name: "C#", level: 90 },
      { name: ".NET / ASP.NET Core", level: 88 },
      { name: "RESTful Web APIs", level: 85 },
      { name: "Entity Framework", level: 80 },
      { name: "SQL", level: 80 },
      { name: "NoSQL", level: 75 },
      { name: "AI Implementation", level: 80 },
    ],
  },
  {
    title: "Tools",
    skills: [
      { name: "Visual Studio / VS Code", level: 90 },
      { name: "Git & GitHub", level: 85 },
      { name: "SQL Server", level: 82 },
      { name: "PostgreSQL", level: 65 },
      { name: "MySQL", level: 70 },
      { name: "MongoDB", level: 70 },
    ],
  },
];

const learningItems = [
  "Docker",
  "Postman",
  "System Design",
  "Microservices Architecture",
  "DevOps Fundamentals",
  "CI/CD Pipelines",
  "Cloud Platforms (AWS / Azure Basics)",
  "Caching (Redis)",
];

const Skills = () => {
  return (
    <section id="skills" className="py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-primary text-sm tracking-widest uppercase mb-2">
            {"// Skills & Tools"}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold font-mono text-gradient">
            Tech Arsenal
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {categories.map((category, catIdx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: catIdx * 0.15 }}
              className="glass rounded-2xl p-6 hover:glow-border transition-all duration-500 group"
            >
              <h3 className="font-mono text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <span className="text-primary">{">"}</span>
                {category.title}
              </h3>
              <div className="space-y-5">
                {category.skills.map((skill, i) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: catIdx * 0.1 + i * 0.05 }}
                  >
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground/80">
                        {skill.name}
                      </span>
                      <span className="text-xs font-mono text-primary">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1,
                          delay: catIdx * 0.1 + i * 0.1,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass rounded-2xl p-6 hover:glow-border transition-all duration-500"
        >
          <h3 className="font-mono text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <span className="text-primary">{">"}</span>
            Currently Learning
          </h3>
          <div className="flex flex-wrap gap-3">
            {learningItems.map((item, i) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium font-mono"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
