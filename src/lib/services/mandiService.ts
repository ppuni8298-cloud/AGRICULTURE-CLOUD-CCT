import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type {
  MandiRecordItem,
  MandiPriceHistoryItem,
  MandiComparisonItem,
  MandiTransportCalculation,
  FarmerMandiWatchlist,
  SellingAdvisorInsight,
} from '@/lib/supabase/types';

const STORAGE_KEYS = {
  WATCHLIST: 'agrocloud_mandi_watchlist',
  TRANSPORT: 'agrocloud_mandi_transport',
};

function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

export const mandiService = {
  // ============================================================================
  // 1. FETCH MANDI PRICES
  // ============================================================================
  async getPrices(params?: {
    commodity?: string;
    state?: string;
    district?: string;
    market?: string;
    search?: string;
  }): Promise<{
    records: MandiRecordItem[];
    total: number;
    source: string;
    isLive: boolean;
    lastUpdated: string;
  }> {
    const query = new URLSearchParams();
    if (params?.commodity && params.commodity !== 'All') query.set('commodity', params.commodity);
    if (params?.state && params.state !== 'All') query.set('state', params.state);
    if (params?.district && params.district !== 'All') query.set('district', params.district);
    if (params?.market && params.market !== 'All') query.set('market', params.market);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/mandi/prices?${query.toString()}`);
    if (!res.ok) {
      throw new Error('Failed to fetch mandi prices from server.');
    }
    return res.json();
  },

  // ============================================================================
  // 2. COMPARE MANDIS
  // ============================================================================
  async compareMarkets(commodity: string, markets: string[]): Promise<{
    commodity: string;
    comparisons: MandiComparisonItem[];
    highestPrice: number;
    lowestPrice: number;
    priceSpread: number;
    bestMarket: string;
  }> {
    const res = await fetch('/api/mandi/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commodity, markets }),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch market comparisons.');
    }
    return res.json();
  },

  // ============================================================================
  // 3. FETCH HISTORICAL ANALYTICS
  // ============================================================================
  async getAnalytics(commodity: string, market?: string, days: number = 30): Promise<{
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
  }> {
    const query = new URLSearchParams({ commodity, days: days.toString() });
    if (market) query.set('market', market);

    const res = await fetch(`/api/mandi/analytics?${query.toString()}`);
    if (!res.ok) {
      throw new Error('Failed to fetch historical analytics.');
    }
    return res.json();
  },

  // ============================================================================
  // 4. CALCULATE TRANSPORTATION ECONOMICS
  // ============================================================================
  async calculateTransport(payload: {
    commodity: string;
    quantityQuintals: number;
    destinationMarket: string;
    distanceKm: number;
    vehicleType: string;
    customModalPrice?: number;
  }) {
    const res = await fetch('/api/mandi/transport', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('Failed to compute transportation economics.');
    }
    const data = await res.json();
    return data.calculation;
  },

  // ============================================================================
  // 5. FETCH SELLING ADVISORY
  // ============================================================================
  async getSellingAdvisory(commodity: string, market?: string): Promise<SellingAdvisorInsight> {
    const query = new URLSearchParams({ commodity });
    if (market) query.set('market', market);

    const res = await fetch(`/api/mandi/advisor?${query.toString()}`);
    if (!res.ok) {
      throw new Error('Failed to fetch selling advisory.');
    }
    const data = await res.json();
    return data.advisory;
  },

  // ============================================================================
  // 6. FARMER WATCHLIST CRUD
  // ============================================================================
  async getWatchlist(userId: string): Promise<FarmerMandiWatchlist[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('farmer_mandi_watchlists')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as FarmerMandiWatchlist[];
      }
    }
    const all = getLocalItem<FarmerMandiWatchlist[]>(STORAGE_KEYS.WATCHLIST, [
      {
        id: 'wl-1',
        user_id: 'demo-farmer-001',
        commodity: 'Tomato',
        market: 'Kolar APMC Yard',
        target_price_alert: 2400,
        alert_condition: 'above',
        created_at: new Date().toISOString(),
      },
      {
        id: 'wl-2',
        user_id: 'demo-farmer-001',
        commodity: 'Onion',
        market: 'Lasalgaon APMC',
        target_price_alert: 3000,
        alert_condition: 'above',
        created_at: new Date().toISOString(),
      },
    ]);
    return all.filter((w) => w.user_id === userId || w.user_id === 'demo-farmer-001');
  },

  async toggleWatchlist(
    item: { commodity: string; market: string; target_price_alert?: number },
    userId: string
  ): Promise<boolean> {
    const current = await this.getWatchlist(userId);
    const existingIndex = current.findIndex(
      (w) => w.commodity.toLowerCase() === item.commodity.toLowerCase() && w.market.toLowerCase() === item.market.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Remove
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          await (supabase as any)
            .from('farmer_mandi_watchlists')
            .delete()
            .eq('id', current[existingIndex].id)
            .eq('user_id', userId);
        }
      }
      const updated = current.filter((_, idx) => idx !== existingIndex);
      setLocalItem(STORAGE_KEYS.WATCHLIST, updated);
      return false; // Not in watchlist anymore
    } else {
      // Add
      const newEntry: FarmerMandiWatchlist = {
        id: `wl-${Date.now()}`,
        user_id: userId,
        commodity: item.commodity,
        market: item.market,
        target_price_alert: item.target_price_alert || 2500,
        alert_condition: 'above',
        created_at: new Date().toISOString(),
      };
      if (isSupabaseConfigured) {
        const supabase = createClient();
        if (supabase) {
          await (supabase as any)
            .from('farmer_mandi_watchlists')
            .insert([{ ...newEntry, user_id: userId }]);
        }
      }
      const updated = [newEntry, ...current];
      setLocalItem(STORAGE_KEYS.WATCHLIST, updated);
      return true; // Added
    }
  },

  // ============================================================================
  // 7. CSV EXPORT UTILITY
  // ============================================================================
  exportToCSV(data: MandiPriceHistoryItem[], filename: string) {
    if (typeof window === 'undefined' || data.length === 0) return;

    const headers = ['Record Date', 'Commodity', 'Market', 'State', 'District', 'Min Price (₹/Q)', 'Modal Price (₹/Q)', 'Max Price (₹/Q)', 'Arrivals (Tonnes)', 'Data Source'];
    const rows = data.map((d) => [
      d.record_date,
      `"${d.commodity}"`,
      `"${d.market}"`,
      `"${d.state}"`,
      `"${d.district}"`,
      d.min_price,
      d.modal_price,
      d.max_price,
      d.arrivals_tonnes || 0,
      `"${d.data_source}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

