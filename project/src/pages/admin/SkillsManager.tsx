import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { skillsApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Skill {
  _id: string;
  category: string;
  name: string;
  level: number;
}

interface SkillFormData {
  _id?: string;
  category: string;
  name: string;
  level: number;
}

const categories = [
  'Programming Languages',
  'Frameworks',
  'Databases',
  'Tools',
  'Other'
];

export default function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<SkillFormData>({
    category: '',
    name: '',
    level: 0
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const data = await skillsApi.getAll();
      setSkills(data);
    } catch (error) {
      toast.error('Failed to load skills data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentSkill._id) {
        await skillsApi.update(currentSkill._id, currentSkill);
        toast.success('Skill updated successfully');
      } else {
        await skillsApi.create(currentSkill);
        toast.success('Skill added successfully');
      }
      resetForm();
      loadSkills();
    } catch (error) {
      toast.error('Failed to save skill');
    }
  };

  const handleEdit = (skill: Skill) => {
    setIsEditing(true);
    setCurrentSkill(skill);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await skillsApi.delete(id);
        toast.success('Skill deleted successfully');
        loadSkills();
      } catch (error) {
        toast.error('Failed to delete skill');
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentSkill({
      category: '',
      name: '',
      level: 0
    });
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#2C1810]">Manage Skills</h1>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C1810] text-white rounded-lg hover:bg-[#5C4B37]"
          >
            <Plus size={20} />
            Add New
          </button>
        </div>

        {/* Skill Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={currentSkill.category}
                onChange={(e) => setCurrentSkill({...currentSkill, category: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Skill Name</label>
              <input
                type="text"
                value={currentSkill.name}
                onChange={(e) => setCurrentSkill({...currentSkill, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Proficiency Level (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={currentSkill.level}
                onChange={(e) => setCurrentSkill({...currentSkill, level: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                required
              />
            </div>
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
              {isEditing ? 'Update' : 'Add'} Skill
            </button>
          </div>
        </form>

        {/* Skills List */}
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-[#2C1810] mb-4">{category}</h2>
              <div className="grid gap-4">
                {categorySkills.map((skill) => (
                  <div key={skill._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-[#2C1810]">{skill.name}</h3>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full ${
                              i < skill.level ? 'bg-[#2C1810]' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(skill._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
