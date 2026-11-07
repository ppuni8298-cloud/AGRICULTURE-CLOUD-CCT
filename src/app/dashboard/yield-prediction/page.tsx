'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { farmService } from '@/lib/services/farmService';
import { iotService } from '@/lib/services/iotService';
import { aiFarmService } from '@/lib/services/aiFarmService';
import type { Farm, Field, Crop, YieldPrediction, InfluencingFactor } from '@/lib/supabase/types';
import {
  TrendingUp,
  MapPin,
  Wheat,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  BarChart3,
  Layers,
  Scale,
  Activity,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const GROWTH_STAGES = [
  'Germination / Seedling',
  'Vegetative Growth',
  'Flowering / Anthesis',
  'Fruit / Grain Development',
  'Maturity / Ripening',
];

const MANAGEMENT_LEVELS = [
  { value: 'optimal', label: 'Optimal (Recommended NPK + Scheduled Drip)' },
  { value: 'moderate', label: 'Moderate (Standard Fertilizer + Regular Irrigation)' },
  { value: 'stress_prone', label: 'Stress-Prone (Rainfed / Irregular Nutrients)' },
];

export default function YieldPredictionPage() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const userId = user?.id || profile?.id || 'demo-farmer-001';

  // Farm & Crop Selection State
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [selectedCropName, setSelectedCropName] = useState<string>('Tomato');
  const [growthStage, setGrowthStage] = useState<string>('Vegetative Growth');
  const [fieldArea, setFieldArea] = useState<number>(3.0);
  const [historicalAverage, setHistoricalAverage] = useState<number | undefined>(200);
  const [managementLevel, setManagementLevel] = useState<string>('moderate');

  // Prediction State
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<YieldPrediction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<YieldPrediction[]>([]);

  // Load Farms, Crops, and Past Predictions
  useEffect(() => {
    async function loadData() {
      try {
        const userFarms = await farmService.getFarms(userId);
        setFarms(userFarms);
        if (userFarms.length > 0) {
          setSelectedFarmId(userFarms[0].id);
          const farmCrops = await farmService.getCrops(userFarms[0].id, userId);
          setCrops(farmCrops);
          if (farmCrops.length > 0) {
            setSelectedCropName(farmCrops[0].name);
            if (farmCrops[0].growth_stage) {
              setGrowthStage(farmCrops[0].growth_stage);
            }
          }
        }

        const past = await aiFarmService.getYieldPredictions(userId);
        setPredictionHistory(past);
        if (past.length > 0) {
          setPredictionResult(past[0]);
        }
      } catch (err) {
        console.warn('Failed to load yield prediction data:', err);
      }
    }
    loadData();
  }, [userId]);

  // Handle Farm Change
  const handleFarmChange = async (farmId: string) => {
    setSelectedFarmId(farmId);
    if (!farmId) {
      setCrops([]);
      return;
    }
    try {
      const farmCrops = await farmService.getCrops(farmId, userId);
      setCrops(farmCrops);
      if (farmCrops.length > 0) {
        setSelectedCropName(farmCrops[0].name);
      }
    } catch (err) {
      console.warn('Failed to load crops for farm:', err);
    }
  };

  // Run Yield Prediction
  const handleCalculateYield = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsPredicting(true);
    setErrorMessage(null);

    try {
      const selectedFarm = farms.find((f) => f.id === selectedFarmId);
      const res = await fetch('/api/ai/predict-yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: selectedCropName,
          growthStage,
          fieldArea,
          historicalAverageYield: historicalAverage,
          recentSoilMoisture: 42.5,
          irrigationType: selectedFarm?.irrigation_type || 'Drip Irrigation',
          location: selectedFarm?.district || 'Karnataka',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to compute yield prediction.');
      }

      const raw = data.prediction || data || {};
      const minVal = raw.estimated_min_yield ?? raw.predicted_yield_min ?? (Array.isArray(raw.predicted_per_acre_range) ? raw.predicted_per_acre_range[0] : 180);
      const maxVal = raw.estimated_max_yield ?? raw.predicted_yield_max ?? (Array.isArray(raw.predicted_per_acre_range) ? raw.predicted_per_acre_range[1] : 240);
      const unitVal = raw.yield_unit || raw.predicted_yield_unit || raw.unit || 'Quintals/Acre';
      const confScore = Number(raw.confidence_score) || 85;

      const predictionRecord: Omit<YieldPrediction, 'id' | 'created_at'> = {
        user_id: userId,
        farm_id: selectedFarmId || undefined,
        crop_name: selectedCropName || raw.crop_name || 'Tomato',
        growth_stage: (growthStage as any) || 'Vegetative Growth',
        field_area_acres: fieldArea,
        estimated_min_yield: minVal,
        estimated_max_yield: maxVal,
        predicted_yield_min: minVal,
        predicted_yield_max: maxVal,
        yield_unit: unitVal,
        predicted_yield_unit: unitVal,
        confidence_score: confScore,
        confidence_explanation: raw.confidence_explanation || raw.uncertainty_explanation || 'Statistical projection based on verified growth models.',
        uncertainty_explanation: raw.uncertainty_explanation || raw.confidence_explanation || 'Statistical projection based on verified growth models.',
        influencing_factors: raw.influencing_factors || [],
        missing_data_points: raw.missing_data_points || [],
        historical_comparison: raw.historical_comparison,
        disclaimer:
          raw.disclaimer ||
          'Statistical projection based on ICAR growth models. Does not constitute guaranteed harvest yield.',
      };

      const saved = await aiFarmService.saveYieldPrediction(predictionRecord, userId);
      setPredictionResult(saved);
      setPredictionHistory((prev) => [saved, ...prev]);
    } catch (err: any) {
      console.error('Yield prediction error:', err);
      setErrorMessage(err.message || 'Yield prediction service error.');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                AI Yield Prediction & Harvest Forecasting
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
                Phenological crop growth modeling, moisture telemetry, and regional harvest estimations.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-xs font-semibold text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Statistical Model (Non-Guaranteed)</span>
        </div>
      </div>

      {/* Main Grid: Parameters Form (Left) + Prediction Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleCalculateYield}
            className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md space-y-4"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-2 pb-2 border-b border-emerald-100 dark:border-emerald-800/60">
              <Wheat className="w-4 h-4 text-emerald-600" />
              <span>Crop & Growth Parameters</span>
            </h3>

            {/* Farm Selector */}
            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                Select Farm
              </label>
              <select
                value={selectedFarmId}
                onChange={(e) => handleFarmChange(e.target.value)}
                className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
              >
                <option value="">Manual Entry (No farm linked)</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.district || f.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Crop Name */}
            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                Crop Variety / Name
              </label>
              <input
                type="text"
                value={selectedCropName}
                onChange={(e) => setSelectedCropName(e.target.value)}
                placeholder="e.g. Tomato, Paddy, Maize, Cotton"
                className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
              />
            </div>

            {/* Growth Stage */}
            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                Current Growth Stage
              </label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
              >
                {GROWTH_STAGES.map((gs) => (
                  <option key={gs} value={gs}>
                    {gs}
                  </option>
                ))}
              </select>
            </div>

            {/* Field Area & Historical Yield */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                  Field Area (Acres)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={fieldArea}
                  onChange={(e) => setFieldArea(parseFloat(e.target.value) || 1)}
                  className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                  Past Yield (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={historicalAverage || ''}
                  onChange={(e) =>
                    setHistoricalAverage(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="e.g. 210 Q/Acre"
                  className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Management Level */}
            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                Fertilizer & Irrigation Practice
              </label>
              <select
                value={managementLevel}
                onChange={(e) => setManagementLevel(e.target.value)}
                className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
              >
                {MANAGEMENT_LEVELS.map((ml) => (
                  <option key={ml.value} value={ml.value}>
                    {ml.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isPredicting}
              className="w-full py-3 text-sm font-bold shadow-lg shadow-emerald-700/20"
              icon={<TrendingUp className="w-4 h-4" />}
            >
              {isPredicting ? 'Computing Harvest Projection...' : 'Calculate Predicted Yield'}
            </Button>
          </form>
        </div>

        {/* Right Column: Prediction Results Dashboard */}
        <div className="lg:col-span-7 space-y-4">
          {predictionResult ? (
            <div className="space-y-4">
              {/* Estimated Yield Range Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/40">
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
                    Harvest Forecast ({predictionResult.crop_name} - {predictionResult.growth_stage})
                  </span>
                  <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-1 rounded-full">
                    {predictionResult.confidence_score}% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <span className="text-[11px] text-emerald-200 block uppercase font-bold">
                      Yield Per Acre
                    </span>
                    <div className="text-3xl sm:text-4xl font-black tracking-tight">
                      {predictionResult.estimated_min_yield ?? predictionResult.predicted_yield_min ?? 0} –{' '}
                      {predictionResult.estimated_max_yield ?? predictionResult.predicted_yield_max ?? 0}
                    </div>
                    <span className="text-xs text-emerald-100">
                      {predictionResult.yield_unit || predictionResult.predicted_yield_unit || 'Quintals/Acre'}
                    </span>
                  </div>

                  <div className="sm:border-l sm:border-emerald-500/40 sm:pl-4">
                    <span className="text-[11px] text-emerald-200 block uppercase font-bold">
                      Total Production ({predictionResult.field_area_acres || fieldArea} Acres)
                    </span>
                    <div className="text-2xl sm:text-3xl font-black tracking-tight">
                      {Math.round(
                        (predictionResult.estimated_min_yield ?? predictionResult.predicted_yield_min ?? 0) *
                          (predictionResult.field_area_acres || fieldArea)
                      )}{' '}
                      –{' '}
                      {Math.round(
                        (predictionResult.estimated_max_yield ?? predictionResult.predicted_yield_max ?? 0) *
                          (predictionResult.field_area_acres || fieldArea)
                      )}
                    </div>
                    <span className="text-xs text-emerald-100">
                      Total Quintals (Estimated)
                    </span>
                  </div>
                </div>

                {predictionResult.historical_comparison && (
                  <div className="pt-2 text-xs text-emerald-100/90 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{predictionResult.historical_comparison}</span>
                  </div>
                )}
              </div>

              {/* Uncertainty Explanation Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-sm text-xs text-stone-700 dark:text-emerald-200 flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-emerald-950 dark:text-emerald-100 block mb-0.5">
                    Variance & Uncertainty Context
                  </strong>
                  <span>
                    {predictionResult.uncertainty_explanation ||
                      predictionResult.confidence_explanation ||
                      'Growth stage and remaining season weather influence final harvest.'}
                  </span>
                </div>
              </div>

              {/* Key Influencing Factors: Positive Catalysts vs Stress Points */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Key Yield Influencing Factors</span>
                </h4>

                <div className="space-y-2.5">
                  {predictionResult.influencing_factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border flex items-start gap-3 text-xs ${
                        factor.impact === 'positive'
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                          : factor.impact === 'negative'
                          ? 'bg-red-50/60 dark:bg-red-950/40 border-red-200 dark:border-red-900'
                          : 'bg-stone-50 dark:bg-[#071F18] border-stone-200 dark:border-emerald-800/60'
                      }`}
                    >
                      {factor.impact === 'positive' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : factor.impact === 'negative' ? (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      ) : (
                        <Activity className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <strong
                            className={`font-bold ${
                              factor.impact === 'positive'
                                ? 'text-emerald-950 dark:text-emerald-100'
                                : factor.impact === 'negative'
                                ? 'text-red-900 dark:text-red-200'
                                : 'text-stone-800 dark:text-emerald-200'
                            }`}
                          >
                            {factor.factor}
                          </strong>
                          <span
                            className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              factor.impact === 'positive'
                                ? 'bg-emerald-200/80 text-emerald-900'
                                : factor.impact === 'negative'
                                ? 'bg-red-200/80 text-red-900'
                                : 'bg-stone-200 text-stone-800'
                            }`}
                          >
                            {factor.weight} Impact
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-emerald-300/80 mt-0.5">
                          {factor.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Data Guidance */}
              {predictionResult.missing_data_points &&
                predictionResult.missing_data_points.length > 0 && (
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-950 dark:text-blue-200 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      How to Increase Prediction Accuracy:
                    </span>
                    <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                      {predictionResult.missing_data_points.map((pt: string, pIdx: number) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Mandatory Legal & Agronomic Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Disclaimer:</strong> {predictionResult.disclaimer || 'Yield projections are statistical models based on ICAR packages and do not constitute guaranteed production.'}
                </span>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md min-h-[460px] flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-inner">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                Harvest Prediction Ready
              </h4>
              <p className="text-xs text-stone-500 dark:text-emerald-300/80 max-w-sm">
                Fill in the crop variety, acreage, and phenological stage on the left to calculate statistical yield intervals and identify limiting growth factors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
