import React, { useState, useEffect } from 'react';
import { projectApi } from '../services/api';
import ProjectCard from '../components/ProjectCard';

interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await projectApi.getAll();
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <div>
      <div className="min-h-screen bg-[#F5F5F5] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#2C1810] mb-4">
              My Projects
            </h2>
            <p className="text-xl text-gray-600">
              A showcase of my development work and accomplishments
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              <p>{error}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              <p>No projects available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </div>
    </div>
  );
}
