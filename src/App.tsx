import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Research from './components/Research';
import About from './components/About';
import Contact from './components/Contact';

function App() {
  const [currentTab, setCurrentTab] = useState('Home');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const renderContent = () => {
    switch (currentTab) {
      case 'Home':
        return <Home />;
      case 'Research':
        return <Research />;
      // Projects and Blog are parked until they have real content: re-import
      // ./components/Projects and ./components/Blog, add their cases here, and
      // add the tab names back in Navbar.tsx.
      case 'About':
        return <About />;
      case 'Contact':
        return <Contact />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDark={isDark}
        toggleTheme={() => setIsDark(!isDark)}
      />
      <main className="animate-fadeIn flex-grow">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
