import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ParallaxBackground from './components/ParallaxBackground';
import SideMenu from './components/SideMenu';
import ScrollReveal from './components/ScrollReveal';
import Resume from './pages/Resume';
import { useState, useEffect } from 'react';
import ProjectCard from './components/ProjectCard';
import ContactForm from './components/ContactForm';
import { ChevronDown, Terminal, ChevronUp } from 'lucide-react';

const projects = [
  {
    title: 'Test1',
    description: 'A modern e-commerce platform built with React and Node.js, featuring real-time updates and cart management.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    technologies: ['React', 'Node.js', 'MongoDB'],
  },
  {
    title: 'Test2',
    description: 'Real-time chat application powered by AI for smart responses and language translation.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    technologies: ['Python', 'TensorFlow', 'WebSocket'],
  },
  {
    title: 'Test3',
    description: 'Analytics dashboard for cloud infrastructure monitoring with real-time metrics.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    technologies: ['Vue.js', 'D3.js', 'AWS'],
  },
];

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return isVisible ? (
    <button
      onClick={scrollToTop}
      className="fixed bottom-32 md:bottom-8 right-8 p-3 rounded-full bg-[#2C1810] text-[#F5EDE0] shadow-lg transition-opacity duration-300 hover:bg-[#5C4B37] z-50"
    >
      <ChevronUp size={24} />
    </button>
  ) : null;
};

function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4">
        <ScrollReveal className="text-center">
          <Terminal className="mx-auto mb-6 text-[#2C1810]" size={48} />
          <h1 className="text-5xl md:text-7xl font-bold text-[#2C1810] mb-4">
            Beatrice Prayogo
          </h1>
          <p className="text-xl md:text-2xl text-[#5C4B37] mb-8">
            Full Stack Engineer
          </p>
        </ScrollReveal>
        <div className="animate-bounce absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <ChevronDown className="text-[#5C4B37]" size={32} />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen py-20 px-4 md:px-20">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl font-bold text-[#2C1810] mb-8">About Me</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <img
                src="https://plus.unsplash.com/premium_vector-1730832937938-74637e0bd0c5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Profile"
                className="rounded-lg shadow-xl"
              />
            </ScrollReveal>
            <div className="space-y-4 text-black bg-[#E6D5AC]/60 p-6 rounded-lg backdrop-blur-sm">
              <ScrollReveal>
                <p className="text-lg">
                  My Name is Beatrice and I'm a Full Stack Engineer based in Jakarta, Indonesia.
                </p>
              </ScrollReveal>
              <ScrollReveal>
                <p className="text-lg">
                  When I'm not coding, you can find me exploring new places, trying out new recipes, or reading a book.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="min-h-screen py-20 px-4 md:px-20 bg-[#F5EDE0] text-[#2C1810]">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl font-bold mb-12">Featured Projects</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={index} {...project} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen py-20 px-4 md:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-bold text-[#2C1810] mb-8">Get In Touch</h2>
            <p className="text-xl text-[#5C4B37] mb-12">
              Have a project in mind? Let's work together to bring your ideas to life.
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <ContactForm />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Router>
      <div className="relative min-h-screen bg-[#F5EDE0] overflow-hidden">
        <ParallaxBackground />
        <div className="relative z-50">
          <SideMenu isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
        </div>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/about" element={<Home />} />
          <Route path="/projects" element={<Home />} />
          <Route path="/contact" element={<Home />} />
        </Routes>
        <ScrollToTop />
      </div>
    </Router>
  );
}

export default App;
