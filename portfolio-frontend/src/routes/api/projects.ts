import { createFileRoute } from "@tanstack/react-router";

const PROJECTS = [
  {
    id: "tekla-concrete-suite",
    title: "Tekla Concrete Modelling Plugin Suite",
    description:
      "4 plugins (L-wall, headwall, stair slab, balcony slab) that auto-generate fully reinforced 3D concrete models from user-defined dimensions. Replaced 5–6 hours of manual element modelling per object. All 4 in daily use.",
    technologies: ["C#", "Tekla Open API", "WinForms", ".NET Framework"],
    status: "In Production",
    statusIcon: "✅",
    coord: "PRJ:001",
    githubUrl: null,
    liveUrl: null,
  },
  {
    id: "revit-sheet-creator",
    title: "Revit Sheet Creator",
    description:
      "Plugin that automates view-to-sheet placement in Revit. Reduced a 50-sheet project from 2–3 hours of manual drag-and-drop to under 5 minutes.",
    technologies: ["C#", "Revit API", ".NET Framework"],
    status: "In Production",
    statusIcon: "✅",
    coord: "PRJ:002",
    githubUrl: null,
    liveUrl: null,
  },
  {
    id: "ga-cast-unit-generator",
    title: "GA & Cast Unit Drawing Generator",
    description:
      "Tekla plugin that auto-generates GA drawings and Cast Unit drawings from model selection. Core logic complete, UI in development.",
    technologies: ["C#", "Tekla Open API", "Tekla Drawing API", "WinForms"],
    status: "In Progress",
    statusIcon: "🔨",
    coord: "PRJ:003",
    githubUrl: null,
    liveUrl: null,
  },
];

export const Route = createFileRoute("/api/projects")({
  server: {
    handlers: {
      GET: async () => Response.json({ projects: PROJECTS }),
    },
  },
});
