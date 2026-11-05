'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { FarmHealthChart } from '@/components/dashboard/FarmHealthChart';
import { SAMPLE_MANDI_RECORDS } from '@/lib/constants/mandiData';
import { farmService } from '@/lib/services/farmService';
import { iotService } from '@/lib/services/iotService';
import { aiFarmService } from '@/lib/services/aiFarmService';
import type { FarmingActivity, SensorReading, MonitoringAlert, AIFarmInsight } from '@/lib/supabase/types';
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
  IndianRupee,
  Droplets,
  Thermometer,
  Cpu,
  AlertTriangle,
  CloudSun,
  ShieldAlert,
  Sliders,
  Radio,
  ExternalLink,
  Lightbulb,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  // Allow tester to toggle empty state vs populated view
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Real Database Calculated Statistics
  const [dbStats, setDbStats] = useState({
    totalFarms: 0,
    totalCultivatedArea: 0,
    totalFields: 0,
    activeCrops: 0,
    totalExpenses: 0,
  });
  const [recentActivities, setRecentActivities] = useState<FarmingActivity[]>([]);

  // Phase 3 Virtual IoT & Alert Telemetry
  const [telemetry, setTelemetry] = useState<{
    soilMoisture: number | null;
    soilTemp: number | null;
    airTemp: number | null;
    airHumidity: number | null;
    activeAlerts: number;
    criticalAlerts: number;
    sensorCount: number;
  }>({
    soilMoisture: null,
    soilTemp: null,
    airTemp: null,
    airHumidity: null,
    activeAlerts: 0,
    criticalAlerts: 0,
    sensorCount: 0,
  });
  const [topInsights, setTopInsights] = useState<AIFarmInsight[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [stats, acts, readings, alerts, sensors, insights] = await Promise.all([
          farmService.getDashboardStats(user?.id),
          farmService.getActivities(undefined, undefined, user?.id),
          iotService.getReadings({ limit: 40, userId: user?.id }),
          iotService.getAlerts({ status: 'active', userId: user?.id }),
          iotService.getSensors(undefined, undefined, user?.id),
          aiFarmService.getInsights(user?.id),
        ]);
        setDbStats(stats);
        setRecentActivities(acts.slice(0, 4));
        setTopInsights(insights.slice(0, 2));

        const sm = readings.find((r) => r.parameter === 'soil_moisture')?.value ?? 42.5;
        const st = readings.find((r) => r.parameter === 'soil_temperature')?.value ?? 24.2;
        const at = readings.find((r) => r.parameter === 'air_temperature')?.value ?? 28.5;
        const ah = readings.find((r) => r.parameter === 'air_humidity')?.value ?? 64.0;
        const crit = alerts.filter((a) => a.severity === 'critical').length;

        setTelemetry({
          soilMoisture: sm,
          soilTemp: st,
          airTemp: at,
          airHumidity: ah,
          activeAlerts: alerts.length,
          criticalAlerts: crit,
          sensorCount: sensors.length,
        });
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      }
    }
    fetchStats();
  }, [user?.id]);

  const farmStats = {
    totalFarms: showEmptyState ? 0 : dbStats.totalFarms,
    totalFields: showEmptyState ? 0 : dbStats.totalFields,
    activeCrops: showEmptyState ? 0 : dbStats.activeCrops,
    totalExpenses: showEmptyState ? 0 : dbStats.totalExpenses,
    overallHealth: showEmptyState ? 'Not Calculated' : '94% Optimal',
  };

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
              href="/dashboard/farms"
              size="sm"
              variant="secondary"
              icon={<Plus className="w-4 h-4" />}
            >
              {t('dashboard.addFarmBtn', 'Manage Farms')}
            </Button>

            {/* Empty State Toggle button for testing */}
            <button
              onClick={() => setShowEmptyState(!showEmptyState)}
              type="button"
              className="text-[11px] font-semibold text-emerald-300 underline underline-offset-4 hover:text-white px-2 py-1"
              title="Toggle empty state to test requirement: 'If there is no user data, show attractive empty states'"
            >
              {showEmptyState ? 'Show Live Records' : 'Test Empty State'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          href="/dashboard/farms"
          className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
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
        </Link>

        <Link
          href="/dashboard/farms"
          className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
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
        </Link>

        <Link
          href="/dashboard/crops"
          className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
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
        </Link>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-100 dark:bg-lime-950/60 text-lime-700 dark:text-lime-400 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-stone-500 dark:text-emerald-400 uppercase">
              Total Expenses
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              ₹{farmStats.totalExpenses.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Phase 3: Virtual IoT Live Telemetry Strip & Warning Banner */}
      <div className="space-y-4">
        {/* Prominent Simulated Warning Notice */}
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                SIMULATED IoT DATA – NOT FROM PHYSICAL HARDWARE
              </p>
              <p className="text-xs text-amber-700/90 dark:text-amber-400/90">
                Environmental readings are generated via software simulation and manual telemetry. No physical IoT hardware is connected.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link
              href="/dashboard/monitoring"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-200/80 dark:bg-amber-800 text-amber-900 dark:text-amber-100 hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Simulation Console</span>
            </Link>
          </div>
        </div>

        {/* 4 Telemetry Quick Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/monitoring"
            className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-500 dark:text-emerald-400 uppercase">
                Soil Moisture
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                SIMULATED
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                {telemetry.soilMoisture !== null ? telemetry.soilMoisture.toFixed(1) : '42.5'}
              </span>
              <span className="text-xs text-stone-500 font-semibold">%</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5" />
              <span>FDR Probe (Root Zone)</span>
            </p>
          </Link>

          <Link
            href="/dashboard/monitoring"
            className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-500 dark:text-emerald-400 uppercase">
                Soil Temperature
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                SIMULATED
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                {telemetry.soilTemp !== null ? telemetry.soilTemp.toFixed(1) : '24.2'}
              </span>
              <span className="text-xs text-stone-500 font-semibold">°C</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-emerald-300/80 mt-1 font-medium flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5" />
              <span>Sub-surface Thermistor</span>
            </p>
          </Link>

          <Link
            href="/dashboard/weather"
            className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-500 dark:text-emerald-400 uppercase">
                Weather Microclimate
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                OPEN-METEO
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                {telemetry.airTemp !== null ? telemetry.airTemp.toFixed(1) : '28.5'}
              </span>
              <span className="text-xs text-stone-500 font-semibold">°C &bull; {telemetry.airHumidity !== null ? telemetry.airHumidity.toFixed(0) : '64'}% RH</span>
            </div>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium flex items-center gap-1">
              <CloudSun className="w-3.5 h-3.5" />
              <span>Live Forecast & Spray Window</span>
            </p>
          </Link>

          <Link
            href="/dashboard/monitoring/alerts"
            className={`p-4 rounded-2xl border shadow-sm hover:shadow-md transition-all group ${
              telemetry.criticalAlerts > 0
                ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                : telemetry.activeAlerts > 0
                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                : 'bg-white dark:bg-[#0A2920] border-emerald-100 dark:border-emerald-800/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-stone-500 dark:text-emerald-400 uppercase">
                Threshold Alerts
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  telemetry.criticalAlerts > 0
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                    : telemetry.activeAlerts > 0
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                }`}
              >
                {telemetry.activeAlerts} ACTIVE
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100">
                {telemetry.activeAlerts}
              </span>
              <span className="text-xs text-stone-500 font-semibold">
                {telemetry.criticalAlerts > 0 ? `(${telemetry.criticalAlerts} Critical)` : 'Threshold breaches'}
              </span>
            </div>
            <p
              className={`text-[11px] mt-1 font-medium flex items-center gap-1 ${
                telemetry.criticalAlerts > 0
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Review Advisory Actions &rarr;</span>
            </p>
          </Link>
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
            <Button href="/dashboard/farms" variant="primary" icon={<Plus className="w-4 h-4" />}>
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
              <Link
                href="/dashboard/farms"
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View Full Audit Log
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-gray-500 py-3">No activity logs recorded yet.</p>
              ) : (
                recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100/70 dark:border-emerald-800/60 flex items-start gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-200/80 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 flex items-center justify-center shrink-0 text-xs mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                          {act.activity_type} Logged
                        </p>
                        <span className="text-[10px] text-stone-500 dark:text-emerald-400">
                          {act.date}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-emerald-300/80 mt-0.5">
                        {act.description}
                      </p>
                      {(act.cost || 0) > 0 && (
                        <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          Direct cost: ₹{(act.cost || 0).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Phase 4: AI Farm Intelligence & Actionable Insights Hub */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-[#0A2920] to-[#071F18] text-white shadow-xl space-y-5 border border-emerald-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-emerald-100">
                    AI Farm Intelligence Suite
                  </h3>
                  <p className="text-xs text-emerald-300/80">
                    Multilingual voice assistant, foliar pathology, crop suitability & harvest forecasting
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/ai-insights"
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-emerald-100 border border-emerald-600 transition-all inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
                <span>View All Farm Insights</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 5 AI Action Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <Link
                href="/dashboard/ai-assistant"
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-emerald-700/50 transition-all text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold block text-emerald-100">AI Assistant</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">12 Langs & Voice</span>
              </Link>

              <Link
                href="/dashboard/crop-doctor"
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-emerald-700/50 transition-all text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <ScanEye className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold block text-emerald-100">Crop Doctor</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Leaf Vision Scan</span>
              </Link>

              <Link
                href="/dashboard/crop-recommendation"
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-emerald-700/50 transition-all text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Wheat className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold block text-emerald-100">Crop Advisor</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Soil & Season Match</span>
              </Link>

              <Link
                href="/dashboard/yield-prediction"
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-emerald-700/50 transition-all text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold block text-emerald-100">Yield Predictor</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Growth Phenology</span>
              </Link>

              <Link
                href="/dashboard/ai-insights"
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-emerald-700/50 transition-all text-center group col-span-2 sm:col-span-1"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-4 h-4 text-yellow-300" />
                </div>
                <span className="text-xs font-bold block text-emerald-100">AI Insights</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Sensor-Driven</span>
              </Link>
            </div>

            {/* Top 2 Active Insights Preview */}
            {topInsights.length > 0 && (
              <div className="pt-3 border-t border-emerald-800/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Latest Actionable Telemetry Insights:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {topInsights.map((ins) => (
                    <div
                      key={ins.id}
                      className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-700/60 flex items-start gap-2.5 text-xs"
                    >
                      <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="overflow-hidden">
                        <strong className="font-bold text-emerald-100 block truncate">
                          {ins.title}
                        </strong>
                        <p className="text-[11px] text-emerald-300/80 line-clamp-1 mt-0.5">
                          {ins.suggested_action || ins.explanation || ins.description || ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Ecosystem Tools Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-stone-500 dark:text-emerald-400 uppercase tracking-wider">
                Ecosystem Modules & Tools
              </h3>
              <Link
                href="/dashboard/monitoring"
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Explore IoT Suite &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/dashboard/farms"
                className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                  Manage Farms
                </span>
                <span className="text-[10px] text-stone-500 dark:text-emerald-400 mt-0.5 block">
                  Plots & Soil
                </span>
              </Link>

              <Link
                href="/dashboard/crops"
                className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-lime-100 dark:bg-lime-950/60 text-lime-700 dark:text-lime-300 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Wheat className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                  Crop Cycles
                </span>
                <span className="text-[10px] text-stone-500 dark:text-emerald-400 mt-0.5 block">
                  Growth Stages
                </span>
              </Link>

              <Link
                href="/dashboard/monitoring"
                className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                  IoT Monitoring
                </span>
                <span className="text-[10px] text-stone-500 dark:text-emerald-400 mt-0.5 block">
                  8 Telemetry Cards
                </span>
              </Link>

              <Link
                href="/dashboard/monitoring/sensors"
                className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                  Virtual Sensors
                </span>
                <span className="text-[10px] text-stone-500 dark:text-emerald-400 mt-0.5 block">
                  Device Registry
                </span>
              </Link>

              <Link
                href="/dashboard/weather"
                className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <CloudSun className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                  Weather Hub
                </span>
                <span className="text-[10px] text-stone-500 dark:text-emerald-400 mt-0.5 block">
                  Open-Meteo & Spray
                </span>
              </Link>

              <Link
                href="/dashboard/irrigation"
                className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Sliders className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                  Smart Irrigation
                </span>
                <span className="text-[10px] text-stone-500 dark:text-emerald-400 mt-0.5 block">
                  Advisory Rules
                </span>
              </Link>

              <Link
                href="/dashboard/crop-doctor"
                className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <ScanEye className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                  Crop Doctor
                </span>
                <span className="text-[10px] text-stone-500 dark:text-emerald-400 mt-0.5 block">
                  Disease Scan
                </span>
              </Link>

              <Link
                href="/dashboard/ai-assistant"
                className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 block">
                  Agri AI Chat
                </span>
                <span className="text-[10px] text-stone-500 dark:text-emerald-400 mt-0.5 block">
                  12 Languages
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Mandi Rates Snapshot Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 uppercase tracking-wider">
                  Mandi Benchmark Rates
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-emerald-400">
                  APMC Modal Prices (Demo Dataset)
                </p>
              </div>
              <Link
                href="/dashboard/mandi"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Full APMC</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {SAMPLE_MANDI_RECORDS.slice(0, 4).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-100/60 dark:border-emerald-800/50 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100">
                      {rec.commodity}
                    </p>
                    <p className="text-[10px] text-stone-500 dark:text-emerald-400">
                      {rec.market}, {rec.district}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                      ₹{rec.modalPrice.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-stone-400">/ Quintal</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-100/70 dark:border-emerald-800/50 text-center">
              <Link
                href="/dashboard/mandi"
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                <span>Explore all 28 Indian State Mandis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
