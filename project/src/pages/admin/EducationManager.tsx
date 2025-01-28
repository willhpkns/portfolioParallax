import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { educationApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { DraggableItems } from '../../components/admin/DraggableItems';

interface Education {
  _id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  order: number;
}

interface EducationFormData {
  _id?: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function EducationManager() {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<EducationFormData>({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  useEffect(() => {
    loadEducation();
  }, []);

  const loadEducation = async () => {
    try {
      const data = await educationApi.getAll();
      setEducation(data);
    } catch (error) {
      toast.error('Failed to load education data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentEducation._id) {
        await educationApi.update(currentEducation._id, currentEducation);
        toast.success('Education updated successfully');
      } else {
        await educationApi.create(currentEducation);
        toast.success('Education added successfully');
      }
      resetForm();
      loadEducation();
    } catch (error) {
      toast.error('Failed to save education');
    }
  };

  const handleEdit = (edu: Education) => {
    setIsEditing(true);
    setCurrentEducation(edu);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      try {
        await educationApi.delete(id);
        toast.success('Education deleted successfully');
        loadEducation();
      } catch (error) {
        toast.error('Failed to delete education');
      }
    }
  };

  const handleOrderChange = async (newOrder: Education[]) => {
    try {
      await educationApi.reorder(newOrder);
      setEducation(newOrder);
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentEducation({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const renderEducationItem = (edu: Education) => (
    <div className="bg-white p-6 rounded-lg shadow-md group">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <GripVertical className="text-gray-400 opacity-0 group-hover:opacity-100 cursor-grab" size={20} />
            <div>
              <h3 className="text-xl font-semibold text-[#2C1810]">{edu.institution}</h3>
              <p className="text-gray-600">{edu.degree} in {edu.field}</p>
              <p className="text-gray-500">
                {new Date(edu.startDate).toLocaleDateString()} - 
                {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
              </p>
              <p className="mt-2 text-gray-700">{edu.description}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(edu)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
          >
            <Edit2 size={20} />
          </button>
          <button
            onClick={() => handleDelete(edu._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#2C1810]">Manage Education</h1>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C1810] text-white rounded-lg hover:bg-[#5C4B37]"
          >
            <Plus size={20} />
            Add New
          </button>
        </div>

        {/* Education Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <input
                type="text"
                value={currentEducation.institution}
                onChange={(e) => setCurrentEducation({...currentEducation, institution: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Degree</label>
              <input
                type="text"
                value={currentEducation.degree}
                onChange={(e) => setCurrentEducation({...currentEducation, degree: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Field of Study</label>
              <input
                type="text"
                value={currentEducation.field}
                onChange={(e) => setCurrentEducation({...currentEducation, field: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={currentEducation.startDate}
                onChange={(e) => setCurrentEducation({...currentEducation, startDate: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={currentEducation.endDate}
                onChange={(e) => setCurrentEducation({...currentEducation, endDate: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={currentEducation.description}
              onChange={(e) => setCurrentEducation({...currentEducation, description: e.target.value})}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
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
              {isEditing ? 'Update' : 'Add'} Education
            </button>
          </div>
        </form>

        {/* Education List */}
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <DraggableItems
            items={education}
            onOrderChange={handleOrderChange}
            renderItem={renderEducationItem}
          />
        )}
      </div>
    </AdminLayout>
  );
}
