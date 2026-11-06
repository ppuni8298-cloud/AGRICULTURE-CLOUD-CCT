'use client';

import React, { useState } from 'react';
import { PLATFORM_FEATURES, FeatureItem } from '@/lib/constants/features';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Modal } from '@/components/ui/Modal';
import {
  Bot,
  ScanEye,
  Activity,
  TrendingUp,
  CloudSunRain,
  Droplets,
  Cpu,
  BarChart3,
  TestTube,
  Mic,
  FileText,
  Printer,
  Wallet,
  Satellite,
  Store,
  Landmark,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Bot,
  ScanEye,
  Activity,
  TrendingUp,
  CloudSunRain,
  Droplets,
  Cpu,
  BarChart3,
  TestTube,
  Mic,
  FileText,
  Printer,
  Wallet,
  Satellite,
  Store,
  Landmark,
};

export function FeaturesShowcase() {
  const { t } = useLanguage();
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300/40 dark:border-emerald-800">
            {t('features.badge', 'Comprehensive SaaS Suite')}
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#16352A] dark:text-emerald-100 tracking-tight">
            {t('features.title', '16 Modular Solutions for Modern Agriculture')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64756B] dark:text-emerald-300/80">
            {t(
              'features.subtitle',
              'Explore our planned end-to-end ecosystem, engineered to deliver intelligent farm advisory from sowing to harvest.'
            )}
          </p>
        </div>

        {/* 16 Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLATFORM_FEATURES.map((feature) => {
            const IconComponent = iconMap[feature.iconName] || Bot;

            return (
              <div
                key={feature.id}
                className="group relative p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/70 shadow-sm hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Number, Icon, and Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {t('features.statusActive', 'Active')}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    0{feature.number}. {feature.category}
                  </span>

                  <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-stone-600 dark:text-emerald-200/70 line-clamp-3 leading-relaxed">
                    {feature.shortDescription}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-emerald-100/60 dark:border-emerald-800/40 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedFeature(feature)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 group/btn"
                  >
                    <span>{t('features.learnMore', 'Learn More')}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </button>

                  <span className="text-[11px] font-mono text-stone-400 dark:text-emerald-600">
                    #{feature.number}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Details Modal */}
      {selectedFeature && (
        <Modal
          isOpen={Boolean(selectedFeature)}
          onClose={() => setSelectedFeature(null)}
          title={selectedFeature.title}
          subtitle={`Module 0${selectedFeature.number} • Category: ${selectedFeature.category}`}
        >
          <div className="space-y-5">
            {/* Status Alert Banner */}
            <div className="p-3.5 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong>Module Status:</strong> Live & Fully Operational in AgroCloud AI.
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs uppercase font-bold text-stone-500 dark:text-emerald-400 tracking-wider mb-2">
                Agronomic Overview
              </h4>
              <p className="text-sm text-stone-700 dark:text-emerald-100 leading-relaxed">
                {selectedFeature.detailedDescription}
              </p>
            </div>

            {/* Architectural Specifications */}
            <div>
              <h4 className="text-xs uppercase font-bold text-stone-500 dark:text-emerald-400 tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Technical Specifications & Cloud Architecture</span>
              </h4>
              <ul className="space-y-2 mt-2">
                {selectedFeature.architectureDetails.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 dark:text-emerald-200/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer actions */}
            <div className="pt-4 border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                {t('features.modalClose', 'Close Details')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

