'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { farmService } from '@/lib/services/farmService';
import { iotService } from '@/lib/services/iotService';
import { weatherService, WeatherData } from '@/lib/services/weatherService';
import { irrigationService, IrrigationAnalysisResult } from '@/lib/services/irrigationService';
import { Button } from '@/components/ui/Button';
import type { Farm, Field, Crop, SensorReading } from '@/lib/supabase/types';
import {
  Droplets,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Sliders,
  Wheat,
  MapPin,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

export default function SmartIrrigationAdvisorPage() {
  const { user } = useAuth();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Field Selection
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');

  // Farmer Configurable Thresholds
  const [customMinMoisture, setCustomMinMoisture] = useState<number>(40);
  const [customMaxMoisture, setCustomMaxMoisture] = useState<number>(75);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allFarms, allFields, allCrops, allReadings] = await Promise.all([
        farmService.getFarms(user?.id),
        farmService.getFields(undefined, user?.id),
        farmService.getCrops(undefined, undefined, user?.id),
        iotService.getReadings({ parameter: 'soil_moisture', limit: 200, userId: user?.id }),
      ]);

      setFarms(allFarms);
      setFields(allFields);
      setCrops(allCrops);
      setReadings(allReadings);

      if (allFarms.length > 0) {
        setSelectedFarmId(allFarms[0].id);
        const relatedFields = allFields.filter((f) => f.farm_id === allFarms[0].id);
        if (relatedFields.length > 0) {
          setSelectedFieldId(relatedFields[0].id);
        }
        // Fetch weather for farm district
        const wData = await weatherService.fetchWeather(allFarms[0].district);
        setWeather(wData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When farm changes, update field options and weather
  const handleFarmChange = async (farmId: string) => {
    setSelectedFarmId(farmId);
    const relatedFields = fields.filter((f) => f.farm_id === farmId);
    if (relatedFields.length > 0) {
      setSelectedFieldId(relatedFields[0].id);
    } else {
      setSelectedFieldId('');
    }
    const farm = farms.find((f) => f.id === farmId);
    if (farm) {
      const wData = await weatherService.fetchWeather(farm.district);
      setWeather(wData);
    }
  };

  const currentFarm = useMemo(() => farms.find((f) => f.id === selectedFarmId) || null, [farms, selectedFarmId]);
  const currentField = useMemo(() => fields.find((f) => f.id === selectedFieldId) || null, [fields, selectedFieldId]);
  const currentCrop = useMemo(
    () => crops.find((c) => c.field_id === selectedFieldId && c.status === 'active') || null,
    [crops, selectedFieldId]
  );

  // Latest moisture reading for selected field
  const latestMoisture = useMemo(() => {
    if (!selectedFieldId) return null;
    const fieldReadings = readings.filter((r) => r.field_id === selectedFieldId);
    return fieldReadings.length > 0 ? fieldReadings[0] : null;
  }, [readings, selectedFieldId]);

  // Compute Rule-Based Irrigation Advisory
  const advisory: IrrigationAnalysisResult | null = useMemo(() => {
    if (!currentFarm || !currentField) return null;
    return irrigationService.evaluateIrrigation({
      farm: currentFarm,
      field: currentField,
      activeCrop: currentCrop,
      latestMoistureReading: latestMoisture,
      userCustomMinMoisture: customMinMoisture,
      userCustomMaxMoisture: customMaxMoisture,
      weather,
    });
  }, [currentFarm, currentField, currentCrop, latestMoisture, customMinMoisture, customMaxMoisture, weather]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Evaluating soil moisture telemetry and meteorological forecasts...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Smart Irrigation Advisor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Rule-based agronomic water budget engine incorporating soil capacitance telemetry & Open-Meteo precipitation models.
          </p>
        </div>

        <Link href="/dashboard/monitoring">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5 self-start sm:self-auto">
            <span>Live Telemetry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Target Plot Selector Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Farm Holding:</span>
          </div>
          <select
            value={selectedFarmId}
            onChange={(e) => handleFarmChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-emerald-800 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.district})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 ml-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Target Field Plot:</span>
          </div>
          <select
            value={selectedFieldId}
            onChange={(e) => setSelectedFieldId(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 dark:border-emerald-800 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
          >
            {fields
              .filter((f) => f.farm_id === selectedFarmId)
              .map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.size} {f.area_unit})
                </option>
              ))}
          </select>
        </div>

        {currentCrop && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-lime-100 text-lime-900 border border-lime-300 dark:bg-lime-950 dark:text-lime-300">
            <Wheat className="w-3.5 h-3.5" />
            <span>Active Crop: {currentCrop.name} ({currentCrop.growth_stage})</span>
          </div>
        )}
      </div>

      {/* Threshold Configuration Drawer */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Farmer-Configured Irrigation Threshold Envelope
            </h3>
          </div>
          <span className="text-xs text-gray-400">Customizable trigger levels</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-gray-700 dark:text-gray-300">Minimum Moisture Threshold (Trigger Watering)</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{customMinMoisture}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={60}
              value={customMinMoisture}
              onChange={(e) => setCustomMinMoisture(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[10px] text-gray-400">Recommend irrigation if soil capacitance falls below this limit</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-gray-700 dark:text-gray-300">Maximum Moisture Threshold (Saturation Limit)</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{customMaxMoisture}%</span>
            </div>
            <input
              type="range"
              min={65}
              max={95}
              value={customMaxMoisture}
              onChange={(e) => setCustomMaxMoisture(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[10px] text-gray-400">Halt irrigation if volumetric moisture exceeds this limit</span>
          </div>
        </div>
      </div>

      {/* Main Advisory Banner Card */}
      {advisory && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-emerald-800/30">
            <div className="flex items-center gap-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${advisory.statusBadgeColor}`}>
                {advisory.status.replace('_', ' ')}
              </span>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {advisory.statusTitle}
              </h2>
            </div>

            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Calculated {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          </div>

          {/* Recommendation & Explanation */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-sm font-semibold leading-relaxed">
              {advisory.recommendation}
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-gray-100 dark:border-emerald-800/20 space-y-1">
              <span className="font-bold text-gray-900 dark:text-white block">Agronomic Rationale:</span>
              <p>{advisory.explanation}</p>
            </div>
          </div>

          {/* Environmental Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-emerald-950/30 border border-gray-100 dark:border-emerald-800/30 space-y-1">
              <span className="text-[11px] text-gray-500 block">Root-Zone Moisture</span>
              <div className="text-xl font-black text-gray-900 dark:text-white">
                {advisory.soilMoistureValue !== null ? `${advisory.soilMoistureValue}%` : 'N/A'}
              </div>
              <span className="text-[10px] text-gray-400 block truncate">{advisory.soilMoistureStatus}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-emerald-950/30 border border-gray-100 dark:border-emerald-800/30 space-y-1">
              <span className="text-[11px] text-gray-500 block">Recent Rainfall (Current)</span>
              <div className="text-xl font-black text-gray-900 dark:text-white">
                {advisory.recentRainfallMm} <span className="text-xs font-semibold">mm</span>
              </div>
              <span className="text-[10px] text-gray-400 block">Open-Meteo Current</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-emerald-950/30 border border-gray-100 dark:border-emerald-800/30 space-y-1">
              <span className="text-[11px] text-gray-500 block">Forecast Precipitation</span>
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">
                {advisory.forecastRainfallMm} <span className="text-xs font-semibold">mm</span>
              </div>
              <span className="text-[10px] text-gray-400 block">{advisory.forecastRainProbability}% Probability</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-emerald-950/30 border border-gray-100 dark:border-emerald-800/30 space-y-1">
              <span className="text-[11px] text-gray-500 block">Irrigation System</span>
              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {advisory.irrigationMethod || 'Standard'}
              </div>
              <span className="text-[10px] text-gray-400 block truncate">Soil: {advisory.soilType || 'Loam'}</span>
            </div>
          </div>

          {/* Data Sources Used & Limitations */}
          <div className="pt-3 border-t border-gray-100 dark:border-emerald-800/30 space-y-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-gray-700 dark:text-gray-300">Data Sources Synthesized:</span>
              {advisory.dataSources.map((src, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium"
                >
                  {src}
                </span>
              ))}
            </div>

            <div className="flex items-start gap-2 text-gray-500 pt-1">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>System Limitation & Safety Boundary:</strong> {advisory.limitations} AgroCloud AI does not actuate physical irrigation equipment. Farmer visual inspection and electrical safety protocols must always be observed before switching on pumps.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

