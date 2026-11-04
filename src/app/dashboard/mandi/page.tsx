'use client';

import React, { useState, useMemo } from 'react';
import { SAMPLE_MANDI_RECORDS } from '@/lib/constants/mandiData';
import { TrendingUp, Search, Filter, AlertCircle, MapPin, Sparkles } from 'lucide-react';

export default function MandiPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [selectedState, setSelectedState] = useState('All');

  const commodities = useMemo(() => {
    return ['All', ...Array.from(new Set(SAMPLE_MANDI_RECORDS.map((r) => r.commodity)))];
  }, []);

  const states = useMemo(() => {
    return ['All', ...Array.from(new Set(SAMPLE_MANDI_RECORDS.map((r) => r.state)))];
  }, []);

  const filteredRecords = useMemo(() => {
    return SAMPLE_MANDI_RECORDS.filter((r) => {
      const matchSearch =
        r.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.state.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCommodity = selectedCommodity === 'All' || r.commodity === selectedCommodity;
      const matchState = selectedState === 'All' || r.state === selectedState;

      return matchSearch && matchCommodity && matchState;
    });
  }, [searchTerm, selectedCommodity, selectedState]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="pb-6 border-b border-emerald-100 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
              All-India Mandi Price Explorer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 mt-1">
            APMC benchmark prices, min/max spreads, and modal rates across Indian agricultural markets.
          </p>
        </div>
      </div>

      {/* Demonstration Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Sample Demonstration Records:</strong> Illustrates APMC benchmark tracking. Production release connects directly to national e-NAM and Agmarknet feeds.
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by commodity, market or district..."
              className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 pl-10 pr-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {commodities.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Commodities' : c}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All States' : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-100/60 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 text-xs uppercase font-bold tracking-wider border-b border-emerald-200 dark:border-emerald-800">
                <th className="py-3.5 px-6">Commodity & Variety</th>
                <th className="py-3.5 px-6">APMC Yard / Location</th>
                <th className="py-3.5 px-6 text-right">Min Price</th>
                <th className="py-3.5 px-6 text-right">Max Price</th>
                <th className="py-3.5 px-6 text-right">Modal Price</th>
                <th className="py-3.5 px-6 text-center">Date</th>
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
                      <div className="font-bold text-emerald-950 dark:text-emerald-100">
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
                      <div className="text-[11px] text-stone-500 dark:text-emerald-400 flex items-center gap-1">
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
                    No mandi records matching your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

