'use client';

import React from 'react';
import { Satellite, Cpu, Database, CloudLightning, ShieldCheck, Zap } from 'lucide-react';

export function AgriculturalTechShowcase() {
  const pillars = [
    {
      icon: Satellite,
      title: 'Earth Observation & Multispectral',
      badge: 'Copernicus & Sentinel-2',
      description: 'Calculates Normalized Difference Vegetation Index (NDVI) and moisture indices at 10m resolution, identifying early canopy chlorosis.',
    },
    {
      icon: Cpu,
      title: 'Domain-Fine-Tuned Neural Nets',
      badge: 'CNNs & Agronomy LLMs',
      description: 'Custom convolutional backbones trained on over 80,000 foliar pathology samples covering 38 prominent Indian crop diseases.',
    },
    {
      icon: Database,
      title: 'Cloud-Native PostgreSQL & RLS',
      badge: 'Supabase Architecture',
      description: 'Granular Row Level Security guaranteeing farmer data sovereignty. Cryptographic authentication and real-time synchronization.',
    },
    {
      icon: CloudLightning,
      title: 'Agro-Meteorological Modeling',
      badge: 'FAO-56 & IMD Radar',
      description: 'Automated spray window advisory based on wind shear, ambient humidity, and precipitation probability 48 hours in advance.',
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300/40 dark:border-emerald-800">
            Cloud Computing Architecture
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#16352A] dark:text-emerald-100 tracking-tight">
            Agricultural Technology Stack
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64756B] dark:text-emerald-300/80">
            A state-of-the-art cloud architecture engineered for scale, reliability, and security across rural connectivity environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" />
                </div>

                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  {p.badge}
                </span>

                <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                  {p.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-stone-600 dark:text-emerald-200/80 leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

