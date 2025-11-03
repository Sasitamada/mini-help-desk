import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    // Apply dark mode class to document
    if (typeof document === 'undefined') return;
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    } catch (e) {
      console.warn('Could not save dark mode preference');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const ToggleButton = motion ? (
    <motion.div
      className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
      animate={{
        x: darkMode ? 24 : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
    >
      {darkMode ? (
        <span className="flex items-center justify-center h-full text-gray-800">🌙</span>
      ) : (
        <span className="flex items-center justify-center h-full text-yellow-500">☀️</span>
      )}
    </motion.div>
  ) : (
    <div
      className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200"
      style={{ transform: darkMode ? 'translateX(24px)' : 'translateX(0px)' }}
    >
      {darkMode ? (
        <span className="flex items-center justify-center h-full text-gray-800">🌙</span>
      ) : (
        <span className="flex items-center justify-center h-full text-yellow-500">☀️</span>
      )}
    </div>
  );

  return (
    <button
      onClick={toggleDarkMode}
      className="relative w-14 h-8 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label="Toggle dark mode"
    >
      {ToggleButton}
    </button>
  );
};

export default DarkModeToggle;

