'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Droplets,
  Thermometer,
  CloudRain,
  Sprout,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import DigitalTwinNavTabs from '@/components/dashboard/DigitalTwinNavTabs';
import { farmSimulatorService } from '@/lib/services/farmSimulatorService';
import { farmService } from '@/lib/services/farmService';
import type {
  Farm,
  SimulationParameters,
  SimulationResults,
  FarmSimulationScenario,
} from '@/lib/supabase/types';

const CROPS = ['Tomato', 'Cotton', 'Wheat', 'Onion'];
const GROWTH_STAGES: Record<string, string[]> = {
  Tomato: ['Vegetative', 'Flowering', 'Fruit Setting / Development', 'Harvesting'],
  Cotton: ['Vegetative', 'Flowering', 'Boll Formation', 'Maturity'],
  Wheat: ['Vegetative', 'Tillering', 'Grain Filling', 'Ripening'],
  Onion: ['Vegetative', 'Bulb Initiation', 'Bulb Development', 'Maturity'],
};

export default function WhatIfFarmSimulatorPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('farm-001');
  const [cropType, setCropType] = useState<string>('Tomato');
  const [scenarios, setScenarios] = useState<FarmSimulationScenario[]>([]);
  const [scenarioName, setScenarioName] = useState<string>('Deficit Irrigation & Heat Stress Test');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Baseline Parameters
  const baselineParams: SimulationParameters = {
    irrigation_mm: 35,
    initial_moisture_pct: 60,
    nitrogen_kg_acre: 60,
    phosphorus_kg_acre: 40,
    potassium_kg_acre: 50,
    growth_stage: 'Flowering',
    temp_anomaly_c: 0,
    rainfall_scenario: 'normal',
  };

  // Active / Modified Parameters
  const [params, setParams] = useState<SimulationParameters>({
    irrigation_mm: 20,
    initial_moisture_pct: 55,
    nitrogen_kg_acre: 50,
    phosphorus_kg_acre: 35,
    potassium_kg_acre: 45,
    growth_stage: 'Flowering',
    temp_anomaly_c: 2.5,
    rainfall_scenario: 'deficit_50',
  });

  const [baselineResults, setBaselineResults] = useState<SimulationResults>(
    farmSimulatorService.runSimulation('Tomato', baselineParams)
  );

  const [activeResults, setActiveResults] = useState<SimulationResults>(
    farmSimulatorService.runSimulation('Tomato', params)
  );

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
    async function loadSavedScenarios() {
      try {
        const list = await farmSimulatorService.getScenarios(selectedFarmId);
        setScenarios(list);
      } catch (err) {
        console.error('Failed to load scenarios:', err);
      }
    }
    loadSavedScenarios();
  }, [selectedFarmId]);

  // Recalculate whenever params or cropType changes
  useEffect(() => {
    const updated = farmSimulatorService.runSimulation(cropType, params);
    setActiveResults(updated);
    const updatedBaseline = farmSimulatorService.runSimulation(cropType, baselineParams);
    setBaselineResults(updatedBaseline);
  }, [cropType, params]);

  const handleSaveScenario = async () => {
    try {
      const saved = await farmSimulatorService.saveScenario(
        selectedFarmId,
        scenarioName,
        cropType,
        params,
        activeResults
      );
      setScenarios([saved, ...scenarios]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save scenario:', err);
    }
  };

  const handleReset = () => {
    setParams({ ...baselineParams });
  };

  // Chart Comparison Data
  const comparisonChartData = [
    {
      metric: 'Water Use (m³)',
      Baseline: baselineResults.water_consumption_m3,
      Scenario: activeResults.water_consumption_m3,
    },
    {
      metric: 'Stress Index (0-100)',
      Baseline: baselineResults.stress_index,
      Scenario: activeResults.stress_index,
    },
    {
      metric: 'Yield Range Mid (Q/Ac)',
      Baseline: parseFloat(
        (
          (baselineResults.expected_yield_range.min +
            baselineResults.expected_yield_range.max) /
          2
        ).toFixed(1)
      ),
      Scenario: parseFloat(
        (
          (activeResults.expected_yield_range.min +
            activeResults.expected_yield_range.max) /
          2
        ).toFixed(1)
      ),
    },
    {
      metric: 'Resource Cost (₹)',
      Baseline: baselineResults.resource_cost_inr / 50, // scaled for chart visibility
      Scenario: activeResults.resource_cost_inr / 50,
    },
  ];

  // Moisture 7-day Line Chart Data
  const moistureTrendData = activeResults.soil_moisture_trend_pct.map((val, idx) => ({
    day: `Day ${idx + 1}`,
    ScenarioMoisture: val,
    BaselineMoisture: baselineResults.soil_moisture_trend_pct[idx] || 60,
    StressThreshold: 40,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
              <Sliders className="w-3.5 h-3.5" />
              FAO-56 Agronomic Response & Micro-Climate Simulator
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              What-If Farm Simulator
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Model irrigation variations, thermal anomalies, and fertilizer adjustments against baseline conditions to predict resource consumption and yield impact.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 text-xs font-semibold transition inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Baseline
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <DigitalTwinNavTabs activeTab="simulator" />

      {/* Non-Guaranteed Simulation Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs shadow-xs">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-gray-900 dark:text-white">Simulation Disclaimer: </strong>
          Outputs are calculated using transparent mathematical response models based on FAO-56 dual crop coefficients and agronomic nutrient response curves. Results represent theoretical scenario projections for decision support and do not constitute guaranteed harvest yields.
        </p>
      </div>

      {/* Simulation Controls & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Scenario Inputs (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Scenario Input Parameters
              </h3>
            </div>
            <select
              value={cropType}
              onChange={(e) => {
                setCropType(e.target.value);
                setParams({
                  ...params,
                  growth_stage: GROWTH_STAGES[e.target.value]?.[0] || 'Vegetative',
                });
              }}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Form Controls */}
          <div className="space-y-4 text-xs">
            {/* Irrigation Depth Slider */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-gray-700 dark:text-gray-300">
                  Irrigation Depth: {params.irrigation_mm} mm
                </span>
                <span className="text-gray-400">Baseline: 35 mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={params.irrigation_mm}
                onChange={(e) =>
                  setParams({ ...params, irrigation_mm: parseInt(e.target.value) || 0 })
                }
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Starting Soil Moisture */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-gray-700 dark:text-gray-300">
                  Starting Soil Moisture: {params.initial_moisture_pct}%
                </span>
                <span className="text-gray-400">Baseline: 60%</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                step="5"
                value={params.initial_moisture_pct}
                onChange={(e) =>
                  setParams({ ...params, initial_moisture_pct: parseInt(e.target.value) || 50 })
                }
                className="w-full accent-sky-600"
              />
            </div>

            {/* Growth Stage Selector */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Crop Phenology / Growth Stage
              </label>
              <select
                value={params.growth_stage}
                onChange={(e) => setParams({ ...params, growth_stage: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {(GROWTH_STAGES[cropType] || GROWTH_STAGES.Tomato).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Anomaly */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-gray-700 dark:text-gray-300">
                  Temperature Anomaly: {params.temp_anomaly_c > 0 ? `+${params.temp_anomaly_c}` : params.temp_anomaly_c}°C
                </span>
                <span className="text-gray-400">Baseline: 0°C</span>
              </div>
              <input
                type="range"
                min="-3"
                max="5"
                step="0.5"
                value={params.temp_anomaly_c}
                onChange={(e) =>
                  setParams({ ...params, temp_anomaly_c: parseFloat(e.target.value) || 0 })
                }
                className="w-full accent-amber-600"
              />
            </div>

            {/* Rainfall Scenario */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Precipitation Scenario
              </label>
              <select
                value={params.rainfall_scenario}
                onChange={(e) => setParams({ ...params, rainfall_scenario: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="drought">Severe Drought (0 mm rain)</option>
                <option value="deficit_50">50% Deficit Monsoon (10 mm rain)</option>
                <option value="normal">Normal Seasonal Rain (25 mm rain)</option>
                <option value="excess_30">+30% Excess Rain (45 mm rain)</option>
              </select>
            </div>

            {/* Fertilizer Inputs (N-P-K) */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Fertilizer Inputs (kg/acre):
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-gray-500">Nitrogen (N)</span>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={params.nitrogen_kg_acre}
                    onChange={(e) =>
                      setParams({ ...params, nitrogen_kg_acre: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500">Phosphorus (P)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={params.phosphorus_kg_acre}
                    onChange={(e) =>
                      setParams({ ...params, phosphorus_kg_acre: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500">Potassium (K)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={params.potassium_kg_acre}
                    onChange={(e) =>
                      setParams({ ...params, potassium_kg_acre: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Save Scenario Form */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <label className="block font-semibold text-gray-700 dark:text-gray-300">
                Save Current Scenario
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                />
                <button
                  type="button"
                  onClick={handleSaveScenario}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs flex items-center gap-1 shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
              {savedSuccess && (
                <p className="text-[11px] text-emerald-600 font-bold">
                  ✓ Scenario saved successfully to registry!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Results & Dynamic Analytics (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Headline Scenario Scoreboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="text-xs text-gray-500">Water Consumption</div>
              <div className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1">
                {activeResults.water_consumption_m3} m³
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                Baseline: {baselineResults.water_consumption_m3} m³
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="text-xs text-gray-500">Crop Stress Index</div>
              <div
                className={`text-xl font-black mt-1 ${
                  activeResults.stress_index > 50
                    ? 'text-rose-600'
                    : activeResults.stress_index > 25
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {activeResults.stress_index} / 100
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                Baseline: {baselineResults.stress_index} / 100
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="text-xs text-gray-500">Projected Yield Impact</div>
              <div
                className={`text-xl font-black mt-1 flex items-center ${
                  activeResults.projected_yield_change_pct >= 0
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
              >
                {activeResults.projected_yield_change_pct >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {activeResults.projected_yield_change_pct > 0 ? '+' : ''}
                {activeResults.projected_yield_change_pct}%
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                Range: {activeResults.expected_yield_range.min}–{activeResults.expected_yield_range.max} Q
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="text-xs text-gray-500">Resource Expense</div>
              <div className="text-xl font-black text-gray-900 dark:text-white mt-1">
                ₹{activeResults.resource_cost_inr.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                Power + NPK Fertilizer
              </div>
            </div>
          </div>

          {/* Comparative Metrics Bar Chart */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Baseline vs Simulated Scenario Multi-Metric Comparison
            </h3>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
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
                  <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Scenario" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 7-Day Soil Moisture Projected Depletion Curve */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                7-Day Soil Moisture Projection Curve
              </h3>
              <span className="text-xs text-amber-600 font-semibold">
                Stress Limit: 40% Moisture
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moistureTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis domain={[10, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    type="monotone"
                    dataKey="ScenarioMoisture"
                    name="Scenario Moisture (%)"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="BaselineMoisture"
                    name="Baseline Moisture (%)"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="StressThreshold"
                    name="Critical Stress Level"
                    stroke="#e11d48"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Factors & Agronomic Observations */}
          {activeResults.risk_factors.length > 0 && (
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4" />
                Agronomic Simulation Risk Alerts ({activeResults.risk_factors.length})
              </div>
              <ul className="space-y-1 text-rose-900/90 dark:text-rose-200">
                {activeResults.risk_factors.map((rf, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
