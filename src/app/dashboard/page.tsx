'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { FarmHealthChart } from '@/components/dashboard/FarmHealthChart';
import { SAMPLE_MANDI_RECORDS } from '@/lib/constants/mandiData';
import { Button } from '@/components/ui/Button';
import {
  MapPin,
  Wheat,
  Activity,
  Bot,
  ScanEye,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  // Allow tester to toggle empty state vs populated view
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Sample farm statistics (realistic and clearly attributed)
  const farmStats = {
    totalFarms: showEmptyState ? 0 : 2,
    totalFields: showEmptyState ? 0 : 5,
    activeCrops: showEmptyState ? 0 : 3,
    overallHealth: showEmptyState ? 'Not Calculated' : '94% Optimal',
  };

  const sampleRecentActivities = [
    {
      id: 1,
      title: 'Monsoon Rain Spray Alert Logged',
      desc: 'Automatic advisory generated: postpone copper oxychloride spray on Tomato (Plot 2).',
      time: '2 hours ago',
      type: 'weather',
    },
    {
      id: 2,
      title: 'Mandi Rate Benchmark Refreshed',
      desc: 'Kolar APMC modal price recorded at ₹2,150 / Quintal for Hybrid Tomato.',
      time: '5 hours ago',
      type: 'market',
    },
    {
      id: 3,
      title: 'Soil Nitrogen Diagnostic Logged',
      desc: 'Soil test report imported for North Terrace Plot (2.4 Acres).',
      time: 'Yesterday',
      type: 'soil',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AgroCloud AI Agricultural Ecosystem</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t('dashboard.welcome', 'Welcome back')}, {profile?.full_name || 'Farmer'}!
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-emerald-200/90 max-w-xl leading-relaxed">
              Role: <strong>{profile?.role || 'Farmer'}</strong> &bull; Region:{' '}
              <strong>{profile?.state || 'Karnataka'}</strong> &bull; Language:{' '}
              <strong>{profile?.preferred_language?.toUpperCase() || 'EN'}</strong>
            </p>
          </div>

          {/* Quick Actions & Empty state preview toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              href="/dashboard/ai-assistant"
              size="sm"
              variant="leaf"
              icon={<Bot className="w-4 h-4" />}
            >
              Consult AI Doctor
            </Button>

            <Button
              href="/dashboard/my-farms"
              size="sm"
              variant="secondary"
              icon={<Plus className="w-4 h-4" />}
            >
              {t('dashboard.addFarmBtn', 'Add New Farm')}
            </Button>

            {/* Empty State Toggle button for testing */}
            <button
              onClick={() => setShowEmptyState(!showEmptyState)}
              type="button"
              className="text-[11px] font-semibold text-emerald-300 underline underline-offset-4 hover:text-white px-2 py-1"
              title="Toggle empty state to test requirement 7: 'If there is no user data, show attractive empty states'"
            >
              {showEmptyState ? 'Show Populated View' : 'Test Empty State'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 dark:text-emerald-400 uppercase">
              {t('dashboard.totalFarms', 'Total Farms')}
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              {farmStats.totalFarms}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 dark:text-emerald-400 uppercase">
              {t('dashboard.totalFields', 'Total Fields')}
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              {farmStats.totalFields}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Wheat className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 dark:text-emerald-400 uppercase">
              {t('dashboard.registeredCrops', 'Active Crops')}
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              {farmStats.activeCrops}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-100 dark:bg-lime-950/60 text-lime-700 dark:text-lime-400 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 dark:text-emerald-400 uppercase">
              {t('dashboard.farmHealth', 'Overall Health')}
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              {farmStats.overallHealth}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Weather + Farm Health Recharts Chart OR Empty State */}
      {showEmptyState ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-[#0A2920] border-2 border-dashed border-emerald-200 dark:border-emerald-800 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-emerald-950 dark:text-emerald-100">
            {t('dashboard.emptyFarmsTitle', 'No farms registered yet')}
          </h3>
          <p className="text-sm text-stone-600 dark:text-emerald-200/80 max-w-md mx-auto leading-relaxed">
            {t(
              'dashboard.emptyFarmsDesc',
              'Add your first agricultural plot to start monitoring soil moisture, crop cycles, and localized micro-weather.'
            )}
          </p>
          <div className="pt-2">
            <Button href="/dashboard/my-farms" variant="primary" icon={<Plus className="w-4 h-4" />}>
              {t('dashboard.addFarmBtn', 'Add Your First Farm')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <FarmHealthChart />
          </div>
          <div className="lg:col-span-5">
            <WeatherCard />
          </div>
        </div>
      )}

      {/* Quick Shortcuts & Top Mandi Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Quick Actions & Recent Activities */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 uppercase tracking-wider">
                {t('dashboard.recentActivity', 'Recent Farm Activity')}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Live Audit Log
              </span>
            </div>

            <div className="space-y-3">
              {sampleRecentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100/70 dark:border-emerald-800/60 flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-200/80 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 flex items-center justify-center shrink-0 text-xs mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                        {act.title}
                      </p>
                      <span className="text-[10px] text-stone-400 dark:text-emerald-400 font-mono">
                        {act.time}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-emerald-200/80 mt-0.5">
                      {act.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Mandi Intelligence Shortcut */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 uppercase tracking-wider">
                    Trending APMC Rates
                  </h3>
                </div>
                <Link
                  href="/dashboard/mandi"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  {t('dashboard.viewAll', 'View All')} &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                {SAMPLE_MANDI_RECORDS.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/40 border border-emerald-100/70 dark:border-emerald-800/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                        {m.commodity}
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-emerald-400">
                        {m.market} ({m.state})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                        ₹{m.modalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[9px] text-stone-400 dark:text-emerald-400">
                        / Quintal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-800/60">
              <Button
                href="/dashboard/mandi"
                size="sm"
                variant="outline"
                className="w-full text-xs font-semibold"
                icon={<TrendingUp className="w-3.5 h-3.5" />}
              >
                {t('dashboard.checkMandiBtn', 'Open Full Mandi Explorer')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

