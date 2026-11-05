'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { farmService } from '@/lib/services/farmService';
import { iotService } from '@/lib/services/iotService';
import { aiFarmService } from '@/lib/services/aiFarmService';
import type { Farm, Field, RecommendedCropItem, CropRecommendation } from '@/lib/supabase/types';
import {
  Sparkles,
  MapPin,
  Layers,
  Droplets,
  Calendar,
  Compass,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Wheat,
  ShieldCheck,
  RefreshCw,
  Info,
  Sliders,
  Table,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const SOIL_TYPES = [
  'Red Sandy Loam',
  'Black Cotton',
  'Alluvial Soil',
  'Clay Loam',
  'Laterite Soil',
  'Coastal Sandy',
];

const SEASONS = ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)', 'Perennial'];

const IRRIGATION_TYPES = [
  'Drip Irrigation',
  'Sprinkler Irrigation',
  'Canal / Flood',
  'Tube-well / Borewell',
  'Rainfed (Monsoon Only)',
];

export default function CropRecommendationPage() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const userId = user?.id || profile?.id || 'demo-farmer-001';

  // Registered Farms & Fields
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');

  // Form State
  const [soilType, setSoilType] = useState<string>('Red Sandy Loam');
  const [soilPh, setSoilPh] = useState<number>(6.5);
  const [soilMoisture, setSoilMoisture] = useState<number>(45);
  const [moistureSource, setMoistureSource] = useState<'sensor' | 'manual'>('manual');
  const [season, setSeason] = useState<string>('Kharif (Monsoon)');
  const [irrigation, setIrrigation] = useState<string>('Drip Irrigation');
  const [farmArea, setFarmArea] = useState<number>(2.5);
  const [state, setState] = useState<string>('Karnataka');
  const [district, setDistrict] = useState<string>('Kolar');

  // Recommendation State
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<RecommendedCropItem[]>([]);
  const [topCrop, setTopCrop] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cards' | 'comparison'>('cards');

  // Load User Farms
  useEffect(() => {
    async function loadFarms() {
      try {
        const userFarms = await farmService.getFarms(userId);
        setFarms(userFarms);
        if (userFarms.length > 0) {
          const first = userFarms[0];
          setSelectedFarmId(first.id);
          if (first.soil_type) setSoilType(first.soil_type);
          if (first.state) setState(first.state);
          if (first.district) setDistrict(first.district);
          if (first.area) setFarmArea(first.area);
          if (first.irrigation_type) setIrrigation(first.irrigation_type);

          // Load fields
          const farmFields = await farmService.getFields(first.id, userId);
          setFields(farmFields);
          if (farmFields.length > 0) {
            setSelectedFieldId(farmFields[0].id);
          }

          // Check virtual IoT moisture reading
          try {
            const readings = await iotService.getReadings({
              farmId: first.id,
              parameter: 'soil_moisture',
              limit: 1,
              userId,
            });
            if (readings.length > 0) {
              setSoilMoisture(Math.round(readings[0].value));
              setMoistureSource('sensor');
            }
          } catch {
            // Keep default
          }
        }
      } catch (err) {
        console.warn('Failed to load farms for crop recommendation:', err);
      }
    }
    loadFarms();
  }, [userId]);

  // Handle Farm Change
  const handleFarmChange = async (farmId: string) => {
    setSelectedFarmId(farmId);
    if (!farmId) {
      setFields([]);
      setSelectedFieldId('');
      setMoistureSource('manual');
      return;
    }
    const farm = farms.find((f) => f.id === farmId);
    if (farm) {
      if (farm.soil_type) setSoilType(farm.soil_type);
      if (farm.state) setState(farm.state);
      if (farm.district) setDistrict(farm.district);
      if (farm.area) setFarmArea(farm.area);
      if (farm.irrigation_type) setIrrigation(farm.irrigation_type);

      try {
        const farmFields = await farmService.getFields(farmId, userId);
        setFields(farmFields);
        if (farmFields.length > 0) setSelectedFieldId(farmFields[0].id);

        const readings = await iotService.getReadings({
          farmId,
          parameter: 'soil_moisture',
          limit: 1,
          userId,
        });
        if (readings.length > 0) {
          setSoilMoisture(Math.round(readings[0].value));
          setMoistureSource('sensor');
        } else {
          setMoistureSource('manual');
        }
      } catch {
        setMoistureSource('manual');
      }
    }
  };

  // Run Recommendation Analysis
  const handleRunRecommendation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soilType,
          soilPh,
          soilMoisture,
          season,
          state,
          district,
          irrigationType: irrigation,
          farmArea,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to calculate crop suitability.');
      }

      setRecommendations(data.recommendations || []);
      setTopCrop(data.top_crop || '');
      setRationale(data.agronomic_rationale || '');

      // Persist to user's recommendation history
      const recData: Omit<CropRecommendation, 'id' | 'created_at'> = {
        user_id: userId,
        farm_id: selectedFarmId || undefined,
        field_id: selectedFieldId || undefined,
        season,
        soil_type: soilType,
        soil_ph: soilPh,
        soil_moisture: soilMoisture,
        water_availability: irrigation,
        top_crop: data.top_crop || 'Paddy (Rice)',
        recommended_crops: data.recommendations || [],
        rationale: data.agronomic_rationale,
      };

      await aiFarmService.saveRecommendation(recData, userId);
    } catch (err: any) {
      console.error('Recommendation error:', err);
      setErrorMessage(err.message || 'Unable to generate crop recommendation.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                Smart Crop Recommendation Engine
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
                Multi-factor agronomic evaluation based on soil characteristics, rainfall forecasts, and ICAR suitability models.
              </p>
            </div>
          </div>
        </div>

        {/* Data Authenticity Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ICAR Multi-Factor Agronomic Model</span>
        </div>
      </div>

      {/* Grid: Form Parameters (Left) + Recommendations View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleRunRecommendation}
            className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md space-y-4"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-2 pb-2 border-b border-emerald-100 dark:border-emerald-800/60">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Plot & Environmental Variables</span>
            </h3>

            {/* Farm Selector */}
            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                Link to Farm Plot
              </label>
              <select
                value={selectedFarmId}
                onChange={(e) => handleFarmChange(e.target.value)}
                className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
              >
                <option value="">Manual Exploration (No Farm Linked)</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.district || f.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Soil Type */}
            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                Soil Classification
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
              >
                {SOIL_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Soil pH Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-emerald-300 mb-1">
                <span>Soil pH Value</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">
                  {soilPh.toFixed(1)} {soilPh < 6 ? '(Acidic)' : soilPh > 7.5 ? '(Alkaline)' : '(Neutral)'}
                </span>
              </div>
              <input
                type="range"
                min="4.5"
                max="9.0"
                step="0.1"
                value={soilPh}
                onChange={(e) => setSoilPh(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 dark:text-emerald-500 font-mono">
                <span>4.5 Acidic</span>
                <span>7.0 Neutral</span>
                <span>9.0 Alkaline</span>
              </div>
            </div>

            {/* Soil Moisture */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-emerald-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>Soil Moisture (%)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold">
                    {soilMoisture}%
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      moistureSource === 'sensor'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-stone-100 text-stone-600 dark:bg-emerald-950 dark:text-emerald-400'
                    }`}
                  >
                    {moistureSource === 'sensor' ? 'Virtual IoT' : 'Manual'}
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="1"
                value={soilMoisture}
                onChange={(e) => {
                  setSoilMoisture(parseInt(e.target.value));
                  setMoistureSource('manual');
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Season & Irrigation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                  Upcoming Season
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                  Irrigation System
                </label>
                <select
                  value={irrigation}
                  onChange={(e) => setIrrigation(e.target.value)}
                  className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
                >
                  {IRRIGATION_TYPES.map((it) => (
                    <option key={it} value={it}>
                      {it}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location (State & District) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Error Notice */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isEvaluating}
              className="w-full py-3 text-sm font-bold shadow-lg shadow-emerald-700/20"
              icon={<Sparkles className="w-4 h-4" />}
            >
              {isEvaluating ? 'Evaluating Crop Models...' : 'Generate Crop Recommendations'}
            </Button>
          </form>
        </div>

        {/* Right Column: Recommendations Output */}
        <div className="lg:col-span-7 space-y-4">
          {recommendations.length > 0 ? (
            <div className="space-y-5">
              {/* Top Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    Highest Suitability Match
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black">{topCrop}</h3>
                  <p className="text-xs text-emerald-100 mt-1 max-w-lg leading-relaxed">
                    {rationale}
                  </p>
                </div>

                {/* View switcher */}
                <div className="flex items-center gap-1 bg-white/20 p-1 rounded-xl self-start sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('cards')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      activeTab === 'cards' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white'
                    }`}
                  >
                    Crop Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('comparison')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      activeTab === 'comparison' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white'
                    }`}
                  >
                    Comparison Table
                  </button>
                </div>
              </div>

              {/* View 1: Crop Cards */}
              {activeTab === 'cards' ? (
                <div className="space-y-4">
                  {recommendations.map((crop, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100 dark:border-emerald-800/60">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <h4 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100">
                              {crop.crop_name || crop.name}
                            </h4>
                          </div>
                          {crop.scientific_name && (
                            <span className="text-[11px] italic text-stone-500 dark:text-emerald-400 pl-7">
                              {crop.scientific_name}
                            </span>
                          )}
                        </div>

                        {/* Suitability Badge & Bar */}
                        <div className="flex items-center gap-3">
                          <div className="w-28 sm:w-36 bg-emerald-100 dark:bg-emerald-950 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2.5 rounded-full"
                              style={{ width: `${crop.suitability_score}%` }}
                            />
                          </div>
                          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                            {crop.suitability_score}%
                          </span>
                        </div>
                      </div>

                      {/* Metrics Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-[#071F18] border border-emerald-100 dark:border-emerald-800/60">
                          <span className="text-[10px] text-stone-500 dark:text-emerald-400 block">Water Need</span>
                          <span className="font-bold text-emerald-900 dark:text-emerald-200">{crop.water_requirement}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-[#071F18] border border-emerald-100 dark:border-emerald-800/60">
                          <span className="text-[10px] text-stone-500 dark:text-emerald-400 block">Crop Duration</span>
                          <span className="font-bold text-emerald-900 dark:text-emerald-200">
                            {crop.duration_days || crop.growing_duration}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-[#071F18] border border-emerald-100 dark:border-emerald-800/60">
                          <span className="text-[10px] text-stone-500 dark:text-emerald-400 block">Est. Yield</span>
                          <span className="font-bold text-emerald-900 dark:text-emerald-200">
                            {crop.expected_yield || crop.estimated_yield}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-[#071F18] border border-emerald-100 dark:border-emerald-800/60">
                          <span className="text-[10px] text-stone-500 dark:text-emerald-400 block">Profit Potential</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-300">{crop.profit_potential}</span>
                        </div>
                      </div>

                      {/* Recommended Varieties */}
                      {crop.recommended_varieties && crop.recommended_varieties.length > 0 && (
                        <div className="text-xs">
                          <span className="font-bold text-stone-600 dark:text-emerald-300">
                            Recommended Regional Varieties:{' '}
                          </span>
                          <span className="text-stone-700 dark:text-emerald-200">
                            {crop.recommended_varieties.join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Suitable Conditions */}
                      <p className="text-xs text-stone-600 dark:text-emerald-300/80 leading-relaxed">
                        <strong>Why Suitable:</strong> {crop.suitable_conditions}
                      </p>

                      {/* Potential Risks */}
                      {crop.potential_risks && crop.potential_risks.length > 0 && (
                        <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                          <span className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Agronomic Risks & Countermeasures:
                          </span>
                          <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                            {crop.potential_risks.map((risk, rIdx) => (
                              <li key={rIdx}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* View 2: Comparison Table */
                <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-emerald-200 dark:border-emerald-800 text-[10px] uppercase font-bold text-stone-500 dark:text-emerald-400">
                        <th className="py-2.5 px-3">Crop Name</th>
                        <th className="py-2.5 px-3">Suitability</th>
                        <th className="py-2.5 px-3">Water Need</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Est. Yield</th>
                        <th className="py-2.5 px-3">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/60">
                      {recommendations.map((crop, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40">
                          <td className="py-3 px-3 font-bold text-emerald-950 dark:text-emerald-100">
                            {crop.crop_name || crop.name}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            {crop.suitability_score}%
                          </td>
                          <td className="py-3 px-3 text-stone-700 dark:text-emerald-200">
                            {crop.water_requirement}
                          </td>
                          <td className="py-3 px-3 text-stone-700 dark:text-emerald-200">
                            {crop.duration_days || crop.growing_duration}
                          </td>
                          <td className="py-3 px-3 text-stone-700 dark:text-emerald-200 font-medium">
                            {crop.expected_yield || crop.estimated_yield}
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-300">
                            {crop.profit_potential}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md min-h-[460px] flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-inner">
                <Wheat className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                Ready to Evaluate Crop Feasibility
              </h4>
              <p className="text-xs text-stone-500 dark:text-emerald-300/80 max-w-sm">
                Select your farm plot, adjust soil pH, moisture, and season on the left, then click &quot;Generate Crop Recommendations&quot; to calculate optimal planting matches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
