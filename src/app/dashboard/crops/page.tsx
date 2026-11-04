'use client';

import React from 'react';
import { Wheat, Calendar, Clock, Sprout, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CropsPage() {
  const cropCycles = [
    {
      id: 'c1',
      name: 'Hybrid Tomato (Sahu)',
      plot: 'North Kolar Plot (Terrace A)',
      area: '3.5 Acres',
      stage: 'Flowering & Early Fruit Set',
      sownDate: '12 Sep 2026',
      harvestDate: 'Nov 2026',
      progress: 65,
    },
    {
      id: 'c2',
      name: 'Red Chilli (G4 Teja)',
      plot: 'Eastern Valley Plot B',
      area: '1.2 Acres',
      stage: 'Vegetative Canopy Expansion',
      sownDate: '04 Aug 2026',
      harvestDate: 'Dec 2026',
      progress: 45,
    },
    {
      id: 'c3',
      name: 'Pomegranate (Bhagwa)',
      plot: 'Eastern Valley Orchard',
      area: '1.0 Acre',
      stage: 'Fruit Maturity & Sizing',
      sownDate: 'Perennial (Year 3)',
      harvestDate: 'Jan 2027',
      progress: 80,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
            Fields & Crop Cycles
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 mt-1">
            Track vegetative stages, phenological calendars, and projected harvest windows.
          </p>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
          Log New Crop Cycle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cropCycles.map((crop) => (
          <div
            key={crop.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4">
                <Wheat className="w-5 h-5" />
              </div>

              <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                {crop.name}
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                {crop.plot} ({crop.area})
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60">
                <span className="text-[10px] text-stone-500 dark:text-emerald-400 uppercase font-bold block">
                  Current Growth Stage
                </span>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block mt-0.5">
                  {crop.stage}
                </span>

                <div className="w-full bg-stone-200 dark:bg-emerald-900/60 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-lime-500 rounded-full"
                    style={{ width: `${crop.progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-400 dark:text-emerald-400 text-right block mt-1 font-mono">
                  {crop.progress}% of season elapsed
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-emerald-300/80">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase block">Sowing Date</span>
                  <span className="font-semibold text-emerald-950 dark:text-emerald-100">{crop.sownDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase block">Est. Harvest</span>
                  <span className="font-semibold text-emerald-950 dark:text-emerald-100">{crop.harvestDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
              <span>Sensor telemetry active</span>
              <span className="font-semibold hover:underline cursor-pointer">View Spray Plan &rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

