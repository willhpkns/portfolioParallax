import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Resume from '../Resume';

export default function ResumePreview() {
  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-3xl font-bold text-[#2C1810] mb-8">Resume Preview</h1>
        <div className="bg-[#F5EDE0] rounded-lg shadow-lg">
          <Resume />
        </div>
      </div>
    </AdminLayout>
  );
}
