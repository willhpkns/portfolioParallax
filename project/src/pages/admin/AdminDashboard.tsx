import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  aboutApi, 
  projectApi, 
  educationApi, 
  experienceApi, 
  skillsApi 
} from '../../services/api';
import { 
  FileText, 
  Code2, 
  GraduationCap, 
  Briefcase, 
  Award 
} from 'lucide-react';

interface DashboardCard {
  title: string;
  count: number;
  icon: React.ElementType;
  bgColor: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projects, education, experience, skills] = await Promise.all([
          projectApi.getAll(),
          educationApi.getAll(),
          experienceApi.getAll(),
          skillsApi.getAll(),
        ]);

        setStats([
          {
            title: 'Projects',
            count: projects.length,
            icon: Code2,
            bgColor: 'bg-blue-500',
          },
          {
            title: 'Education',
            count: education.length,
            icon: GraduationCap,
            bgColor: 'bg-green-500',
          },
          {
            title: 'Experience',
            count: experience.length,
            icon: Briefcase,
            bgColor: 'bg-purple-500',
          },
          {
            title: 'Skills',
            count: skills.length,
            icon: Award,
            bgColor: 'bg-yellow-500',
          },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#2C1810]">Dashboard</h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className="h-32 bg-white rounded-lg shadow-md animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">{item.title}</p>
                        <p className="text-2xl font-bold text-[#2C1810] mt-1">
                          {item.count}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${item.bgColor}`}>
                        <Icon className="text-white" size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#2C1810] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/admin/about"
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <FileText className="text-[#2C1810]" size={24} />
              <span>Edit About Section</span>
            </a>
            <a
              href="/admin/projects"
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Code2 className="text-[#2C1810]" size={24} />
              <span>Manage Projects</span>
            </a>
            <a
              href="/admin/skills"
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Award className="text-[#2C1810]" size={24} />
              <span>Update Skills</span>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
