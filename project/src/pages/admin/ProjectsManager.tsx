import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { projectApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import axios, { AxiosError } from 'axios';

interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
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

  const handleCreateProject = async (projectData: Partial<Project>) => {
    console.log('Initial project data:', projectData);
    
    // Validate required fields
    if (!projectData.title?.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!projectData.description?.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!projectData.image?.trim()) {
      toast.error('Image URL is required');
      return;
    }

    // Ensure technologies is initialized and is an array
    const dataToSend = {
      ...projectData,
      technologies: Array.isArray(projectData.technologies) ? projectData.technologies : []
    };

    console.log('Sending project data:', dataToSend);

    try {
      const response = await projectApi.create(dataToSend);
      console.log('Created project:', response);
      toast.success('Project created successfully');
      setIsModalOpen(false);
      setNewProject({ title: '', description: '', image: '', technologies: [] });
      loadProjects();
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = (axiosError.response?.data as any)?.error || axiosError.message || 'Failed to create project';
      console.error('Error creating project:', axiosError);
      toast.error(errorMessage);
    }
  };

  const handleUpdateProject = async (id: string, projectData: Partial<Project>) => {
    // Validate required fields
    if (!projectData.title?.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!projectData.description?.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!projectData.image?.trim()) {
      toast.error('Image URL is required');
      return;
    }

    // Ensure technologies is initialized
    const dataToSend = {
      ...projectData,
      technologies: projectData.technologies || []
    };

    try {
      await projectApi.update(id, dataToSend);
      toast.success('Project updated successfully');
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = (axiosError.response?.data as any)?.error || axiosError.message || 'Failed to update project';
      console.error('Error updating project:', axiosError);
      toast.error(errorMessage);
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
    // Initialize form data
    const [formData, setFormData] = useState<Partial<Project>>(() => {
      const initialTechnologies = Array.isArray(project.technologies) ? [...project.technologies] : [];
      console.log('Initializing form with technologies:', initialTechnologies);
      return {
        title: project.title || '',
        description: project.description || '',
        image: project.image || '',
        technologies: initialTechnologies,
        _id: project._id,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        __v: project.__v
      };
    });

    // Update form data when project changes
    useEffect(() => {
      console.log('Project changed:', project);
      const updatedTechnologies = Array.isArray(project.technologies) ? [...project.technologies] : [];
      console.log('Updating form with technologies:', updatedTechnologies);
      setFormData(prevData => ({
        ...prevData,
        title: project.title || prevData.title || '',
        description: project.description || prevData.description || '',
        image: project.image || prevData.image || '',
        technologies: updatedTechnologies
      }));
    }, [project]);
    const [techInput, setTechInput] = useState('');

    const handleTechKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && techInput.trim()) {
        e.preventDefault();
        const newTech = techInput.trim();
        // Prevent duplicates
        const currentTechnologies = formData.technologies || [];
        if (!currentTechnologies.includes(newTech)) {
          setFormData({
            ...formData,
            technologies: [...currentTechnologies, newTech],
          });
        }
        setTechInput('');
      }
    };

    const removeTech = (index: number) => {
      const currentTechnologies = formData.technologies || [];
      setFormData({
        ...formData,
        technologies: currentTechnologies.filter((_, i) => i !== index)
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Technologies
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value.slice(0, 30))}
                  onKeyDown={handleTechKeyDown}
                  placeholder="e.g. React, Node.js, TypeScript"
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-[#5C4B37]"
                />
                <button
                  onClick={() => {
                    if (techInput.trim()) {
                      const newTech = techInput.trim();
                      const currentTechnologies = formData.technologies || [];
                      if (!currentTechnologies.includes(newTech)) {
                        setFormData({
                          ...formData,
                          technologies: [...currentTechnologies, newTech],
                        });
                        setTechInput('');
                        toast.success(`Added ${newTech}`);
                      } else {
                        toast.error('Technology already added');
                      }
                    }
                  }}
                  type="button"
                  className="p-2 bg-[#2C1810] text-white rounded hover:bg-[#5C4B37] transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Type a technology and press Enter or click + to add. Click × to remove.
              </p>
              
              {/* Common technologies suggestions */}
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Common technologies:</p>
                <div className="flex flex-wrap gap-2">
                  {["React", "Node.js", "TypeScript", "JavaScript", "HTML", "CSS", "MongoDB", "PostgreSQL", "Python", "Docker"].map((tech) => (
                    !formData.technologies?.includes(tech) && (
                      <button
                        key={tech}
                        onClick={() => {
                          const currentTechnologies = formData.technologies || [];
                          setFormData({
                            ...formData,
                            technologies: [...currentTechnologies, tech],
                          });
                          toast.success(`Added ${tech}`);
                        }}
                        className="px-2 py-1 text-sm border border-[#2C1810] text-[#2C1810] rounded-full hover:bg-[#2C1810] hover:text-white transition-colors"
                      >
                        + {tech}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Selected technologies */}
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.technologies?.map((tech: string, index: number) => (
                  <span
                    key={index}
                    className="bg-[#2C1810] text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 group transition-all hover:bg-opacity-90"
                  >
                    {tech}
                    <button
                      onClick={() => {
                        removeTech(index);
                        toast.success(`Removed ${tech}`);
                      }}
                      className="hover:bg-red-500 hover:text-white rounded-full p-1 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              
              {formData.technologies?.length === 0 && (
                <p className="text-sm text-gray-500 italic mt-2">
                  No technologies added yet
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
          <button
            onClick={() => {
              const dataToSave = {
                ...formData,
                technologies: formData.technologies || []
              };
              console.log('Saving project with data:', dataToSave);
              onSave(dataToSave);
            }}
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
              console.log('Modal save - form data:', formData);
              console.log('Current technologies:', formData.technologies);

              // Always use the form's technologies array
              const dataToSend = {
                ...formData,
                technologies: formData.technologies || []
              };
              
              console.log('Sending to API:', dataToSend);
              console.log('Technologies being sent:', dataToSend.technologies);
              if (editingProject) {
                handleUpdateProject(editingProject._id, dataToSend);
              } else {
                handleCreateProject(dataToSend);
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
