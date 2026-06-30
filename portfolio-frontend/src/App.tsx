import Hero from "./components/portfolio/Hero";
import About from "./components/portfolio/About";
import Skills from "./components/portfolio/Skills";
import Projects from "./components/portfolio/Projects";
import Blog from "./components/portfolio/Blog";
import Contact from "./components/portfolio/Contact";
import Footer from "./components/portfolio/Footer";
import Nav from "./components/portfolio/Nav";
import ChatWidget from "./components/portfolio/ChatWidget";

function App() {
  return (
    <>
      <Nav />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Blog />
      <Contact />
      <Footer />
      <ChatWidget />
    </>
  );
}

export default App;