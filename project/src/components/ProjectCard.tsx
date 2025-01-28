import React from 'react';
import ScrollReveal from './ScrollReveal';

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  index: number;
}

export default function ProjectCard({ title, description, image, technologies, index }: ProjectCardProps) {
  return (
    <ScrollReveal className={`transition-all duration-500 delay-${index * 100}`}>
      <div className="bg-white rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-300 shadow-xl">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 text-black">{title}</h3>
          <p className="text-black mb-4">{description}</p>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-sm bg-[#5C4B37] text-white rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
