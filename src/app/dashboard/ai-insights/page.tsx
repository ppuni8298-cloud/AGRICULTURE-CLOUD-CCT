'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { farmService } from '@/lib/services/farmService';
import { iotService } from '@/lib/services/iotService';
import { aiFarmService } from '@/lib/services/aiFarmService';
import type { Farm, Field, Crop, IoTSensor, SensorReading, AIFarmInsight, InsightPriority, InsightCategory } from '@/lib/supabase/types';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Droplets,
  CloudSun,
  Bug,
  Wheat,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  X,
  Layers,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AIFarmInsightsPage() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const userId = user?.id || profile?.id || 'demo-farmer-001';

  const [insights, setInsights] = useState<AIFarmInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Load telemetry & generate insights
  const loadInsightsData = async () => {
    try {
      setRefreshing(true);
      const userFarms = await farmService.getFarms(userId);
      let activeCrops: Crop[] = [];
      let activeSensors: IoTSensor[] = [];

      if (userFarms.length > 0) {
        activeCrops = await farmService.getCrops(userFarms[0].id, userId);
        activeSensors = await iotService.getSensors(userFarms[0].id, undefined, userId);
      }

      // Check for saved insights first
      const saved = await aiFarmService.getInsights(userId);
      if (saved.length > 0) {
        setInsights(saved.filter((i) => !i.is_dismissed));
      } else {
        // Query API to generate dynamic insights
        const res = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farms: userFarms,
            crops: activeCrops,
            sensors: activeSensors,
            recentAlerts: [],
          }),
        });

        const data = await res.json();
        if (data.success && data.insights) {
          setInsights(data.insights);
        }
      }
    } catch (err) {
      console.warn('Failed to load insights:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInsightsData();
  }, [userId]);

  // Handle Dismiss Insight
  const handleDismiss = async (insightId: string) => {
    setDismissedIds((prev) => {
      const next = new Set(Array.from(prev));
      next.add(insightId);
      return next;
    });
    await aiFarmService.dismissInsight(insightId, userId);
    setInsights((prev) => prev.filter((i) => i.id !== insightId));
  };

  // Filtered insights
  const filteredInsights = useMemo(() => {
    return insights.filter((i) => {
      if (dismissedIds.has(i.id)) return false;
      if (selectedPriority !== 'all' && i.priority !== selectedPriority) return false;
      if (selectedCategory !== 'all' && i.category !== selectedCategory) return false;
      return true;
    });
  }, [insights, dismissedIds, selectedPriority, selectedCategory]);

  const getPriorityBadgeClass = (priority: InsightPriority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      case 'low':
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
    }
  };

  const getCategoryIcon = (category: InsightCategory) => {
    switch (category) {
      case 'irrigation':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'soil':
        return <Layers className="w-4 h-4 text-emerald-600" />;
      case 'pest_disease':
        return <Bug className="w-4 h-4 text-amber-600" />;
      case 'weather':
        return <CloudSun className="w-4 h-4 text-sky-500" />;
      case 'fertilizer':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'harvest':
      default:
        return <Wheat className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                AI Farm Insights & Actionable Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
                Data-driven agronomic recommendations synthesized from virtual IoT sensors, weather forecasts, and crop growth stages.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={loadInsightsData}
            isLoading={refreshing}
            className="text-xs py-2 px-3 border-emerald-300 text-emerald-800 dark:text-emerald-300 gap-1.5"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Telemetry Insights
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Summary Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-sm">
        {/* Priority Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400 mr-1">
            Priority:
          </span>
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPriority(p)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedPriority === p
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950 text-stone-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold bg-emerald-50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="irrigation">Irrigation & Moisture</option>
            <option value="soil">Soil Fertility & pH</option>
            <option value="pest_disease">Pest & Disease Advisory</option>
            <option value="weather">Weather Risks</option>
            <option value="fertilizer">Nutrients (NPK)</option>
            <option value="harvest">Harvest & Yield</option>
          </select>
        </div>
      </div>

      {/* Insights Stream */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400 dark:text-emerald-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Synthesizing farm sensor readings and weather telemetry...</span>
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
            No Active Farm Warnings
          </h4>
          <p className="text-xs text-stone-500 dark:text-emerald-300/80 max-w-sm mx-auto">
            All your monitored farm plots and virtual IoT sensor parameters are operating within safe agronomic thresholds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md flex flex-col justify-between space-y-4 relative group"
            >
              <div>
                {/* Header: Priority + Category + Dismiss */}
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800/60 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${getPriorityBadgeClass(
                        insight.priority
                      )}`}
                    >
                      {insight.priority} Priority
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-stone-600 dark:text-emerald-300">
                      {getCategoryIcon(insight.category)}
                      <span className="capitalize">{insight.category.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDismiss(insight.id)}
                    className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                    title="Dismiss Insight"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Title & Description */}
                <h4 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 mb-1.5">
                  {insight.title}
                </h4>
                <p className="text-xs text-stone-600 dark:text-emerald-300/90 leading-relaxed mb-3">
                  {insight.explanation || insight.description}
                </p>

                {/* Supporting Telemetry Metric */}
                {insight.supporting_data && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-[#071F18] border border-emerald-100 dark:border-emerald-800/60 text-xs flex items-center gap-2 text-stone-700 dark:text-emerald-200">
                    <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium">
                      <strong>Observed Data:</strong>{' '}
                      {typeof insight.supporting_data === 'string'
                        ? insight.supporting_data
                        : JSON.stringify(insight.supporting_data)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                {/* Suggested Action Box */}
                {insight.suggested_action && (
                  <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-950 dark:text-emerald-100 mb-3">
                    <strong className="block font-bold text-[10px] uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-0.5">
                      Recommended Action:
                    </strong>
                    <span>{insight.suggested_action}</span>
                  </div>
                )}

                {/* Footer: Data Source Badge & Timestamp */}
                <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-emerald-400/70 pt-2 border-t border-emerald-100/60 dark:border-emerald-800/40">
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-emerald-950 font-mono font-semibold text-stone-600 dark:text-emerald-300">
                    Source: {insight.data_source}
                  </span>
                  <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
