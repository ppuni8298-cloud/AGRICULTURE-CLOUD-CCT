'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MapPin, Plus, Sprout, Layers, CheckCircle2, Trash2 } from 'lucide-react';

interface FarmPlot {
  id: string;
  name: string;
  surveyNumber: string;
  acreage: number;
  soilType: string;
  irrigationMethod: string;
  activeCrop: string;
  sowingDate: string;
}

const INITIAL_FARMS: FarmPlot[] = [
  {
    id: 'f1',
    name: 'North Kolar Plot (Terrace A)',
    surveyNumber: 'SY-142/2B',
    acreage: 3.5,
    soilType: 'Red Loamy Soil (pH 6.5)',
    irrigationMethod: 'Drip Irrigation',
    activeCrop: 'Hybrid Tomato (Sahu)',
    sowingDate: '2026-09-12',
  },
  {
    id: 'f2',
    name: 'Eastern Valley Orchard',
    surveyNumber: 'SY-189/1',
    acreage: 2.2,
    soilType: 'Clay Loam (pH 7.1)',
    irrigationMethod: 'Micro-Sprinkler',
    activeCrop: 'Pomegranate & Green Chilli',
    sowingDate: '2026-08-04',
  },
];

export default function MyFarmsPage() {
  const [farms, setFarms] = useState<FarmPlot[]>(INITIAL_FARMS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [plotName, setPlotName] = useState('');
  const [surveyNo, setSurveyNo] = useState('');
  const [acreage, setAcreage] = useState('');
  const [soilType, setSoilType] = useState('Red Sandy Loam');
  const [crop, setCrop] = useState('');

  const handleAddPlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotName || !acreage) return;

    const newPlot: FarmPlot = {
      id: `plot-${Date.now()}`,
      name: plotName,
      surveyNumber: surveyNo || 'SY-GEN/01',
      acreage: parseFloat(acreage) || 1.0,
      soilType: soilType,
      irrigationMethod: 'Drip System',
      activeCrop: crop || 'General Crop',
      sowingDate: new Date().toISOString().split('T')[0],
    };

    setFarms([newPlot, ...farms]);
    setIsModalOpen(false);
    setPlotName('');
    setSurveyNo('');
    setAcreage('');
    setCrop('');
  };

  const handleDelete = (id: string) => {
    setFarms(farms.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
            My Farm Holdings & Plots
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 mt-1">
            Manage Cadastral Survey Plots, acreage dimensions, and soil classifications.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Farm Plot
        </Button>
      </div>

      {/* Plots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {farms.map((plot) => (
          <div
            key={plot.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Survey: {plot.surveyNumber}
                </span>

                <button
                  onClick={() => handleDelete(plot.id)}
                  type="button"
                  className="text-stone-400 hover:text-red-500 transition-colors p-1"
                  title="Remove Plot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                {plot.name}
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40">
                  <span className="text-[10px] text-stone-500 dark:text-emerald-400 uppercase font-bold block">
                    Acreage
                  </span>
                  <span className="font-extrabold text-emerald-950 dark:text-emerald-100 text-sm">
                    {plot.acreage} Acres
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40">
                  <span className="text-[10px] text-stone-500 dark:text-emerald-400 uppercase font-bold block">
                    Active Crop
                  </span>
                  <span className="font-extrabold text-emerald-950 dark:text-emerald-100 text-sm truncate block">
                    {plot.activeCrop}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-stone-600 dark:text-emerald-300/80">
                <p><strong>Soil:</strong> {plot.soilType}</p>
                <p><strong>Irrigation:</strong> {plot.irrigationMethod}</p>
                <p><strong>Sown On:</strong> {plot.sowingDate}</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Telemetry Monitored
              </span>
              <span className="font-mono text-[11px]">ID: {plot.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Plot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Farm Plot"
        subtitle="Record your agricultural cadastral parcel and soil data"
      >
        <form onSubmit={handleAddPlot} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
              Plot Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={plotName}
              onChange={(e) => setPlotName(e.target.value)}
              placeholder="e.g. West Canal Field"
              className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                Survey Number
              </label>
              <input
                type="text"
                value={surveyNo}
                onChange={(e) => setSurveyNo(e.target.value)}
                placeholder="SY-105/A"
                className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                Acreage (Acres) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={acreage}
                onChange={(e) => setAcreage(e.target.value)}
                placeholder="2.5"
                className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                Active Crop
              </label>
              <input
                type="text"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="e.g. Tomato / Paddy"
                className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                Soil Classification
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Red Sandy Loam">Red Sandy Loam</option>
                <option value="Black Cotton Soil">Black Cotton Soil (Regur)</option>
                <option value="Alluvial Soil">Alluvial Soil</option>
                <option value="Laterite Soil">Laterite Soil</option>
                <option value="Clay Loam">Clay Loam</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-emerald-300 hover:bg-stone-100 dark:hover:bg-emerald-900/40"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" size="sm">
              Save Farm Plot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

