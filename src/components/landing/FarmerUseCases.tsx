'use client';

import React from 'react';
import Image from 'next/image';
import { Sprout, Apple, Briefcase, Users, CheckCircle2 } from 'lucide-react';

export function FarmerUseCases() {
  const useCases = [
    {
      title: 'Smallholder Grain Farmers',
      crops: 'Paddy, Wheat, Bajra, Mustard',
      icon: Sprout,
      scenario: 'Farmers managing 1 to 5 acres needing accurate monsoon rainfall timing, seed treatment advice, and MSP/APMC modal price visibility.',
      impact: 'Avoids premature spraying before heavy downpours and eliminates intermediary distress sales.',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Horticultural & Vegetable Growers',
      crops: 'Tomato, Chilli, Pomegranate, Grapes',
      icon: Apple,
      scenario: 'High-value crops vulnerable to bacterial wilt, thrips, and powdery mildew needing early foliar symptom verification.',
      impact: 'Rapid leaf symptom checks prevent pest outbreaks, saving up to ₹15,000 per acre in pesticide costs.',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Commercial Cash Crop Producers',
      crops: 'Cotton, Soybean, Sugarcane, Coffee',
      icon: Briefcase,
      scenario: 'Multi-plot holdings requiring synchronized input scheduling, labor tracking, and market arrival analysis.',
      impact: 'Centralized plot logging and yield projection optimize post-harvest storage and forward contract timing.',
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Agronomic Consultants & FPOs',
      crops: 'Multi-farmer Cluster Management',
      icon: Users,
      scenario: 'Advisors and Farmer Producer Organizations monitoring 50+ member farms simultaneously across a taluk or district.',
      impact: 'Unified cloud dashboard with multi-tenant access delivers consolidated soil reports and bulk procurement insights.',
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section className="py-24 relative bg-emerald-50/40 dark:bg-[#07241B]/40 border-y border-emerald-100 dark:border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300/40 dark:border-emerald-800">
            Real Agricultural Contexts
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#16352A] dark:text-emerald-100 tracking-tight">
            Designed for Every Agricultural Persona
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64756B] dark:text-emerald-300/80">
            From marginal landowners to large-scale FPO federations, AgroCloud AI adapts to varying agricultural contexts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
              >
                <div className="sm:w-2/5 relative min-h-[200px] sm:min-h-auto">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-emerald-950/60 to-transparent" />
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 dark:bg-[#0A2920]/90 backdrop-blur-md flex items-center justify-center text-emerald-700 dark:text-emerald-300 shadow">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      Target Focus: {item.crops}
                    </span>
                    <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100 mt-1">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-emerald-200/80 leading-relaxed">
                      {item.scenario}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-800/60 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                      {item.impact}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

