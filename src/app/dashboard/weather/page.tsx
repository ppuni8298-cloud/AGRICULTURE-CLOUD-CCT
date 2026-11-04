'use client';

import React from 'react';
import { CloudSun, CloudRain, Sun, Wind, Droplets, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function WeatherPage() {
  const forecastDays = [
    { day: 'Today (Wed)', temp: '28° / 21°', icon: CloudRain, rain: '65%', wind: '14 km/h', spray: 'Unfavorable' },
    { day: 'Thursday', temp: '26° / 20°', icon: CloudRain, rain: '80%', wind: '18 km/h', spray: 'Unfavorable' },
    { day: 'Friday', temp: '27° / 19°', icon: CloudSun, rain: '30%', wind: '10 km/h', spray: 'Moderate' },
    { day: 'Saturday', temp: '30° / 20°', icon: Sun, rain: '10%', wind: '8 km/h', spray: 'Optimal (Morning)' },
    { day: 'Sunday', temp: '31° / 22°', icon: Sun, rain: '5%', wind: '7 km/h', spray: 'Optimal' },
    { day: 'Monday', temp: '30° / 21°', icon: CloudSun, rain: '15%', wind: '11 km/h', spray: 'Optimal' },
    { day: 'Tuesday', temp: '29° / 20°', icon: CloudSun, rain: '20%', wind: '12 km/h', spray: 'Optimal' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-6 border-b border-emerald-100 dark:border-emerald-800/60">
        <div className="flex items-center gap-2">
          <CloudSun className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
            Agricultural Weather Intelligence
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 mt-1">
          Hyperlocal micro-weather forecasts, IMD radar synthesis, and automated spray window optimization.
        </p>
      </div>

      {/* Main Advisory Alert */}
      <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Monsoon Precipitation Window (Next 48 Hours)</p>
          <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300/80 leading-relaxed">
            Significant rainfall (35-50 mm) predicted across Kolar and adjoining taluks due to a low-pressure trough.
            Hold all foliar fungicide and insecticide applications until Saturday morning to ensure chemical efficacy.
          </p>
        </div>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {forecastDays.map((item, idx) => {
          const Icon = item.icon;
          const isToday = idx === 0;

          return (
            <div
              key={item.day}
              className={`p-4 rounded-2xl border text-center transition-all ${
                isToday
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-[#0A2920] border-emerald-100 dark:border-emerald-800/80 shadow-sm'
              }`}
            >
              <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100 truncate">
                {item.day}
              </p>

              <div className="my-3 flex justify-center text-emerald-600 dark:text-emerald-400">
                <Icon className="w-8 h-8" />
              </div>

              <p className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
                {item.temp}
              </p>

              <div className="mt-3 pt-2 border-t border-emerald-100/60 dark:border-emerald-800/40 text-[11px] space-y-1 text-stone-600 dark:text-emerald-300">
                <p>Rain: <strong>{item.rain}</strong></p>
                <p>Wind: <strong>{item.wind}</strong></p>
              </div>

              <div className="mt-3">
                <span
                  className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full block truncate ${
                    item.spray.includes('Optimal')
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : item.spray.includes('Moderate')
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}
                >
                  {item.spray}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

