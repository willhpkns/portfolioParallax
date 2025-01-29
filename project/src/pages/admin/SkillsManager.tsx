import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { skillsApi, type SkillItem, type Skill } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { DraggableItems } from '../../components/admin/DraggableItems';
import { SortableItem } from '../../components/admin/SortableItem';
import SkillLevelSelector from '../../components/admin/SkillLevelSelector';
import CategoryAutocomplete from '../../components/admin/CategoryAutocomplete';

interface SkillFormData {
  _id?: string;
  category: string;
  items: SkillItem[];
}

export default function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentSkill, setCurrentSkill] = useState<SkillItem>({
    name: '',
    level: 3
  });
  const [editingSkill, setEditingSkill] = useState<SkillFormData | null>(null);

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

  const existingCategories = useMemo(() => 
    Array.from(new Set(skills.map(s => s.category)))
  , [skills]);

  const handleAddSkill = () => {
    if (!currentCategory) {
      toast.error('Please enter a category first');
      return;
    }
    if (!currentSkill.name.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    // Find any existing category (case-insensitive)
    const existingCategory = existingCategories.find(
      c => c.toLowerCase() === currentCategory.toLowerCase()
    );

    const skillData = editingSkill ?? {
      category: existingCategory || currentCategory,
      items: []
    };

    const updatedSkill = {
      ...skillData,
      items: [...skillData.items, currentSkill]
    };

    saveSkill(updatedSkill);
    setCurrentSkill({ name: '', level: 3 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSkill.name.trim()) {
      handleAddSkill();
    }
  };

  const saveSkill = async (skillData: Omit<SkillFormData, '_id'> & { _id?: string }) => {
    try {
      if (skillData._id) {
        await skillsApi.update(skillData._id, skillData);
        toast.success('Skills updated successfully');
      } else {
        await skillsApi.create(skillData);
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
    setEditingSkill(skill);
    setCurrentCategory(skill.category);
  };

  const handleRemoveSkill = (index: number) => {
    if (!editingSkill) return;

    const updatedItems = [...editingSkill.items];
    updatedItems.splice(index, 1);
    saveSkill({ ...editingSkill, items: updatedItems });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this skills category?')) {
      try {
        await skillsApi.delete(id);
        toast.success('Skills category deleted successfully');
        loadSkills();
      } catch (error) {
        toast.error('Failed to delete skills category');
      }
    }
  };

  const handleOrderChange = async (newOrder: Skill[]): Promise<void> => {
    try {
      const updatedOrder: Skill[] = newOrder.map((item, index) => ({
        ...item,
        order: index
      }));
      await skillsApi.reorder(updatedOrder);
      setSkills(updatedOrder);
      toast.success('Order saved');
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingSkill(null);
    setCurrentCategory('');
    setCurrentSkill({ name: '', level: 3 });
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
            <div className="w-full">
              <h3 className="text-xl font-semibold text-[#2C1810]">{skill.category}</h3>
              <div className="mt-4 space-y-2 w-full">
                {[...skill.items].sort((a, b) => {
                  // Sort by level first (descending)
                  if (b.level !== a.level) {
                    return b.level - a.level;
                  }
                  // Then by name (alphabetically)
                  return a.name.localeCompare(b.name);
                }).map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 rounded-lg flex justify-between items-center"
                  >
                    <span className="text-gray-700">{item.name}</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < item.level ? 'bg-[#2C1810]' : 'bg-[#E6D5AC]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
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
            <CategoryAutocomplete
              value={currentCategory}
              onChange={setCurrentCategory}
              suggestions={existingCategories}
              placeholder="e.g., Programming Languages, Tools, Frameworks"
              disabled={isEditing}
              className="mt-1"
            />
          </div>
          
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Add Skills</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={currentSkill.name}
                  onChange={(e) => setCurrentSkill({ ...currentSkill, name: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C4B37] focus:ring-[#5C4B37]"
                  placeholder="Enter skill name"
                />
              </div>
              <SkillLevelSelector
                level={currentSkill.level}
                onLevelChange={(level) => setCurrentSkill({ ...currentSkill, level })}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-[#2C1810] text-white rounded-md hover:bg-[#5C4B37]"
              >
                Add Skill
              </button>
            </div>
          </div>

          {editingSkill && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Current Skills</h4>
              <div className="space-y-2">
                {editingSkill.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <span className="text-gray-700">{item.name}</span>
                    <div className="flex gap-2 items-center">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < item.level ? 'bg-[#2C1810]' : 'bg-[#E6D5AC]'
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
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
              {isEditing ? 'Update' : 'Save'} Category
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
