'use client';

import React from 'react';
import { CloudRain, Wind, Droplets, Sun, AlertTriangle, CheckCircle } from 'lucide-react';

export function WeatherCard() {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 uppercase tracking-wider">
              Micro-Weather Intelligence
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
            Kolar Basin
          </span>
        </div>

        {/* Big Temperature & Icon */}
        <div className="flex items-center justify-between my-3">
          <div>
            <div className="flex items-baseline">
              <span className="text-4xl sm:text-5xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight">
                28°
              </span>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 ml-1">C</span>
            </div>
            <p className="text-xs font-semibold text-stone-500 dark:text-emerald-300 mt-1">
              Partly Cloudy • High 31° / Low 21°
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md">
            <CloudRain className="w-9 h-9 text-emerald-100" />
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2.5 my-4 pt-4 border-t border-emerald-100 dark:border-emerald-800/60 text-xs">
          <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 text-center">
            <div className="flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-stone-500 dark:text-emerald-400/80 uppercase font-semibold block">Humidity</span>
            <span className="font-bold text-emerald-950 dark:text-emerald-100">72%</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 text-center">
            <div className="flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
              <Wind className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-stone-500 dark:text-emerald-400/80 uppercase font-semibold block">Wind</span>
            <span className="font-bold text-emerald-950 dark:text-emerald-100">14 km/h</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 text-center">
            <div className="flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
              <CloudRain className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-stone-500 dark:text-emerald-400/80 uppercase font-semibold block">Precipitation</span>
            <span className="font-bold text-emerald-950 dark:text-emerald-100">65% Rain</span>
          </div>
        </div>
      </div>

      {/* Actionable Spray Advisory Banner */}
      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong>Spray Advisory:</strong> Rain forecast within 36 hours. Delay foliar chemical sprays to prevent fungicide run-off.
        </p>
      </div>
    </div>
  );
}

