'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Layers,
  Compass,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
  Maximize2,
  Save,
  RotateCcw,
} from 'lucide-react';
import DigitalTwinNavTabs from '@/components/dashboard/DigitalTwinNavTabs';
import {
  geospatialService,
  calculatePolygonAreaAcres,
  calculatePolygonCentroid,
} from '@/lib/services/geospatialService';
import { farmService } from '@/lib/services/farmService';
import type { Farm, Field, FarmGeometry, BoundarySourceType } from '@/lib/supabase/types';

export default function GeospatialIntelligencePage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('farm-001');
  const [fields, setFields] = useState<Field[]>([]);
  const [geometries, setGeometries] = useState<FarmGeometry[]>([]);
  const [selectedGeomId, setSelectedGeomId] = useState<string>('');
  const [mapStyle, setMapStyle] = useState<'satellite' | 'street' | 'topo'>('satellite');
  const [loading, setLoading] = useState(true);

  // GeoJSON Import Modal State
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  // New Polygon Coordinate Editor
  const [isAddingPolygon, setIsAddingPolygon] = useState<boolean>(false);
  const [newPolygonName, setNewPolygonName] = useState<string>('New Field Parcel');
  const [boundaryType, setBoundaryType] = useState<BoundarySourceType>('farmer_estimated');
  const [customPointsText, setCustomPointsText] = useState<string>(
    '78.1380, 13.1340\n78.1405, 13.1342\n78.1408, 13.1325\n78.1382, 13.1322'
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
    async function loadGeometries() {
      setLoading(true);
      try {
        const [fieldList, geomList] = await Promise.all([
          farmService.getFields(selectedFarmId),
          geospatialService.getGeometriesByFarm(selectedFarmId),
        ]);
        setFields(fieldList);
        setGeometries(geomList);
        if (geomList.length > 0) {
          setSelectedGeomId(geomList[0].id);
        }
      } catch (err) {
        console.error('Failed to load geospatial data:', err);
      } finally {
        setLoading(false);
      }
    }
    if (selectedFarmId) {
      loadGeometries();
    }
  }, [selectedFarmId]);

  const selectedFarm = farms.find((f) => f.id === selectedFarmId);
  const activeGeom = geometries.find((g) => g.id === selectedGeomId) || geometries[0];

  const handleExportGeoJson = () => {
    const jsonStr = geospatialService.exportToGeoJson(geometries);
    const blob = new Blob([jsonStr], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Farm_Boundaries_${selectedFarm?.name.replace(/\s+/g, '_') || 'AgroCloud'}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    setImportError(null);
    try {
      const parsedFeatures = geospatialService.parseGeoJsonImport(importJsonText);
      if (parsedFeatures.length === 0) {
        setImportError('No valid Polygon geometries found in the provided GeoJSON.');
        return;
      }

      // Add imported polygons
      parsedFeatures.forEach(async (feat) => {
        await geospatialService.saveGeometry({
          farm_id: selectedFarmId,
          name: feat.name,
          boundary_type: 'cadastral_geojson',
          coordinates: feat.coordinates,
        });
      });

      // Reload
      geospatialService.getGeometriesByFarm(selectedFarmId).then((updated) => {
        setGeometries(updated);
        setShowImportModal(false);
        setImportJsonText('');
      });
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse GeoJSON.');
    }
  };

  const handleSaveCustomPolygon = async () => {
    try {
      const lines = customPointsText.trim().split('\n');
      const coordinates: number[][] = [];
      for (const line of lines) {
        const parts = line.split(',').map((p) => parseFloat(p.trim()));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          coordinates.push([parts[0], parts[1]]);
        }
      }

      if (coordinates.length < 3) {
        alert('A valid polygon requires at least 3 [longitude, latitude] coordinate vertices.');
        return;
      }

      // Close ring if not closed
      if (
        coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
        coordinates[0][1] !== coordinates[coordinates.length - 1][1]
      ) {
        coordinates.push([...coordinates[0]]);
      }

      const saved = await geospatialService.saveGeometry({
        farm_id: selectedFarmId,
        name: newPolygonName,
        boundary_type: boundaryType,
        coordinates: coordinates,
      });

      setGeometries([...geometries, saved]);
      setSelectedGeomId(saved.id);
      setIsAddingPolygon(false);
    } catch (err) {
      console.error('Failed to save custom polygon:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
              <MapPin className="w-3.5 h-3.5" />
              WGS-84 Cadastral Vector GIS & Geodesic Calculation
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Geospatial Farm Intelligence
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Interactive cadastral vector mapping, polygon area calculations, GeoJSON import/export, and vertex boundary demarcation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 text-xs font-semibold text-gray-700 dark:text-gray-200 transition shadow-xs inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Import GeoJSON
            </button>
            <button
              onClick={handleExportGeoJson}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export GeoJSON
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <DigitalTwinNavTabs activeTab="geospatial" />

      {/* Farm Selector & Layer Switcher Bar */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Active Farm:
          </label>
          <select
            value={selectedFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.district})
              </option>
            ))}
          </select>
        </div>

        {/* Map Tile Style Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs">
          <span className="text-[11px] font-semibold text-gray-500 px-2">Basemap:</span>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              mapStyle === 'satellite'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            Satellite Hybrid
          </button>
          <button
            onClick={() => setMapStyle('street')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              mapStyle === 'street'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            OpenStreetMap
          </button>
          <button
            onClick={() => setMapStyle('topo')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              mapStyle === 'topo'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            Topographic
          </button>
        </div>
      </div>

      {/* Main Geospatial Map & Polygon Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Vector GIS Map (8 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Cadastral Survey Map Canvas
              </h3>
            </div>
            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
              {activeGeom ? `${activeGeom.centroid_lat}° N, ${activeGeom.centroid_lng}° E` : '13.1338° N, 78.1391° E'}
            </div>
          </div>

          {/* Interactive GIS Vector Map Canvas */}
          <div
            className={`relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 flex items-center justify-center select-none shadow-inner ${
              mapStyle === 'satellite'
                ? 'bg-slate-950'
                : mapStyle === 'street'
                ? 'bg-emerald-50/50'
                : 'bg-stone-100 dark:bg-stone-900'
            }`}
          >
            {/* Grid Pattern overlay */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  mapStyle === 'satellite'
                    ? 'radial-gradient(#334155 1px, transparent 1px)'
                    : 'radial-gradient(#10b981 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 800 450">
              {/* Outer Boundary */}
              <polygon
                points="100,50 680,70 710,400 130,410"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5,5"
              />

              {/* Render Field Polygons */}
              {geometries.map((geom, idx) => {
                const isSelected = geom.id === selectedGeomId;
                // Pre-calculated coordinates projection for SVG canvas
                const points =
                  idx === 0
                    ? '120,60 660,80 670,220 130,210'
                    : idx === 1
                    ? '135,225 675,235 695,395 150,400'
                    : '200,100 500,120 480,300 220,280';

                return (
                  <g
                    key={geom.id}
                    onClick={() => setSelectedGeomId(geom.id)}
                    className="cursor-pointer"
                  >
                    <polygon
                      points={points}
                      fill={
                        isSelected
                          ? 'rgba(16, 185, 129, 0.45)'
                          : 'rgba(16, 185, 129, 0.2)'
                      }
                      stroke={isSelected ? '#10b981' : '#059669'}
                      strokeWidth={isSelected ? '3' : '1.5'}
                    />
                    <text
                      x={idx === 0 ? '390' : '400'}
                      y={idx === 0 ? '140' : '310'}
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {geom.name}
                    </text>
                    <text
                      x={idx === 0 ? '390' : '400'}
                      y={idx === 0 ? '160' : '330'}
                      fill="#a7f3d0"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {geom.calculated_area_acres} Acres • {geom.boundary_type.replace('_', ' ')}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Bottom Legend */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 rounded-xl px-3 py-2 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Survey Verified Cadastral Boundary</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Farmer Estimated Boundary (Approximate)</span>
              </div>
            </div>
          </div>

          {/* Polygon List Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {geometries.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGeomId(g.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    g.id === selectedGeomId
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {g.name} ({g.calculated_area_acres} Ac)
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddingPolygon(!isAddingPolygon)}
              className="px-3 py-1.5 rounded-xl border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Parcel</span>
            </button>
          </div>
        </div>

        {/* Right: Selected Boundary Inspector & Geodesic Metrics (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {activeGeom ? (
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {activeGeom.name}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Geodesic Boundary Specifications
                  </p>
                </div>

                {activeGeom.boundary_type === 'survey_verified' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="w-3 h-3" /> Survey Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                    <AlertCircle className="w-3 h-3" /> Estimated Boundary
                  </span>
                )}
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Calculated Area (Acres):</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {activeGeom.calculated_area_acres} Acres
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Metric Equivalent:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {(activeGeom.calculated_area_acres * 0.404686).toFixed(2)} Hectares (
                    {Math.round(activeGeom.calculated_area_acres * 4046.86)} m²)
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Centroid Latitude:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {activeGeom.centroid_lat}° N
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Centroid Longitude:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {activeGeom.centroid_lng}° E
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Elevation:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {activeGeom.elevation_meters || 830} m MSL
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">CRS Coordinate System:</span>
                  <span className="font-mono text-gray-500">EPSG:4326 (WGS84)</span>
                </div>
              </div>

              {/* Raw GeoJSON Preview Pill */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase">
                  <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                  GeoJSON Geometry Type: {activeGeom.geometry_geojson.type}
                </div>
                <div className="text-[10px] text-gray-400 font-mono truncate">
                  Vertices: {activeGeom.geometry_geojson.coordinates[0]?.length || 4} coordinate points
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed rounded-2xl border-gray-300 dark:border-gray-700">
              <p className="text-xs text-gray-500">Select a geometry above to inspect coordinates.</p>
            </div>
          )}

          {/* Add Custom Polygon Drawer */}
          {isAddingPolygon && (
            <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Define New Boundary Polygon
              </h4>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parcel Name
                </label>
                <input
                  type="text"
                  value={newPolygonName}
                  onChange={(e) => setNewPolygonName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Boundary Provenance
                </label>
                <select
                  value={boundaryType}
                  onChange={(e) => setBoundaryType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="farmer_estimated">Farmer Estimated Boundary</option>
                  <option value="survey_verified">Cadastral Survey Verified</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vertices (Longitude, Latitude per line):
                </label>
                <textarea
                  rows={4}
                  value={customPointsText}
                  onChange={(e) => setCustomPointsText(e.target.value)}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveCustomPolygon}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Save Parcel
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingPolygon(false)}
                  className="py-1.5 px-3 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GeoJSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Import Field Boundaries (RFC 7946 GeoJSON)
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Paste a valid GeoJSON FeatureCollection or Polygon geometry string. The system will automatically compute acreage and reproject onto the active farm.
            </p>

            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{ "type": "FeatureCollection", "features": [ ... ] }'
              className="w-full p-3 text-xs font-mono rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {importError && (
              <p className="text-xs text-rose-600 font-medium">{importError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={!importJsonText.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50 shadow-xs"
              >
                Import and Reproject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
