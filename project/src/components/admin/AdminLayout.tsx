import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
  import {
  LayoutDashboard,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  LogOut,
  ChevronDown,
  ChevronRight,
  BarChart,
  Menu,
  X
} from 'lucide-react';

interface MenuChildItem {
  path: string;
  label: string;
  icon: any;
}

interface MenuItem {
  path?: string;
  label: string;
  icon: any;
  children?: MenuChildItem[];
}

type MenuItemWithPath = MenuItem & { path: string };
type MenuItemWithChildren = MenuItem & { children: MenuChildItem[] };

function isMenuItemWithChildren(item: MenuItem): item is MenuItemWithChildren {
  return 'children' in item && Array.isArray(item.children);
}

function isMenuItemWithPath(item: MenuItem): item is MenuItemWithPath {
  return 'path' in item && typeof item.path === 'string';
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [expandedSections, setExpandedSections] = useState<string[]>(['resume']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems: MenuItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/about', label: 'About', icon: FileText },
    { path: '/admin/projects', label: 'Projects', icon: Code2 },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart },
    {
      label: 'Resume',
      icon: FileText,
      children: [
        { path: '/admin/education', label: 'Education', icon: GraduationCap },
        { path: '/admin/experience', label: 'Experience', icon: Briefcase },
        { path: '/admin/skills', label: 'Skills', icon: Award },
        { path: '/admin/resume-preview', label: 'Preview', icon: FileText },
      ],
    },
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (path: string) => {
    if (path === location.pathname) return true;
    if (path === 'resume') {
      return ['/admin/education', '/admin/experience', '/admin/skills', '/admin/resume-preview'].includes(location.pathname);
    }
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#F5EDE0] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#2C1810] text-white z-50 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#5C4B37] transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors hover:bg-[#5C4B37]/50 md:hidden"
        >
          <LogOut size={18} />
          <span className="sr-only">Logout</span>
        </button>
      </header>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static top-16 left-0 bottom-0 z-40
          w-64 bg-[#2C1810] text-white
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="h-full flex flex-col">
          <nav className="flex-1">
            <ul className="space-y-1 p-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                if (isMenuItemWithChildren(item)) {
                  const isExpanded = expandedSections.includes('resume');
                  const isMenuActive = isActive('resume');
                  return (
                    <li key="resume">
                      <button
                        onClick={() => toggleSection('resume')}
                        className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition-colors ${
                          isMenuActive
                            ? 'bg-[#5C4B37] text-white'
                            : 'text-gray-300 hover:bg-[#5C4B37]/50 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={18} />
                          {item.label}
                        </div>
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-200 ${
                          isExpanded ? 'max-h-48' : 'max-h-0'
                        }`}
                      >
                        <ul className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <li key={child.path}>
                                <Link
                                  to={child.path}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    location.pathname === child.path
                                      ? 'bg-[#5C4B37] text-white'
                                      : 'text-gray-300 hover:bg-[#5C4B37]/50 hover:text-white'
                                  }`}
                                >
                                  <ChildIcon size={18} />
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={isMenuItemWithPath(item) ? item.path : item.label}>
                    <Link
                      to={isMenuItemWithPath(item) ? item.path : '#'}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? 'bg-[#5C4B37] text-white'
                          : 'text-gray-300 hover:bg-[#5C4B37]/50 hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="p-4 border-t border-[#5C4B37]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-300 hover:text-white w-full px-4 py-2 rounded-lg transition-colors hover:bg-[#5C4B37]/50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 pt-24 overflow-auto relative z-10 md:ml-0">
        <div className="max-w-7xl mx-auto admin">
          {children}
        </div>
      </main>
    </div>
  );
}
