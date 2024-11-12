import React from 'react';
import { Menu, X, User, Mail, Briefcase, Code, FileText, Github, Linkedin } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

export default function SideMenu({ isOpen, toggleMenu }: SideMenuProps) {
  return (
    <>
      <button 
        onClick={toggleMenu}
        className="fixed top-6 right-6 z-50 p-2 rounded-full bg-[#5C4B37] text-white hover:bg-[#8B7355] transition-colors duration-300"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`fixed top-0 right-0 h-full w-80 bg-[#2C1810] bg-opacity-95 transform transition-transform duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full text-[#E6D5AC] p-8 pt-24">
          <nav className="space-y-6">
            {[
              { icon: User, text: 'About Me', href: '#about' },
              { icon: Code, text: 'Projects', href: '#projects' },
              { icon: Briefcase, text: 'Experience', href: '#experience' },
              { icon: FileText, text: 'Resume', href: '#resume' },
              { icon: Mail, text: 'Contact', href: '#contact' },
            ].map(({ icon: Icon, text, href }) => (
              <a
                key={text}
                href={href}
                className="flex items-center space-x-4 p-2 hover:bg-[#3D2A1F] rounded-lg transition-colors duration-200"
                onClick={toggleMenu}
              >
                <Icon size={20} />
                <span className="text-lg">{text}</span>
              </a>
            ))}
          </nav>

          <div className="mt-auto">
            <div className="border-t border-[#5C4B37] pt-6">
              <div className="flex justify-center space-x-6">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                   className="hover:text-[#8B7355] transition-colors duration-200">
                  <Github size={24} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                   className="hover:text-[#8B7355] transition-colors duration-200">
                  <Linkedin size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}