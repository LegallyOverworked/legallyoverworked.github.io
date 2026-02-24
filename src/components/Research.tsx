import React from 'react';
import { BookOpen, Users, FileText, Award, Database, Microscope } from 'lucide-react';
import { ResearchCard } from './cards/ResearchCard';
import { PublicationCard } from './cards/PublicationCard';

export default function Research() {
  const projects = [
    {
      title: "Enzymares Project",
      journal: "Catalisti/UGent Marine Project (2021-2025)",
      year: 2025,
      citations: 0,
      link: "https://www.ugent.be/marine/en/partnerships/enzymares",
      description: "End-to-end enzyme selection platform for industry: unified multi-source database at thousands of sequences scale, full-stack annotation toolbox (React.js web app + CLI + Dockerised/Singularity ML backend)"
    },
    {
      title: "Optimising the enzyme discovery pathway through omics integration and AI",
      journal: "FWO - SB Research Grant",
      year: 2026,
      citations: 0,
      link: "#",
      description: "Competitive national FWO-SB grant advancing AI-driven enzyme discovery: above SOTA temperature and pH optimum prediction, fine-tuned protein language model pipeline for large-scale EC classification"
    }
  ];

  const researchAreas = [
    {
      title: "Protein Engineering",
      description: "Computational protein engineering, enzyme annotation, proteomics — building predictive models for enzyme temperature, pH, EC classification and solubility",
      icon: Microscope
    },
    {
      title: "Machine Learning",
      description: "Applied Deep Learning, protein language model fine-tuning (ESM-2, ProtTrans via PEFT/LoRA), population-based training for neural architecture search, imbalanced regression",
      icon: BookOpen
    },
    {
      title: "Data Mining & Databases",
      description: "Multi-source relational database design (UniProt, BRENDA, Rhea integration), data mining, SQL — full-stack search interfaces and containerised ML serving pipelines",
      icon: Database
    }
  ];

  return (
    <div className="min-h-screen p-4 pt-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Research Work
        </h2>

        <div className="mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Bioinformatician (M.Sc.) and PhD researcher at STADIUS (Engineering) and CSB (Bioscience Engineering), KU Leuven. 
            Broad background in applied machine learning, deep learning development, and statistical analysis in life sciences, 
            with computational protein engineering as the core research topic.
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
                <li>HPC Computing</li>
                <li>MLOps & DevOps</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Machine Learning</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                <li>Deep Learning</li>
                <li>Neural Networks</li>
                <li>LLM Fine-tuning</li>
                <li>PEFT (LoRA)</li>
                <li>Neural Architecture Search</li>
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
