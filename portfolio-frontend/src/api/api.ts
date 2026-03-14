const BASE = "http://localhost:5000/api";

// Projects
export const getProjects = () =>
  fetch(`${BASE}/projects`).then(r => r.json());

// Blogs
export const getBlogs = () =>
  fetch(`${BASE}/blogs`).then(r => r.json());

export const getBlogBySlug = (slug: string) =>
  fetch(`${BASE}/blogs/${slug}`).then(r => r.json());

// Contact
export const sendContact = (data: { name: string; email: string; message: string }) =>
  fetch(`${BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(r => r.json());

// AI Chatbot
export const sendChatMessage = (
  message: string,
  history: { role: string; content: string }[]
) =>
  fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  }).then(r => r.json());