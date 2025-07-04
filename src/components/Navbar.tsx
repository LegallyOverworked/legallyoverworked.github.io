import React from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import closeupDiffusion from '../assets/closeup_diffusion.png';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, isDark, toggleTheme }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Update tabs to include 'About' instead of 'Personal' and 'CV'
  const tabs = ['Home', 'Research', 'Projects', 'Blog', 'About', 'Contact'];

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          <div className="flex items-center space-x-3">
  <img src={closeupDiffusion} alt="Site Icon" className="h-8 w-8 rounded-full" />
  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Jaldert François</span>
</div>
          
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 
  ${currentTab === tab
    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 hover:text-white'}
`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setCurrentTab(tab);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 
  ${currentTab === tab
    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 hover:text-white'}
`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
