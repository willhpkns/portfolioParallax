import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PageTracker from './components/PageTracker';
import { Toaster } from 'react-hot-toast';
import { aboutApi, projectApi } from './services/api';
import ParallaxBackground from './components/ParallaxBackground';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AboutManager from './pages/admin/AboutManager';
import ProjectsManager from './pages/admin/ProjectsManager';
import EducationManager from './pages/admin/EducationManager';
import SkillsManager from './pages/admin/SkillsManager';
import ExperienceManager from './pages/admin/ExperienceManager';
import PixelBoardManager from './pages/admin/PixelBoardManager';
import PixelBoard from './pages/PixelBoard';
import SideMenu from './components/SideMenu';
import ScrollReveal from './components/ScrollReveal';
import Resume from './pages/Resume';
import ResumePreview from './pages/admin/ResumePreview';
import Analytics from './pages/admin/Analytics';
import { useState, useEffect } from 'react';
import ProjectCard from './components/ProjectCard';
import ContactForm from './components/ContactForm';
import { ChevronDown, Terminal, ChevronUp } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
}

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
      className="fixed bottom-8 right-8 p-3 rounded-full bg-[#2C1810] text-[#F5EDE0] shadow-lg transition-opacity duration-300 hover:bg-[#5C4B37] z-50 hidden md:block"
    >
      <ChevronUp size={24} />
    </button>
  ) : null;
};

function Home() {
  const [aboutData, setAboutData] = useState<{
    name: string;
    position: string;
    description: string[];
    profileImage: string;
  }>({
    name: "",
    position: "",
    description: [],
    profileImage: ""
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const data = await aboutApi.get();
        setAboutData({
          name: data?.name || "",
          position: data?.position || "",
          description: data?.description || [],
          profileImage: data?.profileImage || ""
        });
      } catch (error) {
        console.error('Error fetching about content:', error);
      }
    };

    const fetchProjects = async () => {
      try {
        const data = await projectApi.getAll();
        setProjects(data);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjectsError('Failed to load projects');
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchAboutData();
    fetchProjects();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4">
        <ScrollReveal className="text-center">
          <Terminal className="mx-auto mb-6 text-[#2C1810]" size={48} />
          <h1 className="text-5xl md:text-7xl font-bold text-[#2C1810] mb-4">
            {aboutData.name || "Loading..."}
          </h1>
          <p className="text-xl md:text-2xl text-[#5C4B37] mb-8">
            {aboutData.position || "Loading..."}
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
                src={aboutData.profileImage}
                alt="Profile"
                className="rounded-lg shadow-xl w-full h-auto object-cover"
              />
            </ScrollReveal>
            <div className="space-y-4 text-black bg-[#E6D5AC]/60 p-6 rounded-lg backdrop-blur-sm">
              {aboutData.description.map((paragraph, index) => (
                <ScrollReveal key={index}>
                  <p className="text-lg">{paragraph}</p>
                </ScrollReveal>
              ))}
              {aboutData.description.length === 0 && (
                <ScrollReveal>
                  <p className="text-lg">Loading about content...</p>
                </ScrollReveal>
              )}
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
          {projectsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-48"></div>
                  <div className="mt-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : projectsError ? (
            <div className="text-center text-red-600 py-8">
              <p>{projectsError}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              <p>No projects available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project._id}
                  title={project.title}
                  description={project.description}
                  image={project.image}
                  technologies={project.technologies}
                  index={index}
                />
              ))}
            </div>
          )}
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
  
  // Log auth status on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('App auth check:', { 
      hasToken: !!token,
      tokenValue: token
    });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <PageTracker />
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
          <Route path="/pixelboard" element={<PixelBoard />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/about" element={<AboutManager />} />
            <Route path="/admin/projects" element={<ProjectsManager />} />
            <Route path="/admin/education" element={<EducationManager />} />
            <Route path="/admin/skills" element={<SkillsManager />} />
            <Route path="/admin/experience" element={<ExperienceManager />} />
            <Route path="/admin/resume-preview" element={<ResumePreview />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/pixelboard" element={<PixelBoardManager />} />
          </Route>
        </Routes>
        <ScrollToTop />
        <Toaster position="top-right" />
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
