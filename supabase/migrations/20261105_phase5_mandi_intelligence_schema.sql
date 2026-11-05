-- ==============================================================================
-- AGROCLOUD AI - PHASE 5: MANDI INTELLIGENCE & MARKET PRICE ANALYTICS SCHEMA
-- ==============================================================================

-- 1. Create Enums for Market Intelligence
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mandi_data_source') THEN
    CREATE TYPE mandi_data_source AS ENUM ('agmarknet_live', 'agmarknet_daily_benchmark', 'enam_portal', 'user_reported');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'selling_recommendation_type') THEN
    CREATE TYPE selling_recommendation_type AS ENUM ('sell_now', 'hold_storage', 'divert_alternate_mandi', 'monitor_close');
  END IF;
END $$;

-- 2. Mandi Records Table (Current & Daily Market Arrivals)
CREATE TABLE IF NOT EXISTS public.mandi_records (
  id TEXT PRIMARY KEY,
  commodity VARCHAR(100) NOT NULL,
  variety VARCHAR(100) NOT NULL DEFAULT 'Standard',
  grade VARCHAR(50) NOT NULL DEFAULT 'FAQ',
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  market VARCHAR(150) NOT NULL,
  min_price NUMERIC(10, 2) NOT NULL,
  max_price NUMERIC(10, 2) NOT NULL,
  modal_price NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT '₹ / Quintal',
  arrivals_tonnes NUMERIC(10, 2) DEFAULT 0,
  arrival_date DATE NOT NULL,
  data_source mandi_data_source NOT NULL DEFAULT 'agmarknet_daily_benchmark',
  is_live BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Mandi Historical Time-Series Table (Daily modal prices for analytics)
CREATE TABLE IF NOT EXISTS public.mandi_price_history (
  id TEXT PRIMARY KEY,
  commodity VARCHAR(100) NOT NULL,
  market VARCHAR(150) NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  record_date DATE NOT NULL,
  min_price NUMERIC(10, 2) NOT NULL,
  max_price NUMERIC(10, 2) NOT NULL,
  modal_price NUMERIC(10, 2) NOT NULL,
  arrivals_tonnes NUMERIC(10, 2) DEFAULT 0,
  data_source mandi_data_source NOT NULL DEFAULT 'agmarknet_daily_benchmark',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Farmer Watchlist Table (Pinned commodities and mandis)
CREATE TABLE IF NOT EXISTS public.farmer_mandi_watchlists (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  commodity VARCHAR(100) NOT NULL,
  market VARCHAR(150) NOT NULL,
  target_price_alert NUMERIC(10, 2),
  alert_condition VARCHAR(20) DEFAULT 'above', -- 'above' or 'below'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Saved Transport Calculations Table
CREATE TABLE IF NOT EXISTS public.mandi_transport_calculations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  commodity VARCHAR(100) NOT NULL,
  quantity_quintals NUMERIC(10, 2) NOT NULL,
  destination_market VARCHAR(150) NOT NULL,
  destination_district VARCHAR(100) NOT NULL,
  distance_km NUMERIC(10, 2) NOT NULL,
  vehicle_type VARCHAR(100) NOT NULL,
  freight_cost NUMERIC(10, 2) NOT NULL,
  labor_cost NUMERIC(10, 2) NOT NULL,
  mandi_fees NUMERIC(10, 2) NOT NULL,
  total_expenses NUMERIC(10, 2) NOT NULL,
  gross_revenue NUMERIC(10, 2) NOT NULL,
  net_realized_revenue NUMERIC(10, 2) NOT NULL,
  net_price_per_quintal NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Indexes for High-Speed Search & Querying
CREATE INDEX IF NOT EXISTS idx_mandi_records_commodity_state ON public.mandi_records(commodity, state);
CREATE INDEX IF NOT EXISTS idx_mandi_records_date ON public.mandi_records(arrival_date DESC);
CREATE INDEX IF NOT EXISTS idx_mandi_records_market ON public.mandi_records(market);
CREATE INDEX IF NOT EXISTS idx_mandi_history_commodity_market_date ON public.mandi_price_history(commodity, market, record_date DESC);
CREATE INDEX IF NOT EXISTS idx_farmer_watchlists_user ON public.farmer_mandi_watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_mandi_transport_user ON public.mandi_transport_calculations(user_id);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.mandi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandi_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_mandi_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandi_transport_calculations ENABLE ROW LEVEL SECURITY;

-- Public read access for market price records and history
CREATE POLICY "Public Read Access for Mandi Records"
  ON public.mandi_records FOR SELECT USING (true);

CREATE POLICY "Public Read Access for Mandi Price History"
  ON public.mandi_price_history FOR SELECT USING (true);

-- Authenticated user isolation for watchlists
CREATE POLICY "Users Can Manage Own Mandi Watchlists"
  ON public.farmer_mandi_watchlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated user isolation for transport calculations
CREATE POLICY "Users Can Manage Own Transport Calculations"
  ON public.mandi_transport_calculations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

