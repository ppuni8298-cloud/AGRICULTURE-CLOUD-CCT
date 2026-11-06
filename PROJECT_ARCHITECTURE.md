# AgroCloud AI – System Architecture Documentation

**Platform:** AgroCloud AI – Cloud-Native Multilingual Agricultural Ecosystem  
**Target:** Indian Farmers, Agri-SaaS Operators, APMC Mandi Traders & Agronomists  
**Technology Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, Recharts  

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Client Layer
        Browser[Modern Web Browser / Mobile Browser]
        Lang[12-Language i18n Engine]
        Theme[Tailwind Emerald Theme Engine]
    end

    subgraph Presentation & Routing Tier (Next.js 14 App Router)
        P1[Landing & Auth Routes]
        P2[Farm & Crop Management Routes]
        P3[IoT Telemetry & Weather Hub]
        P4[AI Assistant & Crop Doctor]
        P5[Mandi Intelligence & Logistics]
        P6[Digital Twin, Satellite & Simulator]
    end

    subgraph Service & Calculation Layer
        FS[farmService.ts]
        IS[iotService.ts]
        AIS[aiFarmService.ts / aiProviderService.ts]
        MS[marketDataService.ts / mandiService.ts]
        GSS[geospatialService.ts]
        SS[satelliteService.ts]
        DAS[droneAnalyticsService.ts]
        FSS[farmSimulatorService.ts]
        PAS[predictiveAnalyticsService.ts]
    end

    subgraph Cloud Backend Tier (Supabase)
        Auth[Supabase Auth Engine]
        DB[(PostgreSQL Database - 23 Tables)]
        RLS[Row Level Security Engine]
        Storage[Supabase Storage Buckets]
    end

    subgraph External Intelligence Feeds
        Meteo[Open-Meteo Weather API]
        Agmark[AGMARKNET / data.gov.in / e-NAM]
        Copernicus[ESA Copernicus Sentinel-2 MSI]
        AIModels[Google Gemini / OpenAI / ICAR Rules]
    end

    Browser --> Lang & Theme
    Browser --> P1 & P2 & P3 & P4 & P5 & P6

    P1 & P2 --> FS
    P3 --> IS & Meteo
    P4 --> AIS & AIModels
    P5 --> MS & Agmark
    P6 --> GSS & SS & DAS & FSS & PAS
    SS --> Copernicus

    FS & IS & AIS & MS & GSS & SS & DAS & FSS & PAS --> Auth & DB & RLS & Storage
```

---

## 2. Architectural Layers

### 1. Presentation Tier (Next.js 14 App Router)
- **Framework:** Next.js 14 with React 18 and strict TypeScript 5.7.
- **Styling & Design System:** Tailwind CSS with commercial emerald brand styling (`#059669`, `#064E3B`, `#84CC16`).
- **Data Visualization:** Recharts multi-series area charts, bar charts, and historical corridors.
- **State & Providers:**
  - `AuthProvider`: Supabase user session management, user profile synchronization, and protected route redirection.
  - `LanguageProvider`: 12-language state management across English, Hindi, Kannada, Telugu, Tamil, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Odia, and Assamese.
  - `ThemeProvider`: Light-mode default with dark-mode persistence.

### 2. Service & Calculation Tier
- **`geospatialService.ts`:** Implements the Spherical Shoelace algorithm for calculating ground acreage from WGS-84 coordinate polygons.
- **`satelliteService.ts`:** Implements calibrated Normalized Difference Vegetation Index (NDVI) and Enhanced Vegetation Index (EVI) formulas from Red ($B4$) and NIR ($B8$) reflectance.
- **`farmSimulatorService.ts`:** Implements FAO-56 dual crop coefficient Penman-Monteith crop water and nutrient simulation.
- **`marketDataService.ts`:** Processes APMC market arrivals, inter-mandi price spreads, freight economics, hamali labor, and APMC cess ($1.5\%$).
- **`predictiveAnalyticsService.ts`:** Synthesizes IoT telemetry, Sentinel-2 vegetation trends, and Open-Meteo forecasts into 14-day crop stress curves.

### 3. Database & Security Tier (Supabase)
- **PostgreSQL Database:** 23 relational tables with cascading foreign keys and composite B-tree indexes.
- **Row Level Security (RLS):** Strict tenant isolation enforcing `auth.uid() = user_id` across all personal farm data.
- **Storage:** Secure bucket architecture with user-folder isolation for aerial drone orthomosaics and farm photos.

