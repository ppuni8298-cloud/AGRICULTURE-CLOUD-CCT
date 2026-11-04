'use client';

import React from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Cpu, MapPin, Languages, TrendingUp, Cloud } from 'lucide-react';

export function PlatformCapabilities() {
  const { t } = useLanguage();

  const capabilities = [
    {
      icon: Cpu,
      title: t('capabilities.ai.title', 'Artificial Intelligence'),
      description: t(
        'capabilities.ai.desc',
        'Deep neural networks trained for localized crop disease identification, automated advisory, and predictive farming guidance.'
      ),
      badge: 'Neural Vision & LLM',
    },
    {
      icon: MapPin,
      title: t('capabilities.farm.title', 'Smart Farm Management'),
      description: t(
        'capabilities.farm.desc',
        'Centralized mapping of plots, soil nutrient history, irrigation tracking, and yield schedules across multi-acre holdings.'
      ),
      badge: 'Plot Geometry & Logs',
    },
    {
      icon: Languages,
      title: t('capabilities.multilingual.title', 'Multilingual Interaction'),
      description: t(
        'capabilities.multilingual.desc',
        'True native interaction across 12 Indian languages, breaking technological barriers for farmers across every state.'
      ),
      badge: '12 Indian Scripts',
    },
    {
      icon: TrendingUp,
      title: t('capabilities.market.title', 'Market Intelligence'),
      description: t(
        'capabilities.market.desc',
        'Transparent commodity prices, APMC market arrivals, and historical trends to empower fair price negotiation.'
      ),
      badge: 'APMC Price Discovery',
    },
    {
      icon: Cloud,
      title: t('capabilities.cloud.title', 'Cloud-Based Access'),
      description: t(
        'capabilities.cloud.desc',
        'Secure, enterprise-grade cloud architecture with Supabase database, instant synchronization, and offline-first capabilities.'
      ),
      badge: 'PostgreSQL & RLS',
    },
  ];

  return (
    <section id="capabilities" className="py-20 relative bg-emerald-50/50 dark:bg-[#07241B]/40 border-y border-emerald-100 dark:border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300/40 dark:border-emerald-800">
            {t('capabilities.badge', 'Next-Gen Capabilities')}
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#16352A] dark:text-emerald-100 tracking-tight">
            {t('capabilities.title', "Built for India's Diverse Agricultural Landscape")}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64756B] dark:text-emerald-300/80">
            {t(
              'capabilities.subtitle',
              'Cloud-native intelligence engineered to bridge precision technology with real Indian farming realities.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`group relative p-7 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100/90 dark:border-emerald-800/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${
                  idx === 0 ? 'md:col-span-2 lg:col-span-1 bg-gradient-to-b from-white to-emerald-50/30 dark:from-[#0A2920] dark:to-[#0D3529]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm text-stone-600 dark:text-emerald-200/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-emerald-100/70 dark:border-emerald-800/40 flex items-center text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span>Engineered for AgroCloud Ecosystem</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

