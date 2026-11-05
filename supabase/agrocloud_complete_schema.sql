-- ==============================================================================
-- AGROCLOUD AI - MASTER DATABASE PROVISIONING SCHEMA
-- Covers Phase 1, Phase 2, and Phase 3
-- Database: Supabase PostgreSQL
-- Features: 
--   - Idempotent execution (safe to run multiple times without data loss)
--   - Row Level Security (RLS) enabled on all tables
--   - Preserves all existing records (Never drops tables)
-- ==============================================================================

-- ==============================================================================
-- 1. ENUMS (Custom PostgreSQL Types)
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('Farmer', 'Agricultural Consultant', 'Administrator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE app_theme AS ENUM ('light', 'dark', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE farm_ownership AS ENUM ('owned', 'leased', 'shared');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE crop_growth_stage AS ENUM (
        'Sowing',
        'Germination',
        'Vegetative',
        'Flowering',
        'Yield Formation',
        'Ripening',
        'Harvested'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE crop_status AS ENUM ('active', 'harvested', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_category AS ENUM (
        'Seeds',
        'Fertilizers',
        'Pesticides',
        'Machinery & Fuel',
        'Labor',
        'Irrigation',
        'Storage & Logistics',
        'Other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM (
        'Sowing',
        'Weeding',
        'Irrigation',
        'Fertilization',
        'Pesticide Spray',
        'Pruning',
        'Harvesting',
        'Soil Test',
        'Other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

DO $$ BEGIN
    CREATE TYPE diagnosis_severity AS ENUM ('low', 'moderate', 'severe', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE insight_priority AS ENUM ('high', 'medium', 'low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE insight_category AS ENUM (
        'irrigation',
        'soil',
        'weather',
        'crop_growth',
        'pest_disease',
        'market',
        'general'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. PHASE 1 TABLES: Profiles, Preferences, Inquiries
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    state TEXT,
    role user_role NOT NULL DEFAULT 'Farmer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    theme app_theme NOT NULL DEFAULT 'light',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    notification_preferences JSONB NOT NULL DEFAULT '{"email_alerts": true, "sms_weather": true, "mandi_updates": true, "disease_warnings": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. PHASE 2 TABLES: Farms, Fields, Crops, Activities, Expenses
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    taluk TEXT,
    village TEXT,
    pincode VARCHAR(10),
    address TEXT,
    area NUMERIC(10, 2) NOT NULL,
    area_unit VARCHAR(10) NOT NULL DEFAULT 'acres',
    soil_type TEXT NOT NULL,
    irrigation_type TEXT NOT NULL,
    ownership farm_ownership NOT NULL DEFAULT 'owned',
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    area NUMERIC(10, 2) NOT NULL,
    area_unit VARCHAR(10) NOT NULL DEFAULT 'acres',
    soil_type TEXT NOT NULL,
    soil_ph NUMERIC(3, 1),
    irrigation_method TEXT NOT NULL,
    water_source TEXT NOT NULL,
    description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    variety TEXT,
    season VARCHAR(20) NOT NULL,
    growth_stage crop_growth_stage NOT NULL DEFAULT 'Sowing',
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    actual_harvest_date DATE,
    yield_estimate NUMERIC(10, 2),
    yield_actual NUMERIC(10, 2),
    yield_unit VARCHAR(20) DEFAULT 'quintals',
    crop_status crop_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.farming_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    activity_type activity_type NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    cost NUMERIC(10, 2) DEFAULT 0,
    performed_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.farming_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    category expense_category NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'Cash',
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. PHASE 3 TABLES: Virtual IoT, Telemetry, Alerts, Weather Cache
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.iot_sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    sensor_name TEXT NOT NULL,
    sensor_code VARCHAR(50) NOT NULL UNIQUE,
    sensor_type sensor_category_enum NOT NULL DEFAULT 'soil',
    parameter sensor_parameter_enum NOT NULL DEFAULT 'soil_moisture',
    unit VARCHAR(20) NOT NULL,
    min_threshold NUMERIC(10, 2) NOT NULL DEFAULT 0,
    max_threshold NUMERIC(10, 2) NOT NULL DEFAULT 100,
    status sensor_status_enum NOT NULL DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sensor_id UUID NOT NULL REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    parameter sensor_parameter_enum NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    data_source reading_source_enum NOT NULL DEFAULT 'simulated',
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.sensor_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sensor_id UUID NOT NULL REFERENCES public.iot_sensors(id) ON DELETE CASCADE UNIQUE,
    status simulation_status_enum NOT NULL DEFAULT 'stopped',
    interval_seconds INTEGER NOT NULL DEFAULT 5,
    simulation_profile VARCHAR(50) NOT NULL DEFAULT 'standard',
    started_at TIMESTAMPTZ,
    stopped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.monitoring_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    sensor_id UUID NOT NULL REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    severity alert_severity_enum NOT NULL DEFAULT 'warning',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    triggered_value NUMERIC(10, 2) NOT NULL,
    threshold_value NUMERIC(10, 2) NOT NULL,
    status alert_status_enum NOT NULL DEFAULT 'active',
    recommended_action TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.irrigation_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    soil_moisture NUMERIC(5, 2),
    rainfall NUMERIC(5, 2),
    recommendation TEXT NOT NULL,
    explanation TEXT NOT NULL,
    data_sources TEXT NOT NULL DEFAULT 'Software simulation + Open-Meteo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude NUMERIC(8, 4) NOT NULL,
    longitude NUMERIC(8, 4) NOT NULL,
    weather_payload JSONB NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL
);

-- ==============================================================================
-- 4B. PHASE 4 TABLES: AI Farm Intelligence & Multilingual Assistant
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Agricultural Consultation',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    data_context JSONB,
    is_voice BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.crop_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    image_url TEXT,
    disease_name TEXT NOT NULL,
    scientific_name TEXT,
    severity diagnosis_severity NOT NULL DEFAULT 'moderate',
    confidence NUMERIC(5, 2) NOT NULL DEFAULT 85.00,
    visible_symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    possible_causes JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    prevention_guidance JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_confirmed_diagnosis BOOLEAN NOT NULL DEFAULT false,
    disclaimer TEXT NOT NULL DEFAULT 'Preliminary AI assessment based on visual patterns. Consult local Krishi Vigyan Kendra (KVK) or an ICAR-certified agronomist before applying chemical treatments.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.crop_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
    season VARCHAR(20) NOT NULL,
    soil_type TEXT NOT NULL,
    soil_ph NUMERIC(3, 1),
    soil_moisture NUMERIC(5, 2),
    weather_context JSONB,
    recommended_crops JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.yield_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    growth_stage crop_growth_stage NOT NULL DEFAULT 'Vegetative',
    historical_yield NUMERIC(10, 2),
    predicted_yield_min NUMERIC(10, 2) NOT NULL,
    predicted_yield_max NUMERIC(10, 2) NOT NULL,
    predicted_yield_unit VARCHAR(20) NOT NULL DEFAULT 'quintals/acre',
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
    confidence_explanation TEXT NOT NULL,
    influencing_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
    data_sufficiency_note TEXT,
    is_guaranteed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.ai_farm_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category insight_category NOT NULL DEFAULT 'general',
    priority insight_priority NOT NULL DEFAULT 'medium',
    explanation TEXT NOT NULL,
    supporting_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    suggested_action TEXT NOT NULL,
    data_source TEXT NOT NULL DEFAULT 'hybrid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. INDEXES FOR PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_district ON public.farms(district);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_fields_user_id ON public.fields(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_field_id ON public.crops(field_id);
CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON public.crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON public.crops(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_status ON public.crops(crop_status);
CREATE INDEX IF NOT EXISTS idx_farming_activities_field_id ON public.farming_activities(field_id);
CREATE INDEX IF NOT EXISTS idx_farming_activities_user_id ON public.farming_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_farming_expenses_farm_id ON public.farming_expenses(farm_id);
CREATE INDEX IF NOT EXISTS idx_farming_expenses_user_id ON public.farming_expenses(user_id);

CREATE INDEX IF NOT EXISTS idx_iot_sensors_user_id ON public.iot_sensors(user_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_farm_id ON public.iot_sensors(farm_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_field_id ON public.iot_sensors(field_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_code ON public.iot_sensors(sensor_code);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_time ON public.sensor_readings(sensor_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_farm_param ON public.sensor_readings(farm_id, parameter, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_user_id ON public.sensor_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_user_status ON public.monitoring_alerts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_sensor_time ON public.monitoring_alerts(sensor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_crop_diagnoses_user ON public.crop_diagnoses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crop_diagnoses_crop ON public.crop_diagnoses(crop_name);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_user ON public.crop_recommendations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crop_recommendations_farm ON public.crop_recommendations(farm_id);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_user ON public.yield_predictions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_yield_predictions_crop ON public.yield_predictions(crop_id);
CREATE INDEX IF NOT EXISTS idx_ai_farm_insights_user ON public.ai_farm_insights(user_id, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_farm_insights_farm ON public.ai_farm_insights(farm_id);

-- ==============================================================================
-- 6. TRIGGER FUNCTIONS FOR UPDATED_AT & AUTOMATIC PROFILES
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER set_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_farms_updated_at ON public.farms;
CREATE TRIGGER set_farms_updated_at BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_fields_updated_at ON public.fields;
CREATE TRIGGER set_fields_updated_at BEFORE UPDATE ON public.fields FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_crops_updated_at ON public.crops;
CREATE TRIGGER set_crops_updated_at BEFORE UPDATE ON public.crops FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_iot_sensors_updated_at ON public.iot_sensors;
CREATE TRIGGER set_iot_sensors_updated_at BEFORE UPDATE ON public.iot_sensors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_ai_conversations_updated_at ON public.ai_conversations;
CREATE TRIGGER set_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
    v_phone TEXT;
    v_preferred_language TEXT;
    v_state TEXT;
    v_role user_role;
BEGIN
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    v_phone := NEW.raw_user_meta_data->>'phone';
    v_preferred_language := COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en');
    v_state := NEW.raw_user_meta_data->>'state';
    
    BEGIN
        v_role := (NEW.raw_user_meta_data->>'role')::user_role;
    EXCEPTION WHEN OTHERS THEN
        v_role := 'Farmer'::user_role;
    END;

    INSERT INTO public.profiles (id, full_name, email, phone, preferred_language, state, role)
    VALUES (NEW.id, v_full_name, NEW.email, v_phone, v_preferred_language, v_state, v_role)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        preferred_language = EXCLUDED.preferred_language,
        state = EXCLUDED.state,
        role = EXCLUDED.role,
        updated_at = timezone('utc'::text, now());

    INSERT INTO public.user_preferences (user_id, language, theme)
    VALUES (NEW.id, v_preferred_language, 'light')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- Helper function for Admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'Administrator'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe Policy helper
DO $$ BEGIN
    -- Profiles
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

    -- User Preferences
    DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
    CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
    CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
    CREATE POLICY "Users can insert their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Inquiries
    DROP POLICY IF EXISTS "Anyone can submit a contact inquiry" ON public.contact_inquiries;
    CREATE POLICY "Anyone can submit a contact inquiry" ON public.contact_inquiries FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Only admins can view inquiries" ON public.contact_inquiries;
    CREATE POLICY "Only admins can view inquiries" ON public.contact_inquiries FOR SELECT USING (public.is_admin());

    -- Farms
    DROP POLICY IF EXISTS "Users can view their own farms" ON public.farms;
    CREATE POLICY "Users can view their own farms" ON public.farms FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own farms" ON public.farms;
    CREATE POLICY "Users can insert their own farms" ON public.farms FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own farms" ON public.farms;
    CREATE POLICY "Users can update their own farms" ON public.farms FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own farms" ON public.farms;
    CREATE POLICY "Users can delete their own farms" ON public.farms FOR DELETE USING (auth.uid() = user_id);

    -- Fields
    DROP POLICY IF EXISTS "Users can view their own fields" ON public.fields;
    CREATE POLICY "Users can view their own fields" ON public.fields FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own fields" ON public.fields;
    CREATE POLICY "Users can insert their own fields" ON public.fields FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own fields" ON public.fields;
    CREATE POLICY "Users can update their own fields" ON public.fields FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own fields" ON public.fields;
    CREATE POLICY "Users can delete their own fields" ON public.fields FOR DELETE USING (auth.uid() = user_id);

    -- Crops
    DROP POLICY IF EXISTS "Users can view their own crops" ON public.crops;
    CREATE POLICY "Users can view their own crops" ON public.crops FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own crops" ON public.crops;
    CREATE POLICY "Users can insert their own crops" ON public.crops FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own crops" ON public.crops;
    CREATE POLICY "Users can update their own crops" ON public.crops FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own crops" ON public.crops;
    CREATE POLICY "Users can delete their own crops" ON public.crops FOR DELETE USING (auth.uid() = user_id);

    -- Activities
    DROP POLICY IF EXISTS "Users can view their own activities" ON public.farming_activities;
    CREATE POLICY "Users can view their own activities" ON public.farming_activities FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own activities" ON public.farming_activities;
    CREATE POLICY "Users can insert their own activities" ON public.farming_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own activities" ON public.farming_activities;
    CREATE POLICY "Users can update their own activities" ON public.farming_activities FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own activities" ON public.farming_activities;
    CREATE POLICY "Users can delete their own activities" ON public.farming_activities FOR DELETE USING (auth.uid() = user_id);

    -- Expenses
    DROP POLICY IF EXISTS "Users can view their own expenses" ON public.farming_expenses;
    CREATE POLICY "Users can view their own expenses" ON public.farming_expenses FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.farming_expenses;
    CREATE POLICY "Users can insert their own expenses" ON public.farming_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own expenses" ON public.farming_expenses;
    CREATE POLICY "Users can update their own expenses" ON public.farming_expenses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.farming_expenses;
    CREATE POLICY "Users can delete their own expenses" ON public.farming_expenses FOR DELETE USING (auth.uid() = user_id);

    -- IoT Sensors
    DROP POLICY IF EXISTS "Users can view their own sensors" ON public.iot_sensors;
    CREATE POLICY "Users can view their own sensors" ON public.iot_sensors FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own sensors" ON public.iot_sensors;
    CREATE POLICY "Users can insert their own sensors" ON public.iot_sensors FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own sensors" ON public.iot_sensors;
    CREATE POLICY "Users can update their own sensors" ON public.iot_sensors FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own sensors" ON public.iot_sensors;
    CREATE POLICY "Users can delete their own sensors" ON public.iot_sensors FOR DELETE USING (auth.uid() = user_id);

    -- Sensor Readings
    DROP POLICY IF EXISTS "Users can view their own readings" ON public.sensor_readings;
    CREATE POLICY "Users can view their own readings" ON public.sensor_readings FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own readings" ON public.sensor_readings;
    CREATE POLICY "Users can insert their own readings" ON public.sensor_readings FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Sensor Simulations
    DROP POLICY IF EXISTS "Users can view their own simulations" ON public.sensor_simulations;
    CREATE POLICY "Users can view their own simulations" ON public.sensor_simulations FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can manage their own simulations" ON public.sensor_simulations;
    CREATE POLICY "Users can manage their own simulations" ON public.sensor_simulations FOR ALL USING (auth.uid() = user_id);

    -- Monitoring Alerts
    DROP POLICY IF EXISTS "Users can view their own alerts" ON public.monitoring_alerts;
    CREATE POLICY "Users can view their own alerts" ON public.monitoring_alerts FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can update their own alerts" ON public.monitoring_alerts;
    CREATE POLICY "Users can update their own alerts" ON public.monitoring_alerts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert alerts" ON public.monitoring_alerts;
    CREATE POLICY "Users can insert alerts" ON public.monitoring_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Irrigation Recommendations
    DROP POLICY IF EXISTS "Users can view their irrigation recommendations" ON public.irrigation_recommendations;
    CREATE POLICY "Users can view their irrigation recommendations" ON public.irrigation_recommendations FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert irrigation recommendations" ON public.irrigation_recommendations;
    CREATE POLICY "Users can insert irrigation recommendations" ON public.irrigation_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Weather Cache
    DROP POLICY IF EXISTS "Users can view their weather cache" ON public.weather_cache;
    CREATE POLICY "Users can view their weather cache" ON public.weather_cache FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert weather cache" ON public.weather_cache;
    CREATE POLICY "Users can insert weather cache" ON public.weather_cache FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- AI Conversations Policies
    DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_conversations;
    CREATE POLICY "Users can view their own conversations" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.ai_conversations;
    CREATE POLICY "Users can insert their own conversations" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update their own conversations" ON public.ai_conversations;
    CREATE POLICY "Users can update their own conversations" ON public.ai_conversations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.ai_conversations;
    CREATE POLICY "Users can delete their own conversations" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);

    -- AI Messages Policies
    DROP POLICY IF EXISTS "Users can view their own messages" ON public.ai_messages;
    CREATE POLICY "Users can view their own messages" ON public.ai_messages FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own messages" ON public.ai_messages;
    CREATE POLICY "Users can insert their own messages" ON public.ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own messages" ON public.ai_messages;
    CREATE POLICY "Users can delete their own messages" ON public.ai_messages FOR DELETE USING (auth.uid() = user_id);

    -- Crop Diagnoses Policies
    DROP POLICY IF EXISTS "Users can view their own diagnoses" ON public.crop_diagnoses;
    CREATE POLICY "Users can view their own diagnoses" ON public.crop_diagnoses FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own diagnoses" ON public.crop_diagnoses;
    CREATE POLICY "Users can insert their own diagnoses" ON public.crop_diagnoses FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own diagnoses" ON public.crop_diagnoses;
    CREATE POLICY "Users can delete their own diagnoses" ON public.crop_diagnoses FOR DELETE USING (auth.uid() = user_id);

    -- Crop Recommendations Policies
    DROP POLICY IF EXISTS "Users can view their own recommendations" ON public.crop_recommendations;
    CREATE POLICY "Users can view their own recommendations" ON public.crop_recommendations FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own recommendations" ON public.crop_recommendations;
    CREATE POLICY "Users can insert their own recommendations" ON public.crop_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own recommendations" ON public.crop_recommendations;
    CREATE POLICY "Users can delete their own recommendations" ON public.crop_recommendations FOR DELETE USING (auth.uid() = user_id);

    -- Yield Predictions Policies
    DROP POLICY IF EXISTS "Users can view their own yield predictions" ON public.yield_predictions;
    CREATE POLICY "Users can view their own yield predictions" ON public.yield_predictions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own yield predictions" ON public.yield_predictions;
    CREATE POLICY "Users can insert their own yield predictions" ON public.yield_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own yield predictions" ON public.yield_predictions;
    CREATE POLICY "Users can delete their own yield predictions" ON public.yield_predictions FOR DELETE USING (auth.uid() = user_id);

    -- AI Farm Insights Policies
    DROP POLICY IF EXISTS "Users can view their own farm insights" ON public.ai_farm_insights;
    CREATE POLICY "Users can view their own farm insights" ON public.ai_farm_insights FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

    DROP POLICY IF EXISTS "Users can insert their own farm insights" ON public.ai_farm_insights;
    CREATE POLICY "Users can insert their own farm insights" ON public.ai_farm_insights FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete their own farm insights" ON public.ai_farm_insights;
    CREATE POLICY "Users can delete their own farm insights" ON public.ai_farm_insights FOR DELETE USING (auth.uid() = user_id);
END $$;

