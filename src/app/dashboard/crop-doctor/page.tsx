'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { farmService } from '@/lib/services/farmService';
import { aiFarmService } from '@/lib/services/aiFarmService';
import type { Farm, Crop, CropDiagnosis, DiagnosisSeverity } from '@/lib/supabase/types';
import {
  ScanEye,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  X,
  History,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  MapPin,
  RefreshCw,
  FileText,
  Info,
  Bug,
  Leaf,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const SAMPLE_CROPS = [
  'Tomato (Solanum lycopersicum)',
  'Paddy / Rice (Oryza sativa)',
  'Cotton (Gossypium hirsutum)',
  'Maize / Corn (Zea mays)',
  'Chilli / Pepper (Capsicum annuum)',
  'Groundnut / Peanut (Arachis hypogaea)',
  'Soybean (Glycine max)',
  'Wheat (Triticum aestivum)',
  'Potato (Solanum tuberosum)',
  'Onion (Allium cepa)',
];

export default function CropDoctorPage() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const userId = user?.id || profile?.id || 'demo-farmer-001';

  // State for user farms & crops
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [selectedCropName, setSelectedCropName] = useState<string>('Tomato (Solanum lycopersicum)');

  // Upload & Image Preview State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<CropDiagnosis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);

  // Diagnosis History State
  const [history, setHistory] = useState<CropDiagnosis[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load Farms, Crops, and Diagnosis History
  useEffect(() => {
    async function loadInitialData() {
      try {
        const userFarms = await farmService.getFarms(userId);
        setFarms(userFarms);
        if (userFarms.length > 0) {
          setSelectedFarmId(userFarms[0].id);
          const farmCrops = await farmService.getCrops(userFarms[0].id, userId);
          setCrops(farmCrops);
          if (farmCrops.length > 0) {
            setSelectedCropName(farmCrops[0].name);
          }
        }

        const pastDiagnoses = await aiFarmService.getDiagnoses(userId);
        setHistory(pastDiagnoses);
        if (pastDiagnoses.length > 0) {
          setCurrentDiagnosis(pastDiagnoses[0]);
          setImagePreview(pastDiagnoses[0].image_url || null);
        }
      } catch (err) {
        console.warn('Failed to load initial crop doctor data:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadInitialData();
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

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAnalysisError('Please upload a valid image file (JPEG, PNG, or WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAnalysisError('File size exceeds the 10MB limit. Please upload a smaller image.');
      return;
    }

    setFileName(file.name);
    setImageMimeType(file.type);
    setAnalysisError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      // Extract base64 without prefix
      const base64Content = dataUrl.split(',')[1];
      setImageBase64(base64Content);
    };
    reader.readAsDataURL(file);
  };

  // Remove Selected Image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Run AI Diagnostic Scan
  const handleRunDiagnosis = async () => {
    if (!imageBase64 && !imagePreview) {
      setAnalysisError('Please upload or capture a photo of the infected crop leaf first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const selectedFarm = farms.find((f) => f.id === selectedFarmId);
      const location = selectedFarm
        ? `${selectedFarm.taluk || ''}, ${selectedFarm.district || ''}, ${selectedFarm.state || ''}`
        : 'India';

      // If we only have a pre-existing URL (e.g. from seed), convert it or pass placeholder base64
      let payloadBase64 = imageBase64;
      if (!payloadBase64 && imagePreview) {
        // Fallback for sample demo image
        payloadBase64 = 'SAMPLE_DEMO_IMAGE_BASE64';
      }

      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: payloadBase64,
          mimeType: imageMimeType,
          cropName: selectedCropName,
          location,
        }),
      });

      const data = await res.json();
      setIsConfigured(data.isConfigured !== false);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete crop diagnosis.');
      }

      const result = data.diagnosis;

      // Save diagnosis to database & state
      const newDiagnosisData: Omit<CropDiagnosis, 'id' | 'created_at'> = {
        user_id: userId,
        farm_id: selectedFarmId || undefined,
        crop_name: selectedCropName,
        image_url: imagePreview || 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=400',
        disease_name: result.disease_name,
        scientific_name: result.scientific_name,
        severity: result.severity as DiagnosisSeverity,
        confidence: result.confidence,
        visible_symptoms: result.visible_symptoms,
        possible_causes: result.possible_causes,
        suggested_steps: result.suggested_steps,
        prevention_guidance: result.prevention_guidance,
        is_confirmed_diagnosis: false,
        disclaimer:
          result.disclaimer ||
          'Preliminary AI advisory based on visual pattern matching. Consult your local Krishi Vigyan Kendra (KVK) for chemical sprays.',
      };

      const saved = await aiFarmService.saveDiagnosis(newDiagnosisData, userId);
      setCurrentDiagnosis(saved);
      setHistory((prev) => [saved, ...prev]);
    } catch (err: any) {
      console.error('Diagnosis error:', err);
      setAnalysisError(err.message || 'Diagnostic service encountered an error.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityBadgeClass = (severity: DiagnosisSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      case 'low':
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <ScanEye className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                AI Crop Doctor – Foliar Pathogen Diagnostics
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
                Computer vision pest & foliar disease classification grounded in ICAR Integrated Pest Management (IPM).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs py-2 px-3 border-emerald-300 text-emerald-800 dark:text-emerald-300 gap-1.5"
          >
            <History className="w-4 h-4" />
            <span>{showHistory ? 'Hide History' : `Scan History (${history.length})`}</span>
          </Button>
        </div>
      </div>

      {/* Prominent Preliminary Advisory Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800/70 flex items-start gap-3.5 text-xs text-amber-950 dark:text-amber-200 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-sm text-amber-900 dark:text-amber-100">
            Important Agricultural Disclaimer
          </strong>
          <p className="leading-relaxed">
            AI Crop Doctor evaluations are <strong>preliminary advisory predictions</strong> generated from computer vision pattern recognition. They do not constitute an officially certified diagnostic test. Before executing intensive chemical applications or eradicating large-scale crops, always consult your district <strong>Krishi Vigyan Kendra (KVK)</strong>, an ICAR-accredited agronomist, or local agricultural extension officers.
          </p>
        </div>
      </div>

      {/* Main Diagnostic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Parameters */}
        <div className="lg:col-span-5 space-y-4">
          {/* Farm & Crop Selection Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Plot & Crop Selection</span>
            </h3>

            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                Select Farm (Optional Location Context)
              </label>
              <select
                value={selectedFarmId}
                onChange={(e) => handleFarmChange(e.target.value)}
                className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
              >
                <option value="">No farm linked (General Indian crop scan)</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.district || f.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                Crop Name / Variety
              </label>
              <select
                value={selectedCropName}
                onChange={(e) => setSelectedCropName(e.target.value)}
                className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
              >
                {crops.length > 0 && (
                  <optgroup label="Your Registered Crops">
                    {crops.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} (Field Plot)
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="Standard Indian Crops">
                  {SAMPLE_CROPS.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Photo Upload Zone */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border-2 border-dashed border-emerald-300 dark:border-emerald-700 shadow-md text-center flex flex-col items-center justify-center min-h-[340px] relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {imagePreview ? (
              <div className="w-full space-y-4">
                <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-emerald-200 dark:border-emerald-700 shadow-inner bg-stone-100 dark:bg-emerald-950">
                  <Image
                    src={imagePreview}
                    alt="Selected leaf specimen"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-all"
                    title="Remove photograph"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-emerald-300 px-1">
                  <span className="truncate max-w-[200px] font-mono">{fileName || 'Specimen Photo'}</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Replace Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer flex flex-col items-center justify-center py-6 w-full"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-all shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  Click to Upload or Drag & Drop Leaf Photo
                </h4>
                <p className="text-xs text-stone-500 dark:text-emerald-300/80 max-w-xs mt-1 mb-4">
                  Capture a focused close-up photo showing visible spots, curling, lesions, or powdery patches.
                </p>
                <span className="text-[10px] text-stone-400 dark:text-emerald-500">
                  JPEG, PNG, WEBP up to 10MB
                </span>
              </div>
            )}

            {/* Error Message */}
            {analysisError && (
              <div className="w-full mt-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Scan Button */}
            <div className="w-full mt-4">
              <Button
                onClick={handleRunDiagnosis}
                isLoading={isAnalyzing}
                disabled={(!imageBase64 && !imagePreview) || isAnalyzing}
                variant="primary"
                className="w-full py-3 text-sm font-bold shadow-lg shadow-emerald-700/20"
                icon={<ScanEye className="w-4 h-4" />}
              >
                {isAnalyzing ? 'Analyzing Pathogen...' : 'Analyze Foliar Specimen'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic Results Card */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-xl min-h-[520px] flex flex-col justify-between">
            {currentDiagnosis ? (
              <div className="space-y-6">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100 dark:border-emerald-800/60">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-emerald-400">
                      Crop Analyzed
                    </span>
                    <h3 className="text-lg font-extrabold text-emerald-950 dark:text-emerald-100">
                      {currentDiagnosis.crop_name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full border ${getSeverityBadgeClass(
                        currentDiagnosis.severity
                      )}`}
                    >
                      {currentDiagnosis.severity} Severity
                    </span>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                      {currentDiagnosis.confidence}% Confidence
                    </span>
                  </div>
                </div>

                {/* Pathogen Name Banner */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-[#071F18] border border-emerald-200 dark:border-emerald-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">
                    <Bug className="w-4 h-4 text-emerald-600" />
                    <span>Identified Pathogen / Condition</span>
                  </div>
                  <h4 className="text-xl font-black text-emerald-950 dark:text-emerald-100">
                    {currentDiagnosis.disease_name}
                  </h4>
                  {currentDiagnosis.scientific_name && (
                    <p className="text-xs italic text-stone-500 dark:text-emerald-300/80 mt-0.5">
                      Scientific Name: {currentDiagnosis.scientific_name}
                    </p>
                  )}
                </div>

                {/* Visible Symptoms */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span>Visible Foliar Symptoms</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-stone-700 dark:text-emerald-200/90 pl-1">
                    {currentDiagnosis.visible_symptoms.map((sym, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Possible Causes */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>Agronomic Causes & Environmental Triggers</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-stone-700 dark:text-emerald-200/90 pl-1">
                    {currentDiagnosis.possible_causes.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Curative & IPM Next Steps */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Recommended Immediate IPM Actions (ICAR Protocol)</span>
                  </h5>
                  <ol className="space-y-2 text-xs text-emerald-950 dark:text-emerald-100 list-decimal pl-4">
                    {currentDiagnosis.suggested_steps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Prevention Guidance */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 mb-2">
                    Long-Term Prevention Strategy
                  </h5>
                  <ul className="space-y-1.5 text-xs text-stone-600 dark:text-emerald-300/90 pl-1">
                    {currentDiagnosis.prevention_guidance.map((prev, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span>{prev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-inner">
                  <ScanEye className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                  No Diagnostic Scan Executed Yet
                </h4>
                <p className="text-xs text-stone-500 dark:text-emerald-300/80 max-w-sm">
                  Upload a leaf photograph from your phone or desktop, pick the crop variety, and click &quot;Analyze Foliar Specimen&quot; to inspect visible disease symptoms.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Drawer / Modal */}
      {showHistory && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800/60">
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              <span>Past Foliar Diagnostic Scans</span>
            </h3>
            <span className="text-xs font-semibold text-stone-500 dark:text-emerald-400">
              Total Recorded Scans: {history.length}
            </span>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-stone-500 dark:text-emerald-400 py-6 text-center">
              No saved scans in your farm database.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((diag) => (
                <div
                  key={diag.id}
                  onClick={() => {
                    setCurrentDiagnosis(diag);
                    setImagePreview(diag.image_url || null);
                  }}
                  className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 cursor-pointer bg-emerald-50/20 dark:bg-[#071F18]/50 transition-all flex gap-3.5 items-start"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-stone-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                    <Image
                      src={diag.image_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=400'}
                      alt={diag.crop_name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="overflow-hidden flex-1">
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full inline-block border mb-1 ${getSeverityBadgeClass(
                        diag.severity
                      )}`}
                    >
                      {diag.severity}
                    </span>
                    <h5 className="text-xs font-bold text-emerald-950 dark:text-emerald-100 truncate">
                      {diag.disease_name}
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-emerald-300 truncate">
                      {diag.crop_name}
                    </p>
                    <span className="text-[10px] text-stone-400 dark:text-emerald-500/70 font-mono">
                      {new Date(diag.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
