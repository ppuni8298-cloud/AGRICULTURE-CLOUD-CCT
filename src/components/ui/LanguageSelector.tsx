'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function LanguageSelector({ className = '', variant = 'compact' }: LanguageSelectorProps) {
  const { language, setLanguage, languageConfig, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200
          bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/60
          dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-100 dark:border-emerald-800/60
          focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="font-semibold">{languageConfig.nativeName}</span>
        {variant === 'full' && (
          <span className="text-emerald-700/70 dark:text-emerald-400/70 text-xs hidden sm:inline">
            ({languageConfig.name})
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0A2920] shadow-xl border border-emerald-100 dark:border-emerald-800/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-emerald-100/80 dark:border-emerald-800/40 mb-1">
            <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Select Language (12 Languages)
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-0.5 pr-1">
            {supportedLanguages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors text-left
                    ${isSelected 
                      ? 'bg-emerald-100/90 text-emerald-950 font-semibold dark:bg-emerald-900/60 dark:text-emerald-100' 
                      : 'text-stone-700 dark:text-emerald-200/90 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium text-emerald-950 dark:text-emerald-100">
                        {lang.nativeName}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-emerald-400/70">
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

