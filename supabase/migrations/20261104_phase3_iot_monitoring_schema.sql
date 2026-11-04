-- ==============================================================================
-- AGROCLOUD AI - PHASE 3 DATABASE MIGRATION
-- Module: Virtual IoT, Weather Intelligence & Smart Farm Monitoring
-- Database: Supabase PostgreSQL
-- Security: Row Level Security (RLS) enabled on all tables
-- ==============================================================================

-- 1. Create Enums for Sensor Categories, Parameters, Statuses, and Reading Sources
DO $$ BEGIN
    CREATE TYPE sensor_category_enum AS ENUM (
        'soil',
        'weather',
        'temperature',
        'humidity',
        'rainfall',
        'light',
        'multi_parameter'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sensor_parameter_enum AS ENUM (
        'soil_moisture',
        'soil_temperature',
        'air_temperature',
        'air_humidity',
        'soil_ph',
        'rainfall',
        'wind_speed',
        'light_intensity'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sensor_status_enum AS ENUM (
        'active',
        'inactive',
        'maintenance',
        'offline'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reading_source_enum AS ENUM (
        'simulated',
        'manual',
        'csv'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE simulation_status_enum AS ENUM (
        'running',
        'paused',
        'stopped'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_severity_enum AS ENUM (
        'critical',
        'warning',
        'info'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_status_enum AS ENUM (
        'active',
        'acknowledged',
        'resolved'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create `iot_sensors` Table
CREATE TABLE IF NOT EXISTS public.iot_sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    sensor_name TEXT NOT NULL,
    sensor_code TEXT NOT NULL UNIQUE,
    sensor_type sensor_category_enum NOT NULL DEFAULT 'soil',
    parameter sensor_parameter_enum NOT NULL DEFAULT 'soil_moisture',
    unit TEXT NOT NULL DEFAULT '%',
    min_threshold NUMERIC,
    max_threshold NUMERIC,
    status sensor_status_enum NOT NULL DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create `sensor_readings` Table
CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sensor_id UUID NOT NULL REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    parameter sensor_parameter_enum NOT NULL,
    value NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    data_source reading_source_enum NOT NULL DEFAULT 'simulated',
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create `sensor_simulations` Table
CREATE TABLE IF NOT EXISTS public.sensor_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sensor_id UUID NOT NULL REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
    status simulation_status_enum NOT NULL DEFAULT 'stopped',
    interval_seconds INT NOT NULL DEFAULT 5,
    simulation_profile TEXT NOT NULL DEFAULT 'standard',
    started_at TIMESTAMPTZ,
    stopped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create `monitoring_alerts` Table
CREATE TABLE IF NOT EXISTS public.monitoring_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    sensor_id UUID NOT NULL REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    severity alert_severity_enum NOT NULL DEFAULT 'warning',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    triggered_value NUMERIC NOT NULL,
    threshold_value NUMERIC NOT NULL,
    status alert_status_enum NOT NULL DEFAULT 'active',
    recommended_action TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 6. Create `irrigation_recommendations` Table
CREATE TABLE IF NOT EXISTS public.irrigation_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    soil_moisture NUMERIC,
    rainfall NUMERIC,
    recommendation TEXT NOT NULL,
    explanation TEXT NOT NULL,
    data_sources TEXT NOT NULL DEFAULT 'Virtual IoT & Open-Meteo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create `weather_cache` Table
CREATE TABLE IF NOT EXISTS public.weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    weather_payload JSONB NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 8. Create Indexes for High Performance Telemetry Queries
CREATE INDEX IF NOT EXISTS idx_iot_sensors_farm_field ON public.iot_sensors(farm_id, field_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_user ON public.iot_sensors(user_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_time ON public.sensor_readings(sensor_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_farm_param ON public.sensor_readings(farm_id, parameter, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_user_status ON public.monitoring_alerts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_weather_cache_farm_expiry ON public.weather_cache(farm_id, expires_at);

-- 9. Trigger for updating updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_iot_sensors_updated_at ON public.iot_sensors;
CREATE TRIGGER trigger_iot_sensors_updated_at
BEFORE UPDATE ON public.iot_sensors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_sensor_simulations_updated_at ON public.sensor_simulations;
CREATE TRIGGER trigger_sensor_simulations_updated_at
BEFORE UPDATE ON public.sensor_simulations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Enable Row Level Security (RLS) on all Phase 3 Tables
ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- 11. Define RLS Policies
-- Sensors
CREATE POLICY "Farmers can manage own virtual sensors" ON public.iot_sensors
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Readings
CREATE POLICY "Farmers can manage own sensor readings" ON public.sensor_readings
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Simulations
CREATE POLICY "Farmers can manage own sensor simulations" ON public.sensor_simulations
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Alerts
CREATE POLICY "Farmers can manage own monitoring alerts" ON public.monitoring_alerts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Irrigation Recommendations
CREATE POLICY "Farmers can view own irrigation recommendations" ON public.irrigation_recommendations
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Weather Cache
CREATE POLICY "Farmers can manage own weather cache" ON public.weather_cache
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

