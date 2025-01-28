import { useState, useEffect } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { educationApi, skillsApi } from '../services/api';

interface Education {
  _id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Skill {
  _id: string;
  category: string;
  name: string;
  level: number;
}

const Resume = () => {
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [educationData, skillsData] = await Promise.all([
          educationApi.getAll(),
          skillsApi.getAll()
        ]);
        setEducation(educationData);
        setSkills(skillsData);
      } catch (error) {
        console.error('Error fetching resume data:', error);
      }
    };

    fetchData();
  }, []);

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="min-h-screen bg-[#F5EDE0] py-20 px-4 md:px-20">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-4xl font-bold text-[#2C1810] mb-8">Resume</h2>
        </ScrollReveal>
        <ScrollReveal>
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="space-y-8">
              {/* Education Section */}
              <div>
                <h3 className="text-2xl font-semibold text-[#2C1810] mb-6">Education</h3>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu._id} className="bg-[#E6D5AC]/20 p-6 rounded-lg">
                      <h4 className="text-xl font-medium text-[#5C4B37]">{edu.institution}</h4>
                      <p className="text-[#8B7355] mt-1">
                        {edu.degree} in {edu.field} • {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                      </p>
                      {edu.description && (
                        <p className="text-[#5C4B37] mt-3">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Section */}
              <div>
                <h3 className="text-2xl font-semibold text-[#2C1810] mb-6">Experience</h3>
                <div className="space-y-4">
                  <div className="bg-[#E6D5AC]/20 p-6 rounded-lg">
                    <h4 className="text-xl font-medium text-[#5C4B37]">Tech Company</h4>
                    <p className="text-[#8B7355] mt-1">Software Engineer • 2023 - Present</p>
                    <ul className="list-disc list-inside text-[#5C4B37] mt-3 space-y-1">
                      <li>Developed and maintained full-stack web applications</li>
                      <li>Implemented CI/CD pipelines reducing deployment time by 50%</li>
                      <li>Collaborated with cross-functional teams to deliver features</li>
                    </ul>
                  </div>
                  <div className="bg-[#E6D5AC]/20 p-6 rounded-lg">
                    <h4 className="text-xl font-medium text-[#5C4B37]">Startup Inc</h4>
                    <p className="text-[#8B7355] mt-1">Software Developer Intern • 2022</p>
                    <ul className="list-disc list-inside text-[#5C4B37] mt-3 space-y-1">
                      <li>Built responsive web interfaces using React and TypeScript</li>
                      <li>Optimized database queries improving performance by 30%</li>
                      <li>Participated in code reviews and agile development processes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div>
                <h3 className="text-2xl font-semibold text-[#2C1810] mb-6">Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(groupedSkills).map(([category, skills]) => (
                    <div key={category} className="space-y-4">
                      <h4 className="font-medium text-[#5C4B37]">{category}</h4>
                      <div className="space-y-3">
                        {skills.map((skill) => (
                          <div key={skill._id} className="bg-[#E6D5AC]/20 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[#2C1810] font-medium">{skill.name}</span>
                              <span className="text-[#5C4B37] text-sm">Level {skill.level}/5</span>
                            </div>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1.5 flex-1 rounded-full ${
                                    i < skill.level ? 'bg-[#2C1810]' : 'bg-[#E6D5AC]'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Resume;
