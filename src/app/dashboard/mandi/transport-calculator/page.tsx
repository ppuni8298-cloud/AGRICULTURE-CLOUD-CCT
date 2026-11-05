'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { farmService } from '@/lib/services/farmService';
import { mandiService } from '@/lib/services/mandiService';
import { MandiNavTabs } from '@/components/dashboard/MandiNavTabs';
import type { Farm } from '@/lib/supabase/types';
import {
  Truck,
  IndianRupee,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Scale,
  Sliders,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const VEHICLE_OPTIONS = [
  { value: 'pickup', label: 'Pickup Truck / Bolero Maxi (2.5T, ₹24/km)', rate: 24 },
  { value: 'mini_truck', label: 'Mini Truck / Tata Ace (1.5T, ₹18/km)', rate: 18 },
  { value: 'tractor_trolley', label: 'Tractor Trolley (4.0T, ₹28/km)', rate: 28 },
  { value: 'lcv_medium', label: 'Medium LCV 407 (6.0T, ₹38/km)', rate: 38 },
  { value: 'heavy_truck', label: 'Heavy Truck 16T (16.0T, ₹65/km)', rate: 65 },
];

const POPULAR_MANDIS = [
  { name: 'Kolar APMC Yard', district: 'Kolar', defaultDistance: 25, defaultPrice: 2200 },
  { name: 'Yeshwanthpur APMC Yard', district: 'Bengaluru Urban', defaultDistance: 68, defaultPrice: 2350 },
  { name: 'Chikkaballapur APMC', district: 'Chikkaballapur', defaultDistance: 45, defaultPrice: 2280 },
  { name: 'Lasalgaon APMC', district: 'Nashik', defaultDistance: 220, defaultPrice: 2900 },
  { name: 'Pimpalgaon Baswant APMC', district: 'Nashik', defaultDistance: 240, defaultPrice: 2850 },
  { name: 'Gondal Marketing Yard', district: 'Rajkot', defaultDistance: 310, defaultPrice: 7350 },
];

export default function MandiTransportCalculatorPage() {
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const userId = user?.id || profile?.id || 'demo-farmer-001';

  // Registered Farms
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');

  // Form Parameters
  const [commodity, setCommodity] = useState<string>(searchParams.get('commodity') || 'Tomato');
  const [destinationMarket, setDestinationMarket] = useState<string>(
    searchParams.get('market') || 'Kolar APMC Yard'
  );
  const [quantityQuintals, setQuantityQuintals] = useState<number>(30);
  const [distanceKm, setDistanceKm] = useState<number>(35);
  const [vehicleType, setVehicleType] = useState<string>('pickup');
  const [modalPrice, setModalPrice] = useState<number>(
    parseFloat(searchParams.get('price') || '2200') || 2200
  );

  // Calculation Results
  const [loading, setLoading] = useState<boolean>(false);
  const [calcResult, setCalcResult] = useState<{
    quantityQuintals: number;
    distanceKm: number;
    vehicleType: string;
    freightRatePerKm: number;
    freightCost: number;
    laborCost: number;
    mandiCessCost: number;
    weighingCost: number;
    totalLogisticsCost: number;
    grossMandiRevenue: number;
    netRealizedRevenue: number;
    netPricePerQuintal: number;
    effectiveModalPrice: number;
  } | null>(null);

  // Load User Farms
  useEffect(() => {
    async function loadFarms() {
      try {
        const userFarms = await farmService.getFarms(userId);
        setFarms(userFarms);
        if (userFarms.length > 0) {
          setSelectedFarmId(userFarms[0].id);
        }
      } catch (err) {
        console.warn('Failed to load farms:', err);
      }
    }
    loadFarms();
  }, [userId]);

  // Run calculation
  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const result = await mandiService.calculateTransport({
        commodity,
        quantityQuintals,
        destinationMarket,
        distanceKm,
        vehicleType,
        customModalPrice: modalPrice,
      });
      setCalcResult(result);
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  // When a destination market is selected from presets
  const handleMarketSelect = (marketName: string) => {
    setDestinationMarket(marketName);
    const found = POPULAR_MANDIS.find((m) => m.name === marketName);
    if (found) {
      setDistanceKm(found.defaultDistance);
      setModalPrice(found.defaultPrice);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                Mandi Logistics & Net Realized Price Calculator
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80">
                Accurately deduct transit freight, labor (hamali), and APMC cess to discover your true take-home earnings.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Real-World Freight Rates</span>
        </div>
      </div>

      {/* Mandi Navigation Tabs */}
      <MandiNavTabs activeTab="transport" />

      {/* Main Grid: Parameters Form (Left) + Economics Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleCalculate}
            className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md space-y-4"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 flex items-center gap-2 pb-2 border-b border-emerald-100 dark:border-emerald-800/60">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Logistics & Shipment Inputs</span>
            </h3>

            {/* Farm Selector */}
            <div>
              <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                Source Farm / Loading Location
              </label>
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none cursor-pointer"
              >
                <option value="">Custom Farm Location</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.district || f.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Commodity & Target Market */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                  Commodity
                </label>
                <input
                  type="text"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                  Destination Market
                </label>
                <input
                  type="text"
                  value={destinationMarket}
                  onChange={(e) => setDestinationMarket(e.target.value)}
                  className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Popular Presets */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                Quick Mandi Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_MANDIS.slice(0, 4).map((pm, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleMarketSelect(pm.name)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      destinationMarket === pm.name
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50/60 dark:bg-emerald-950 text-stone-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {pm.name.replace(' APMC Yard', '').replace(' APMC', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Modal Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                  Quantity (Quintals)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantityQuintals}
                  onChange={(e) => setQuantityQuintals(parseFloat(e.target.value) || 1)}
                  className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                  Expected Modal (₹/Q)
                </label>
                <input
                  type="number"
                  min="100"
                  step="10"
                  value={modalPrice}
                  onChange={(e) => setModalPrice(parseFloat(e.target.value) || 100)}
                  className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Vehicle Type & Distance */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-emerald-300 block mb-1">
                  Vehicle Type & Freight Benchmark
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full text-xs bg-emerald-50/60 dark:bg-[#071F18] text-emerald-950 dark:text-emerald-100 px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none cursor-pointer"
                >
                  {VEHICLE_OPTIONS.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-emerald-300 mb-1">
                  <span>Transit Distance (One-Way)</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">
                    {distanceKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="350"
                  step="1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Calculate Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full py-3 text-sm font-bold shadow-lg shadow-emerald-700/20"
              icon={<Truck className="w-4 h-4" />}
            >
              Recalculate Net Profit
            </Button>
          </form>
        </div>

        {/* Right Column: Economics Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {calcResult ? (
            <div className="space-y-4">
              {/* Highlight Banner: Realized Net Price vs Modal */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/40">
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
                    Net Take-Home Yield ({calcResult.quantityQuintals} Quintals)
                  </span>
                  <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-1 rounded-full">
                    {destinationMarket}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <span className="text-[11px] text-emerald-200 block uppercase font-bold">
                      Net Realized Price Per Quintal
                    </span>
                    <div className="text-3xl sm:text-4xl font-black tracking-tight">
                      ₹{calcResult.netPricePerQuintal.toLocaleString('en-IN')}
                    </div>
                    <span className="text-xs text-emerald-100">
                      (vs ₹{calcResult.effectiveModalPrice} Gross Modal)
                    </span>
                  </div>

                  <div className="sm:border-l sm:border-emerald-500/40 sm:pl-4">
                    <span className="text-[11px] text-emerald-200 block uppercase font-bold">
                      Total Net In-Hand Revenue
                    </span>
                    <div className="text-2xl sm:text-3xl font-black tracking-tight">
                      ₹{calcResult.netRealizedRevenue.toLocaleString('en-IN')}
                    </div>
                    <span className="text-xs text-emerald-100">
                      After all freight, cess & labor deductions
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 shadow-md space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-emerald-300 flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-800/60">
                  <span>Logistics & Market Deduction Breakdown</span>
                  <span className="text-rose-600 font-bold">
                    -₹{calcResult.totalLogisticsCost.toLocaleString('en-IN')} Total Cost
                  </span>
                </h4>

                <div className="space-y-3 text-xs">
                  {/* Gross Revenue */}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-stone-700 dark:text-emerald-200 font-medium">
                      Gross Mandi Revenue ({calcResult.quantityQuintals} Q @ ₹{calcResult.effectiveModalPrice})
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      +₹{calcResult.grossMandiRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Freight Charge */}
                  <div className="flex items-center justify-between py-1 border-t border-stone-100 dark:border-emerald-900/40 text-stone-600 dark:text-emerald-300/90">
                    <span>
                      Vehicle Freight ({calcResult.distanceKm} km @ ₹{calcResult.freightRatePerKm}/km)
                    </span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                      -₹{calcResult.freightCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Hamali Labor */}
                  <div className="flex items-center justify-between py-1 border-t border-stone-100 dark:border-emerald-900/40 text-stone-600 dark:text-emerald-300/90">
                    <span>Labor & Hamali Loading/Unloading (₹15 / Quintal)</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                      -₹{calcResult.laborCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* APMC Cess */}
                  <div className="flex items-center justify-between py-1 border-t border-stone-100 dark:border-emerald-900/40 text-stone-600 dark:text-emerald-300/90">
                    <span>APMC Mandi Cess & Market Fee (1.5%)</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                      -₹{calcResult.mandiCessCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Weighing Charges */}
                  <div className="flex items-center justify-between py-1 border-t border-stone-100 dark:border-emerald-900/40 text-stone-600 dark:text-emerald-300/90">
                    <span>Weighbridge Fee (Dharam Kanta)</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                      -₹{calcResult.weighingCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Final Net Line */}
                  <div className="flex items-center justify-between py-2.5 border-t-2 border-emerald-200 dark:border-emerald-800 font-bold text-sm">
                    <span className="text-emerald-950 dark:text-emerald-100">
                      Final Net In-Hand Earnings
                    </span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-300 text-base">
                      ₹{calcResult.netRealizedRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Strategic Selling Tip */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[#071F18] border border-emerald-200 dark:border-emerald-800 text-xs text-stone-700 dark:text-emerald-300 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Agronomic Logistics Insight:</strong> For shipments over 50 quintals, consolidating loads with neighboring farmers using a Medium LCV (₹38/km) reduces per-quintal transit overhead by up to 28% compared to individual pickup trucks.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
              <p className="text-xs text-stone-500">Calculating transportation economics...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

