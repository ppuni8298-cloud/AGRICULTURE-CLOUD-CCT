'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  MapPin,
  Wheat,
  Activity,
  Droplets,
  Thermometer,
  CloudSun,
  ShieldCheck,
  AlertCircle,
  Eye,
  Info,
  Maximize2,
  RefreshCw,
  Compass,
  CheckCircle2,
  Sliders,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import DigitalTwinNavTabs from '@/components/dashboard/DigitalTwinNavTabs';
import { geospatialService } from '@/lib/services/geospatialService';
import { farmService } from '@/lib/services/farmService';
import { iotService } from '@/lib/services/iotService';
import type { Farm, Field, FarmGeometry, IoTSensor, SensorReading } from '@/lib/supabase/types';

export default function DigitalTwinPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('farm-001');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [geometries, setGeometries] = useState<FarmGeometry[]>([]);
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [readings, setReadings] = useState<Record<string, SensorReading>>({});
  const [activeLayer, setActiveLayer] = useState<'all' | 'moisture' | 'crop' | 'sensors'>('all');
  const [loading, setLoading] = useState(true);

  // Load farms
  useEffect(() => {
    async function loadFarms() {
      try {
        const farmList = await farmService.getFarms();
        setFarms(farmList);
        if (farmList.length > 0 && !selectedFarmId) {
          setSelectedFarmId(farmList[0].id);
        }
      } catch (err) {
        console.error('Failed to load farms:', err);
      }
    }
    loadFarms();
  }, []);

  // Load field and geometry data when selected farm changes
  useEffect(() => {
    async function loadFarmData() {
      setLoading(true);
      try {
        const [fieldList, geomList, sensorList] = await Promise.all([
          farmService.getFields(selectedFarmId),
          geospatialService.getGeometriesByFarm(selectedFarmId),
          iotService.getSensors(selectedFarmId),
        ]);
        setFields(fieldList);
        setGeometries(geomList);
        setSensors(sensorList);
        if (fieldList.length > 0) {
          setSelectedFieldId(fieldList[0].id);
        } else {
          setSelectedFieldId(null);
        }

        // Fetch latest readings for these sensors
        const readingsMap: Record<string, SensorReading> = {};
        for (const s of sensorList) {
          const rList = await iotService.getReadings({ sensorId: s.id, limit: 1 });
          if (rList && rList.length > 0) readingsMap[s.id] = rList[0];
        }
        setReadings(readingsMap);
      } catch (err) {
        console.error('Error loading farm digital twin data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (selectedFarmId) {
      loadFarmData();
    }
  }, [selectedFarmId]);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId);
  const selectedField = fields.find((f) => f.id === selectedFieldId);
  const selectedGeom = geometries.find((g) => g.field_id === selectedFieldId);

  // Field sensors
  const fieldSensors = sensors.filter((s) => s.field_id === selectedFieldId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5" />
              Hydrological & Vegetative Spatial Model
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Farm Digital Twin
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Interactive cadastral boundary modeling, real-time virtual IoT telemetry overlays, and spatial vegetative monitoring.
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
      <DigitalTwinNavTabs activeTab="twin" />

      {/* Main Digital Twin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Spatial Vector Map (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
            {/* Map Header & Layer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Cadastral Plot Topology: {selectedFarm?.name || 'Selected Farm'}
                </span>
              </div>

              {/* Layer Toggle Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 text-xs">
                <button
                  onClick={() => setActiveLayer('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    activeLayer === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                  }`}
                >
                  All Layers
                </button>
                <button
                  onClick={() => setActiveLayer('moisture')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    activeLayer === 'moisture'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                  }`}
                >
                  Moisture Heatmap
                </button>
                <button
                  onClick={() => setActiveLayer('crop')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    activeLayer === 'crop'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                  }`}
                >
                  Crops & Stages
                </button>
                <button
                  onClick={() => setActiveLayer('sensors')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    activeLayer === 'sensors'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                  }`}
                >
                  IoT Probes
                </button>
              </div>
            </div>

            {/* Interactive Vector Canvas / SVG Map */}
            <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-900 border border-emerald-950 flex items-center justify-center select-none shadow-inner">
              {/* Satellite Tile Background Pattern */}
              <div
                className="absolute inset-0 opacity-40 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "radial-gradient(#1e293b 1px, transparent 1px), radial-gradient(#1e293b 1px, #091310 1px)",
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Vector Geometry Canvas */}
              <svg className="w-full h-full p-6 relative z-10" viewBox="0 0 800 500">
                <defs>
                  {/* Grid hatch pattern */}
                  <pattern id="cropHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="10" stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />
                  </pattern>
                  <radialGradient id="moistureGradient1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.2" />
                  </radialGradient>
                  <radialGradient id="moistureGradient2" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
                  </radialGradient>
                </defs>

                {/* Outer Farm Perimeter Boundary */}
                <polygon
                  points="120,60 680,80 720,420 180,440"
                  fill="none"
                  stroke="#84cc16"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                  className="opacity-70"
                />
                <text x="140" y="50" fill="#a3e635" fontSize="12" fontWeight="bold">
                  Farm Boundary: {selectedFarm?.name || 'Farm'} (5.75 Acres)
                </text>

                {/* Field 101 Polygon (North Block A) */}
                <g
                  onClick={() => setSelectedFieldId('field-101')}
                  className="cursor-pointer transition-transform hover:opacity-95"
                >
                  <polygon
                    points="140,80 660,100 670,240 150,230"
                    fill={
                      activeLayer === 'moisture'
                        ? 'url(#moistureGradient1)'
                        : selectedFieldId === 'field-101'
                        ? 'rgba(16, 185, 129, 0.4)'
                        : 'rgba(16, 185, 129, 0.2)'
                    }
                    stroke={selectedFieldId === 'field-101' ? '#34d399' : '#059669'}
                    strokeWidth={selectedFieldId === 'field-101' ? '3' : '1.5'}
                  />
                  <text x="320" y="150" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                    Block A: North Terrace (3.5 Acres)
                  </text>
                  <text x="320" y="170" fill="#a7f3d0" fontSize="11" textAnchor="middle">
                    Tomato (Flowering Stage) • Soil Moisture 62%
                  </text>

                  {/* Survey Verified Badge Icon */}
                  <circle cx="160" cy="100" r="8" fill="#10b981" />
                  <text x="160" y="103" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                    ✓
                  </text>
                </g>

                {/* Field 102 Polygon (South Block B) */}
                <g
                  onClick={() => setSelectedFieldId('field-102')}
                  className="cursor-pointer transition-transform hover:opacity-95"
                >
                  <polygon
                    points="155,245 675,255 700,410 175,425"
                    fill={
                      activeLayer === 'moisture'
                        ? 'url(#moistureGradient2)'
                        : selectedFieldId === 'field-102'
                        ? 'rgba(234, 179, 8, 0.35)'
                        : 'rgba(234, 179, 8, 0.15)'
                    }
                    stroke={selectedFieldId === 'field-102' ? '#facc15' : '#ca8a04'}
                    strokeWidth={selectedFieldId === 'field-102' ? '3' : '1.5'}
                  />
                  <text x="350" y="320" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
                    Block B: South Slope (2.25 Acres)
                  </text>
                  <text x="350" y="340" fill="#fde047" fontSize="11" textAnchor="middle">
                    Onion (Vegetative Stage) • Soil Moisture 54%
                  </text>

                  {/* Estimated Boundary Warning Icon */}
                  <circle cx="175" cy="265" r="8" fill="#eab308" />
                  <text x="175" y="268" fill="#713f12" fontSize="9" fontWeight="bold" textAnchor="middle">
                    !
                  </text>
                </g>

                {/* Virtual IoT Probe Markers */}
                {(activeLayer === 'all' || activeLayer === 'sensors') && (
                  <>
                    <g transform="translate(300, 115)">
                      <circle cx="0" cy="0" r="10" fill="#0284c7" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                      <text x="14" y="4" fill="#38bdf8" fontSize="10" fontWeight="bold">
                        Soil Sensor (KOL-SOIL-01)
                      </text>
                    </g>
                    <g transform="translate(500, 180)">
                      <circle cx="0" cy="0" r="10" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                      <text x="14" y="4" fill="#6ee7b7" fontSize="10" fontWeight="bold">
                        Canopy Temp (KOL-ATEMP-01)
                      </text>
                    </g>
                    <g transform="translate(420, 360)">
                      <circle cx="0" cy="0" r="10" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                      <text x="14" y="4" fill="#38bdf8" fontSize="10" fontWeight="bold">
                        Soil Moisture (KOL-SOIL-02)
                      </text>
                    </g>
                  </>
                )}
              </svg>

              {/* Map Floating Legend */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 rounded-xl px-3 py-2 text-[11px] text-slate-300 space-y-1 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Verified Cadastral Survey (Block A)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Farmer-Estimated Boundary (Block B)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                  <span>Virtual IoT FDR Moisture Probe</span>
                </div>
              </div>

              {/* Coordinate Reticle Badge */}
              <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 rounded-lg px-2.5 py-1 text-[11px] text-emerald-400 font-mono">
                13.1338° N, 78.1391° E • Elev 830m
              </div>
            </div>

            {/* Field Selection Ribbon */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Fields in this Farm:
              </span>
              {fields.map((f) => {
                const isSelected = f.id === selectedFieldId;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFieldId(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <Wheat className="w-3.5 h-3.5" />
                    <span>{f.name}</span>
                    <span className="text-[10px] opacity-80">({f.size} {f.area_unit})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Environmental Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span>Soil Moisture</span>
              </div>
              <div className="text-xl font-black text-gray-900 dark:text-white mt-1">
                62.4% <span className="text-xs font-medium text-emerald-600">Optimal</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Field Capacity: 75%</div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Thermometer className="w-4 h-4 text-emerald-500" />
                <span>Soil Temp</span>
              </div>
              <div className="text-xl font-black text-gray-900 dark:text-white mt-1">
                24.8°C <span className="text-xs font-medium text-emerald-600">Active</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Microbial zone 15cm</div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CloudSun className="w-4 h-4 text-amber-500" />
                <span>Canopy Air Temp</span>
              </div>
              <div className="text-xl font-black text-gray-900 dark:text-white mt-1">
                28.6°C <span className="text-xs font-medium text-emerald-600">Normal</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Humidity: 68% RH</div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Activity className="w-4 h-4 text-purple-500" />
                <span>Soil pH Level</span>
              </div>
              <div className="text-xl font-black text-gray-900 dark:text-white mt-1">
                6.8 pH <span className="text-xs font-medium text-emerald-600">Neutral</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Red Sandy Loam</div>
            </div>
          </div>
        </div>

        {/* Right Column: Field Details & Cadastral Inspector (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Selected Field Profile Card */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {selectedField?.name || 'Selected Field'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Cadastral Parcel Details
                  </p>
                </div>
              </div>

              {selectedGeom?.boundary_type === 'survey_verified' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3" /> Survey Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="w-3 h-3" /> Estimated
                </span>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Parcel Size:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedField?.size || 3.5} {selectedField?.area_unit || 'acres'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Soil Classification:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedField?.soil_type || 'Red Sandy Loam'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Irrigation Setup:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedField?.irrigation_method || 'Drip Irrigation'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Elevation:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedGeom?.elevation_meters || 832} m MSL
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Registered IoT Devices:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {fieldSensors.length > 0 ? `${fieldSensors.length} Virtual Probes` : '3 Active Probes'}
                </span>
              </div>
            </div>

            {/* Field-Level AI Insights */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Agronomic Digital Twin Recommendation
              </div>
              <p className="text-xs text-emerald-900/90 dark:text-emerald-200 leading-relaxed">
                Vegetative leaf area index (LAI) is expanding on schedule. Soil moisture at 62% maintains non-stressed root respiration. Next fertigation cycle recommended in 48h.
              </p>
            </div>

            {/* Quick Actions into Next Modules */}
            <div className="pt-2 space-y-2">
              <Link
                href="/dashboard/satellite"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-xs font-semibold text-gray-800 dark:text-gray-200 transition border border-gray-200 dark:border-gray-700"
              >
                <span>Inspect Sentinel-2 NDVI Bands</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/dashboard/farm-simulator"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-xs font-semibold text-gray-800 dark:text-gray-200 transition border border-gray-200 dark:border-gray-700"
              >
                <span>Simulate Water Deficit Scenarios</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/dashboard/geospatial"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-xs font-semibold text-gray-800 dark:text-gray-200 transition border border-gray-200 dark:border-gray-700"
              >
                <span>Edit / Draw Cadastral Boundaries</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
