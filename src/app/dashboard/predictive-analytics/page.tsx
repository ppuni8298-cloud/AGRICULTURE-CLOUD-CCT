'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  AlertTriangle,
  Droplets,
  CloudRain,
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  ChevronRight,
  Activity,
  Wind,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import DigitalTwinNavTabs from '@/components/dashboard/DigitalTwinNavTabs';
import {
  predictiveAnalyticsService,
  DailyStressPrediction,
  SoilDepletionForecast,
  WeatherHazardRadar,
  WaterDemandSchedule,
} from '@/lib/services/predictiveAnalyticsService';
import { farmService } from '@/lib/services/farmService';
import type { Farm, Field, PredictiveInsight } from '@/lib/supabase/types';

export default function PredictiveFarmAnalyticsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('farm-001');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('field-101');
  const [stressPredictions, setStressPredictions] = useState<DailyStressPrediction[]>([]);
  const [moistureForecast, setMoistureForecast] = useState<SoilDepletionForecast[]>([]);
  const [weatherHazards, setWeatherHazards] = useState<WeatherHazardRadar[]>([]);
  const [waterSchedule, setWaterSchedule] = useState<WaterDemandSchedule[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFarms() {
      try {
        const farmList = await farmService.getFarms();
        setFarms(farmList);
        if (farmList.length > 0) setSelectedFarmId(farmList[0].id);
      } catch (err) {
        console.error('Failed to load farms:', err);
      }
    }
    loadFarms();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const fieldList = await farmService.getFields(selectedFarmId);
        setFields(fieldList);
        if (fieldList.length > 0 && !fieldList.some((f: Field) => f.id === selectedFieldId)) {
          setSelectedFieldId(fieldList[0].id);
        }

        // Generate predictive streams
        const stressData = predictiveAnalyticsService.get14DayStressTrajectory('Tomato', 58, 29);
        const depletionData = predictiveAnalyticsService.getSoilMoistureDepletionCurve(58);
        const hazards = predictiveAnalyticsService.getWeatherHazardRadar();
        const schedule = predictiveAnalyticsService.getWaterDemandSchedule('Tomato');
        const insightList = await predictiveAnalyticsService.getPredictiveInsights(selectedFarmId);

        setStressPredictions(stressData);
        setMoistureForecast(depletionData);
        setWeatherHazards(hazards);
        setWaterSchedule(schedule);
        setInsights(insightList);
      } catch (err) {
        console.error('Error loading predictive analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    if (selectedFarmId) {
      loadData();
    }
  }, [selectedFarmId]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Multi-Source Predictive Intelligence & Hazard Radar
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Predictive Farm Analytics
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Synthesizing historical IoT telemetry, Sentinel-2 canopy trajectories, Open-Meteo forecasts, and agronomic phenology models.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="px-3.5 py-2 text-sm font-semibold rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.district})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <DigitalTwinNavTabs activeTab="predictive" />

      {/* Data Provenance Standards Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-3 text-emerald-900 dark:text-emerald-200 text-xs shadow-xs">
        <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-gray-900 dark:text-white">Data Provenance Standards: </strong>
          Every metric displays its originating intelligence source: <span className="font-semibold text-sky-700 dark:text-sky-300">[Measured IoT]</span> for calibrated ground probes, <span className="font-semibold text-purple-700 dark:text-purple-300">[Satellite Spectral]</span> for Sentinel-2 passes, <span className="font-semibold text-emerald-700 dark:text-emerald-300">[User-Entered]</span> for farm logs, and <span className="font-semibold text-amber-700 dark:text-amber-300">[Predictive Model Output]</span> for algorithmic projections.
        </p>
      </div>

      {/* 4 Actionable Intelligence Stream Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                14-Day Peak Stress Risk
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                Moderate Risk
              </span>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              64% <span className="text-xs font-normal text-gray-500">on Day 9</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Driven by cumulative soil evapotranspiration without scheduled replenishment.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 font-mono">
            Source: [Predictive Model Output]
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Moisture Stress Breach
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                In 3 Days
              </span>
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              38.2% <span className="text-xs font-normal text-gray-500">(&lt; 40% Threshold)</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Root-zone moisture drops below critical 40% agronomic limit on Day 3.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 font-mono">
            Source: [Measured IoT + ET0 Model]
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Fungal Disease Window
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                62% High Prob
              </span>
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
              42 Hours <span className="text-xs font-normal text-gray-500">Favorable</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Relative humidity &gt;82% sustained with 19–22°C nocturnal temperatures.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 font-mono">
            Source: [Weather Forecast + Canopy NDVI]
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Recommended Water Depth
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200">
                Day 2 Morning
              </span>
            </div>
            <div className="text-2xl font-black text-sky-600 dark:text-sky-400">
              22 mm <span className="text-xs font-normal text-gray-500">(89 m³/acre)</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Drip run time: 2.5 hours prior to 09:00 AM to replenish active root zone.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 font-mono">
            Source: [Agronomic Water Scheduler]
          </div>
        </div>
      </div>

      {/* Predictive Visualizations (2 Charts Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 14-Day Crop Stress Probability Curve */}
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                14-Day Cumulative Crop Stress Trajectory
              </h3>
              <p className="text-[11px] text-gray-500">
                Daily Combined Stress Probability (%) vs 50% Warning Line
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-600">[Predictive Output]</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stressPredictions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Area
                  type="monotone"
                  dataKey="stressProbabilityPct"
                  name="Stress Probability (%)"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#stressGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Root-Zone Soil Moisture Depletion Curve */}
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Root-Zone Soil Moisture Depletion Curve
              </h3>
              <p className="text-[11px] text-gray-500">
                10-Day Projected Evapotranspiration Without Supplementary Rain
              </p>
            </div>
            <span className="text-[11px] font-mono text-sky-600">[Measured + ET0]</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moistureForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[10, 80]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Line
                  type="monotone"
                  dataKey="rootZoneMoisturePct"
                  name="Moisture (%)"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="stressThreshold"
                  name="Stress Threshold (40%)"
                  stroke="#e11d48"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="permanentWiltingPoint"
                  name="Wilting Point (20%)"
                  stroke="#64748b"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Atmospheric Hazard Radar & Water Demand Scheduler (2 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Hazards Radar Table */}
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Micro-Climate Hazard Radar
              </h3>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Open-Meteo 7-Day Model</span>
          </div>

          <div className="space-y-2.5">
            {weatherHazards.map((h, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white">{h.hazard}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      h.severity === 'high'
                        ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                        : h.severity === 'medium'
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {h.probabilityPct}% Probability ({h.timeframe})
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Action: </span>
                  {h.mitigationAction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Water Demand Scheduler */}
        <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Predictive Water Demand Schedule
              </h3>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Drip Scheduling</span>
          </div>

          <div className="space-y-3">
            {waterSchedule.map((ws, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {ws.recommendedDate}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        ws.urgency === 'critical'
                          ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                          : ws.urgency === 'recommended'
                          ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                          : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                      }`}
                    >
                      {ws.urgency.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                    {ws.rationale}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-black text-sky-600 dark:text-sky-400">
                    {ws.waterDepthMm} mm
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {ws.dripRunHours}h run time
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Provenance Documented Insights */}
      <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Active Multi-Source Predictive Agronomic Assessments ({insights.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {ins.title}
                </span>
                <span className="text-[10px] font-bold text-emerald-600">
                  Confidence: {ins.confidence_score}%
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {ins.summary}
              </p>

              {/* Data Sources Provenance Pill List */}
              <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="text-[10px] font-semibold text-gray-500 uppercase mb-1">
                  Supporting Data Sources & Observations:
                </div>
                <div className="space-y-1">
                  {ins.data_sources_json.map((src, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                      <span className="px-1.5 py-0.5 rounded-sm bg-gray-200 dark:bg-gray-700 font-mono text-[9px] text-gray-800 dark:text-gray-200">
                        {src.source_type}
                      </span>
                      <span className="truncate">{src.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable recommendations */}
              <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50 space-y-1">
                {ins.actionable_recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
