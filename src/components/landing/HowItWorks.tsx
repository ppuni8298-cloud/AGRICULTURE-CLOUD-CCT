'use client';

import React from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { UserCheck, MapPin, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      num: '01',
      icon: UserCheck,
      title: t('howItWorks.step1.title', 'Register Your Account'),
      description: t(
        'howItWorks.step1.desc',
        'Sign up in seconds, pick your regional language, and choose your role as Farmer, Consultant, or Admin.'
      ),
      highlight: 'Instant access',
    },
    {
      num: '02',
      icon: MapPin,
      title: t('howItWorks.step2.title', 'Add Your Farm & Crops'),
      description: t(
        'howItWorks.step2.desc',
        'Map your agricultural plots, record crop varieties, sowing dates, and current irrigation methods.'
      ),
      highlight: 'Plot telemetry',
    },
    {
      num: '03',
      icon: Sparkles,
      title: t('howItWorks.step3.title', 'Explore AI-Powered Tools'),
      description: t(
        'howItWorks.step3.desc',
        'Access disease scanners, micro-weather advisories, and APMC mandi price benchmarks tailored to your region.'
      ),
      highlight: '12 Languages',
    },
    {
      num: '04',
      icon: TrendingUp,
      title: t('howItWorks.step4.title', 'Make Informed Decisions'),
      description: t(
        'howItWorks.step4.desc',
        'Maximize yields, minimize input costs, prevent pest outbreaks, and sell at the best market prices.'
      ),
      highlight: 'Maximized ROI',
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300/40 dark:border-emerald-800">
            {t('howItWorks.badge', 'Simple Onboarding')}
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#16352A] dark:text-emerald-100 tracking-tight">
            {t('howItWorks.title', 'How AgroCloud AI Empowers You')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64756B] dark:text-emerald-300/80">
            {t(
              'howItWorks.subtitle',
              'Start digitizing your agricultural practices in four structured steps.'
            )}
          </p>
        </div>

        {/* 4 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative p-7 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Big Step Number in background */}
                <span className="text-4xl font-black font-mono text-emerald-100 dark:text-emerald-900/50 absolute top-4 right-6 group-hover:text-emerald-200 dark:group-hover:text-emerald-800 transition-colors">
                  {step.num}
                </span>

                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                  <Icon className="w-6 h-6" />
                </div>

                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  Step {step.num} • {step.highlight}
                </span>

                <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                  {step.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-emerald-200/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

