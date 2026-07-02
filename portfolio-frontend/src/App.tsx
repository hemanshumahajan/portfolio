import type { ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import Hero from "./components/portfolio/Hero";
import About from "./components/portfolio/About";
import Skills from "./components/portfolio/Skills";
import Projects from "./components/portfolio/Projects";
import Blog from "./components/portfolio/Blog";
import Contact from "./components/portfolio/Contact";
import Footer from "./components/portfolio/Footer";
import Nav from "./components/portfolio/Nav";
import ChatWidget from "./components/portfolio/ChatWidget";
import BlogPost from "./components/portfolio/BlogPost";
import ProjectDemo from "./components/portfolio/ProjectDemo";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProtectedRoute from "./components/admin/ProtectedRoute";

function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Blog />
      <Contact />
    </>
  );
}

// Public-facing pages keep the Nav/Footer/ChatWidget chrome.
// Admin routes render bare — no point showing the portfolio nav there.
function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
      <ChatWidget />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
      <Route path="/projects/:id" element={<PublicLayout><ProjectDemo /></PublicLayout>} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;