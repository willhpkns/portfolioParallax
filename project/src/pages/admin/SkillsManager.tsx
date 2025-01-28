import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { skillsApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { DraggableItems } from '../../components/admin/DraggableItems';
import { SortableItem } from '../../components/admin/SortableItem';

interface Skill {
  _id: string;
  category: string;
  items: string[];
  order: number;
}

interface SkillFormData {
  _id?: string;
  category: string;
  items: string[];
}

export default function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<SkillFormData>({
    category: '',
    items: []
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
        toast.success('Skills updated successfully');
      } else {
        await skillsApi.create(currentSkill);
        toast.success('Skills added successfully');
      }
      resetForm();
      loadSkills();
    } catch (error) {
      toast.error('Failed to save skills');
    }
  };

  const handleEdit = (skill: Skill) => {
    setIsEditing(true);
    setCurrentSkill(skill);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this skills entry?')) {
      try {
        await skillsApi.delete(id);
        toast.success('Skills deleted successfully');
        loadSkills();
      } catch (error) {
        toast.error('Failed to delete skills');
      }
    }
  };

  const handleOrderChange = async (newOrder: Skill[]) => {
    try {
      await skillsApi.reorder(newOrder);
      setSkills(newOrder);
      toast.success('Order saved');
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentSkill({
      category: '',
      items: []
    });
  };

  const handleItemsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const items = e.target.value.split('\n').map(item => item.trim()).filter(Boolean);
    setCurrentSkill({ ...currentSkill, items });
  };

  const renderSkillItem = (skill: Skill) => {
    const dragHandle = (
      <div className="text-gray-400 opacity-50 group-hover:opacity-100 cursor-grab my-6">
        <GripVertical size={20} />
      </div>
    );

    return (
      <SortableItem key={skill._id} id={skill._id} handle={dragHandle}>
        <div className="bg-white p-6 rounded-lg shadow-md group w-full">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-[#2C1810]">{skill.category}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {skill.items.map((item, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-sm text-gray-700 rounded-md"
                  >
                    {item}
                  </span>
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
        </div>
      </SortableItem>
    );
  };

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

        {/* Skills Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={currentSkill.category}
              onChange={(e) => setCurrentSkill({...currentSkill, category: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
              placeholder="e.g., Programming Languages, Tools, Frameworks"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Skills</label>
            <p className="text-sm text-gray-500 mb-2">One skill per line</p>
            <textarea
              value={currentSkill.items.join('\n')}
              onChange={handleItemsChange}
              rows={5}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
              placeholder="JavaScript&#10;TypeScript&#10;React&#10;Node.js"
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
              {isEditing ? 'Update' : 'Add'} Skills
            </button>
          </div>
        </form>

        {/* Skills List */}
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <DraggableItems
            items={skills}
            onOrderChange={handleOrderChange}
            renderItem={renderSkillItem}
          />
        )}
      </div>
    </AdminLayout>
  );
}
