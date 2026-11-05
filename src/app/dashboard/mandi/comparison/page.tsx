'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { mandiService } from '@/lib/services/mandiService';
import { MandiNavTabs } from '@/components/dashboard/MandiNavTabs';
import type { MandiComparisonItem } from '@/lib/supabase/types';
import {
  GitCompare,
  TrendingUp,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Truck,
  ArrowRight,
  Filter,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CROPS_LIST = [
  'Tomato',
  'Onion',
  'Potato',
  'Wheat',
  'Cotton',
  'Soybean',
  'Paddy (Rice)',
  'Maize',
  'Chilli (Dry)',
];

export default function MandiComparisonPage() {
  const searchParams = useSearchParams();
  const initialCommodity = searchParams.get('commodity') || 'Tomato';

  const [selectedCrop, setSelectedCrop] = useState<string>(initialCommodity);
  const [loading, setLoading] = useState<boolean>(true);
  const [comparisonData, setComparisonData] = useState<{
    commodity: string;
    comparisons: MandiComparisonItem[];
    highestPrice: number;
    lowestPrice: number;
    priceSpread: number;
    bestMarket: string;
  }>({
    commodity: initialCommodity,
    comparisons: [],
    highestPrice: 0,
    lowestPrice: 0,
    priceSpread: 0,
    bestMarket: '',
  });

  // Load comparison data
  const loadComparison = async (crop: string) => {
    setLoading(true);
    try {
      const data = await mandiService.compareMarkets(crop, []);
      setComparisonData(data);
    } catch (err) {
      console.warn('Failed to load comparison data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison(selectedCrop);
  }, [selectedCrop]);

  // Recharts Chart Data
  const chartData = useMemo(() => {
    return comparisonData.comparisons.map((c) => ({
      market: c.market.replace(' APMC', '').replace(' Yard', ''),
      modalPrice: c.modal_price,
      minPrice: c.min_price,
      maxPrice: c.max_price,
      isHighest: c.is_highest,
    }));
  }, [comparisonData]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                Inter-Mandi Price Comparison Matrix
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
                Compare modal prices, spreads, and grade comparability across major agricultural wholesale yards.
              </p>
            </div>
          </div>
        </div>

        {/* Crop Selector */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <span className="text-xs font-bold text-stone-500 dark:text-emerald-300">Compare Crop:</span>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="text-xs font-extrabold bg-transparent text-emerald-950 dark:text-emerald-100 focus:outline-none cursor-pointer"
          >
            {CROPS_LIST.map((crop) => (
              <option key={crop} value={crop} className="bg-white dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100">
                {crop}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mandi Navigation Tabs */}
      <MandiNavTabs activeTab="comparison" />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Highest Price Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-200 dark:border-emerald-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Highest Modal Price
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100 mt-0.5">
              ₹{comparisonData.highestPrice.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-stone-500 dark:text-emerald-300/80 mt-0.5 block truncate max-w-[200px]">
              {comparisonData.bestMarket}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Lowest Price Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-200 dark:border-emerald-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400">
              Lowest Modal Price
            </span>
            <div className="text-2xl sm:text-3xl font-black text-stone-800 dark:text-stone-200 mt-0.5">
              ₹{comparisonData.lowestPrice.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-stone-500 dark:text-emerald-300/80 mt-0.5 block truncate max-w-[200px]">
              Regional Baseline
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        {/* Price Spread Difference Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              Inter-Market Price Spread
            </span>
            <div className="text-2xl sm:text-3xl font-black mt-0.5">
              ₹{comparisonData.priceSpread.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-emerald-100 mt-0.5 block">
              Max Profit Opportunity / Quintal
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Bar Chart + Comparison Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recharts Bar Chart */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800/60">
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 uppercase tracking-wider">
                Modal Price Spread (₹ / Quintal)
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-emerald-400">
                Visual benchmark comparison for {selectedCrop}
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="market"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['dataMin - 200', 'dataMax + 200']} />
                <Tooltip
                  formatter={(val: any) => [`₹${val.toLocaleString('en-IN')} / Q`, 'Modal Price']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #10b981',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="modalPrice" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isHighest ? '#059669' : '#10b981'}
                      opacity={entry.isHighest ? 1 : 0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-stone-500 dark:text-emerald-400/90 leading-relaxed italic border-t border-emerald-100/60 dark:border-emerald-800/40 pt-3">
            * Dark emerald indicates the highest-paying market for {selectedCrop}. Always verify net transit freight before dispatching loads.
          </p>
        </div>

        {/* Right Column: Comparative Ledger Table */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800/60">
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 uppercase tracking-wider">
                Mandi Comparison Table
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-emerald-400">
                Grade comparability, spread vs top market, and transit shortcuts
              </p>
            </div>
            <Link
              href={`/dashboard/mandi/transport-calculator?commodity=${encodeURIComponent(selectedCrop)}`}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Calculate Net Return</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-emerald-200 dark:border-emerald-800 text-[10px] uppercase font-bold text-stone-500 dark:text-emerald-400">
                  <th className="py-2.5 px-3">Market & Location</th>
                  <th className="py-2.5 px-3 text-right">Modal Rate</th>
                  <th className="py-2.5 px-3 text-right">Spread vs Best</th>
                  <th className="py-2.5 px-3">Grade Quality</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/60">
                {comparisonData.comparisons.map((c, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40">
                    <td className="py-3 px-3">
                      <strong className="block font-bold text-emerald-950 dark:text-emerald-100">
                        {c.market}
                      </strong>
                      <span className="text-[10px] text-stone-500 dark:text-emerald-400">
                        {c.district}, {c.state}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm">
                      ₹{c.modal_price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs">
                      {c.is_highest ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold text-[10px]">
                          HIGHEST
                        </span>
                      ) : (
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          -₹{Math.abs(c.price_difference_from_best).toLocaleString('en-IN')}/Q
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-stone-600 dark:text-emerald-300 text-[11px]">
                      <span className="block font-medium">{c.variety}</span>
                      <span className="text-[10px] text-stone-400">{c.comparability_note}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Link
                        href={`/dashboard/mandi/transport-calculator?commodity=${encodeURIComponent(
                          selectedCrop
                        )}&market=${encodeURIComponent(c.market)}&price=${c.modal_price}`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] inline-flex items-center gap-1 shadow-sm"
                      >
                        <Truck className="w-3 h-3" />
                        <span>Freight</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

