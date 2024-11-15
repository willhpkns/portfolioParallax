import ScrollReveal from '../components/ScrollReveal';

const Resume = () => {
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
                  <div className="bg-[#E6D5AC]/20 p-6 rounded-lg">
                    <h4 className="text-xl font-medium text-[#5C4B37]">University of Example</h4>
                    <p className="text-[#8B7355] mt-1">Bachelor of Computer Science • 2019 - 2023</p>
                    <ul className="list-disc list-inside text-[#5C4B37] mt-3 space-y-1">
                      <li>Graduated with First Class Honours</li>
                      <li>Specialized in Software Engineering and AI</li>
                      <li>Led the University Programming Club</li>
                    </ul>
                  </div>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-[#5C4B37]">Frontend</h4>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'Tailwind CSS'].map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-[#E6D5AC] text-[#2C1810] rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-[#5C4B37]">Backend</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Node.js', 'Python', 'SQL'].map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-[#E6D5AC] text-[#2C1810] rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-[#5C4B37]">Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Git', 'Docker', 'AWS'].map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-[#E6D5AC] text-[#2C1810] rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
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