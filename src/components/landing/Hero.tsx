'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  CloudSun,
  Activity,
  Bot,
  CheckCircle2,
} from 'lucide-react';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-300/20 dark:bg-emerald-900/20 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-[-100px] w-[400px] h-[400px] bg-lime-300/20 dark:bg-lime-900/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/50 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('hero.badge', 'AI-Powered Cloud Ecosystem for Indian Agriculture')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#16352A] dark:text-emerald-50 leading-[1.15]">
              {t('hero.headline', 'Empowering Farmers with the Intelligence of AI.')}
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-[#64756B] dark:text-emerald-200/80 max-w-2xl font-normal leading-relaxed">
              {t(
                'hero.subtitle',
                'Your intelligent agricultural companion to monitor farms, understand crop health, explore Indian mandi prices and make smarter farming decisions – all through one powerful multilingual cloud platform.'
              )}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Button
                href="/auth/register"
                size="lg"
                variant="primary"
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto text-base font-semibold"
              >
                {t('hero.ctaPrimary', 'Get Started Free')}
              </Button>

              <Button
                href="#features"
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto text-base"
              >
                {t('hero.ctaSecondary', 'Explore Features')}
              </Button>
            </div>

            {/* Micro Highlights */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-emerald-200/60 dark:border-emerald-800/40 w-full">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-200">
                  12 Indian Languages
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-200">
                  All-India APMC Mandi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-200">
                  Cloud RLS Secured
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Background Image Card with Green Glowing Border */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-400/40 dark:border-emerald-600/30 bg-emerald-900/10 aspect-[4/3] sm:aspect-[16/11]">
                <Image
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop&q=80"
                  alt="Lush green agricultural farm terrace in India"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />

                {/* Floating Bottom Badge on image */}
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-white/90 dark:bg-[#0A2920]/90 backdrop-blur-md border border-emerald-200 dark:border-emerald-700/60 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                      {t('hero.floatingDashboard', 'Farm Analytics Live')}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
                    Kolar, KA
                  </span>
                </div>
              </div>

              {/* Floating Card 1: Crop Health (Top Left) */}
              <div className="absolute -top-6 -left-4 sm:-left-8 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0A2920] shadow-xl border border-emerald-100 dark:border-emerald-700/60 flex items-center gap-3 animate-float">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 dark:text-emerald-300/70 uppercase font-semibold">Vegetative Index</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                    {t('hero.cropHealth', 'Crop Health: 94% Optimal')}
                  </p>
                </div>
              </div>

              {/* Floating Card 2: Weather Forecast (Bottom Right) */}
              <div className="absolute -bottom-8 -right-4 sm:-right-6 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0A2920] shadow-xl border border-emerald-100 dark:border-emerald-700/60 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-lime-100 dark:bg-lime-950/60 text-lime-700 dark:text-lime-400">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 dark:text-emerald-300/70 uppercase font-semibold">Micro-Weather</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                    {t('hero.weatherPreview', 'Monsoon Forecast: Rain in 48h')}
                  </p>
                </div>
              </div>

              {/* Floating Card 3: AI Assistant (Top Right) */}
              <div className="absolute top-12 -right-4 sm:-right-8 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-[#0A2920]/95 shadow-lg border border-emerald-200 dark:border-emerald-700 flex items-center gap-2 hidden sm:flex">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-semibold text-emerald-950 dark:text-emerald-100 block">
                    AI Agronomist
                  </span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">
                    12 Languages Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

