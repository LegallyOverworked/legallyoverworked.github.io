import React from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import profileAvatar from '../assets/profile_avatar.webp';
import profilePhoto from '../assets/profile.webp';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, isDark, toggleTheme }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showPhoto, setShowPhoto] = React.useState(false);

  React.useEffect(() => {
    if (!showPhoto) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowPhoto(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showPhoto]);

  const tabs = ['Home', 'Research', 'Projects', 'Blog', 'About', 'Contact'];

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          <div className="flex items-center space-x-3">
  <button
    type="button"
    onClick={() => setShowPhoto(true)}
    className="h-8 w-8 shrink-0 rounded-full overflow-hidden cursor-zoom-in ring-2 ring-transparent hover:ring-accent-500 focus:outline-none focus-visible:ring-accent-500 transition-shadow"
    title="View photo"
    aria-label="View profile photo"
  >
    <img src={profileAvatar} alt="Jaldert François" width={128} height={128} className="h-full w-full object-cover" />
  </button>
  <span className="text-2xl font-bold bg-gradient-to-r from-brand-800 to-accent-600 dark:from-brand-400 dark:to-accent-300 bg-clip-text text-transparent">Jaldert François</span>
</div>
          
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 
  ${currentTab === tab
    ? 'bg-gradient-to-r from-brand-800 to-accent-600 text-white shadow-md'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-brand-700/20 hover:to-accent-500/20 hover:text-brand-900 dark:hover:text-white'}
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
    ? 'bg-gradient-to-r from-brand-800 to-accent-600 text-white shadow-md'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-brand-700/20 hover:to-accent-500/20 hover:text-brand-900 dark:hover:text-white'}
`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {showPhoto &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
            onClick={() => setShowPhoto(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Profile photo"
          >
            <button
              type="button"
              onClick={() => setShowPhoto(false)}
              className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Close photo"
              aria-label="Close photo"
              autoFocus
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={profilePhoto}
              alt="Jaldert François"
              width={938}
              height={835}
              className="max-h-[85vh] max-w-full w-auto h-auto rounded-2xl shadow-2xl cursor-default"
              onClick={(event) => event.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </nav>
  );
}
