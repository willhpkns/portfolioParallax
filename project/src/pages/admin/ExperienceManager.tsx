import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { experienceApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { DraggableItems } from '../../components/admin/DraggableItems';
import { SortableItem } from '../../components/admin/SortableItem';

interface Experience {
  _id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

interface ExperienceFormData {
  _id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

export default function ExperienceManager() {
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<ExperienceFormData>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    technologies: []
  });

  useEffect(() => {
    loadExperience();
  }, []);

  const loadExperience = async () => {
    try {
      const data = await experienceApi.getAll();
      setExperience(data);
    } catch (error) {
      toast.error('Failed to load experience data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentExperience._id) {
        await experienceApi.update(currentExperience._id, currentExperience);
        toast.success('Experience updated successfully');
      } else {
        await experienceApi.create(currentExperience);
        toast.success('Experience added successfully');
      }
      resetForm();
      loadExperience();
    } catch (error) {
      toast.error('Failed to save experience');
    }
  };

  const handleEdit = (exp: Experience) => {
    setIsEditing(true);
    setCurrentExperience(exp);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this experience entry?')) {
      try {
        await experienceApi.delete(id);
        toast.success('Experience deleted successfully');
        loadExperience();
      } catch (error) {
        toast.error('Failed to delete experience');
      }
    }
  };

  const handleOrderChange = async (newOrder: Experience[]) => {
    try {
      // Update the array order property for each item
      const updatedOrder = newOrder.map((item, index) => ({
        ...item,
        order: index
      }));
      await experienceApi.reorder(updatedOrder);
      setExperience(updatedOrder);
      toast.success('Order saved');
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      technologies: []
    });
  };

  const handleTechnologiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const techs = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
    setCurrentExperience({ ...currentExperience, technologies: techs });
  };

  const renderExperienceItem = (exp: Experience) => {
    const dragHandle = (
      <div className="text-gray-400 opacity-50 group-hover:opacity-100 cursor-grab my-6">
        <GripVertical size={20} />
      </div>
    );

    return (
      <SortableItem key={exp._id} id={exp._id} handle={dragHandle}>
        <div className="bg-white p-6 rounded-lg shadow-md group w-full">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-[#2C1810]">{exp.company}</h3>
              <p className="text-gray-600">{exp.position}</p>
              <p className="text-gray-500">
                {new Date(exp.startDate).toLocaleDateString()} - 
                {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
              </p>
              <p className="mt-2 text-gray-700">{exp.description}</p>
              {exp.technologies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {exp.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-sm text-gray-700 rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(exp)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={() => handleDelete(exp._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </SortableItem>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#2C1810]">Manage Experience</h1>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C1810] text-white rounded-lg hover:bg-[#5C4B37]"
          >
            <Plus size={20} />
            Add New
          </button>
        </div>

        {/* Experience Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                value={currentExperience.company}
                onChange={(e) => setCurrentExperience({...currentExperience, company: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                value={currentExperience.position}
                onChange={(e) => setCurrentExperience({...currentExperience, position: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={currentExperience.startDate}
                onChange={(e) => setCurrentExperience({...currentExperience, startDate: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={currentExperience.endDate}
                onChange={(e) => setCurrentExperience({...currentExperience, endDate: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Technologies</label>
              <input
                type="text"
                value={currentExperience.technologies.join(', ')}
                onChange={handleTechnologiesChange}
                placeholder="Comma-separated list of technologies"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={currentExperience.description}
              onChange={(e) => setCurrentExperience({...currentExperience, description: e.target.value})}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2C1810] text-white rounded-md hover:bg-[#5C4B37]"
            >
              {isEditing ? 'Update' : 'Add'} Experience
            </button>
          </div>
        </form>

        {/* Experience List */}
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <DraggableItems
            items={experience}
            onOrderChange={handleOrderChange}
            renderItem={renderExperienceItem}
          />
        )}
      </div>
    </AdminLayout>
  );
}
