-- ==============================================================================
-- AGROCLOUD AI - PHASE 4 DATABASE MIGRATION
-- Module: AI Farm Intelligence & Multilingual AI Assistant
-- Database: Supabase PostgreSQL
-- Features:
--   - Idempotent execution (safe to run multiple times without data loss)
--   - Row Level Security (RLS) enabled on all tables
--   - User-level data isolation via auth.uid()
--   - Foreign keys to existing farms, fields, and crops
-- ==============================================================================

-- ==============================================================================
-- 1. ENUMS FOR AI MODULES
-- ==============================================================================

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
-- 2. AI CONVERSATIONS & MESSAGES (Module 1 & Module 5)
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

-- ==============================================================================
-- 3. CROP DIAGNOSES (Module 2: Crop Doctor)
-- ==============================================================================

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

-- ==============================================================================
-- 4. SMART CROP RECOMMENDATIONS (Module 3)
-- ==============================================================================

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

-- ==============================================================================
-- 5. YIELD PREDICTIONS (Module 4)
-- ==============================================================================

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

-- ==============================================================================
-- 6. AI FARM INSIGHTS (Module 6)
-- ==============================================================================

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
-- 7. INDEXES FOR PERFORMANCE
-- ==============================================================================

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
-- 8. TRIGGERS
-- ==============================================================================

DROP TRIGGER IF EXISTS set_ai_conversations_updated_at ON public.ai_conversations;
CREATE TRIGGER set_ai_conversations_updated_at
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_farm_insights ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
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

