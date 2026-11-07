# AgroCloud AI – Comprehensive System Architecture & Engineering Specifications

**Platform:** AgroCloud AI – Cloud-Native Multilingual Smart Agricultural Ecosystem  
**Target Audience:** Smallholder Farmers, Agri-Enterprises, APMC Traders, and Agronomists  
**Core Stack:** Next.js 14 (App Router), TypeScript 5.7, Tailwind CSS, PostgreSQL 15, Supabase, Leaflet, Recharts  

---

## 1. Overall System Architecture Diagram

```mermaid
graph TB
    subgraph Client Tier [Client Tier - Responsive Web & Mobile PWA]
        Browser[Modern Web Browser / Mobile Device]
        I18nEngine[12-Language i18n Localization Engine]
        ThemeEngine[Tailwind CSS Emerald Design System]
    end

    subgraph Application Tier [Next.js 14 App Router - Fullstack Edge Server]
        AuthRouting[Auth & Protected Layout Middleware]
        UIRoutes[Dashboard, Farms, IoT, Mandi, AI, Satellite Views]
        APIRoutes[RESTful Route Handlers: /api/ai/* & /api/mandi/*]
    end

    subgraph Computation & Service Layer [Mathematical & Agronomic Engines]
        GeoService[Geospatial Service: Spherical Shoelace Geodesic Engine]
        SatService[Satellite Service: Sentinel-2 NDVI/EVI Spectral Math]
        MandiEngine[Mandi Service: Freight, Cess & Realized Profit Engine]
        SimEngine[Farm Simulator: FAO-56 Penman-Monteith Evapotranspiration]
        MLService[Predictive Analytics: 14-Day Stress & Yield Forecasts]
    end

    subgraph Cloud Persistence Tier [Supabase Enterprise Backend]
        SupaAuth[Supabase Auth: JWT & Session Management]
        PostgresDB[(PostgreSQL 15: 30 Relational Tables)]
        RLSEngine[Row Level Security Engine: auth.uid() Tenant Isolation]
        StorageBuckets[Storage: crop-images & drone-surveys Buckets]
    end

    subgraph External Data & AI Feeds [External Intelligence Feeds]
        OpenMeteo[Open-Meteo Hyperlocal Weather API]
        Agmarknet[AGMARKNET / e-NAM / data.gov.in Mandi Feeds]
        Copernicus[ESA Copernicus Sentinel-2 MSI Satellite API]
        GeminiLLM[Google Gemini 1.5 Pro / Built-in Agronomy Rules]
    end

    Browser --> I18nEngine & ThemeEngine
    Browser --> AuthRouting --> UIRoutes
    UIRoutes --> APIRoutes
    APIRoutes --> GeoService & SatService & MandiEngine & SimEngine & MLService

    GeoService & SatService & MandiEngine & SimEngine & MLService --> PostgresDB & StorageBuckets
    AuthRouting --> SupaAuth
    PostgresDB --> RLSEngine

    APIRoutes --> OpenMeteo & Agmarknet & Copernicus & GeminiLLM
```

---

## 2. Database Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    users ||--o{ profiles : "has identity"
    users ||--o{ user_preferences : "configures"
    users ||--o{ farms : "owns"
    
    farms ||--o{ fields : "contains"
    fields ||--o{ crops : "grows"
    farms ||--o{ farming_activities : "logs"
    farms ||--o{ farming_expenses : "records"
    
    farms ||--o{ iot_sensors : "deploys"
    iot_sensors ||--o{ sensor_readings : "transmits"
    farms ||--o{ sensor_simulations : "simulates"
    farms ||--o{ monitoring_alerts : "triggers"
    farms ||--o{ irrigation_recommendations : "receives"
    
    users ||--o{ ai_conversations : "participates"
    ai_conversations ||--o{ ai_messages : "contains"
    users ||--o{ crop_diagnoses : "uploads"
    farms ||--o{ yield_predictions : "projects"
    farms ||--o{ ai_farm_insights : "generates"
    
    mandi_records ||--o{ mandi_price_history : "tracks"
    users ||--o{ farmer_mandi_watchlists : "monitors"
    farms ||--o{ mandi_transport_calculations : "evaluates"
    
    farms ||--o{ farm_geometries : "bounds"
    farms ||--o{ satellite_observations : "monitors"
    farms ||--o{ drone_uploads : "surveys"
    drone_uploads ||--o{ drone_analyses : "evaluates"
    
    farms ||--o{ farm_simulation_scenarios : "runs"
    farms ||--o{ predictive_insights : "synthesizes"
```

---

## 3. System Use Case Diagram

```mermaid
graph LR
    Farmer((Farmer User))
    Consultant((Agri Consultant))
    Admin((Platform Admin))

    subgraph AgroCloud AI Ecosystem
        UC1[Register & Authenticate Account]
        UC2[Switch Interface Language - 12 Indian Languages]
        UC3[Manage Farms, Fields & Crop Lifecycle]
        UC4[Monitor Real-time IoT Sensor Gauges]
        UC5[Upload Leaf Photo for Disease Diagnosis]
        UC6[Check Mandi Prices & Calculate Transport Net Profit]
        UC7[View Sentinel-2 Satellite NDVI Vegetation Health]
        UC8[Draw Farm Parcel on Map & Calculate Acreage]
        UC9[Run What-If Climate & Drought Simulation]
        UC10[Multi-farm Advisory & Telemetry Review]
        UC11[System Health & Security Audit Management]
    end

    Farmer --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC8 & UC9
    Consultant --> UC1 & UC2 & UC4 & UC5 & UC9 & UC10
    Admin --> UC1 & UC11
```

---

## 4. Data Flow Diagrams (DFD)

### 4.1 DFD Level 0 (Context Diagram)
```mermaid
graph TD
    Farmer[Farmer / Agri-User] -->|Input: Farm Details, Soil Data, Leaf Photos, Desired Markets| AgroCloud[AgroCloud AI Platform Core]
    AgroCloud -->|Output: Soil Alerts, Crop Diagnosis, Net Realized Mandi Prices, NDVI Health Maps| Farmer

    AgroCloud <-->|Telemetry & Satellite Requests / Band Data| Copernicus[Copernicus Sentinel-2 & Open-Meteo]
    AgroCloud <-->|Wholesale Market Queries / Price Feeds| APMC[AGMARKNET / e-NAM Mandis]
    AgroCloud <-->|Encrypted User Sessions & Data Queries| Supabase[(Supabase Cloud Database & Storage)]
```

### 4.2 DFD Level 1 (Decomposition Diagram)
```mermaid
graph TD
    User([Farmer]) -->|Auth Credentials| P1[1.0 Identity & Access Management]
    P1 -->|User JWT| UserStore[(profiles & preferences)]

    User -->|Farm Boundaries & Coordinates| P2[2.0 Geospatial & Plot Service]
    P2 -->|Acreage & Polygon| GeoStore[(farm_geometries & farms)]

    P2 -->|Coordinates| P3[3.0 Satellite & Remote Sensing Engine]
    P3 <-->|NIR & Red Spectral Bands| SentinelAPI[Sentinel-2 Satellite Feed]
    P3 -->|NDVI / EVI Indices| SatStore[(satellite_observations)]

    User -->|Leaf Photo| P4[4.0 AI Crop Doctor & Diagnostics]
    P4 -->|Image Upload| ImageBucket[(Storage: crop-images)]
    P4 -->|Diagnostic Results| DiagnosisStore[(crop_diagnoses)]

    User -->|Commodity, Origin & Distance| P5[5.0 Mandi Intelligence & Logistics]
    P5 <-->|Market Arrivals & Rates| MandiAPI[APMC Market Feed]
    P5 -->|Net Realized Margin| TransportStore[(mandi_transport_calculations)]

    UserStore & GeoStore & SatStore & DiagnosisStore & TransportStore --> P6[6.0 Executive Analytics Dashboard]
    P6 -->|Synthesized KPIs & Advisories| User
```

---

## 5. Activity Diagram (Crop Diagnosis & Advisory Workflow)

```mermaid
stateDiagram-v2
    [*] --> FarmerSelectsModule: Navigate to Crop Doctor
    FarmerSelectsModule --> CaptureImage: Capture / Upload Leaf Photo
    CaptureImage --> ValidateUpload: Client-side Validation (< 15MB, JPEG/PNG)
    
    state ValidateUpload <<choice>>
    ValidateUpload --> RejectFile: Invalid File Format or Exceeds Size
    RejectFile --> CaptureImage: Display Warning Message
    
    ValidateUpload --> UploadStorage: Upload to Supabase Storage (crop-images)
    UploadStorage --> CallVisionModel: Dispatch /api/ai/diagnose
    
    state CallVisionModel {
        [*] --> ExtractVisualFeatures
        ExtractVisualFeatures --> MatchPathogenSignature
        MatchPathogenSignature --> ComputeConfidenceScore
        ComputeConfidenceScore --> [*]
    }
    
    CallVisionModel --> DisplayRemedies: Render Dual Organic & Chemical Protocol
    DisplayRemedies --> SaveToHistory: Persist to public.crop_diagnoses
    SaveToHistory --> [*]: Farmer Takes Remedial Action
```

---

## 6. Authentication & Session Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer Browser
    participant Middleware as Next.js Middleware
    participant SupaAuth as Supabase Auth Engine
    participant Postgres as PostgreSQL Engine (RLS)

    Farmer->>Middleware: GET /dashboard (with sb-access-token)
    alt No Active Token
        Middleware-->>Farmer: 302 Redirect to /auth/login
    else Valid Token Present
        Middleware->>SupaAuth: Verify JWT Signature & Expiry
        SupaAuth-->>Middleware: Token Valid (User ID: UUID)
        Middleware-->>Farmer: Render Dashboard Layout
    end

    Farmer->>Postgres: SELECT * FROM farms WHERE user_id = UUID
    Note over Postgres: RLS Policy executes: USING (auth.uid() = user_id)
    Postgres-->>Farmer: Return user's private farm records
```

---

## 7. AI Agronomy Processing Workflow

```mermaid
flowchart TD
    Prompt[Farmer Query + Farm Context] --> Dispatcher{Model Selector}
    Dispatcher -->|API Key Configured| GeminiEngine[Google Gemini 1.5 Pro Flash API]
    Dispatcher -->|Offline / Sandbox Mode| RuleEngine[ICAR Certified Agronomic Expert System]

    GeminiEngine --> ResponseValidator[Schema & Content Sanitization]
    RuleEngine --> ResponseValidator

    ResponseValidator --> Formatter[Language Localization & Metric Unit Formatting]
    Formatter --> RenderUI[Render Conversational Card & Treatment Plan]
    RenderUI --> DBLog[(public.ai_messages Log)]
```

---

## 8. Virtual IoT Monitoring Workflow

```mermaid
flowchart LR
    VirtualEngine[Virtual IoT Simulation Engine] -->|Tick every 30s| StateEvaluator{Current Simulation Mode}
    StateEvaluator -->|Normal| NormalDist[Moisture: 45-60%, Temp: 24-28C, pH: 6.5]
    StateEvaluator -->|Heatwave Deficit| DeficitDist[Moisture: 18-25%, Temp: 38-42C, High ET0]
    StateEvaluator -->|Monsoon Saturation| SatDist[Moisture: 85-98%, Temp: 20-22C, Runoff Risk]

    NormalDist & DeficitDist & SatDist --> TelemetryPipeline[Telemetry Ingestion Pipeline]
    TelemetryPipeline --> AlertCheck{Threshold Breach?}
    AlertCheck -->|Yes| PushAlert[Generate High Severity Alert in public.monitoring_alerts]
    AlertCheck -->|No| NormalLog[Standard Reading Log in public.sensor_readings]
    PushAlert & NormalLog --> UIStream[Real-time Gauge Update on /dashboard/iot]
```

---

## 9. Mandi Intelligence & Logistics Profitability Workflow

```mermaid
flowchart TD
    Input[Farmer Inputs: Commodity, Quantity, Origin District, Destination APMC] --> FetchPrice[Fetch Target APMC Modal Price per Quintal]
    Input --> CalcDistance[Compute Haulage Distance in Kilometers]

    FetchPrice & CalcDistance --> FreightCost["Freight Cost = Base Truck Hire + (Distance * Diesel Consumption Rate)"]
    FetchPrice & CalcDistance --> HamaliCost["Loading & Unloading Hamali = Quantity * ₹20/Q"]
    FetchPrice & CalcDistance --> CessCost["APMC Market Cess = 1.5% of Gross Auction Value"]
    FetchPrice & CalcDistance --> WeighCost["Official Weighbridge Electronic Weighing = ₹4/Q"]

    FreightCost & HamaliCost & CessCost & WeighCost --> TotalDeduction["Total Operational Deductions = Freight + Hamali + Cess + Weighing"]
    TotalDeduction --> NetRealized["Net Realized Revenue = Gross Value - Total Deductions"]
    NetRealized --> RealizedPricePerQ["Net Realized Price/Q = Net Revenue / Total Quintals"]

    RealizedPricePerQ --> Decision{Spread vs Local Mandi > ₹150/Q?}
    Decision -->|Yes| AdviseDispatch["Recommendation: Dispatch to Destination Mandi (Profitable)"]
    Decision -->|No| AdviseLocal["Recommendation: Sell in Local District Yard (Avoid Freight Loss)"]
```
