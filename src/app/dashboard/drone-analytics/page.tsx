'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Camera,
  Upload,
  Calendar,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Eye,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Sliders,
  ChevronRight,
  Download,
} from 'lucide-react';
import DigitalTwinNavTabs from '@/components/dashboard/DigitalTwinNavTabs';
import { droneAnalyticsService } from '@/lib/services/droneAnalyticsService';
import { farmService } from '@/lib/services/farmService';
import type { Farm, Field, DroneUpload, DroneAnalysis } from '@/lib/supabase/types';

export default function DroneAnalyticsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('farm-001');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('field-101');
  const [uploads, setUploads] = useState<DroneUpload[]>([]);
  const [selectedUploadId, setSelectedUploadId] = useState<string>('');
  const [analysis, setAnalysis] = useState<DroneAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [flightAltitude, setFlightAltitude] = useState<number>(45);
  const [captureDate, setCaptureDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [sensorType, setSensorType] = useState<'rgb_standard' | 'multispectral_calibrated'>('rgb_standard');
  const [notes, setNotes] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

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
    async function loadUploads() {
      setLoading(true);
      try {
        const [fieldList, uploadList] = await Promise.all([
          farmService.getFields(selectedFarmId),
          droneAnalyticsService.getUploadsByFarm(selectedFarmId),
        ]);
        setFields(fieldList);
        if (fieldList.length > 0 && !fieldList.some((f: Field) => f.id === selectedFieldId)) {
          setSelectedFieldId(fieldList[0].id);
        }
        setUploads(uploadList);
        if (uploadList.length > 0) {
          setSelectedUploadId(uploadList[0].id);
        }
      } catch (err) {
        console.error('Failed to load drone surveys:', err);
      } finally {
        setLoading(false);
      }
    }
    if (selectedFarmId) {
      loadUploads();
    }
  }, [selectedFarmId]);

  // Load analysis whenever selected upload changes
  useEffect(() => {
    async function loadAnalysis() {
      if (!selectedUploadId) {
        setAnalysis(null);
        return;
      }
      try {
        const res = await droneAnalyticsService.getAnalysisByUploadId(selectedUploadId);
        setAnalysis(res);
      } catch (err) {
        console.error('Failed to load analysis:', err);
      }
    }
    loadAnalysis();
  }, [selectedUploadId]);

  const activeUpload = uploads.find((u) => u.id === selectedUploadId) || uploads[0];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    // Validate size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size exceeds 25 MB limit. Please compress or select an optimized orthomosaic tile.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Unsupported file type. Please upload a JPEG, PNG, WebP, or TIFF aerial photograph.');
      return;
    }

    setUploadFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a drone aerial image to upload.');
      return;
    }

    try {
      const newUpload = await droneAnalyticsService.recordUpload({
        farm_id: selectedFarmId,
        field_id: selectedFieldId,
        file_name: uploadFile.name,
        file_url: filePreviewUrl || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200',
        file_size_bytes: uploadFile.size,
        mime_type: uploadFile.type,
        capture_date: captureDate,
        sensor_type: sensorType,
        flight_altitude_m: flightAltitude,
        notes,
      });

      setUploads([newUpload, ...uploads]);
      setSelectedUploadId(newUpload.id);
      setUploadFile(null);
      setFilePreviewUrl(null);
      setNotes('');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to record drone survey upload.');
    }
  };

  const handleTriggerAnalysis = async () => {
    if (!activeUpload) return;
    setAnalyzing(true);
    try {
      const result = await droneAnalyticsService.analyzeDroneImage(activeUpload.id, 'Tomato');
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportReport = () => {
    if (!analysis || !activeUpload) return;
    const reportData = {
      farm_id: selectedFarmId,
      survey_file: activeUpload.file_name,
      capture_date: activeUpload.capture_date,
      altitude_m: activeUpload.flight_altitude_m,
      sensor_type: activeUpload.sensor_type,
      analysis: analysis,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Drone_Survey_Report_${activeUpload.file_name.replace(/\.[^/.]+$/, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
              <Camera className="w-3.5 h-3.5" />
              Ultra-High-Resolution Aerial Orthomosaic Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Drone Aerial Image Analytics
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Upload UAV orthomosaics, inspect visual canopy coverage, detect localized lodging & chlorosis, and generate actionable field reports.
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
      <DigitalTwinNavTabs activeTab="drone" />

      {/* Scientific Honesty Notice on RGB Drone Imagery */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-slate-800 dark:text-slate-300 text-xs shadow-xs">
        <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-gray-900 dark:text-white">Scientific Imaging Notice: </strong>
          Standard RGB drone photographs deliver millimeter-scale visual resolution for identifying physical damage, lodging, weed patches, and foliar chlorosis. Calibrated multispectral cameras (with RedEdge and NIR filters) are strictly required for radiometric NDVI measurements.
        </p>
      </div>

      {/* Dual Column Layout: Upload / Survey History (4 Cols) + Analysis Inspector (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drone Image Upload & History (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Upload Card */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Upload UAV Flight Photograph
              </h3>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Field
                </label>
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Flight Date
                </label>
                <input
                  type="date"
                  value={captureDate}
                  onChange={(e) => setCaptureDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Altitude (m AGL)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={flightAltitude}
                    onChange={(e) => setFlightAltitude(parseInt(e.target.value) || 45)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sensor Type
                  </label>
                  <select
                    value={sensorType}
                    onChange={(e) => setSensorType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="rgb_standard">RGB Standard (CMOS)</option>
                    <option value="multispectral_calibrated">Multispectral (5-Band)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image File (Max 25 MB)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/tiff"
                  onChange={handleFileSelect}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950 dark:file:text-emerald-300"
                />
              </div>

              {uploadError && (
                <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
              )}

              <button
                type="submit"
                disabled={!uploadFile}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Survey to Safe Storage
              </button>
            </form>
          </div>

          {/* Survey History List */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Survey Flight History ({uploads.length})
            </h4>

            <div className="space-y-2">
              {uploads.map((u) => {
                const isSelected = u.id === selectedUploadId;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUploadId(u.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                        : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                      <span className="truncate max-w-[180px]">{u.file_name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {u.flight_altitude_m}m AGL
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                      <span>{u.capture_date}</span>
                      <span className="capitalize">{u.sensor_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Inspector & AI Observations (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeUpload ? (
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-5">
              {/* Survey Header & Analysis Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Survey Inspection: {activeUpload.file_name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Captured on {activeUpload.capture_date} • Altitude: {activeUpload.flight_altitude_m}m • Size: {(activeUpload.file_size_bytes / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTriggerAnalysis}
                    disabled={analyzing}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                    {analyzing ? 'Running AI Vision...' : 'Run Crop Health Scan'}
                  </button>

                  {analysis && (
                    <button
                      onClick={handleExportReport}
                      className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Report</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Large Aerial Photograph Display */}
              <div className="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden bg-slate-900 border border-gray-200 dark:border-gray-800">
                <img
                  src={activeUpload.file_url}
                  alt={activeUpload.file_name}
                  className="w-full h-full object-cover"
                />

                {/* Overlay Bounding Box Badges if issues detected */}
                {analysis?.chlorosis_yellowing_detected && (
                  <div className="absolute top-1/4 left-1/3 p-2 rounded-lg bg-amber-500/80 backdrop-blur-xs border border-white text-white text-[10px] font-bold shadow-lg">
                    <span>⚠ Interveinal Chlorosis Cluster</span>
                  </div>
                )}

                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-lg font-mono">
                  Sensor: {activeUpload.sensor_type.toUpperCase()}
                </div>
              </div>

              {/* AI Vision Observations Breakdown */}
              {analysis ? (
                <div className="space-y-4 pt-2">
                  {/* Top Stats Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/80">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Crop Health Index</div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {analysis.crop_health_score}/100
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">
                        Optimal Canopy Vigor
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Canopy Ground Cover</div>
                      <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                        {analysis.canopy_coverage_percent}%
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Bare soil: {(100 - analysis.canopy_coverage_percent).toFixed(1)}%</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Chlorosis Yellowing</div>
                      <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                        {analysis.chlorosis_yellowing_detected ? 'Detected' : 'None'}
                      </div>
                      <div className="text-[10px] text-amber-600 mt-0.5">Mild Iron / N Deficit</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Weed Infestation</div>
                      <div className="text-2xl font-black text-gray-900 dark:text-white mt-1 capitalize">
                        {analysis.weed_infestation_level}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Perimeter boundary</div>
                    </div>
                  </div>

                  {/* Detected Visual Anomalies */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Detected Visual Observations ({analysis.visible_issues_json.length})
                    </h4>
                    <div className="space-y-2">
                      {analysis.visible_issues_json.map((issue, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-xs flex items-start gap-3"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900 dark:text-white">
                                {issue.issue}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600">
                                Confidence: {issue.confidence}%
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                              {issue.description}
                            </p>
                            {issue.location_quadrant && (
                              <p className="text-[10px] text-gray-400 mt-1">
                                Location: <span className="font-semibold text-gray-700 dark:text-gray-300">{issue.location_quadrant}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Agronomic Actions */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Recommended Mitigation Steps
                    </div>
                    <ul className="space-y-1.5 text-xs text-emerald-900/90 dark:text-emerald-200">
                      {analysis.recommendations_json.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500">
                    No visual AI scan performed on this photograph yet. Click &quot;Run Crop Health Scan&quot; above to evaluate canopy coverage and anomalies.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed rounded-2xl border-gray-300 dark:border-gray-700">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                No drone survey selected. Upload an aerial image on the left to begin analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
