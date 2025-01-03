import React from 'react';
import { ExternalLink, Github, Star } from 'lucide-react';

export default function Projects() {
  const projects = [
    {
      title: "Large Language Model Research",
      description: "Description coming soon",
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=400",
      tags: ["PyTorch", "Transformers", "LLM", "Python"],
      stars: 10,
      link: "#",
      github: "#"
    },
    {
      title: "Computational Enzyme Annotation",
      description: "Description coming soon",
      image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?auto=format&fit=crop&q=80&w=400",
      tags: ["Python", "OpenCV", "TensorFlow", "Deep Learning"],
      stars: 7,
      link: "#",
      github: "#"
    },
    {
      title: "Protein Rerepresentation Learning",
      description: "Description coming soon",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
      tags: ["Scikit-Learn", "R", "Machine Learning", "PLM"],
      stars: 3,
      link: "#",
      github: "#"
    }
  ];

  return (
    <div className="min-h-screen p-4 pt-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Coming Soon
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative group">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a
                      href={project.link}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="View live demo"
                    >
                      <ExternalLink className="h-5 w-5 text-gray-900" />
                    </a>
                    <a
                      href={project.github}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="View source code"
                    >
                      <Github className="h-5 w-5 text-gray-900" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm">{project.stars}</span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {project.description}
                </p>

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
