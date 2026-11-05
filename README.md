# 🌱 AgroCloud AI (कृषि-क्लाउड AI)
### Enterprise Cloud-Native Agricultural Intelligence & Decision Support Platform
> **Smart Farming • Multilingual Intelligence • Geospatial Insights • Better Tomorrow**

AgroCloud AI is an enterprise-grade, cloud-native agricultural software platform engineered specifically for Indian smallholder farmers, agronomists, farmer producer organizations (FPOs), and agricultural extension consultants. The platform integrates IoT sensor simulation, multi-spectral satellite remote sensing, drone survey analytics, localized Mandi price advisory, what-if agronomic simulations, and multimodal AI crop diagnostics into an accessible, high-performance web dashboard available in 12 major Indian languages.

---

## 🌟 COMPLETE 7-PHASE ARCHITECTURE OVERVIEW

AgroCloud AI has been built through 7 modular, production-ready phases:

### 🌾 Phase 1: Platform Foundation, Multilingual System & Core UX
- **Branding & Design System**: Commercial emerald green (`#059669`), deep forest green (`#064E3B`), fresh leaf accent (`#84CC16`), and clean white layout. Light mode default with full dark-mode toggle and persistent preferences.
- **12 Indian Languages**: Native i18n support across English (`en`), Kannada (`kn`), Hindi (`hi`), Telugu (`te`), Tamil (`ta`), Malayalam (`ml`), Marathi (`mr`), Gujarati (`gu`), Bengali (`bn`), Punjabi (`pa`), Odia (`or`), and Assamese (`as`).
- **Commercial Landing Page**: Responsive sticky navbar, live farm analytics preview, 16 modular feature showcases with deep-dive modals, interactive 12-language demonstration, FAQ accordion, and inquiry submission.
- **Auth Foundation**: Email/password registration with 8 validated fields, role-based profiles (`farmer`, `consultant`, `admin`), password recovery, and Supabase Auth integration.

### 🚜 Phase 2: Farm, Field, Crop & Financial Expense Management
- **Farm Registry**: Multi-farm creation with soil type classification, primary water source, and geographic coordinates.
- **Field & Crop Tracking**: Dynamic field segmentation, crop variety cataloging, sowing/harvest dates, and stage estimation.
- **Agronomic Activity Log**: Irrigation, fertilization, pesticide spraying, weeding, and soil preparation history.
- **Farm Expense Tracker**: Cost categorizations (seeds, fertilizer, labor, fuel, machinery, transport) with automated seasonal P&L calculations.

### 📡 Phase 3: Virtual IoT, Weather Intelligence & Smart Farm Monitoring
- **Real-Time Monitoring Dashboard** (`/dashboard/monitoring`): 8 live environmental telemetry metrics:
  1. Soil moisture (%)
  2. Soil temperature (°C)
  3. Air temperature (°C)
  4. Air humidity (%)
  5. Soil pH
  6. Rainfall (mm)
  7. Wind speed (km/h)
  8. Solar radiation / Light intensity (lux)
- **Multi-Source Ingestion**: Simulated virtual sensors, manual telemetry entry, and bulk CSV dataset ingestion.
- **Weather Intelligence**: 7-day agro-meteorological forecasting with evapotranspiration (ET₀) and optimal spray advisory windows.
- **Rule-Based Alert System**: Configurable threshold breach notifications for moisture deficiency, extreme heat, and frost risk.

### 🤖 Phase 4: Multilingual AI Assistant & Multimodal Crop Doctor
- **AI Farm Assistant** (`/dashboard/ai-assistant`): Conversational chat interface grounded in the authenticated farmer's real farm, crop, sensor, and weather context. Responses are rendered natively in the farmer's chosen Indian language.
- **AI Crop Doctor** (`/dashboard/crop-doctor`): Multimodal leaf and plant pathology inspection. Accepts field camera uploads, validates file types, and returns diagnostic hypotheses, pathogen details, chemical/organic treatment protocols, and prevention steps.

### 📈 Phase 5: Mandi Price Intelligence & Farmer Selling Advisor
- **Live Mandi Intelligence** (`/dashboard/mandi`): Market price discovery across Indian APMCs with commodity filtering, modal/min/max prices, arrival volumes, and government data source attribution (Agmarknet / data.gov.in).
- **Interactive Price Trend Analytics**: 30-day and 90-day modal price trajectory charts with 7-day forecasting.
- **Farmer Selling Advisor & Logistics Calculator**: Computes net realized returns per quintal by deducting real-world logistics costs (freight, hamali/labor loading, APMC market cess, weighing, and bagging).
- **Price Alerts & Watchlist**: Bookmark target commodities and receive alerts when local Mandi rates exceed target thresholds.

### 🛰️ Phase 6: Farm Digital Twin, Satellite Remote Sensing & Drone Analytics
- **Farm Digital Twin** (`/dashboard/digital-twin`): Interactive geospatial map rendering farm perimeters, individual field polygons, live micro-climate badges, and crop vigor overlays.
- **Multi-Spectral Satellite Remote Sensing** (`/dashboard/satellite`):
  - Satellite indices: Normalized Difference Vegetation Index (NDVI), Enhanced Vegetation Index (EVI), Normalized Difference Water Index (NDWI), and Soil-Adjusted Vegetation Index (SAVI).
  - Multi-temporal vegetation vigor trend charts and cloud-cover filtering.
- **Drone Analytics** (`/dashboard/drone-analytics`): Aerial orthomosaic upload pipeline, centimeter-resolution weed patch detection, thermal water stress mapping, and canopy height distribution.
- **What-If Farm Simulator** (`/dashboard/farm-simulator`): Agronomic simulation engine based on FAO-56 Penman-Monteith crop water models. Simulate drought shocks, heatwaves, 50% irrigation cutbacks, or fertilizer dosage changes and observe predicted yield impacts.
- **Predictive Analytics & Early Warnings** (`/dashboard/predictive-analytics`): Predictive harvest yield modeling, disease outbreak probability indexing, and seasonal revenue projections.

### 🔒 Phase 7: Final Integration, Database Verification, Security & Production Deployment
- **Supabase Production Schema**: Complete 23-table master idempotent schema (`supabase/agrocloud_complete_schema.sql`) with comprehensive Row Level Security (RLS) policies.
- **Zero-Vulnerability Secrets Handling**: Strict separation of client-safe public keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) from server-only keys (`SUPABASE_SERVICE_ROLE_KEY`, `DATA_GOV_IN_API_KEY`).
- **141-Test Automated Verification Suite**: Run via `pnpm test` covering localization parity, remote sensing mathematics, geospatial area calculations, Mandi logistics deductions, agronomic simulation models, file upload guards, and database schema compliance.
- **CI/CD & Cloud Hosting Ready**: GitHub Actions CI workflow (`.github/workflows/ci.yml`) and production Vercel configuration (`vercel.json`) with security headers and Asia Mumbai edge region (`bom1`).

---

## 🛠️ TECH STACK

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/), PostCSS, Autoprefixer |
| **Icons & UI** | [Lucide React](https://lucide.dev/), Custom SVG Geospatial Canvases |
| **Charts & Geospatial** | [Recharts](https://recharts.org/), Custom Interactive SVG Vector Mapping Engine |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL 15, Row Level Security, Auth, Storage) |
| **Localization** | Custom React 18 i18n Context supporting 12 Indian Languages |
| **Testing** | Node.js Test Harness (`scripts/test-phase7.mjs`) |
| **CI/CD & Hosting** | GitHub Actions, Vercel (`bom1` Mumbai region) |

---

## 📁 REPOSITORY STRUCTURE

```
agrocloud-ai/
├── .github/
│   └── workflows/
│       └── ci.yml                     # Automated GitHub Actions test & build pipeline
├── public/
│   ├── images/                        # Static agricultural assets
│   └── favicon.ico
├── scripts/
│   └── test-phase7.mjs                # 141-test comprehensive automated verification suite
├── src/
│   ├── app/                           # Next.js 14 App Router routes
│   │   ├── auth/                      # Login, Register, Forgot Password
│   │   ├── dashboard/
│   │   │   ├── page.tsx               # Main Dashboard Overview
│   │   │   ├── farms/                 # Farm & Field Management (Phase 2)
│   │   │   ├── activities/            # Farm Activities (Phase 2)
│   │   │   ├── expenses/              # Farm Expenses & P&L (Phase 2)
│   │   │   ├── monitoring/            # Virtual IoT & Weather Telemetry (Phase 3)
│   │   │   ├── ai-assistant/          # Multilingual AI Assistant (Phase 4)
│   │   │   ├── crop-doctor/           # Vision AI Crop Pathology (Phase 4)
│   │   │   ├── mandi/                 # Mandi Intelligence & Logistics (Phase 5)
│   │   │   ├── digital-twin/          # Farm Digital Twin (Phase 6)
│   │   │   ├── satellite/             # Satellite Spectral Remote Sensing (Phase 6)
│   │   │   ├── drone-analytics/       # Drone Orthomosaic Analytics (Phase 6)
│   │   │   ├── farm-simulator/        # What-If Agronomic Simulator (Phase 6)
│   │   │   ├── predictive-analytics/  # Predictive Yield & Disease Forecasting (Phase 6)
│   │   │   └── settings/              # User Preferences & Security (Phase 1/7)
│   │   ├── layout.tsx                 # Root HTML & Fonts layout
│   │   └── page.tsx                   # Public Commercial Landing Page
│   ├── components/                    # Modular React UI components
│   │   ├── dashboard/                 # Metric cards, charts, navigation, digital twin tabs
│   │   ├── landing/                   # Hero, features, demo, mandi preview, FAQ
│   │   └── shared/                    # Navbar, footer, modal, theme toggle, language picker
│   ├── i18n/
│   │   ├── LanguageContext.tsx        # React Context for runtime language switching
│   │   └── locales/                   # 12 complete locale dictionaries (0 missing keys)
│   │       ├── as.json, bn.json, en.json, gu.json, hi.json, kn.json,
│   │       └── ml.json, mr.json, or.json, pa.json, ta.json, te.json
│   └── lib/
│       ├── services/                  # Business logic, mathematical models, API clients
│       │   ├── authService.ts         # User auth & profile management
│       │   ├── farmService.ts         # Farms, fields, crops, activities, expenses
│       │   ├── iotService.ts          # Virtual IoT telemetry & threshold alerts
│       │   ├── aiService.ts           # Gemini/OpenAI integration & farm context injector
│       │   ├── mandiService.ts        # APMC price search & logistics cost engine
│       │   ├── geospatialService.ts   # Boundary calculation & Shoelace geodesic area
│       │   ├── satelliteService.ts    # NDVI, EVI, NDWI, SAVI calculation engine
│       │   ├── droneAnalyticsService.ts # Drone survey orthomosaic validation & indices
│       │   ├── farmSimulatorService.ts  # FAO-56 Penman-Monteith what-if stress engine
│       │   └── predictiveAnalyticsService.ts # Harvest yield & disease risk algorithms
│       └── supabase/
│           ├── client.ts              # Browser Supabase client
│           └── server.ts              # Server-side Supabase client
├── supabase/
│   ├── agrocloud_complete_schema.sql  # Master single-file idempotent database schema (23 tables)
│   └── migrations/                    # Phase-by-phase SQL migration files
├── DATABASE_SETUP_GUIDE.md            # Supabase manual setup & provisioning instructions
├── DEPLOYMENT_GUIDE.md                # Vercel & Production environment deployment manual
├── ENVIRONMENT_VARIABLES.md           # Exhaustive environment variable specification
├── PROJECT_ARCHITECTURE.md            # High-level architecture & data flow diagrams
├── TESTING_REPORT.md                  # Comprehensive verification & test suite documentation
├── phase7_project_audit.md            # Detailed phase-by-phase codebase audit report
├── vercel.json                        # Vercel production edge & security headers configuration
└── package.json                       # Project dependencies, scripts, and build tasks
```

---

## 🌐 12 INDIAN LANGUAGES SUPPORTED

AgroCloud AI provides complete, zero-fallback localization across all 12 major Indian regional languages:

| Language | Native Script | Locale Code | State / Region Focus |
| :--- | :--- | :---: | :--- |
| **English** | English | `en` | Pan-India / International |
| **Kannada** | ಕನ್ನಡ | `kn` | Karnataka |
| **Hindi** | हिन्दी | `hi` | Uttar Pradesh, MP, Bihar, Rajasthan, Haryana |
| **Telugu** | తెలుగు | `te` | Andhra Pradesh, Telangana |
| **Tamil** | தமிழ் | `ta` | Tamil Nadu, Puducherry |
| **Malayalam** | മലയാളം | `ml` | Kerala |
| **Marathi** | मराठी | `mr` | Maharashtra |
| **Gujarati** | ગુજરાતી | `gu` | Gujarat |
| **Bengali** | বাংলা | `bn` | West Bengal, Tripura |
| **Punjabi** | ਪੰਜਾਬੀ | `pa` | Punjab |
| **Odia** | ଓଡ଼ିଆ | `or` | Odisha |
| **Assamese** | অসমীয়া | `as` | Assam, Northeast India |

*All 12 translation files contain 100% key parity (verified by automated CI test `scripts/test-phase7.mjs`).*

---

## ⚡ QUICK START & LOCAL DEVELOPMENT

### Prerequisites
- Node.js 18.18+ or 20.x
- pnpm 9.x (recommended) or npm

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/agrocloud-ai.git
cd agrocloud-ai
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to create your local `.env.local`:
```bash
cp .env.example .env.local
```

Configure your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://virqitxonxadugycvdgp.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_IRUjjh1yZc4HhuGNE6zlLA_3vh64mco
```
*(Refer to [`ENVIRONMENT_VARIABLES.md`](./ENVIRONMENT_VARIABLES.md) for full descriptions of optional external keys).*

### 3. Run Automated Tests
```bash
pnpm test
```
All **141 automated tests** across localization, remote sensing math, geodesic area, logistics calculations, and schema verification will execute and pass.

### 4. Start Local Development Server
```bash
pnpm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the live landing page and authenticated dashboard.

---

## 🗄️ DATABASE SETUP & PROVISIONING

AgroCloud AI includes a master single-file idempotent migration containing all 23 database tables, PostgreSQL custom ENUMs, triggers, indexes, and Row Level Security (RLS) policies.

To provision your Supabase database:
1. Open your Supabase project SQL Editor:
   `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new`
2. Open [`supabase/agrocloud_complete_schema.sql`](./supabase/agrocloud_complete_schema.sql) in this repository.
3. Copy the entire file content, paste it into the Supabase SQL editor, and click **RUN**.
4. In Supabase Storage, create two public buckets:
   - `crop-images` (For leaf disease photos)
   - `drone-surveys` (For aerial orthomosaics)

For detailed step-by-step instructions with verification queries, see [`DATABASE_SETUP_GUIDE.md`](./DATABASE_SETUP_GUIDE.md).

---

## 🧪 AUTOMATED TESTING & VERIFICATION

AgroCloud AI features a rigorous automated integration test suite located at `scripts/test-phase7.mjs`:

```bash
pnpm test
```

### Verified Test Suites:
1. **12-Language Localization Parity (96 tests)**: Verifies exact key existence across all 12 languages.
2. **Satellite Remote Sensing Mathematics (4 tests)**: Tests NDVI, EVI, NDWI, and SAVI formulas and zero-division safety.
3. **Geospatial Geodesic Area Engine (2 tests)**: Verifies Shoelace geodesic polygon area conversion to acres.
4. **Mandi Logistics & Net Price Engine (3 tests)**: Verifies itemized transport deductions, hamali, APMC cess, and weighing fees.
5. **What-If Agronomic Simulator (2 tests)**: Validates FAO-56 Penman-Monteith crop stress index under drought and heat.
6. **Drone Survey File Validation (3 tests)**: Verifies size limits (≤25MB) and accepted image MIME types.
7. **Supabase Database Schema Check (26 tests)**: Validates all 23 tables, ENUM types, and RLS policies.
8. **Security & Secret Leak Prevention (5 tests)**: Confirms `.env.local` is ignored in git and `.env.example` contains no secrets.

---

## 🚀 PRODUCTION BUILD & DEPLOYMENT

### Type Check & Production Build
```bash
npx tsc --noEmit
pnpm run build
```

### Deploy to Vercel
1. Push your repository to GitHub or GitLab.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Set Framework Preset to **Next.js**.
4. Configure the following Production Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Optional server-only)
   - `GEMINI_API_KEY` (Optional for live AI)
   - `DATA_GOV_IN_API_KEY` (Optional for live Mandi API)
5. Deploy! Vercel automatically honors `vercel.json` for Mumbai region routing and HTTP security headers.

For the full deployment walkthrough, see [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md).

---

## 🛡️ SECURITY & COMPLIANCE

- **Zero Secret Leakage**: No server-side secrets (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) are exposed to the client bundle. Only `NEXT_PUBLIC_` prefixed keys are accessible in browser components.
- **Row Level Security (RLS)**: Every user table has RLS enabled with `auth.uid() = user_id` policies preventing unauthorized cross-tenant data access.
- **Strict Content Security Headers**: `vercel.json` configures `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and strict Referrer Policy.
- **Safe Fallback Architecture**: The application gracefully displays simulated, cached, or informative states when external APIs (Agmarknet, Sentinel Hub) are unreachable, ensuring uninterrupted farmer operations.

---

## 📄 LICENSE & ATTRIBUTION

Developed as part of the **AgroCloud AI** project. Open-source under the MIT License. Agricultural market data sourced via AGMARKNET and data.gov.in. Meteorological data modeled after Open-Meteo and FAO-56 guidelines.
