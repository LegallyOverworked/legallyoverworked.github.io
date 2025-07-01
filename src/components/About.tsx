import React from 'react';
import {
  Code,
  Coffee,
  Book,
  Plane,
  Briefcase,
  GraduationCap,
  Award,
  Download,
  Dumbbell,
  Compass,
  ScrollText,
  Smile,
  LucideSmile,
  Quote,
  Eye
} from 'lucide-react';

export default function CombinedPage() {
  return (
    <div className="min-h-screen p-4 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* About Me Section */}
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          About Me
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Background</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              I'm a <strong>passionate Bioinformatician and Machine Learning engineer</strong> with a love for solving real-world prediction problems. 
              I specialize in <strong>bioinformatics, predictive modelling and statistical analysis</strong> with 5+ years of experience! 
              Free-time generative AI devotee and database builder. Ooh and <strong>running, health and psychology enthusiast</strong> <LucideSmile className="inline h-5 w-5 text-yellow-500" />
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Skills</h3>
            <div className="space-y-2">
              {[
                { skill: "Bioinformatics", level: 100 },
                { skill: "Machine Learning & Deep Learning", level: 100 },
                { skill: "Statistical Analysis", level: 90 },
                { skill: "Backend Development", level: 85 },
                { skill: "Database Design", level: 85 },
                { skill: "Frontend Development", level: 75},
                { skill: "Effort, Enthusiasm, Positive Attitude & Humor", level: 105}
              ].map(({ skill, level }) => (
                <div key={skill}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{skill}</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quotes Section */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <Quote className="h-6 w-6 mr-2 text-blue-600" />
              <h3 className="text-xl font-semibold">Something to think about</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Sometimes it is worth thinking about the life you've built and how you've spent your time. I believe that effort and meaningful work are crucial, but never forget to smile through the process: challenges are easier to tackle with a little bit of happiness. Most important is probably how you treat others. It only takes a little bit of positivity and respect towards others to make the world a better place.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300 italic">"Be the change you want to see in the world"</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">- Mahatma Gandhi</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300 italic">"Success is not final, failure is not fatal: It is the courage to continue that counts."</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">- Winston Churchill</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300 italic">"Life moves pretty fast. If you don't stop and look around once in a while, you could miss it"</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">- Ferris Bueller</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interests & Hobbies Section */}
        <h3 className="text-2xl font-bold mt-12 mb-6">Interests & Hobbies</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { Icon: Code, title: "Predictive Modelling", desc: "Building smart machines" },
            { Icon: Compass, title: "Adventure", desc: "Trying new things, new experiences" },
            { Icon: Dumbbell, title: "Sports", desc: (<>Running, calisthenics, badminton, pretty much anything <Smile className="inline h-4 w-4 text-yellow-500" /></>) },
            { Icon: Coffee, title: "Coffee", desc: "Caffeine Addict & Biohacking" },
            { Icon: Book, title: "Reading", desc: "Health, Psychology & Tech" },
            { Icon: ScrollText, title: "Research Reader", desc: "So many interesting publications on health & sports besides bioinformatics & ML!" },
            { Icon: Plane, title: "Travel", desc: "Exploring new places" }
          ].map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Icon className="h-6 w-6 mb-2 text-blue-600" />
              <h4 className="font-semibold mb-1">{title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>

        {/* Curriculum Vitae Section */}
        <div className="flex justify-between items-center mt-16 mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Curriculum Vitae
          </h2>
          <div className="flex gap-4">
            <button 
              onClick={() => alert("Full CV is currently unavailable")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Show CV
            </button>
            <a 
              href="/cv_JaldertFrancois_short.pdf" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Show Short CV
            </a>
            <a 
              href="/cv_JaldertFrancois_short.pdf" 
              download="cv_JaldertFrancois_short.pdf"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Short CV
            </a>
          </div>
        </div>

        <div className="space-y-8">
          {/* Experience Section */}
          <section>
            <div className="flex items-center mb-6">
              <Briefcase className="h-6 w-6 mr-2 text-blue-600" />
              <h3 className="text-2xl font-semibold">Experience</h3>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  role: "PhD Candidate",
                  company: "FWO - KU Leuven",
                  period: "10/2021 - 11/2026",
                  description: (<>Working on <strong>Protein Engineering, Applied Machine Learning and Statistical Analysis</strong> at STADIUS (Engineering) and CSB (Bioscience Engineering). Research focuses on <strong>enzyme engineering, proteomics, and computational protein annotation</strong>. Teaching <strong>Bioinformatics</strong> and <strong>Introduction to Object Oriented Programming</strong>.</>)
                },
                {
                  role: "Research Internship",
                  company: "University of Antwerp",
                  period: "08/2018 - 09/2018",
                  description: (<>Examining novel mutations in <strong>Charcot-Marie-Tooth disease</strong>, focusing on <strong>DNA/RNA extraction & analysis</strong>.</>)
                }
              ].map((job) => (
                <div
                  key={job.role}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xl font-semibold">{job.role}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{job.period}</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{job.description}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Education Section */}
          <section>
            <div className="flex items-center mb-6">
              <GraduationCap className="h-6 w-6 mr-2 text-blue-600" />
              <h3 className="text-2xl font-semibold">Education</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xl font-semibold">MSc in Bioinformatics</h4>
                      <p className="text-gray-600 dark:text-gray-400">KU Leuven</p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">09/2019 - 06/2021</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Graduated <strong>Cum Laude</strong>. Thesis: "<strong>Exploring mutational patterns of evolution experiments: Meta-analyses of microbial data from the CAMEL database</strong>"
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Key courses: <strong>Neural Computing</strong>, <strong>Univariate Data Analysis and Modelling</strong>, <strong>Gene Technology</strong>
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xl font-semibold">BSc in Biochemistry and Biotechnology</h4>
                      <p className="text-gray-600 dark:text-gray-400">University of Antwerp</p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">09/2016 - 06/2019</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Graduated <strong>Summa Cum Laude</strong>. <strong>Honours College Program</strong> participant.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Certifications Section */}
          <section>
            <div className="flex items-center mb-6">
              <Award className="h-6 w-6 mr-2 text-blue-600" />
              <h3 className="text-2xl font-semibold">Certifications</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: "FWO-SB Research Grant",
                  issuer: "FWO",
                  year: "2022-2026",
                  description: (<>Project: <strong>Optimising the enzyme discovery pathway through omics integration and AI</strong></>)
                },
                {
                  name: "Honours College Program",
                  issuer: "University of Antwerp",
                  year: "2017-2019",
                  description: (<>Selected for the <strong>Honours College Program</strong> during Bachelor studies</>)
                }
              ].map((cert) => (
                <div
                  key={cert.name}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="font-semibold">{cert.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cert.issuer} • {cert.year}
                  </p>
                  {cert.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{cert.description}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Projects Section */}
          <section>
            <div className="flex items-center mb-6">
              <Code className="h-6 w-6 mr-2 text-blue-600" />
              <h3 className="text-2xl font-semibold">Projects</h3>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-semibold">Enzymares</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">10/2021 - 10/2024</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Development of a <strong>toolbox for enzyme selection</strong>, including a <strong>custom database linking UniProt, Brenda, Rhea</strong>, etc.
                  Implementation and development of <strong>machine learning models for enzyme prediction</strong>, and <strong>efficient enzyme screening</strong>.
                </p>
                <a href="https://catalisti.be/project/enzymares/" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                  Learn more →
                </a>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-semibold">FWO - SB Research</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">10/2022 - 10/2026</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Exploring current approaches for <strong>enzyme classification, reaction parameter prediction and substrate affinity</strong>.
                  Developing novel <strong>machine learning models for enzyme classification</strong> and <strong>reaction parameter prediction</strong>.
                  Development of an <strong>enzyme selection toolbox/software</strong>.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
