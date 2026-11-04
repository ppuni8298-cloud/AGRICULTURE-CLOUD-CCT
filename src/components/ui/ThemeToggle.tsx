'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 
        bg-emerald-50 hover:bg-emerald-100 text-emerald-800 
        dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-200 dark:border dark:border-emerald-800/60 ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Current: ${resolvedTheme === 'dark' ? 'Dark' : 'Light'} Mode. Click to toggle.`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-emerald-700 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}

