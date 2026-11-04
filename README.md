# AGROCLOUD AI (Phase 1)
### Smart Farming. Intelligent Decisions. Better Tomorrow.

AgroCloud AI is a multilingual, cloud-native, AI-powered agricultural SaaS ecosystem engineered for Indian smallholder farmers, agricultural consultants, and cooperative federations.

---

## 🌟 PHASE 1 ARCHITECTURE & DELIVERABLES

1. **Commercial Brand Identity & Design System**:
   - Primary Emerald (`#059669`), Deep Forest Green (`#064E3B`), Fresh Leaf Green (`#84CC16`), Secondary Green (`#10B981`), Soft Background (`#F5FAF5`), White (`#FFFFFF`), Primary Text (`#16352A`), Secondary Text (`#64756B`).
   - Seamless **Light Mode (default)** and **Dark Mode** with zero-FOUC script and persistent preference.

2. **12 Indian Languages Multilingual Architecture**:
   - English (`en`), Kannada (`kn` - ಕನ್ನಡ), Hindi (`hi` - हिन्दी), Telugu (`te` - తెలుగు), Tamil (`ta` - தமிழ்), Malayalam (`ml` - മലയാളം), Marathi (`mr` - मराठी), Gujarati (`gu` - ગુજરાતી), Bengali (`bn` - বাংলা), Punjabi (`pa` - ਪੰਜਾਬੀ), Odia (`or` - ଓଡ଼ିଆ), Assamese (`as` - অসমীয়া).
   - Reusable JSON locale dictionaries with live dynamic switching across public landing page, authentication, and dashboard.

3. **Premium Commercial Landing Page**:
   - **Sticky Navigation**: Leaf-inspired logo, responsive mobile drawer, working navigation links, language dropdown, theme switcher.
   - **Hero Section**: High-resolution Indian agricultural landscape, live floating farm analytics card, vegetative index indicator (94% Optimal), micro-weather preview, AI Assistant preview.
   - **Platform Capabilities**: 5 core pillars (AI, Smart Farm Management, Multilingual Interaction, Market Intelligence, Cloud-Based Access).
   - **16 Features Showcase**: All 16 modular solutions with interactive "Learn More" modal detailing agronomic overview and cloud architecture.
   - **Multilingual Showcase**: Interactive 12-language selector and live native greeting preview.
   - **AI Assistant Interactive Demonstration**: Tomato foliar diagnosis simulation with multilingual prompt presets and verified confidence score.
   - **All-India Mandi Price Explorer**: APMC benchmark prices across Karnataka, Maharashtra, Uttar Pradesh, Punjab, Gujarat, Madhya Pradesh, Rajasthan, Andhra Pradesh, Telangana with commodity and state filtering.
   - **How It Works**: 4-step structured onboarding.
   - **Agricultural Personas & Tech Showcase**: Multi-spectral remote sensing, CNN models, PostgreSQL RLS, agro-meteorological modeling.
   - **FAQ & Validated Contact Form**: Working accordion and contact submission store.
   - **SEO**: Sitemap, robots.txt, OpenGraph and Twitter cards.

4. **Authentication & Supabase Database Foundation**:
   - **Registration**: 8 fields (Full name, Email, 10-digit Phone, Password with strength meter, Confirm password, Preferred language, State, Role [Farmer, Consultant, Administrator], Terms acceptance).
   - **Login**: Email, password with show/hide toggle, remember session, quick demo credential buttons.
   - **Password Recovery**: Clean email recovery flow.
   - **Interactive Local Development Sandbox**: Runs seamlessly out of the box when Supabase keys are not yet configured, persisting state to local storage while also providing live Supabase client connection hooks.
   - **Database Migration (`supabase/migrations/20261104_init_agrocloud_schema.sql`)**:
     - `profiles` table with foreign keys, indexes, triggers.
     - `user_preferences` table with JSONB notification preferences.
     - `contact_inquiries` table.
     - Comprehensive **PostgreSQL Row Level Security (RLS)** policies with `is_admin()` security definer function.

5. **Protected Farmer Dashboard**:
   - Responsive sidebar with all 14 navigation routes.
   - Top navbar with global search, notifications popover, language selector, theme toggle, and user avatar dropdown.
   - Overview metrics: Total Farms, Total Fields, Active Crops, Farm Health.
   - Recharts 7-day NDVI vigor vs soil moisture area chart.
   - Agricultural micro-weather card with spray advisory windows.
   - Empty state toggle for evaluating "Add your first farm" onboarding flow.
   - Sub-routes for My Farms, Fields & Crops, AI Assistant, Crop Doctor, Smart Monitoring, Weather Intelligence, Mandi Explorer, and Settings.
   - Upcoming module placeholders for future roadmap phases (Digital Farm Twin, Reports, Marketplace, Schemes, Finance).

---

## 🛠 TECH STACK

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide React icons.
- **Data Visualization**: Recharts.
- **Validation**: Zod & React Hook Form.
- **Backend & Cloud Database**: Supabase Auth, PostgreSQL with Row Level Security (RLS).

---

## 🚀 GETTING STARTED

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

*(Optional: To connect a remote Supabase project, populate `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If left empty, AgroCloud AI automatically operates in Interactive Local Development Mode).*

### 3. Run Development Server
```bash
pnpm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build Production Bundle
```bash
pnpm run build
```

---

## 🛡 DATABASE SCHEMA & RLS MIGRATION

To execute the database schema on Supabase:
1. Navigate to the Supabase Dashboard SQL Editor.
2. Open and run `supabase/migrations/20261104_init_agrocloud_schema.sql`.
3. The migration sets up:
   - `user_role` and `app_theme` enums
   - `profiles` table (linked to `auth.users(id)`)
   - `user_preferences` table
   - `contact_inquiries` table
   - `on_auth_user_created` trigger for automatic profile generation
   - `is_admin()` helper function
   - Strict Row Level Security policies ensuring farmers can only read/update their own data.

