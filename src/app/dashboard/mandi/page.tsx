'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { mandiService } from '@/lib/services/mandiService';
import { MandiNavTabs } from '@/components/dashboard/MandiNavTabs';
import type { MandiRecordItem, FarmerMandiWatchlist } from '@/lib/supabase/types';
import {
  TrendingUp,
  Search,
  Filter,
  AlertCircle,
  MapPin,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Building2,
  ExternalLink,
  ShieldCheck,
  Wheat,
  Scale,
  GitCompare,
  Truck,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MandiPriceIntelligencePage() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const userId = user?.id || profile?.id || 'demo-farmer-001';

  // State
  const [records, setRecords] = useState<MandiRecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [sortBy, setSortBy] = useState<'modal_desc' | 'modal_asc' | 'arrivals_desc'>('modal_desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [dataSourceNotice, setDataSourceNotice] = useState<string>('AGMARKNET / e-NAM APMC Benchmark Records');
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Watchlist
  const [watchlist, setWatchlist] = useState<FarmerMandiWatchlist[]>([]);

  // Fetch prices
  const loadPrices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mandiService.getPrices({
        commodity: selectedCommodity,
        state: selectedState,
        search: searchTerm,
      });
      setRecords(data.records);
      setDataSourceNotice(data.source);
      setIsLiveApi(data.isLive);
      setLastUpdated(data.lastUpdated);

      const wl = await mandiService.getWatchlist(userId);
      setWatchlist(wl);
    } catch (err) {
      console.warn('Failed to load mandi prices:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCommodity, selectedState, searchTerm, userId]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  // Handle Watchlist Toggle
  const handleToggleWatchlist = async (record: MandiRecordItem) => {
    await mandiService.toggleWatchlist(
      { commodity: record.commodity, market: record.market, target_price_alert: record.modal_price },
      userId
    );
    const updated = await mandiService.getWatchlist(userId);
    setWatchlist(updated);
  };

  const isItemWatched = (record: MandiRecordItem) => {
    return watchlist.some(
      (w) => w.commodity.toLowerCase() === record.commodity.toLowerCase() && w.market.toLowerCase() === record.market.toLowerCase()
    );
  };

  // Extract unique commodities and states for dropdowns
  const availableCommodities = useMemo(() => {
    return [
      'All',
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
  }, []);

  const availableStates = useMemo(() => {
    return [
      'All',
      'Karnataka',
      'Maharashtra',
      'Madhya Pradesh',
      'Gujarat',
      'Punjab',
      'Uttar Pradesh',
      'Andhra Pradesh',
      'Telangana',
      'Haryana',
    ];
  }, []);

  // Sorted records
  const sortedRecords = useMemo(() => {
    const list = [...records];
    if (sortBy === 'modal_desc') {
      return list.sort((a, b) => b.modal_price - a.modal_price);
    } else if (sortBy === 'modal_asc') {
      return list.sort((a, b) => a.modal_price - b.modal_price);
    } else if (sortBy === 'arrivals_desc') {
      return list.sort((a, b) => (b.arrivals_tonnes || 0) - (a.arrivals_tonnes || 0));
    }
    return list;
  }, [records, sortBy]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                Mandi Intelligence & Live Market Explorer
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
                Official APMC daily modal rates, volume arrivals, and price spreads across Indian wholesale markets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setRefreshing(true);
              loadPrices();
            }}
            isLoading={refreshing}
            className="text-xs py-2 px-3 border-emerald-300 text-emerald-800 dark:text-emerald-300 gap-1.5"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Rates
          </Button>
        </div>
      </div>

      {/* Mandi Navigation Tabs */}
      <MandiNavTabs activeTab="explorer" />

      {/* Official Data Provenance Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 dark:text-emerald-200 shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="font-bold block text-emerald-900 dark:text-emerald-100">
              Verified Source: {dataSourceNotice}
            </strong>
            <span className="text-[11px] text-stone-600 dark:text-emerald-300/80">
              {isLiveApi
                ? 'Connected directly to data.gov.in / AGMARKNET national API feed.'
                : 'Prices reflect verified daily APMC market yard arrival benchmarks.'}{' '}
              Updated: {lastUpdated || 'Today'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              isLiveApi
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100'
            }`}
          >
            {isLiveApi ? '● Live API Feed' : 'Daily APMC Index'}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by commodity, APMC market or district..."
              className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 pl-10 pr-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Commodity Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none cursor-pointer"
            >
              {availableCommodities.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Commodities' : c}
                </option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none cursor-pointer"
            >
              {availableStates.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All States' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs sm:text-sm bg-emerald-50/50 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 focus:outline-none cursor-pointer font-medium"
            >
              <option value="modal_desc">Price: High to Low</option>
              <option value="modal_asc">Price: Low to High</option>
              <option value="arrivals_desc">Highest Arrivals</option>
            </select>
          </div>
        </div>

        {/* View Switcher & Result Count */}
        <div className="flex items-center justify-between pt-2 border-t border-emerald-100/60 dark:border-emerald-800/40 text-xs">
          <span className="text-stone-500 dark:text-emerald-400 font-semibold">
            Showing {sortedRecords.length} Active Market Listings
          </span>

          <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-[#0A2920] text-emerald-900 dark:text-emerald-100 shadow-sm'
                  : 'text-stone-500 hover:text-emerald-700 dark:text-emerald-400'
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#0A2920] text-emerald-900 dark:text-emerald-100 shadow-sm'
                  : 'text-stone-500 hover:text-emerald-700 dark:text-emerald-400'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Cards or Table */}
      {loading ? (
        <div className="p-16 text-center text-xs text-stone-400 dark:text-emerald-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Fetching verified APMC market prices...</span>
        </div>
      ) : sortedRecords.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 text-center space-y-3">
          <Wheat className="w-10 h-10 text-emerald-500 mx-auto" />
          <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
            No Market Records Found
          </h4>
          <p className="text-xs text-stone-500 dark:text-emerald-300/80 max-w-sm mx-auto">
            Try adjusting your search query, selecting &quot;All Commodities&quot;, or choosing a different state.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedRecords.map((rec) => {
            const isPinned = isItemWatched(rec);
            return (
              <div
                key={rec.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Card Header: Commodity + Variety + Pin */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-emerald-100 dark:border-emerald-800/60">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {rec.variety} &bull; {rec.grade}
                      </span>
                      <h3 className="text-lg font-extrabold text-emerald-950 dark:text-emerald-100">
                        {rec.commodity}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleWatchlist(rec)}
                      className={`p-1.5 rounded-xl transition-all ${
                        isPinned
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-emerald-50 dark:bg-emerald-950 text-stone-400 hover:text-emerald-700'
                      }`}
                      title={isPinned ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      {isPinned ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Market Location */}
                  <div className="py-2.5 space-y-1">
                    <p className="text-xs font-bold text-stone-800 dark:text-emerald-200 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{rec.market}</span>
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-emerald-400 pl-5">
                      {rec.district}, {rec.state}
                    </p>
                  </div>

                  {/* Modal Price Highlight Banner */}
                  <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-[#071F18] border border-emerald-200 dark:border-emerald-800/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-emerald-400 block">
                        Modal Price
                      </span>
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                        ₹{rec.modal_price.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <span className="text-xs text-stone-500 font-semibold">{rec.unit}</span>
                  </div>

                  {/* Price Spread: Min to Max */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200 dark:border-emerald-800/60">
                      <span className="text-[10px] text-stone-400 block">Min Price</span>
                      <span className="font-bold text-stone-700 dark:text-emerald-300">
                        ₹{rec.min_price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50 dark:bg-emerald-950/40 border border-stone-200 dark:border-emerald-800/60">
                      <span className="text-[10px] text-stone-400 block">Max Price</span>
                      <span className="font-bold text-stone-700 dark:text-emerald-300">
                        ₹{rec.max_price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Daily Arrivals & Date Footer */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-emerald-400 pt-3 border-t border-emerald-100/60 dark:border-emerald-800/40">
                    <span className="flex items-center gap-1 font-semibold">
                      <Scale className="w-3.5 h-3.5 text-emerald-600" />
                      Arrivals: {rec.arrivals_tonnes ? `${rec.arrivals_tonnes} T` : 'Regular'}
                    </span>
                    <span className="font-mono text-[10px]">{rec.arrival_date}</span>
                  </div>

                  {/* Action Links */}
                  <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2">
                    <Link
                      href={`/dashboard/mandi/comparison?commodity=${encodeURIComponent(rec.commodity)}`}
                      className="p-1.5 rounded-lg text-center bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-[10px] font-bold text-emerald-800 dark:text-emerald-300"
                    >
                      Compare
                    </Link>
                    <Link
                      href={`/dashboard/mandi/analytics?commodity=${encodeURIComponent(rec.commodity)}`}
                      className="p-1.5 rounded-lg text-center bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-[10px] font-bold text-emerald-800 dark:text-emerald-300"
                    >
                      Trends
                    </Link>
                    <Link
                      href={`/dashboard/mandi/transport-calculator?commodity=${encodeURIComponent(
                        rec.commodity
                      )}&market=${encodeURIComponent(rec.market)}&price=${rec.modal_price}`}
                      className="p-1.5 rounded-lg text-center bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold text-white shadow-sm"
                    >
                      Freight
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-200 dark:border-emerald-800 text-[10px] uppercase font-bold text-stone-500 dark:text-emerald-400">
                <th className="py-2.5 px-3">Commodity & Variety</th>
                <th className="py-2.5 px-3">Market Yard</th>
                <th className="py-2.5 px-3">State / District</th>
                <th className="py-2.5 px-3 text-right">Min Price</th>
                <th className="py-2.5 px-3 text-right">Modal Price</th>
                <th className="py-2.5 px-3 text-right">Max Price</th>
                <th className="py-2.5 px-3">Arrivals</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/60">
              {sortedRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40">
                  <td className="py-3 px-3">
                    <strong className="block font-bold text-emerald-950 dark:text-emerald-100">
                      {rec.commodity}
                    </strong>
                    <span className="text-[10px] text-stone-500 dark:text-emerald-400">
                      {rec.variety} ({rec.grade})
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-stone-800 dark:text-emerald-200">
                    {rec.market}
                  </td>
                  <td className="py-3 px-3 text-stone-600 dark:text-emerald-300">
                    {rec.district}, {rec.state}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-stone-600 dark:text-emerald-400">
                    ₹{rec.min_price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                    ₹{rec.modal_price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-stone-600 dark:text-emerald-400">
                    ₹{rec.max_price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-stone-700 dark:text-emerald-300 font-medium">
                    {rec.arrivals_tonnes ? `${rec.arrivals_tonnes} Tonnes` : 'Regular'}
                  </td>
                  <td className="py-3 px-3 text-stone-500 font-mono text-[11px]">
                    {rec.arrival_date}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        href={`/dashboard/mandi/comparison?commodity=${encodeURIComponent(rec.commodity)}`}
                        className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold text-[10px]"
                      >
                        Compare
                      </Link>
                      <Link
                        href={`/dashboard/mandi/transport-calculator?commodity=${encodeURIComponent(
                          rec.commodity
                        )}&market=${encodeURIComponent(rec.market)}`}
                        className="px-2 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]"
                      >
                        Freight
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
