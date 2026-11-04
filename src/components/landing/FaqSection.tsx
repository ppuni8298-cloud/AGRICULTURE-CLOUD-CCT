'use client';

import React, { useState } from 'react';
import { FAQ_ITEMS } from '@/lib/constants/faq';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FaqSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="about" className="py-24 relative bg-emerald-50/40 dark:bg-[#07241B]/40 border-y border-emerald-100 dark:border-emerald-900/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300/40 dark:border-emerald-800">
            {t('faq.badge', 'Got Questions?')}
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#16352A] dark:text-emerald-100 tracking-tight">
            {t('faq.title', 'Frequently Asked Questions')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64756B] dark:text-emerald-300/80">
            {t(
              'faq.subtitle',
              'Answers to common questions regarding AgroCloud AI capabilities, data privacy, and upcoming phases.'
            )}
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                      {index + 1}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-100">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-stone-600 dark:text-emerald-200/80 leading-relaxed border-t border-emerald-50 dark:border-emerald-900/40">
                    <p className="mt-2">{item.answer}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800">
                        Category: {item.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

