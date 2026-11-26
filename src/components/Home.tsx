import React, { useState, useEffect } from 'react';
import profileImage from '../assets/running101k.webp';
import homeAdd1 from '../assets/home_page_add1.webp';
import homeAdd2 from '../assets/home_page_add2.webp';
import homeAdd3 from '../assets/home_page_add3.webp';
import homeAdd5 from '../assets/home_page_add5.webp';
import homeAdd1Thumb from '../assets/home_page_add1_thumb.webp';
import homeAdd2Thumb from '../assets/home_page_add2_thumb.webp';
import homeAdd3Thumb from '../assets/home_page_add3_thumb.webp';
import homeAdd5Thumb from '../assets/home_page_add5_thumb.webp';
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
import { FOCUS_AREAS } from './focusAreas';
import FocusBackground from './FocusBackground';
import { SCENES } from './backgrounds';
import ContributionHeatmap from './ContributionHeatmap';
import WeeklyActivity from './WeeklyActivity';
import { activityRhythm, activityStats, commitCount, sumField } from '../data/stats';

const EXPERIENCE_START = new Date('2021-10-01');
const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

const FALLBACK_REPOS = { github: 7, gitlab: 24 };

const formatCount = (count: number) => count.toLocaleString('en');
const formatDays = (count: number) => `${formatCount(count)} day${count === 1 ? '' : 's'}`;
const formatDay = (isoDay: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${isoDay}T00:00:00Z`),
  );

type DialogContent = Array<{
  heading?: string;
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
  const [activeArea, setActiveArea] = useState(0);
  const focusArea = FOCUS_AREAS[activeArea];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const additionalImages = [
    { src: homeAdd1, thumb: homeAdd1Thumb, position: '-left-28 top-1/4' },
    { src: homeAdd2, thumb: homeAdd2Thumb, position: '-left-20 top-2/3' },
    { src: homeAdd3, thumb: homeAdd3Thumb, position: '-right-28 top-1/4' },
    { src: homeAdd5, thumb: homeAdd5Thumb, position: '-right-20 top-2/3' },
  ];

  const handleImageClick = () => {
    if (isSmallScreen) {
      setShowGallery(true);
    } else {
      setShowCircularImages(!showCircularImages);
    }
  };

  const { github, gitlab } = activityStats.sources;
  const githubCommits = commitCount(github);
  const gitlabCommits = commitCount(gitlab);
  const hasLiveCommits = githubCommits !== null || gitlabCommits !== null;
  const totalCommits = (githubCommits ?? 0) + (gitlabCommits ?? 0);
  const commitsCaption =
    hasLiveCommits && gitlabCommits === null
      ? 'last 12 months · GitHub only'
      : hasLiveCommits && githubCommits === null
        ? 'last 12 months · GitLab only'
        : 'last 12 months';
  const totalContributions = (github?.contributions ?? 0) + (gitlab?.contributions ?? 0);
  const githubRepos = github?.repos ?? FALLBACK_REPOS.github;
  const gitlabRepos = gitlab?.repos ?? FALLBACK_REPOS.gitlab;
  const rhythm = activityRhythm(activityStats);

  const liveRow = (label: string, value: number | null) =>
    value ? [{ label, value: formatCount(value) }] : [];
  const commitDetails: NonNullable<DialogContent> = hasLiveCommits
    ? [
        { heading: 'Commits · last 12 months' },
        { label: 'Total', value: formatCount(totalCommits) },
        {
          label: github?.privateContributions ? 'GitHub (incl. private activity)' : 'GitHub',
          value: githubCommits !== null ? formatCount(githubCommits) : 'Not synced yet'
        },
        { label: 'GitLab', value: gitlabCommits !== null ? formatCount(gitlabCommits) : 'Not synced yet' },
        ...liveRow('Repositories committed to', sumField(activityStats, 'activeRepos')),

        { heading: 'All contributions' },
        { label: 'Total', value: formatCount(totalContributions) },
        ...liveRow('Pull / merge requests opened', sumField(activityStats, 'pullRequests')),
        ...liveRow('Issues opened', sumField(activityStats, 'issues')),
        ...liveRow('Code reviews', sumField(activityStats, 'reviews')),

        ...(rhythm
          ? [
              { heading: 'Rhythm' },
              { label: 'Active days', value: formatDays(rhythm.activeDays) },
              { label: 'Longest streak', value: formatDays(rhythm.longestStreak) },
              { label: 'Current streak', value: formatDays(rhythm.currentStreak) },
              ...(rhythm.busiestDay
                ? [
                    {
                      label: 'Busiest day',
                      value: `${formatDay(rhythm.busiestDay.date)} · ${formatCount(rhythm.busiestDay.count)}`
                    }
                  ]
                : []),
              ...(rhythm.busiestWeekday ? [{ label: 'Most active weekday', value: rhythm.busiestWeekday }] : [])
            ]
          : [])
      ]
    : [{ label: 'Live GitHub + GitLab data', value: 'Not synced yet' }];

  const activeProjects = sumField(activityStats, 'activeProjects');
  const platformRow = (label: string, value: number | null | undefined) =>
    typeof value === 'number' ? [{ label, value: formatCount(value) }] : [];
  const projectDetails: NonNullable<DialogContent> =
    activeProjects !== null
      ? [
          { heading: 'Active · last 12 months' },
          { label: 'Projects contributed to', value: formatCount(activeProjects) },
          ...platformRow('GitHub', github?.activeProjects),
          ...platformRow('GitLab', gitlab?.activeProjects),

          { heading: 'All projects' },
          { label: 'Repositories', value: formatCount(githubRepos + gitlabRepos) },
          ...liveRow('Public (open source)', sumField(activityStats, 'publicRepos')),
          ...liveRow('Private', sumField(activityStats, 'privateRepos')),
          ...liveRow('Archived', sumField(activityStats, 'archivedRepos')),
          ...liveRow('Started in the last 12 months (GitHub)', sumField(activityStats, 'newRepos'))
        ]
      : [{ label: 'Live GitHub + GitLab data', value: 'Not synced yet' }];
  const experienceYears = Math.floor((Date.now() - EXPERIENCE_START.getTime()) / MS_PER_YEAR);

  const statsData = [
    {
      title: 'Projects',
      caption: 'active · last 12 months',
      value: activeProjects !== null ? formatCount(activeProjects) : '—',
      details: projectDetails,
      icon: (
        <Blocks className="h-4 w-4 text-brand-700 dark:text-brand-400" />
      )
    },
    {
      title: 'Commits',
      caption: commitsCaption,
      value: hasLiveCommits ? formatCount(totalCommits) : '—',
      details: commitDetails,
      icon: (
        <GitFork className="h-4 w-4 text-brand-700 dark:text-brand-400" />
      )
    },
    {
      title: 'Experience',
      caption: 'since 2021',
      value: `${experienceYears}+ years`,
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
          duration: `${experienceYears}+ years (2021-present)`,
          topic: 'Computational enzyme annotation: AI-driven enzyme discovery through ML for classification, parameter prediction and protein engineering',
          achievements: ['Applied Deep Learning & PEFT', 'Protein Language Models (ESM-2, ProtTrans)', 'SOTA Predictive Models', 'Full-stack Platform Engineering', 'Database Design', 'Teaching']
        }
      ],
      icon: (
        <GraduationCap className="h-4 w-4 text-brand-700 dark:text-brand-400" />
      )
    },
    {
      title: 'Repositories',
      caption: 'GitHub + GitLab',
      value: formatCount(githubRepos + gitlabRepos),
      details: [
        { platform: 'GitHub', count: formatCount(githubRepos), topLangs: ['Python', 'R', 'Java', 'JavaScript'] },
        { platform: 'GitLab', count: formatCount(gitlabRepos), topLangs: ['Python', 'R', 'Java'] }
      ],
      icon: (
        <GitBranch className="h-4 w-4 text-brand-700 dark:text-brand-400" />
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
            decoding="async"
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
            if (item.heading) {
              return (
                <h4
                  key={index}
                  className="pt-2 first:pt-0 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {item.heading}
                </h4>
              );
            } else if (item.institution) {
              return (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <h4 className="text-lg font-semibold text-brand-700 dark:text-brand-400">{item.institution}</h4>
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
                  <h4 className="text-lg font-semibold text-brand-700 dark:text-brand-400">{item.platform}</h4>
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
                  <span className="font-semibold text-brand-700 dark:text-brand-400">{item.value}</span>
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
      <MolecularNavBar active={activeArea} onActiveChange={setActiveArea} />

      <div className="relative w-96 h-72 flex items-center justify-center mb-6">
        <FocusBackground
          key={focusArea.background}
          scene={SCENES[focusArea.background]}
          className="helix-field pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-screen -translate-x-1/2 -translate-y-1/2"
        />
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
                <div className="absolute inset-0 bg-gradient-to-b from-brand-700 to-accent-500 dark:from-brand-500 dark:to-accent-400 rounded-[40%] blur opacity-75" />
                <img
                  src={img.thumb}
                  alt={`Profile ${index + 1}`}
                  width={256}
                  height={256}
                  decoding="async"
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
          <div className="absolute inset-0 bg-gradient-to-b from-brand-700 to-accent-500 dark:from-brand-500 dark:to-accent-400 rounded-[40%] blur opacity-75" />
          <img
            src={profileImage}
            alt="Profile"
            width={640}
            height={960}
            decoding="async"
            className="w-64 h-64 object-cover relative z-10 rounded-[40%] object-top border-2 border-white dark:border-gray-800"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 rounded-[40%] z-20 flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {isSmallScreen ? 'View Gallery' : (showCircularImages ? 'Hide Images' : 'Show More')}
            </span>
          </div>
        </div>
      </div>

      <h1 className="mt-4 text-4xl font-bold bg-gradient-to-r from-brand-800 to-accent-600 dark:from-brand-400 dark:to-accent-300 bg-clip-text text-transparent">
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

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl">
        {statsData.map(({ title, caption, value, details, icon }) => (
          <div
            key={title}
            onClick={() => setDialogContent(details)}
            className="relative group cursor-pointer"
            role="button"
            aria-label={`View ${title} details`}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-700 to-accent-500 dark:from-brand-500 dark:to-accent-400 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative px-4 py-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {title}
                </h3>
                {icon}
              </div>
              <p className="mt-1 text-xl font-bold bg-gradient-to-r from-brand-800 to-accent-600 dark:from-brand-400 dark:to-accent-300 bg-clip-text text-transparent">
                {value}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">{caption}</p>
            </div>
          </div>
        ))}
      </div>

      <ContributionHeatmap stats={activityStats} />
      <WeeklyActivity end={activityStats.range?.to ?? null} />

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
              <h3 className="text-xl font-bold bg-gradient-to-r from-brand-800 to-accent-600 dark:from-brand-400 dark:to-accent-300 bg-clip-text text-transparent">
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
