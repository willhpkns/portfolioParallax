import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { projectApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
}

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    image: '',
    technologies: [],
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      await projectApi.create(newProject);
      toast.success('Project created successfully');
      setIsModalOpen(false);
      setNewProject({ title: '', description: '', image: '', technologies: [] });
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleUpdateProject = async (id: string) => {
    if (!editingProject) return;
    try {
      await projectApi.update(id, editingProject);
      toast.success('Project updated successfully');
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectApi.delete(id);
      toast.success('Project deleted successfully');
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  interface ProjectModalProps {
    project: Project | Partial<Project>;
    onSave: (formData: Project | Partial<Project>) => void;
    onClose: () => void;
  }

  const ProjectModal = ({ project, onSave, onClose }: ProjectModalProps) => {
    const [formData, setFormData] = useState(project);
    const [techInput, setTechInput] = useState('');

    const handleTechKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && techInput.trim()) {
        e.preventDefault();
        setFormData({
          ...formData,
          technologies: [...(formData.technologies || []), techInput.trim()],
        });
        setTechInput('');
      }
    };

      const removeTech = (index: number) => {
      setFormData({
        ...formData,
        technologies: formData.technologies?.filter((_: string, i: number) => i !== index),
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#2C1810]">
              {project._id ? 'Edit Project' : 'Add New Project'}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#5C4B37]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#5C4B37]"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#5C4B37]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technologies
              </label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                placeholder="Press Enter to add"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-[#5C4B37]"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.technologies?.map((tech: string, index: number) => (
                  <span
                    key={index}
                    className="bg-[#2C1810] text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {tech}
                    <button
                      onClick={() => removeTech(index)}
                      className="hover:text-red-300"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(formData)}
                className="px-4 py-2 bg-[#2C1810] text-white rounded hover:bg-[#5C4B37]"
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#2C1810]">Projects</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C1810] text-white rounded-lg hover:bg-[#5C4B37] transition-colors"
          >
            <Plus size={18} />
            Add Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-[#2C1810] mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-[#2C1810] text-white px-2 py-1 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(isModalOpen || editingProject) && (
          <ProjectModal
            project={editingProject || newProject}
            onSave={(formData: Partial<Project>) => {
              if (editingProject) {
                handleUpdateProject(editingProject._id);
              } else {
                handleCreateProject();
              }
            }}
            onClose={() => {
              setIsModalOpen(false);
              setEditingProject(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
