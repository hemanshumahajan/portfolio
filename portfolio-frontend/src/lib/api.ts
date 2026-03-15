// Configure this to point to your .NET backend URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// ── Matches exactly to .NET API returns ──────────────
interface ApiProject {
  id: string,
  title: string,
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

interface ApiBlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  coverImageUrl: string | null;
  thumbnailUrl: string | null;
  images: string[];
  videos: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── React components use ─────────────────────────
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  thumbnailUrl: string | null;
  liveUrl: string;
  githubUrl: string;
  featured?: boolean;
  order?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;      
  content: string;
  date: string;         
  readTime: string;     
  category: string;      
  tags: string[];
  thumbnailUrl: string | null;
  images: string[];
  videos: string[];
  featured?: boolean;
}

// ── Chat ───
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
}

// ── Helper: estimate read time from content ────
function calcReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// ── Fetch functions with mapping ───────
export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects`);
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.status}`);
  }

  const data: ApiProject[] = await response.json();

  return data.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    tags: p.technologies,                    // technologies → tags
    image: p.imageUrl ?? p.thumbnailUrl ?? "",  // imageUrl → image
    thumbnailUrl: p.thumbnailUrl,
    liveUrl: p.liveUrl,
    githubUrl: p.githubUrl,
  }))
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const response = await fetch(`${API_BASE_URL}/blog`);
  if (!response.ok) {
    throw new Error(`Failed to fetch blog posts: ${response.status}`);
  }

  const data: ApiBlogPost[] = await response.json();

  return data.map(b => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    excerpt: b.summary,                      // summary → excerpt
    content: b.content,
    date: new Date(b.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),                                       // createdAt → formatted date
    readTime: calcReadTime(b.content),        // calculated
    category: b.tags[0] ?? "General",        // first tag → category
    tags: b.tags,
    thumbnailUrl: b.thumbnailUrl,
    images: b.images,
    videos: b.videos,
  }));
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }
  return response.json();
}
