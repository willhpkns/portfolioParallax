import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { aboutApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

interface AboutData {
  name: string;
  position: string;
  description: string[];
  profileImage: string;
  _id?: string;
}

export default function AboutManager() {
  const [name, setName] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [description, setDescription] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAboutData();
  }, []);

  const loadAboutData = async () => {
    try {
      const data = await aboutApi.get();
      setName(data?.name || "");
      setPosition(data?.position || "");
      setDescription(data?.description || []);
      setProfileImage(data?.profileImage || "");
    } catch (error) {
      console.error('Error loading about data:', error);
      toast.error('Failed to load about data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddParagraph = () => {
    setDescription([...description, '']);
  };

  const handleRemoveParagraph = (index: number) => {
    const newDescription = description.filter((_, i) => i !== index);
    setDescription(newDescription);
  };

  const handleParagraphChange = (index: number, value: string) => {
    const newDescription = [...description];
    newDescription[index] = value;
    setDescription(newDescription);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await aboutApi.update({
        name,
        position,
        description: description.filter(p => p.trim() !== ''),
        profileImage
      });
      toast.success('About section updated successfully');
    } catch (error) {
      console.error('Error updating about section:', error);
      toast.error('Failed to update about section');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#2C1810]">About Section</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#2C1810]">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C1810] mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5C4B37] focus:border-[#5C4B37]"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C1810] mb-1">Position</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5C4B37] focus:border-[#5C4B37]"
                  placeholder="Enter your position"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C1810] mb-1">Profile Image URL</label>
                <input
                  type="text"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5C4B37] focus:border-[#5C4B37]"
                  placeholder="Enter profile image URL"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#2C1810]">Description</h2>
              <button
                type="button"
                onClick={handleAddParagraph}
                className="flex items-center gap-2 px-4 py-2 bg-[#2C1810] text-white rounded-lg hover:bg-[#5C4B37] transition-colors"
              >
                <Plus size={18} />
                Add Paragraph
              </button>
            </div>

            {description.map((paragraph, index) => (
              <div key={index} className="flex gap-4">
                <textarea
                  value={paragraph}
                  onChange={(e) => handleParagraphChange(index, e.target.value)}
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#5C4B37] focus:border-[#5C4B37]"
                  rows={4}
                  placeholder="Enter paragraph text..."
                />
                <button
                  type="button"
                  onClick={() => handleRemoveParagraph(index)}
                  className="self-start p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 bg-[#2C1810] text-white rounded-lg hover:bg-[#5C4B37] transition-colors ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
