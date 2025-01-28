import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  LogOut
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/about', label: 'About', icon: FileText },
    { path: '/admin/projects', label: 'Projects', icon: Code2 },
    { path: '/admin/education', label: 'Education', icon: GraduationCap },
    { path: '/admin/experience', label: 'Experience', icon: Briefcase },
    { path: '/admin/skills', label: 'Skills', icon: Award },
  ];

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
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
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
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
