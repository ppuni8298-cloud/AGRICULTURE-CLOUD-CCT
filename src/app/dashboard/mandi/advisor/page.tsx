'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Warehouse,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Coins,
  Scale,
  RefreshCw,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  CheckSquare
} from 'lucide-react';
import { MandiNavTabs } from '@/components/dashboard/MandiNavTabs';
import { mandiService } from '@/lib/services/mandiService';
import { SellingAdvisorInsight } from '@/lib/supabase/types';

const POPULAR_COMMODITIES = [
  'Tomato',
  'Onion',
  'Potato',
  'Wheat',
  'Cotton',
  'Rice',
  'Soybean',
  'Maize',
  'Green Chilli',
  'Turmeric',
];

const MARKETS_BY_COMMODITY: Record<string, string[]> = {
  Tomato: ['Kolar APMC Yard', 'Madanapalle Market', 'Nashik (Pimpalgaon)', 'Azadpur Mandi'],
  Onion: ['Lasalgaon APMC', 'Pune APMC', 'Hubballi APMC', 'Indore Mandi'],
  Potato: ['Agra Mandi', 'Hassan APMC', 'Azadpur Mandi', 'Kolkata Posta Market'],
  Wheat: ['Khanna Grain Market', 'Indore Mandi', 'Sirsa APMC', 'Kota Mandi'],
  Cotton: ['Rajkot APMC', 'Warangal Enumamula', 'Adilabad APMC', 'Surendranagar'],
  Rice: ['Karnal Grain Market', 'Guntur Mirchi Yard', 'Raipur APMC'],
  Soybean: ['Indore Mandi', 'Latur APMC', 'Ujjain Mandi'],
  Maize: ['Davangere APMC', 'Gulabbagh Mandi', 'Chhindwara APMC'],
  'Green Chilli': ['Guntur Mirchi Yard', 'Byadgi APMC', 'Nagpur APMC'],
  Turmeric: ['Sangli Mandi', 'Nizamabad APMC', 'Erode Mandi'],
};

export default function FarmerSellingAdvisorPage() {
  const [commodity, setCommodity] = useState('Tomato');
  const [market, setMarket] = useState('Kolar APMC Yard');
  const [quantity, setQuantity] = useState<number>(50);
  const [storageType, setStorageType] = useState<'none' | 'aerated' | 'cold'>('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advisory, setAdvisory] = useState<SellingAdvisorInsight | null>(null);

  // Update market when commodity changes if current market isn't in options
  const availableMarkets = MARKETS_BY_COMMODITY[commodity] || ['Kolar APMC Yard'];

  useEffect(() => {
    if (!availableMarkets.includes(market)) {
      setMarket(availableMarkets[0]);
    }
  }, [commodity]);

  const loadAdvisory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mandiService.getSellingAdvisory(commodity, market);
      setAdvisory(data);
    } catch (err: any) {
      console.error('Failed to load advisory:', err);
      setError(err.message || 'Unable to generate selling advisory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisory();
  }, [commodity, market]);

  // Recommendation theme helpers
  const getRecTheme = (rec?: string) => {
    switch (rec) {
      case 'sell_now':
        return {
          title: 'Sell Immediately at Current Market',
          badge: 'RECOMMENDATION: SELL NOW',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300',
          badgeBg: 'bg-emerald-600 text-white',
          icon: TrendingUp,
          accent: 'emerald',
        };
      case 'hold_storage':
        return {
          title: 'Hold Stock in Storage / Warehouse',
          badge: 'RECOMMENDATION: HOLD & STORE',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300',
          badgeBg: 'bg-amber-600 text-white',
          icon: Warehouse,
          accent: 'amber',
        };
      case 'divert_alternate_mandi':
        return {
          title: 'Divert Harvest to Alternate Regional APMC',
          badge: 'RECOMMENDATION: DIVERT TO HIGHER VALUE MANDI',
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300',
          badgeBg: 'bg-blue-600 text-white',
          icon: Truck,
          accent: 'blue',
        };
      default:
        return {
          title: 'Staggered Selling & Close Monitoring',
          badge: 'RECOMMENDATION: MONITOR DAILY',
          bg: 'bg-teal-500/10 border-teal-500/30 text-teal-800 dark:text-teal-300',
          badgeBg: 'bg-teal-600 text-white',
          icon: Scale,
          accent: 'teal',
        };
    }
  };

  const currentTheme = getRecTheme(advisory?.recommendation);
  const RecIcon = currentTheme.icon;

  // Potential revenue at current market
  const currentModal = advisory?.current_modal_price || 0;
  const grossCurrent = currentModal * quantity;

  // Alternate market revenue comparison
  const altMarket = advisory?.best_alternate_market;
  const altModal = altMarket?.modal_price || 0;
  const grossAlternate = altModal * quantity;
  const approxExtraFreight = (altMarket?.distance_km || 40) * 22; // approx freight for small pickup
  const netGainPotential = altMarket
    ? (altModal - currentModal) * quantity - approxExtraFreight
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI Market Intelligence & Timing Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Farmer Selling Decision Advisor
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Multi-factor algorithmic guidance on whether to sell today, store in on-farm/cold storage, or transport to a higher-paying regional APMC.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdvisory}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Decision
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <MandiNavTabs activeTab="advisor" />

      {/* Control Filters Bar */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agricultural Commodity
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {POPULAR_COMMODITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Local / Base APMC Yard
            </label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {availableMarkets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Harvested / Stored Quantity (Quintals)
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Available Storage Facility
            </label>
            <select
              value={storageType}
              onChange={(e) => setStorageType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="none">None / Open Field Shed (Perishable)</option>
              <option value="aerated">Aerated Dry Godown / Farm Store</option>
              <option value="cold">Certified Cold Storage / Warehousing</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center">
          <div className="inline-block p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mb-3 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Evaluating arrival momentum, 30-day moving averages, and regional spreads...
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {!loading && advisory && (
        <div className="space-y-6">
          {/* Main Hero Recommendation Card */}
          <div className={`p-6 sm:p-8 rounded-2xl border ${currentTheme.bg} relative overflow-hidden transition-all shadow-sm`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${currentTheme.badgeBg}">
                  <span className={`px-2 py-0.5 rounded-full ${currentTheme.badgeBg}`}>
                    {currentTheme.badge}
                  </span>
                  <span className="text-xs opacity-90">
                    Confidence: {advisory.confidence_score}%
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 shadow-md">
                    <RecIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                      {currentTheme.title}
                    </h2>
                    <p className="text-base text-gray-700 dark:text-gray-300 mt-2 font-medium leading-relaxed">
                      {advisory.rationale}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-800/50 mt-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Recommended Farmer Action
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {advisory.suggested_action}
                  </p>
                </div>
              </div>

              {/* Quick Decision Metrics Pill */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
                <div className="p-4 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200/80 dark:border-gray-800">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Current Modal Price</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                    ₹{advisory.current_modal_price.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-gray-500">/ Quintal</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">at {market}</div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200/80 dark:border-gray-800">
                  <div className="text-xs text-gray-500 dark:text-gray-400">30-Day Moving Average</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                    ₹{advisory.thirty_day_moving_average.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-gray-500">/ Quintal</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium mt-1">
                    {advisory.current_modal_price >= advisory.thirty_day_moving_average ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                        +{(
                          ((advisory.current_modal_price - advisory.thirty_day_moving_average) /
                            advisory.thirty_day_moving_average) *
                          100
                        ).toFixed(1)}% above average
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center">
                        <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                        {(
                          ((advisory.current_modal_price - advisory.thirty_day_moving_average) /
                            advisory.thirty_day_moving_average) *
                          100
                        ).toFixed(1)}% below average
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Diagnostic Cards (3-Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Perishability & Holding Risk */}
            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Shelf Life & Perishability
                    </h3>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      advisory.perishability_days <= 7
                        ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                        : advisory.perishability_days <= 30
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {advisory.perishability_days <= 7
                      ? 'High Risk'
                      : advisory.perishability_days <= 30
                      ? 'Moderate'
                      : 'Low Risk'}
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Ambient Shelf Life</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {advisory.perishability_days} Days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          advisory.perishability_days <= 7
                            ? 'bg-rose-500'
                            : advisory.perishability_days <= 30
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (advisory.perishability_days / 90) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {advisory.perishability_days <= 7
                      ? `${commodity} suffers rapid dehydration and spoilage. Prolonged on-farm holding without refrigeration leads to 4–7% weight loss per day.`
                      : `${commodity} can tolerate holding in aerated dry storage. Weight degradation is minimal (<1.5% monthly) if pest protection is maintained.`}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4 text-xs text-gray-500">
                Storage facility selected: <span className="font-semibold capitalize">{storageType}</span>
              </div>
            </div>

            {/* 2. Holding Cost vs Value Appreciation */}
            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      <Coins className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Storage Financial Projection
                    </h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                    Monthly
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Estimated Storage Overhead
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                      ₹{advisory.storage_cost_estimate_per_month}{' '}
                      <span className="text-xs font-normal text-gray-500">/ Quintal / Month</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Total holding cost for {quantity} Q: ₹
                      {(advisory.storage_cost_estimate_per_month * quantity).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Break-even price recovery needed: ₹
                    {(advisory.current_modal_price + advisory.storage_cost_estimate_per_month).toFixed(
                      0
                    )}
                    /Q after 30 days of storage.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                <Link
                  href={`/dashboard/mandi/analytics?commodity=${encodeURIComponent(commodity)}`}
                  className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline gap-1"
                >
                  Inspect 30-Day Volatility Curve <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 3. Alternate APMC Yard Arbitrage */}
            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                      <Truck className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Alternate Market Arbitrage
                    </h3>
                  </div>
                  {altMarket && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                      +₹{altMarket.modal_price - advisory.current_modal_price}/Q Spread
                    </span>
                  )}
                </div>

                {altMarket ? (
                  <div className="space-y-3 mt-4">
                    <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Top Alternate APMC Yard
                      </div>
                      <div className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                        {altMarket.market}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                        <span>Modal Price:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{altMarket.modal_price}/Q
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <span>Extra Transit:</span>
                        <span>~{altMarket.distance_km} km</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Estimated net profit gain for {quantity} Q:{' '}
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Math.max(0, netGainPotential).toLocaleString('en-IN')}
                      </span>{' '}
                      (after deducting ~₹{approxExtraFreight} transit freight).
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-4">
                    No higher-paying alternate APMC found within realistic transport radius.
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                <Link
                  href={`/dashboard/mandi/transport-calculator?commodity=${encodeURIComponent(
                    commodity
                  )}`}
                  className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline gap-1"
                >
                  Run Full Freight Deductions <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Actionable Dispatch & Selling Checklist */}
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Actionable Execution Checklist for {commodity}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Recommended operational steps to maximize realized revenue and avoid deduction penalties.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Morning Auction Timing
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Arrive at {market} before 06:00 AM. Early arrivals secure prime auction slots before commission agent bidding fatigue sets in.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Moisture & Grading Verification
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Sort out discolored or undersized produce prior to loading. Well-graded lots fetch ₹80–150/Q premium over mixed FAQ grade.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Official e-Weighbridge Slip
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Demand tare weight receipt at APMC entry gate to prevent unauthorized weighbridge deductions or tare manipulation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    e-NAM Online Settlement Check
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Where e-NAM integrated, ensure direct bank transfer (DBT) is triggered within 24 hours without intermediary cash cuts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
