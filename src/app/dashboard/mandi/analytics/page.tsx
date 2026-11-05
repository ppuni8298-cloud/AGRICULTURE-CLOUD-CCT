'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { mandiService } from '@/lib/services/mandiService';
import { MandiNavTabs } from '@/components/dashboard/MandiNavTabs';
import type { MandiPriceHistoryItem } from '@/lib/supabase/types';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  Info,
  RefreshCw,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COMMODITIES = [
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

export default function MandiAnalyticsPage() {
  const searchParams = useSearchParams();
  const initialCommodity = searchParams.get('commodity') || 'Tomato';

  const [selectedCommodity, setSelectedCommodity] = useState<string>(initialCommodity);
  const [timeframeDays, setTimeframeDays] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<{
    commodity: string;
    market: string;
    history: MandiPriceHistoryItem[];
    currentPrice: number;
    sevenDayChangePercent: number;
    thirtyDayChangePercent: number;
    volatilityIndex: number;
    volatilityCategory: 'low' | 'moderate' | 'high';
    averageModalPrice: number;
    seasonalNote: string;
  }>({
    commodity: initialCommodity,
    market: 'Kolar APMC Yard',
    history: [],
    currentPrice: 2200,
    sevenDayChangePercent: 0,
    thirtyDayChangePercent: 0,
    volatilityIndex: 0,
    volatilityCategory: 'moderate',
    averageModalPrice: 2200,
    seasonalNote: '',
  });

  // Load analytics
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await mandiService.getAnalytics(selectedCommodity, undefined, timeframeDays);
      setAnalyticsData(data);
    } catch (err) {
      console.warn('Failed to load market analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedCommodity, timeframeDays]);

  // Handle CSV Export
  const handleExportCSV = () => {
    mandiService.exportToCSV(
      analyticsData.history,
      `agrocloud_mandi_${selectedCommodity.toLowerCase()}_${timeframeDays}days`
    );
  };

  // Recharts Data Mapping
  const chartData = useMemo(() => {
    return analyticsData.history.map((h) => ({
      date: h.record_date.slice(5), // 'MM-DD'
      modalPrice: h.modal_price,
      minPrice: h.min_price,
      maxPrice: h.max_price,
      arrivals: h.arrivals_tonnes || 0,
    }));
  }, [analyticsData]);

  const getVolatilityBadge = (cat: 'low' | 'moderate' | 'high') => {
    switch (cat) {
      case 'low':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'high':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      case 'moderate':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                Historical Market Analytics & Volatility
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
                Time-series price movements, 30-day moving averages, seasonal cycles, and CSV reporting.
              </p>
            </div>
          </div>
        </div>

        {/* CSV Export & Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs py-2 px-3 border-emerald-300 text-emerald-800 dark:text-emerald-300 gap-1.5"
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Mandi Navigation Tabs */}
      <MandiNavTabs activeTab="analytics" />

      {/* Filter Row: Commodity + Timeframe Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-sm">
        {/* Commodity Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500 dark:text-emerald-400">Commodity:</span>
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="text-xs font-bold bg-emerald-50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none cursor-pointer"
          >
            {COMMODITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950 p-1 rounded-xl">
          {[
            { label: '7 Days', days: 7 },
            { label: '30 Days', days: 30 },
            { label: '90 Days', days: 90 },
          ].map((t) => (
            <button
              key={t.days}
              type="button"
              onClick={() => setTimeframeDays(t.days)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeframeDays === t.days
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-600 dark:text-emerald-300 hover:text-emerald-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Volatility Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Modal Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-sm">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Latest Modal Rate
          </span>
          <div className="text-2xl font-black text-emerald-950 dark:text-emerald-100 mt-1">
            ₹{analyticsData.currentPrice.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-stone-500 font-semibold">{analyticsData.market}</span>
        </div>

        {/* 7-Day Momentum */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-sm">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            7-Day Momentum
          </span>
          <div
            className={`text-2xl font-black mt-1 ${
              analyticsData.sevenDayChangePercent >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {analyticsData.sevenDayChangePercent >= 0 ? '+' : ''}
            {analyticsData.sevenDayChangePercent}%
          </div>
          <span className="text-[11px] text-stone-500 font-semibold">Short-term trajectory</span>
        </div>

        {/* 30-Day Moving Average */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-sm">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Moving Average
          </span>
          <div className="text-2xl font-black text-stone-800 dark:text-emerald-200 mt-1">
            ₹{analyticsData.averageModalPrice.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-stone-500 font-semibold">30-day price baseline</span>
        </div>

        {/* Volatility Index */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Volatility Score
            </span>
            <span
              className={`text-[9px] uppercase font-extrabold px-2 py-0.2 rounded-full border ${getVolatilityBadge(
                analyticsData.volatilityCategory
              )}`}
            >
              {analyticsData.volatilityCategory}
            </span>
          </div>
          <div className="text-2xl font-black text-stone-800 dark:text-emerald-100">
            {analyticsData.volatilityIndex}%
          </div>
          <span className="text-[11px] text-stone-500 font-semibold">Standard deviation index</span>
        </div>
      </div>

      {/* Main Historical Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-emerald-100 dark:border-emerald-800/60">
          <div>
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 uppercase tracking-wider">
              {selectedCommodity} Price Trajectory & Spread (₹ / Quintal)
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-emerald-400">
              Min, Modal, and Max APMC price bands over {timeframeDays} days
            </p>
          </div>
          <span className="text-xs text-stone-500 font-mono font-bold">
            {analyticsData.market}
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="modalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['dataMin - 150', 'dataMax + 150']} />
              <Tooltip
                formatter={(val: any, name: string) => [
                  `₹${val.toLocaleString('en-IN')}`,
                  name === 'modalPrice' ? 'Modal Price' : name === 'maxPrice' ? 'Max Price' : 'Min Price',
                ]}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #10b981',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              <Area
                type="monotone"
                dataKey="maxPrice"
                stroke="#10b981"
                strokeDasharray="4 4"
                fill="url(#maxGradient)"
                name="Max Price"
              />
              <Area
                type="monotone"
                dataKey="modalPrice"
                stroke="#059669"
                strokeWidth={2.5}
                fill="url(#modalGradient)"
                name="Modal Price"
              />
              <Area
                type="monotone"
                dataKey="minPrice"
                stroke="#94a3b8"
                strokeDasharray="2 2"
                fill="transparent"
                name="Min Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Seasonal Agronomic Context */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-[#071F18] border border-emerald-100 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-stone-700 dark:text-emerald-300">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Seasonal Driver:</strong> {analyticsData.seasonalNote}
          </span>
        </div>
      </div>

      {/* Historical Ledger Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800/60">
          <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 uppercase tracking-wider">
            Daily Record Ledger ({analyticsData.history.length} records)
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs py-1.5 px-2.5 h-8 border-emerald-300 text-emerald-700 dark:text-emerald-300 gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </Button>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white dark:bg-[#0A2920]">
              <tr className="border-b border-emerald-200 dark:border-emerald-800 text-[10px] uppercase font-bold text-stone-500 dark:text-emerald-400">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Commodity</th>
                <th className="py-2.5 px-3">Market</th>
                <th className="py-2.5 px-3 text-right">Min Rate</th>
                <th className="py-2.5 px-3 text-right">Modal Rate</th>
                <th className="py-2.5 px-3 text-right">Max Rate</th>
                <th className="py-2.5 px-3 text-right">Arrivals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/60">
              {analyticsData.history.map((h) => (
                <tr key={h.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40">
                  <td className="py-2.5 px-3 font-mono font-semibold text-stone-700 dark:text-emerald-300">
                    {h.record_date}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-950 dark:text-emerald-100">
                    {h.commodity}
                  </td>
                  <td className="py-2.5 px-3 text-stone-600 dark:text-emerald-400">
                    {h.market}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-stone-500">
                    ₹{h.min_price}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    ₹{h.modal_price}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-stone-500">
                    ₹{h.max_price}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-stone-600 dark:text-emerald-400">
                    {h.arrivals_tonnes} T
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
