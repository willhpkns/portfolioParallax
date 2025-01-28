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
  ChevronRight
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

  const menuItems: MenuItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/about', label: 'About', icon: FileText },
    { path: '/admin/projects', label: 'Projects', icon: Code2 },
    {
      label: 'Resume',
      icon: FileText,
      children: [
        { path: '/admin/education', label: 'Education', icon: GraduationCap },
        { path: '/admin/experience', label: 'Experience', icon: Briefcase },
        { path: '/admin/skills', label: 'Skills', icon: Award },
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
      return ['/admin/education', '/admin/experience', '/admin/skills'].includes(location.pathname);
    }
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#F5EDE0] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2C1810] text-white">
        <div className="h-full flex flex-col">
          <div className="p-4">
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </div>
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
      <main className="flex-1 p-8 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto admin">
          {children}
        </div>
      </main>
    </div>
  );
}
