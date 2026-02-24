import React, { useState, useEffect } from 'react';
import profileImage from '../assets/running101k.jpeg';
import homeAdd1 from '../assets/home_page_add1.jpg';
import homeAdd2 from '../assets/home_page_add2.jpg';
import homeAdd3 from '../assets/home_page_add3.jpg';
import homeAdd5 from '../assets/home_page_add5.jpg';
import { 
  Blocks, 
  GitFork, 
  GraduationCap, 
  GitBranch,
  X,
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { MolecularNavBar } from './MolecularNavBar';
import BackgroundEffects from './BackgroundEffects';

type DialogContent = Array<{
  label?: string;
  value?: string;
  institution?: string;
  degree?: string;
  duration?: string;
  topic?: string;
  achievements?: string[];
  platform?: string;
  count?: string;
  topLangs?: string[];
}> | null;

export default function Home() {
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showCircularImages, setShowCircularImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    type IconCategory = 'DNA' | 'Proteins' | 'Enzymes' | 'AI';
  const [activeTab, setActiveTab] = useState<IconCategory>('DNA');
  const categories: IconCategory[] = ['DNA', 'Proteins', 'Enzymes', 'AI'];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const additionalImages = [
    { src: homeAdd1, position: '-left-28 top-1/3' },
    { src: homeAdd2, position: '-left-16 top-1/2' },
    { src: homeAdd3, position: '-left-24 top-2/3' },
    { src: homeAdd5, position: '-right-16 top-1/2' },
  ];

  const handleImageClick = () => {
    if (isSmallScreen) {
      setShowGallery(true);
    } else {
      setShowCircularImages(!showCircularImages);
    }
  };

  const statsData = [
    {
      title: 'Projects',
      value: '20+',
      details: [
        { label: 'Active Projects', value: '7' },
        { label: 'Completed', value: '20+' },
        { label: 'Open Source', value: 'Coming Soon!' },
        { label: 'Private', value: 'hehe can\'t tell you :-)' }
      ],
      icon: (
        <Blocks className="h-6 w-6 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text" />
      )
    },
    {
      title: 'Contributions',
      value: '1000+',
      details: [
        { label: 'Issues Resolved', value: '∞' },
        { label: 'Documentation', value: 'Too Little!' },
        { label: 'Lines of Code', value: '100k+' },
        { label: 'Commits', value: '1000+' },
        { label: 'Tools, Libraries and Frameworks used', value: 'Too Many!' }
      ],
      icon: (
        <GitFork className="h-6 w-6 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text" />
      )
    },
    {
      title: 'Experience',
      value: '4+ years',
      details: [
        { 
          institution: 'UAntwerp',
          degree: 'Biochemistry and Biotechnology, BSc',
          duration: '3 years (2016-2019)',
          achievements: ['Summa Cum Laude', 'Honours College (2017-2019)', 'Research Internship (2018)']
        },
        {
          institution: 'KU Leuven',
          degree: 'Bioinformatics, MSc',
          duration: '2 years (2019-2021)',
          achievements: ['Cum Laude', 'Thesis: Exploring mutational patterns of evolution experiments']
        },
        {
          institution: 'PhD Candidate @KU Leuven',
          degree: '@Bioscience Engineering (CMPG) @Electrical Engineering (ESAT)',
          duration: '4+ years (2021-present)',
          topic: 'Computational enzyme annotation: AI-driven enzyme discovery through ML for classification, parameter prediction and protein engineering',
          achievements: ['Applied Deep Learning & PEFT', 'Protein Language Models (ESM-2, ProtTrans)', 'SOTA Predictive Models', 'Full-stack Platform Engineering', 'Database Design', 'Teaching']
        }
      ],
      icon: (
        <GraduationCap className="h-6 w-6 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text" />
      )
    },
    {
      title: 'Repositories',
      value: '31',
      details: [
        { platform: 'GitHub', count: '7', topLangs: ['Python', 'R', 'Java', 'JavaScript'] },
        { platform: 'GitLab', count: '24', topLangs: ['Python', 'R', 'Java'] }
      ],
      icon: (
        <GitBranch className="h-6 w-6 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text" />
      )
    }
  ];

  const ImageGallery = () => (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
      <div className="relative w-full max-w-4xl mx-auto">
        <button
          onClick={() => setShowGallery(false)}
          className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
          title="Close gallery"
          aria-label="Close gallery"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="relative">
          <img
            src={additionalImages[currentImageIndex].src}
            alt={`Gallery image ${currentImageIndex + 1}`}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          
          <button
            onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? additionalImages.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Previous image"
            aria-label="View previous image"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={() => setCurrentImageIndex((prev) => (prev === additionalImages.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Next image"
            aria-label="View next image"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </div>
        
        <div className="flex justify-center mt-4 gap-2">
          {additionalImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentImageIndex === index ? 'bg-white' : 'bg-white/50'
              }`}
              title={`View image ${index + 1}`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderDialogContent = (content: DialogContent) => {
    if (Array.isArray(content)) {
      return (
        <div className="space-y-4">
          {content.map((item, index) => {
            if (item.institution) {
              return (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400">{item.institution}</h4>
                  <p className="text-gray-700 dark:text-gray-300">{item.degree}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.duration}</p>
                  {item.topic && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">{item.topic}</p>
                  )}
                  <ul className="mt-2 list-disc list-inside">
                    {item.achievements?.map((achievement: string, i: number) => (
                      <li key={i} className="text-gray-600 dark:text-gray-400">{achievement}</li>
                    ))}
                  </ul>
                </div>
              );
            } else if (item.platform) {
              return (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400">{item.platform}</h4>
                  <p className="text-gray-700 dark:text-gray-300">Repositories: {item.count}</p>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Top Languages:</span>
                    <div className="flex gap-2 mt-1">
                      {item.topLangs?.map((lang: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={index} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{item.value}</span>
                </div>
              );
            }
          })}
        </div>
      );
    }
    return <p className="text-gray-700 dark:text-gray-300">{content}</p>;
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center p-4 pt-16 overflow-hidden">
      <BackgroundEffects activeTab={activeTab} />
      <MolecularNavBar 
        active={categories.indexOf(activeTab)}
        onActiveChange={(index) => setActiveTab(categories[index])}
      />

      <div className="relative w-96 h-72 flex items-center justify-center mb-6">
        {showCircularImages && !isSmallScreen && (
          <>
            {additionalImages.map((img, index) => (
              <div
                key={index}
                className={`absolute w-28 h-28 ${img.position} transition-all duration-500 transform cursor-pointer
                  hover:scale-110 hover:z-30 hidden lg:block`}
                onClick={() => {
                  setCurrentImageIndex(index);
                  setShowGallery(true);
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-purple-600 rounded-[40%] blur opacity-75" />
                <img
                  src={img.src}
                  alt={`Profile ${index + 1}`}
                  className="w-full h-full object-cover rounded-[40%] relative z-10 border-2 border-white dark:border-gray-800"
                />
              </div>
            ))}
          </>
        )}

        <div 
          className="relative group cursor-pointer z-20" 
          onClick={handleImageClick}
          role="button"
          aria-label={isSmallScreen ? 'View Gallery' : (showCircularImages ? 'Hide Images' : 'Show More')}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-purple-600 rounded-[40%] blur opacity-75" />
          <img
            src={profileImage}
            alt="Profile"
            className="w-64 h-64 object-cover relative z-10 rounded-[40%] object-top border-2 border-white dark:border-gray-800"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-[40%] z-20 flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {isSmallScreen ? 'View Gallery' : (showCircularImages ? 'Hide Images' : 'Show More')}
            </span>
          </div>
        </div>
      </div>

      <h1 className="mt-4 text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Jaldert François
      </h1>

      <p className="mt-1 text-lg text-gray-500 dark:text-gray-400">
        LegallyOverworked
      </p>

      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 text-center max-w-xl font-medium">
        PhD Candidate | Applied Machine Learning, Bioinformatics, Data Science and Database Development
      </p>

      <p className="mt-2 text-base text-gray-500 dark:text-gray-500 text-center max-w-xl">
        Bioinformatician (M.Sc.) and PhD researcher building end-to-end ML pipelines and scientific software tools for computational protein engineering
      </p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-4xl">
        {statsData.map(({ title, value, details, icon }) => (
          <div
            key={title}
            onClick={() => setDialogContent(details)}
            className="relative group cursor-pointer"
            role="button"
            aria-label={`View ${title} details`}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                  {title}
                </h3>
                {icon}
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {dialogContent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setDialogContent(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Details
              </h3>
              <button
                onClick={() => setDialogContent(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Close details"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderDialogContent(dialogContent)}
          </div>
        </div>
      )}

      {showGallery && <ImageGallery />}
    </div>
  );
}
