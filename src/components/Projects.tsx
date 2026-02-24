import React from 'react';
import { Clock } from 'lucide-react';

export default function Projects() {
  const projects = [
    {
      title: "Large Language Model Research",
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=400",
      tags: ["PyTorch", "Transformers", "LLM", "Python"],
      readTime: "15 min read",
    },
    {
      title: "Computational Enzyme Annotation",
      image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?auto=format&fit=crop&q=80&w=400",
      tags: ["Python", "OpenCV", "TensorFlow", "Deep Learning"],
      readTime: "7 min read",
    },
    {
      title: "Protein Rerepresentation Learning",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
      tags: ["Scikit-Learn", "R", "Machine Learning", "PLM"],
      readTime: "10 min read",
    }
  ];

  return (
    <div className="min-h-screen p-4 pt-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg opacity-60 pointer-events-none cursor-default select-none"
            >
              <div className="relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover grayscale"
                />
                {/* Read-time banner */}
                <span className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                  <Clock className="h-3 w-3" />
                  {project.readTime}
                </span>
              </div>

              <div className="p-6">
                <div className="mb-2">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
