-- ==============================================================================
-- AGROCLOUD AI - PHASE 1 DATABASE MIGRATION
-- Database: Supabase PostgreSQL
-- Tables: profiles, user_preferences, contact_inquiries (foundation)
-- Security: Row Level Security (RLS) enabled on all tables
-- ==============================================================================

-- 1. Create Enums for User Roles and Themes
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

-- 2. Create `profiles` table
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

-- 3. Create `user_preferences` table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    theme app_theme NOT NULL DEFAULT 'light',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    notification_preferences JSONB NOT NULL DEFAULT '{"email_alerts": true, "sms_weather": true, "mandi_updates": true, "disease_warnings": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create `contact_inquiries` table (for contact form store)
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Indexes for fast query lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON public.contact_inquiries(created_at DESC);

-- 6. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER set_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Trigger to automatically create profile and default preferences when a new user signs up via Supabase Auth
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
    
    -- Cast role safely, default to Farmer
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
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Helper function to check if requesting user is Administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'Administrator'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies:
-- 1) Any authenticated user can view their own profile.
-- 2) Administrators can view all profiles.
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

-- 3) Users can update their own profile.
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4) Users can insert their own profile (or handled via trigger).
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- User Preferences Policies:
-- 1) Users can view their own preferences.
CREATE POLICY "Users can view their own preferences"
    ON public.user_preferences
    FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- 2) Users can update their own preferences.
CREATE POLICY "Users can update their own preferences"
    ON public.user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3) Users can insert their own preferences.
CREATE POLICY "Users can insert their own preferences"
    ON public.user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Contact Inquiries Policies:
-- 1) Anyone (even anonymous visitors) can insert an inquiry.
CREATE POLICY "Anyone can submit a contact inquiry"
    ON public.contact_inquiries
    FOR INSERT
    WITH CHECK (true);

-- 2) Only administrators can view contact inquiries.
CREATE POLICY "Only admins can view inquiries"
    ON public.contact_inquiries
    FOR SELECT
    USING (public.is_admin());

