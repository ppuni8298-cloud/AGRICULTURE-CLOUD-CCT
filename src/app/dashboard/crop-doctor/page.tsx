'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ScanEye, Upload, AlertCircle, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CropDoctorPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    disease: string;
    confidence: string;
    crop: string;
    treatment: string[];
  } | null>(null);

  const simulateAnalysis = () => {
    setAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisResult({
        crop: 'Solanum lycopersicum (Tomato)',
        disease: 'Early Blight (Alternaria solani)',
        confidence: '94.2% Diagnostic Certainty',
        treatment: [
          'Immediate physical removal and safe disposal of lower 2-3 leaf nodes showing lesions.',
          'Foliar spray with Chlorothalonil 75% WP @ 2.5g/L or Mancozeb 75% WP @ 2g/L.',
          'Avoid overhead sprinkler irrigation; maintain clean dry soil line.',
          'Observe repeat inspection after 7 days.',
        ],
      });
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="pb-6 border-b border-emerald-100 dark:border-emerald-800/60">
        <div className="flex items-center gap-2">
          <ScanEye className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
            Crop Doctor – Foliar Pathogen Diagnosis
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 mt-1">
          Deep learning computer vision for foliar disease classification and IPM curative treatments.
        </p>
      </div>

      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Phase 1 Visual Pipeline:</strong> Demonstrates neural leaf symptom classification. Phase 2 introduces real-time camera capture on smartphone browsers and Supabase storage bucket sync.
        </span>
      </div>

      {/* Upload & Diagnostic Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Upload Zone */}
        <div className="md:col-span-6 p-8 rounded-3xl bg-white dark:bg-[#0A2920] border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-center flex flex-col items-center justify-center min-h-[340px]">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
            Upload Leaf Photograph
          </h3>
          <p className="text-xs text-stone-500 dark:text-emerald-300/80 max-w-xs mt-1 mb-5">
            Take a clear, focused photo of the diseased leaf top and underside against a neutral background.
          </p>

          <Button
            onClick={simulateAnalysis}
            isLoading={analyzing}
            variant="primary"
            icon={<ScanEye className="w-4 h-4" />}
          >
            {analyzing ? 'Classifying Pathogen...' : 'Run Demonstration Scan'}
          </Button>

          <span className="text-[10px] text-stone-400 dark:text-emerald-500 mt-4 block">
            Supports JPEG, PNG, WEBP up to 10MB
          </span>
        </div>

        {/* Diagnosis Output Card */}
        <div className="md:col-span-6 p-8 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-xl min-h-[340px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-emerald-100 dark:border-emerald-800/60 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Diagnostic Output
              </span>
              <span className="text-[10px] font-mono text-stone-400 dark:text-emerald-500">
                ResNet-50 / EfficientNet
              </span>
            </div>

            {analysisResult ? (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase">Crop Identified</span>
                  <p className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
                    {analysisResult.crop}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase">Diagnosed Pathogen</span>
                  <p className="text-lg font-black text-red-600 dark:text-red-400">
                    {analysisResult.disease}
                  </p>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {analysisResult.confidence}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-stone-400 uppercase block mb-1.5">
                    Integrated Pest Management (IPM) Steps
                  </span>
                  <ul className="space-y-1.5 text-xs text-stone-700 dark:text-emerald-200">
                    {analysisResult.treatment.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-stone-400 dark:text-emerald-400">
                <ScanEye className="w-12 h-12 opacity-30 mb-2" />
                <p className="text-xs">No scan performed yet. Click &ldquo;Run Demonstration Scan&rdquo; on the left.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-emerald-100 dark:border-emerald-800/60 text-[11px] text-stone-400 dark:text-emerald-500 flex justify-between">
            <span>Audit Ref: DG-2026-004</span>
            <span>ICAR Standardized</span>
          </div>
        </div>
      </div>
    </div>
  );
}

