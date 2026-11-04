'use client';

import React, { useState, useMemo } from 'react';
import { SAMPLE_MANDI_RECORDS, MandiRecord } from '@/lib/constants/mandiData';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
  TrendingUp,
  Search,
  Filter,
  AlertCircle,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export function MandiIntelligencePreview() {
  const { t } = useLanguage();

  const [selectedCommodity, setSelectedCommodity] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');

  // Derive unique options
  const commodities = useMemo(() => {
    return ['All', ...Array.from(new Set(SAMPLE_MANDI_RECORDS.map((r) => r.commodity)))];
  }, []);

  const states = useMemo(() => {
    return ['All', ...Array.from(new Set(SAMPLE_MANDI_RECORDS.map((r) => r.state)))];
  }, []);

  const districts = useMemo(() => {
    const filtered = selectedState === 'All' 
      ? SAMPLE_MANDI_RECORDS 
      : SAMPLE_MANDI_RECORDS.filter((r) => r.state === selectedState);
    return ['All', ...Array.from(new Set(filtered.map((r) => r.district)))];
  }, [selectedState]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return SAMPLE_MANDI_RECORDS.filter((r) => {
      const matchCommodity = selectedCommodity === 'All' || r.commodity === selectedCommodity;
      const matchState = selectedState === 'All' || r.state === selectedState;
      const matchDistrict = selectedDistrict === 'All' || r.district === selectedDistrict;
      return matchCommodity && matchState && matchDistrict;
    });
  }, [selectedCommodity, selectedState, selectedDistrict]);

  return (
    <section id="mandi" className="py-24 relative bg-emerald-50/50 dark:bg-[#07241B]/40 border-y border-emerald-100 dark:border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300/40 dark:border-emerald-800">
            {t('mandi.badge', 'Agri-Market Intelligence Preview')}
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-[#16352A] dark:text-emerald-100 tracking-tight">
            {t('mandi.title', 'All-India Mandi Price Explorer')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#64756B] dark:text-emerald-300/80">
            {t(
              'mandi.subtitle',
              'Explore transparent price benchmarks across APMC markets. Empowering farmers to avoid distress selling.'
            )}
          </p>
        </div>

        {/* Mandi Explorer Container */}
        <div className="rounded-3xl bg-white dark:bg-[#0A2920] border-2 border-emerald-200/80 dark:border-emerald-800 shadow-xl overflow-hidden max-w-6xl mx-auto">
          {/* Top Transparency Banner */}
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{t('mandi.disclaimer', 'Sample Demonstration Records: Illustrates APMC benchmark tracking. Production release integrates official e-NAM and Agmarknet feeds.')}</strong>
            </span>
          </div>

          {/* Filter Bar */}
          <div className="p-6 bg-emerald-50/40 dark:bg-[#082218]/50 border-b border-emerald-100 dark:border-emerald-800/60">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Commodity Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                  {t('mandi.selectCommodity', 'Select Commodity')}
                </label>
                <div className="relative">
                  <select
                    value={selectedCommodity}
                    onChange={(e) => setSelectedCommodity(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-[#0A2920] text-emerald-950 dark:text-emerald-100 rounded-xl border border-emerald-200 dark:border-emerald-700 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {commodities.map((c) => (
                      <option key={c} value={c}>
                        {c === 'All' ? 'All Commodities (12 Sample Crops)' : c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* State Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                  {t('mandi.selectState', 'Select State')}
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('All');
                  }}
                  className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-[#0A2920] text-emerald-950 dark:text-emerald-100 rounded-xl border border-emerald-200 dark:border-emerald-700 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s === 'All' ? 'All States (Pan-India)' : s}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-1.5">
                  {t('mandi.selectDistrict', 'Select District')}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-[#0A2920] text-emerald-950 dark:text-emerald-100 rounded-xl border border-emerald-200 dark:border-emerald-700 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Districts' : d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Table / Cards */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-100/50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 text-xs uppercase font-bold tracking-wider border-b border-emerald-200 dark:border-emerald-800">
                  <th className="py-3.5 px-6">Commodity & Variety</th>
                  <th className="py-3.5 px-6">APMC Market / Location</th>
                  <th className="py-3.5 px-6 text-right">{t('mandi.minPrice', 'Min Price')}</th>
                  <th className="py-3.5 px-6 text-right">{t('mandi.maxPrice', 'Max Price')}</th>
                  <th className="py-3.5 px-6 text-right">{t('mandi.modalPrice', 'Modal Price')}</th>
                  <th className="py-3.5 px-6 text-center">{t('mandi.reportedOn', 'Reported On')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-800/40 text-xs sm:text-sm">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-emerald-50/60 dark:hover:bg-emerald-900/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-emerald-950 dark:text-emerald-100 text-sm">
                          {item.commodity}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-emerald-400">
                          {item.variety}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-semibold text-stone-800 dark:text-emerald-200">
                          {item.market}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-emerald-400/80 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{item.district}, {item.state}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right font-medium text-stone-700 dark:text-emerald-300">
                        ₹{item.minPrice.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-6 text-right font-medium text-stone-700 dark:text-emerald-300">
                        ₹{item.maxPrice.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span className="inline-block px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200 font-extrabold text-sm sm:text-base border border-emerald-300 dark:border-emerald-700">
                          ₹{item.modalPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="block text-[10px] text-stone-400 dark:text-emerald-400 mt-0.5">
                          {item.unit}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center text-[11px] text-stone-500 dark:text-emerald-400 font-mono">
                        {item.arrivalDate}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500 dark:text-emerald-400">
                      No sample mandi records matching your filter criteria. Try selecting &ldquo;All&rdquo;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="p-4 bg-emerald-50/40 dark:bg-[#071F18] border-t border-emerald-100 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Showing {filteredRecords.length} representative APMC market records
            </span>
            <span className="font-medium text-emerald-700 dark:text-emerald-300">
              Modal price reflects primary transaction benchmark per quintal
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

