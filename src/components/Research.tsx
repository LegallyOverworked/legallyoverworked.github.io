import React from 'react';
import { BookOpen, Users, FileText, Award, Database, Microscope } from 'lucide-react';
import { ResearchCard } from './cards/ResearchCard';
import { PublicationCard } from './cards/PublicationCard';

export default function Research() {
  const projects = [
    {
      title: "Enzymares Project",
      journal: "Catalisti Project (2021-2024)",
      year: 2024,
      citations: 0,
      link: "https://catalisti.be/project/enzymares/",
      description: "Development of a toolbox for enzyme selection, including custom database integration and ML models for enzyme parameter prediction"
    },
    {
      title: "Optimising the enzyme discovery pathway through omics integration and AI",
      journal: "FWO - SB Research Grant",
      year: 2026,
      citations: 0,
      link: "#",
      description: "Research on enzyme classification, reaction parameter prediction, and substrate affinity using machine learning approaches"
    }
  ];

  const researchAreas = [
    {
      title: "Protein Engineering",
      description: "Protein/Enzyme Engineering, Proteomics, Computational Protein annotation",
      icon: Microscope
    },
    {
      title: "Machine Learning",
      description: "Applied Deep Learning (ANN, CNN, GNN), neural network optimisation & LLM fine-tuning",
      icon: BookOpen
    },
    {
      title: "Data Mining & Databases",
      description: "Data mining and database development (SQL, NoSQL and Graph databases)",
      icon: Database
    }
  ];

  return (
    <div className="min-h-screen p-4 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg mb-8 text-center text-xl font-bold">
          Update Incoming!
        </div>

        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Research Work
        </h2>

        <div className="mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            PhD Candidate in Bioscience Engineering (Bioinformatics) at STADIUS (Engineering) and CSB (Bioscience Engineering), 
            working on Protein Engineering, Applied Machine Learning and Statistical Analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {researchAreas.map((area) => (
            <ResearchCard key={area.title} {...area} />
          ))}
        </div>

        <h3 className="text-2xl font-bold mb-6 flex items-center">
          <Award className="h-6 w-6 mr-2 text-blue-600" />
          Current Projects
        </h3>

        <div className="space-y-6">
          {projects.map((pub) => (
            <PublicationCard key={pub.title} {...pub} />
          ))}
        </div>

        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Skills & Expertise</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Technical</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                <li>Python</li>
                <li>R</li>
                <li>Bash</li>
                <li>SQL</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Machine Learning</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                <li>Deep Learning</li>
                <li>Neural Networks</li>
                <li>LLM Fine-tuning</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Bioinformatics</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                <li>Protein Engineering</li>
                <li>Proteomics</li>
                <li>Enzyme Analysis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Data Analysis</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                <li>Statistical Analysis</li>
                <li>Data Mining</li>
                <li>Database Design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
