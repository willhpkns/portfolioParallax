import React from 'react';
import { Menu, X, User, Mail, Briefcase, Code, FileText, Github, Linkedin } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface SideMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, toggleMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    toggleMenu();

    if (path === '/resume') {
      navigate(path);
      return;
    }

    // If we're not on the home page, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const sectionId = path.replace('/', '');
        scrollToSection(sectionId);
      }, 100);
    } else {
      // If we're already on the home page, just scroll
      const sectionId = path.replace('/', '');
      scrollToSection(sectionId);
    }
  };

  const menuItems = [
    { icon: User, text: 'About Me', path: '/about' },
    { icon: Code, text: 'Projects', path: '/projects' },
    { icon: FileText, text: 'Resume', path: '/resume' },
    { icon: Mail, text: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 rounded-lg bg-[#E6D5AC] p-3 text-[#2C1810] hover:bg-[#2C1810] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
        style={{
          position: 'fixed',
          zIndex: 99999,
          transform: 'none',
          backgroundColor: '#E6D5AC',
          isolation: 'isolate',
          perspective: 'none'
        }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#E6D5AC] transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-8">
          <nav className="space-y-6">
            {menuItems.map(({ icon: Icon, text, path }) => (
              <a
                key={text}
                href={path}
                className="flex items-center space-x-2 text-[#5C4B37] hover:text-[#2C1810] transition-colors duration-300"
                onClick={(e) => handleNavigation(e, path)}
              >
                <Icon size={20} />
                <span className="text-lg">{text}</span>
              </a>
            ))}
          </nav>

          <div className="mt-auto">
            <div className="flex space-x-4 justify-center">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5C4B37] hover:text-[#2C1810] transition-colors duration-300"
              >
                <Github size={24} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5C4B37] hover:text-[#2C1810] transition-colors duration-300"
              >
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
