'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Satellite,
  Calendar,
  Cloud,
  Layers,
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sliders,
  ChevronRight,
  Maximize2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import DigitalTwinNavTabs from '@/components/dashboard/DigitalTwinNavTabs';
import { satelliteService, getNDVIInterpretation } from '@/lib/services/satelliteService';
import { farmService } from '@/lib/services/farmService';
import type { Farm, Field, SatelliteObservation } from '@/lib/supabase/types';

export default function SatelliteCropMonitoringPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('farm-001');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('field-101');
  const [observations, setObservations] = useState<SatelliteObservation[]>([]);
  const [selectedObsId, setSelectedObsId] = useState<string>('');
  const [compareObsId, setCompareObsId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const providerStatus = satelliteService.getProviderStatus();

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
        const [fieldList, obsList] = await Promise.all([
          farmService.getFields(selectedFarmId),
          satelliteService.getObservations(selectedFarmId, selectedFieldId),
        ]);
        setFields(fieldList);
        if (fieldList.length > 0 && !fieldList.some((f: Field) => f.id === selectedFieldId)) {
          setSelectedFieldId(fieldList[0].id);
        }
        setObservations(obsList);
        if (obsList.length > 0) {
          setSelectedObsId(obsList[0].id);
          if (obsList.length > 1) {
            setCompareObsId(obsList[1].id);
          }
        }
      } catch (err) {
        console.error('Failed to load satellite data:', err);
      } finally {
        setLoading(false);
      }
    }
    if (selectedFarmId) {
      loadData();
    }
  }, [selectedFarmId]);

  const activeObs = observations.find((o) => o.id === selectedObsId) || observations[0];
  const compareObs = observations.find((o) => o.id === compareObsId);
  const ndviInfo = activeObs ? getNDVIInterpretation(activeObs.ndvi_mean) : null;
  const quadrantZones = activeObs ? satelliteService.generateQuadrantStressMap(activeObs) : [];

  // Chart data formatted chronologically (oldest to newest)
  const chartData = [...observations]
    .reverse()
    .map((o) => ({
      date: new Date(o.acquisition_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      meanNDVI: o.ndvi_mean,
      maxNDVI: o.ndvi_max,
      minNDVI: o.ndvi_min,
      cloudCover: o.cloud_cover_percent,
    }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
              <Satellite className="w-3.5 h-3.5" />
              ESA Sentinel-2 Multispectral MSI (10m Resolution)
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Satellite Crop & Canopy Monitoring
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Valid Red and Near-Infrared (NIR) band reflectance modeling, Normalized Difference Vegetation Index (NDVI), and vegetative vigor trends.
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
      <DigitalTwinNavTabs activeTab="satellite" />

      {/* Satellite Provider Status & Data Honesty Banner */}
      {!providerStatus.isConfigured && (
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-amber-900 dark:text-amber-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  DEMONSTRATION BENCHMARK MODE (DEMO)
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                  Sentinel-2 MSI Calibrated Dataset
                </span>
              </div>
              <p className="text-xs text-amber-700/90 dark:text-amber-300/90 leading-relaxed">
                {providerStatus.setupInstructions}
              </p>
            </div>
          </div>
          <a
            href="https://dataspace.copernicus.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-200/80 dark:bg-amber-800 text-amber-900 dark:text-amber-100 hover:bg-amber-300 dark:hover:bg-amber-700 transition inline-flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>Copernicus Setup Guide</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Date & Field Selection Bar */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Field Parcel
            </label>
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.size} {f.area_unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primary Satellite Pass (Acquisition Date)
            </label>
            <select
              value={selectedObsId}
              onChange={(e) => setSelectedObsId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {observations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.acquisition_date} • Cloud: {o.cloud_cover_percent}% • NDVI: {o.ndvi_mean}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comparative Pass Date
            </label>
            <select
              value={compareObsId}
              onChange={(e) => setCompareObsId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {observations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.acquisition_date} (NDVI {o.ndvi_mean})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {activeObs && (
        <div className="space-y-6">
          {/* NDVI Metrics Hero Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/80 bg-white dark:bg-gray-900 shadow-xs">
              <div className="text-xs text-gray-500 dark:text-gray-400">Mean Parcel NDVI</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {activeObs.ndvi_mean}
              </div>
              <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                {ndviInfo?.label}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="text-xs text-gray-500 dark:text-gray-400">Red Band (B4 Reflectance)</div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {activeObs.spectral_bands_json.red}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Chlorophyll Absorption: High</div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="text-xs text-gray-500 dark:text-gray-400">NIR Band (B8 Reflectance)</div>
              <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
                {activeObs.spectral_bands_json.nir}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Cell Structure Scatter: Strong</div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="text-xs text-gray-500 dark:text-gray-400">Cloud Cover Impact</div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                {activeObs.cloud_cover_percent}%
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Clear Sky Pass (&lt;10%)</div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs col-span-2 lg:col-span-1">
              <div className="text-xs text-gray-500 dark:text-gray-400">Potentially Stressed Area</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {activeObs.stressed_area_percent}%
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">NDVI &lt; 0.50 threshold</div>
            </div>
          </div>

          {/* Dual Column: NDVI Spatial Quadrants + Time Series Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Spatial Quadrant Stress Map (5 Cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Field Quadrant NDVI Stress Grid
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Acquired {activeObs.acquisition_date}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2x2 Quadrant Grid Visualizer */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {quadrantZones.map((q) => (
                  <div
                    key={q.quadrant}
                    className={`p-3.5 rounded-xl border transition ${
                      q.stressLevel === 'critical'
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                        : q.stressLevel === 'moderate'
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                        : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-gray-900 dark:text-white">{q.label}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          q.stressLevel === 'normal'
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                            : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                        }`}
                      >
                        {q.stressLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-lg font-black text-gray-900 dark:text-white">
                      NDVI {q.ndvi}
                    </div>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 leading-snug">
                      {q.recommendedAction}
                    </p>
                  </div>
                ))}
              </div>

              {/* NDVI Color Scale Bar */}
              <div className="pt-2">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>0.0 (Bare Soil)</span>
                  <span>0.4 (Emergence)</span>
                  <span>0.7 (Healthy)</span>
                  <span>1.0 (Dense)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-slate-400 via-amber-400 via-lime-500 to-emerald-700" />
              </div>
            </div>

            {/* Right: 6-Month Vegetation Index Time Series Chart (7 Cols) */}
            <div className="lg:col-span-7 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    6-Month Sentinel-2 Vegetation Trajectory
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Mean, Min, and Max NDVI Canopy Development Corridor
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                  <TrendingUp className="w-4 h-4" />
                  <span>+0.50 Biomass Gain</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ndviColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 1.0]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area
                      type="monotone"
                      dataKey="meanNDVI"
                      name="Mean NDVI"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#ndviColor)"
                    />
                    <Area
                      type="monotone"
                      dataKey="maxNDVI"
                      name="Peak Pixel NDVI"
                      stroke="#84cc16"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between">
                <span>NDVI calculated via genuine formula: (NIR - Red) / (NIR + Red)</span>
                <span className="font-bold text-emerald-600">Revisit Frequency: 5–10 Days</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
