import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { DraggableSections } from '../../components/admin/DraggableSections';
import { educationApi, experienceApi, skillsApi, settingsApi, type ResumeSectionType } from '../../services/api';
import toast from 'react-hot-toast';

interface SectionData {
  education: any[];
  experience: any[];
  skills: any[];
}

export default function ResumePreview() {
  const [sections, setSections] = useState<ResumeSectionType[]>(['education', 'experience', 'skills']);
  const [sectionData, setSectionData] = useState<SectionData>({
    education: [],
    experience: [],
    skills: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get section order
        const order = await settingsApi.getResumeOrder();
        setSections(order);

        // Get all section data in parallel
        const [education, experience, skills] = await Promise.all([
          educationApi.getAll(),
          experienceApi.getAll(),
          skillsApi.getAll()
        ]);

        setSectionData({
          education,
          experience,
          skills
        });
      } catch (error) {
        console.error('Error fetching resume data:', error);
        toast.error('Failed to load resume data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  const handleOrderChange = async (newOrder: ResumeSectionType[]) => {
    try {
      console.log('Saving new order:', newOrder);
      if (isSaving) return;
      
      setIsSaving(true);
      await settingsApi.updateResumeOrder(newOrder);
      setSections(newOrder);
      toast.success('Order saved', { duration: 2000 });
    } catch (error) {
      console.error('Error saving section order:', error);
      toast.error('Failed to save order');
      // Revert to previous order
      setSections(sections);
    } finally {
      setIsSaving(false);
    }
  };

  const renderSection = (section: ResumeSectionType) => {
    const data = sectionData[section];
    return (
      <div className="p-6 w-full">
        <h2 className="text-2xl font-semibold text-[#2C1810] mb-4 capitalize">{section}</h2>
        <div className="space-y-4">
          {data.map((item: any) => (
            <div key={item._id} className="bg-[#E6D5AC]/20 p-4 rounded-lg">
              {section === 'education' && (
                <>
                  <h3 className="text-xl font-medium text-[#5C4B37]">{item.institution}</h3>
                  <p className="text-[#8B7355]">
                    {item.degree} in {item.field}
                  </p>
                </>
              )}
              {section === 'experience' && (
                <>
                  <h3 className="text-xl font-medium text-[#5C4B37]">{item.company}</h3>
                  <p className="text-[#8B7355]">{item.position}</p>
                </>
              )}
              {section === 'skills' && (
                <>
                  <h3 className="text-xl font-medium text-[#5C4B37]">{item.category}</h3>
                  <p className="text-[#8B7355]">{item.name}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4">
          <h1 className="text-3xl font-bold text-[#2C1810] mb-8">Resume Preview</h1>
          <div className="text-center py-8">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-3xl font-bold text-[#2C1810] mb-8">Resume Preview</h1>
        <div className="bg-[#F5EDE0] rounded-lg shadow-lg p-6">
          <DraggableSections 
            sections={sections}
            onOrderChange={handleOrderChange}
          >
            {renderSection}
          </DraggableSections>
        </div>
      </div>
    </AdminLayout>
  );
}
