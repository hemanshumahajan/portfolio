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

function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
      <Footer />
      <ChatWidget />
    </>
  );
}

export default App;