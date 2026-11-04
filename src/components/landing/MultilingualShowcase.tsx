'use client';

import React from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Check, Sparkles, Languages, MessageSquare } from 'lucide-react';

export function MultilingualShowcase() {
  const { language, setLanguage, languageConfig, supportedLanguages, t } = useLanguage();

  return (
    <section id="languages" className="py-24 relative bg-emerald-50/60 dark:bg-[#07241B]/40 border-y border-emerald-100 dark:border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300/40 dark:border-emerald-800">
            {t('multilingual.badge', 'Pan-India Inclusivity')}
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-[#16352A] dark:text-emerald-100 tracking-tight">
            {t('multilingual.headline', 'Your Language. Your Farm. Your Intelligence.')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64756B] dark:text-emerald-300/80">
            {t(
              'multilingual.subtitle',
              'Indian agriculture speaks dozens of dialects. AgroCloud AI is designed from the ground up to communicate fluently in 12 Indian languages.'
            )}
          </p>
        </div>

        {/* Interactive 12 Languages Grid */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-200/80 dark:border-emerald-800 shadow-xl max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100 dark:border-emerald-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-stone-500 dark:text-emerald-400">
                  {t('multilingual.activeLang', 'Currently Active Language')}
                </p>
                <p className="text-base font-extrabold text-emerald-950 dark:text-emerald-100">
                  {languageConfig.nativeName} ({languageConfig.name})
                </p>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Full UI Translation Synchronized</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-medium text-stone-600 dark:text-emerald-200/80 mt-4 mb-6">
            {t(
              'multilingual.switchPrompt',
              'Click any language below to switch the entire application interface instantly:'
            )}
          </p>

          {/* 12 Language Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {supportedLanguages.map((lang, index) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-emerald-600 shadow-md shadow-emerald-800/20 scale-[1.02]'
                      : 'bg-emerald-50/40 hover:bg-emerald-50 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 border-emerald-100 dark:border-emerald-800/70 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono opacity-60">0{index + 1}</span>
                    <span className="text-base">{lang.flag}</span>
                  </div>

                  <div className="mt-2">
                    <p className={`text-base font-bold ${isSelected ? 'text-white' : 'text-emerald-950 dark:text-emerald-100'}`}>
                      {lang.nativeName}
                    </p>
                    <p className={`text-[11px] font-medium ${isSelected ? 'text-emerald-100' : 'text-stone-500 dark:text-emerald-400/80'}`}>
                      {lang.name}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Live Preview Greeting Card */}
          <div className="mt-8 p-4 rounded-2xl bg-emerald-100/60 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
              <strong>Native Greeting:</strong> &ldquo;{languageConfig.greeting}&rdquo; &bull; All navigation, forms, alerts, and farm metrics translate dynamically.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

