-- ==============================================================================
-- AGROCLOUD AI - PHASE 6 DATABASE SCHEMA MIGRATION
-- Advanced Farm Digital Twin, Satellite Intelligence, Drone Analytics,
-- What-If Farm Simulator, Geospatial Intelligence & Predictive Farm Analytics
-- ==============================================================================

-- 1. Custom Enums for Phase 6
DO $$ BEGIN
    CREATE TYPE boundary_source_type AS ENUM (
        'survey_verified',
        'farmer_estimated',
        'cadastral_geojson'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE satellite_provider_type AS ENUM (
        'sentinel_2',
        'landsat_8',
        'planet',
        'demo_benchmark'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE drone_sensor_type AS ENUM (
        'rgb_standard',
        'multispectral_calibrated',
        'thermal'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE predictive_insight_category AS ENUM (
        'crop_stress',
        'soil_moisture',
        'weather_risk',
        'water_demand'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Table: farm_geometries
CREATE TABLE IF NOT EXISTS farm_geometries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    boundary_type boundary_source_type NOT NULL DEFAULT 'farmer_estimated',
    geometry_geojson JSONB NOT NULL,
    centroid_lat NUMERIC(10, 7) NOT NULL,
    centroid_lng NUMERIC(10, 7) NOT NULL,
    calculated_area_acres NUMERIC(8, 2) NOT NULL,
    elevation_meters NUMERIC(6, 1) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Table: satellite_observations
CREATE TABLE IF NOT EXISTS satellite_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider satellite_provider_type NOT NULL DEFAULT 'demo_benchmark',
    acquisition_date DATE NOT NULL,
    cloud_cover_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
    ndvi_mean NUMERIC(4, 3) NOT NULL,
    ndvi_min NUMERIC(4, 3) NOT NULL,
    ndvi_max NUMERIC(4, 3) NOT NULL,
    evi_mean NUMERIC(4, 3),
    spectral_bands_json JSONB NOT NULL,
    stressed_area_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Table: drone_uploads
CREATE TABLE IF NOT EXISTS drone_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    capture_date DATE NOT NULL,
    sensor_type drone_sensor_type NOT NULL DEFAULT 'rgb_standard',
    flight_altitude_m NUMERIC(6, 1),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Table: drone_analyses
CREATE TABLE IF NOT EXISTS drone_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id UUID NOT NULL REFERENCES drone_uploads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_health_score NUMERIC(5, 1) NOT NULL,
    canopy_coverage_percent NUMERIC(5, 1) NOT NULL,
    visible_issues_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    chlorosis_yellowing_detected BOOLEAN NOT NULL DEFAULT false,
    lodging_detected BOOLEAN NOT NULL DEFAULT false,
    weed_infestation_level VARCHAR(20) NOT NULL DEFAULT 'none',
    ai_model_used VARCHAR(100) NOT NULL,
    recommendations_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Table: farm_simulation_scenarios
CREATE TABLE IF NOT EXISTS farm_simulation_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_name VARCHAR(255) NOT NULL,
    crop_type VARCHAR(100) NOT NULL,
    parameters_json JSONB NOT NULL,
    results_json JSONB NOT NULL,
    is_baseline BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Table: predictive_insights
CREATE TABLE IF NOT EXISTS predictive_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_category predictive_insight_category NOT NULL,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'low',
    confidence_score NUMERIC(5, 1) NOT NULL,
    horizon_days INTEGER NOT NULL DEFAULT 14,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    data_sources_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    actionable_recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_farm_geometries_farm ON farm_geometries(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_geometries_user ON farm_geometries(user_id);
CREATE INDEX IF NOT EXISTS idx_satellite_observations_farm ON satellite_observations(farm_id, acquisition_date DESC);
CREATE INDEX IF NOT EXISTS idx_satellite_observations_user ON satellite_observations(user_id);
CREATE INDEX IF NOT EXISTS idx_drone_uploads_farm ON drone_uploads(farm_id, capture_date DESC);
CREATE INDEX IF NOT EXISTS idx_drone_uploads_user ON drone_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_drone_analyses_upload ON drone_analyses(upload_id);
CREATE INDEX IF NOT EXISTS idx_drone_analyses_user ON drone_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_simulation_scenarios_farm ON farm_simulation_scenarios(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_simulation_scenarios_user ON farm_simulation_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_farm ON predictive_insights(farm_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictive_insights_user ON predictive_insights(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE farm_geometries ENABLE ROW LEVEL SECURITY;
ALTER TABLE satellite_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_simulation_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_insights ENABLE ROW LEVEL SECURITY;

-- farm_geometries policies
CREATE POLICY "Users can manage own farm geometries"
    ON farm_geometries FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- satellite_observations policies
CREATE POLICY "Users can view own satellite observations"
    ON satellite_observations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own satellite observations"
    ON satellite_observations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- drone_uploads policies
CREATE POLICY "Users can manage own drone uploads"
    ON drone_uploads FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- drone_analyses policies
CREATE POLICY "Users can manage own drone analyses"
    ON drone_analyses FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- farm_simulation_scenarios policies
CREATE POLICY "Users can manage own simulation scenarios"
    ON farm_simulation_scenarios FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- predictive_insights policies
CREATE POLICY "Users can manage own predictive insights"
    ON predictive_insights FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
