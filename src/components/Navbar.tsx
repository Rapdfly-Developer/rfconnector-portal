import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { darkMode, toggleTheme } = useTheme();
  const isDashboard = pathname === '/dashboard';

  function scrollToPortal(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === '/') {
      e.preventDefault();
      document.getElementById('choose-portal')?.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-gray-200/60 bg-white/80 dark:border-slate-800/60 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-lg group-hover:bg-brand-500 transition-colors">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white tracking-tight">
              RFConnector
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {!isDashboard && (
              <>
                <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors">How it works</a>
                <Link to="/docs" className="text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors">Docs</Link>
              </>
            )}
            {isDashboard ? (
              <span className="text-sm text-gray-500 dark:text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-charge-500 mr-2 animate-pulse-slow" />
                Live
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <a
                  href="/#choose-portal"
                  onClick={scrollToPortal}
                  className="text-sm text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  Sign in
                </a>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/20"
                >
                  Get API Keys →
                </Link>
              </div>
            )}
          </div>

          {/* Theme + Mobile toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setOpen(!open)} className="md:hidden text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950 px-4 py-4 space-y-3">
          <a href="#features" onClick={() => setOpen(false)} className="block text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white">Features</a>
          <a href="#how-it-works" onClick={() => setOpen(false)} className="block text-sm text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white">How it works</a>
          <a href="/#choose-portal" onClick={scrollToPortal} className="block text-sm text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white">
            Sign in
          </a>
          <Link to="/register" onClick={() => setOpen(false)} className="block text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300">
            Get API Keys →
          </Link>
        </div>
      )}
    </nav>
  );
}
