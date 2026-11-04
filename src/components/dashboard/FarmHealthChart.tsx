'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Activity, Sparkles } from 'lucide-react';

const healthData = [
  { day: 'Mon', ndvi: 84, moisture: 62 },
  { day: 'Tue', ndvi: 86, moisture: 65 },
  { day: 'Wed', ndvi: 89, moisture: 58 },
  { day: 'Thu', ndvi: 91, moisture: 72 },
  { day: 'Fri', ndvi: 90, moisture: 70 },
  { day: 'Sat', ndvi: 93, moisture: 68 },
  { day: 'Sun', ndvi: 94, moisture: 64 },
];

export function FarmHealthChart() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 uppercase tracking-wider">
              Vegetative Health & Moisture Index
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-emerald-300 mt-0.5">
            7-Day satellite NDVI vigor trend vs root-zone soil moisture
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>NDVI Vigor (94%)</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-lime-700 dark:text-lime-400">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-500" />
            <span>Moisture (64%)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84CC16" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#84CC16" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#134B3B' : '#E2ECE5'}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke={isDark ? '#8DA99B' : '#64756B'}
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke={isDark ? '#8DA99B' : '#64756B'}
                fontSize={11}
                domain={[40, 100]}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0A2920' : '#FFFFFF',
                  borderColor: isDark ? '#134B3B' : '#E2ECE5',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                  fontSize: '12px',
                }}
                itemStyle={{ color: isDark ? '#E6F4EA' : '#16352A' }}
              />
              <Area
                type="monotone"
                dataKey="ndvi"
                name="NDVI Health %"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorNdvi)"
              />
              <Area
                type="monotone"
                dataKey="moisture"
                name="Soil Moisture %"
                stroke="#84CC16"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMoisture)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-stone-400">
            Loading farm telemetry chart...
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between text-xs text-stone-500 dark:text-emerald-400">
        <span>Sentinel-2 Multispectral Feed • 10m Ground Resolution</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Plot A & B Optimal</span>
      </div>
    </div>
  );
}

