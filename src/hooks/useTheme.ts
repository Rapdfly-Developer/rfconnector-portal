import { useState, useEffect } from 'react';

function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

export function useTheme() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  // Apply on first mount
  useEffect(() => {
    applyTheme(darkMode);
  }, []);

  const toggleTheme = () => setDarkMode(d => !d);

  return { darkMode, toggleTheme };
}
