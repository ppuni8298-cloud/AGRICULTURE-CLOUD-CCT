-- ==============================================================================
-- AGROCLOUD AI - PHASE 2 DATABASE MIGRATION
-- Module: Complete Farm, Field, Crop, Activity & Expense Management System
-- Database: Supabase PostgreSQL
-- Security: Row Level Security (RLS) enabled on all tables
-- ==============================================================================

-- 1. Create Enums for Farm Ownership, Growth Stages, and Expense Categories
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

-- 2. Create `farms` table
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    taluk TEXT,
    village TEXT,
    pincode VARCHAR(10),
    address TEXT,
    area NUMERIC(10, 2) NOT NULL,
    area_unit VARCHAR(20) NOT NULL DEFAULT 'acres',
    soil_type TEXT NOT NULL,
    irrigation_type TEXT NOT NULL,
    ownership farm_ownership NOT NULL DEFAULT 'owned',
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create `fields` table
CREATE TABLE IF NOT EXISTS public.fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size NUMERIC(10, 2) NOT NULL,
    area_unit VARCHAR(20) NOT NULL DEFAULT 'acres',
    soil_type TEXT NOT NULL,
    soil_ph NUMERIC(3, 1),
    irrigation_method TEXT NOT NULL,
    water_source TEXT,
    description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create `crops` table
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    variety TEXT,
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    growth_stage crop_growth_stage NOT NULL DEFAULT 'Vegetative',
    status crop_status NOT NULL DEFAULT 'active',
    yield_quantity NUMERIC(10, 2),
    yield_unit VARCHAR(20) DEFAULT 'quintals',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create `farming_activities` table
CREATE TABLE IF NOT EXISTS public.farming_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL DEFAULT 'Other',
    date DATE NOT NULL,
    description TEXT NOT NULL,
    operator_name TEXT,
    cost NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Create `farming_expenses` table
CREATE TABLE IF NOT EXISTS public.farming_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category expense_category NOT NULL DEFAULT 'Other',
    amount NUMERIC(10, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    payment_method TEXT DEFAULT 'Cash',
    receipt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_fields_user_id ON public.fields(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_field_id ON public.crops(field_id);
CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON public.crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON public.crops(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_status ON public.crops(status);
CREATE INDEX IF NOT EXISTS idx_farming_activities_farm_id ON public.farming_activities(farm_id);
CREATE INDEX IF NOT EXISTS idx_farming_activities_field_id ON public.farming_activities(field_id);
CREATE INDEX IF NOT EXISTS idx_farming_activities_user_id ON public.farming_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_farming_activities_date ON public.farming_activities(date DESC);
CREATE INDEX IF NOT EXISTS idx_farming_expenses_farm_id ON public.farming_expenses(farm_id);
CREATE INDEX IF NOT EXISTS idx_farming_expenses_user_id ON public.farming_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_farming_expenses_category ON public.farming_expenses(category);
CREATE INDEX IF NOT EXISTS idx_farming_expenses_date ON public.farming_expenses(date DESC);

-- 8. Auto updated_at triggers
DROP TRIGGER IF EXISTS set_farms_updated_at ON public.farms;
CREATE TRIGGER set_farms_updated_at
    BEFORE UPDATE ON public.farms
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_fields_updated_at ON public.fields;
CREATE TRIGGER set_fields_updated_at
    BEFORE UPDATE ON public.fields
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_crops_updated_at ON public.crops;
CREATE TRIGGER set_crops_updated_at
    BEFORE UPDATE ON public.crops
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_expenses ENABLE ROW LEVEL SECURITY;

-- FARMS RLS POLICIES
CREATE POLICY "Users can view their own farms"
    ON public.farms FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own farms"
    ON public.farms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farms"
    ON public.farms FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farms"
    ON public.farms FOR DELETE
    USING (auth.uid() = user_id);

-- FIELDS RLS POLICIES
CREATE POLICY "Users can view their own fields"
    ON public.fields FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own fields"
    ON public.fields FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fields"
    ON public.fields FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fields"
    ON public.fields FOR DELETE
    USING (auth.uid() = user_id);

-- CROPS RLS POLICIES
CREATE POLICY "Users can view their own crops"
    ON public.crops FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own crops"
    ON public.crops FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crops"
    ON public.crops FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crops"
    ON public.crops FOR DELETE
    USING (auth.uid() = user_id);

-- ACTIVITIES RLS POLICIES
CREATE POLICY "Users can view their own farming activities"
    ON public.farming_activities FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own farming activities"
    ON public.farming_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farming activities"
    ON public.farming_activities FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farming activities"
    ON public.farming_activities FOR DELETE
    USING (auth.uid() = user_id);

-- EXPENSES RLS POLICIES
CREATE POLICY "Users can view their own farming expenses"
    ON public.farming_expenses FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert their own farming expenses"
    ON public.farming_expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farming expenses"
    ON public.farming_expenses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farming expenses"
    ON public.farming_expenses FOR DELETE
    USING (auth.uid() = user_id);

