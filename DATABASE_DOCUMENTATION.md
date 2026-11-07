# AgroCloud AI – Database Documentation

**Database Engine:** PostgreSQL 15+ (Hosted on Supabase)  
**Schema File:** `supabase/agrocloud_complete_schema.sql`  
**Security Model:** Row Level Security (RLS) with Tenant Isolation via `auth.uid()`  
**Total Relational Tables:** 30 Tables  
**Total Storage Buckets:** 2 Buckets (`crop-images`, `drone-surveys`)  

---

## 1. Architectural Overview & Entity Groups

The database schema is organized into 7 cohesive domain groups:
1. **User Identity & Preferences:** `profiles`, `user_preferences`, `contact_inquiries`
2. **Farm & Land Asset Hierarchy:** `farms`, `fields`, `crops`, `farming_activities`, `farming_expenses`
3. **IoT Telemetry & Micro-Weather:** `iot_sensors`, `sensor_readings`, `sensor_simulations`, `monitoring_alerts`, `irrigation_recommendations`, `weather_cache`
4. **Agronomic AI & Crop Diagnostics:** `ai_conversations`, `ai_messages`, `crop_diagnoses`, `crop_recommendations`, `yield_predictions`, `ai_farm_insights`
5. **APMC Mandi Intelligence & Trade:** `mandi_records`, `mandi_price_history`, `farmer_mandi_watchlists`, `mandi_transport_calculations`
6. **Geospatial & Remote Sensing:** `farm_geometries`, `satellite_observations`, `drone_uploads`, `drone_analyses`
7. **Simulation & Predictive Engine:** `farm_simulation_scenarios`, `predictive_insights`

---

## 2. Comprehensive Entity-Relationship Table Specifications

### 2.1 User Identity & Preferences

#### 1. `public.profiles`
Stores extended user profile information extending Supabase `auth.users`.
- **Columns:**
  - `id` (UUID, Primary Key, references `auth.users(id)` ON DELETE CASCADE)
  - `full_name` (TEXT, NOT NULL)
  - `phone` (TEXT)
  - `role` (`user_role_type` ENUM: `'farmer'`, `'consultant'`, `'admin'`, default `'farmer'`)
  - `state` (TEXT)
  - `district` (TEXT)
  - `preferred_language` (TEXT, default `'en'`)
  - `created_at` (TIMESTAMPTZ, default `now()`)
  - `updated_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:**
  - Read: Users can view their own profile (`id = auth.uid()`).
  - Update: Users can update their own profile (`id = auth.uid()`).
  - Insert: Users or trigger can create their own profile.

#### 2. `public.user_preferences`
Farmer personal settings and notification preferences.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `theme` (TEXT, default `'emerald-light'`)
  - `alert_email` (BOOLEAN, default `true`)
  - `alert_sms` (BOOLEAN, default `false`)
  - `alert_whatsapp` (BOOLEAN, default `false`)
  - `weather_alerts` (BOOLEAN, default `true`)
  - `mandi_price_alerts` (BOOLEAN, default `true`)
  - `updated_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** Isolated to `user_id = auth.uid()`.

#### 3. `public.contact_inquiries`
Public contact submissions and advisory consultation queries.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `name` (TEXT, NOT NULL)
  - `email` (TEXT, NOT NULL)
  - `phone` (TEXT)
  - `subject` (TEXT, NOT NULL)
  - `message` (TEXT, NOT NULL)
  - `status` (TEXT, default `'new'`)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** Authenticated/Public insertion allowed; viewable only by administrators.

---

### 2.2 Farm & Agronomic Asset Management

#### 4. `public.farms`
Master agricultural holdings owned by farmers.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `name` (TEXT, NOT NULL)
  - `state` (TEXT, NOT NULL)
  - `district` (TEXT, NOT NULL)
  - `taluk_mandal` (TEXT)
  - `village` (TEXT)
  - `total_area_acres` (NUMERIC(8,2), NOT NULL)
  - `latitude` (NUMERIC(10,6))
  - `longitude` (NUMERIC(10,6))
  - `soil_type` (TEXT)
  - `irrigation_type` (TEXT)
  - `created_at` (TIMESTAMPTZ, default `now()`)
  - `updated_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()` for SELECT, INSERT, UPDATE, DELETE.

#### 5. `public.fields`
Individual agricultural plots/parcels within a farm.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `name` (TEXT, NOT NULL)
  - `area_acres` (NUMERIC(8,2), NOT NULL)
  - `soil_type` (TEXT)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 6. `public.crops`
Active, harvested, or planned seasonal plantings within fields.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `field_id` (UUID, references `public.fields(id)` ON DELETE SET NULL)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `name` (TEXT, NOT NULL)
  - `variety` (TEXT)
  - `crop_type` (TEXT)
  - `sowing_date` (DATE)
  - `expected_harvest_date` (DATE)
  - `actual_harvest_date` (DATE)
  - `status` (TEXT, default `'growing'`)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 7. `public.farming_activities`
Log of agrarian operations (irrigation, fertilization, spraying, weeding).
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `activity_type` (TEXT, NOT NULL)
  - `description` (TEXT)
  - `cost_inr` (NUMERIC(10,2), default 0)
  - `activity_date` (DATE, NOT NULL)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 8. `public.farming_expenses`
Financial accounting ledger for input costs and operations.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `category` (TEXT, NOT NULL)
  - `amount_inr` (NUMERIC(10,2), NOT NULL)
  - `expense_date` (DATE, NOT NULL)
  - `receipt_url` (TEXT)
  - `notes` (TEXT)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

---

### 2.3 IoT Sensor Telemetry & Climate Services

#### 9. `public.iot_sensors`
Hardware nodes and virtual IoT sensors deployed in fields.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `sensor_type` (TEXT, NOT NULL)
  - `sensor_label` (TEXT, NOT NULL)
  - `hardware_id` (TEXT)
  - `battery_percentage` (INTEGER, default 100)
  - `status` (TEXT, default `'active'`)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 10. `public.sensor_readings`
High-frequency time-series telemetry data points.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `sensor_id` (UUID, references `public.iot_sensors(id)` ON DELETE CASCADE)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `temperature` (NUMERIC(5,2))
  - `humidity` (NUMERIC(5,2))
  - `soil_moisture` (NUMERIC(5,2))
  - `soil_temperature` (NUMERIC(5,2))
  - `nitrogen` (NUMERIC(6,2))
  - `phosphorus` (NUMERIC(6,2))
  - `potassium` (NUMERIC(6,2))
  - `ph` (NUMERIC(4,2))
  - `recorded_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 11. `public.sensor_simulations`
Simulation state controls for virtual IoT test environments.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `simulation_mode` (TEXT, default `'normal'`)
  - `is_active` (BOOLEAN, default `true`)
  - `interval_seconds` (INTEGER, default 30)
  - `updated_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 12. `public.monitoring_alerts`
Real-time environmental threshold and deficit alerts.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `severity` (TEXT, NOT NULL)
  - `metric` (TEXT, NOT NULL)
  - `message` (TEXT, NOT NULL)
  - `is_read` (BOOLEAN, default `false`)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 13. `public.irrigation_recommendations`
Precision irrigation advice based on ET0 and soil tension.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `recommended_volume_liters` (NUMERIC(10,2))
  - `duration_minutes` (INTEGER)
  - `reason` (TEXT)
  - `recommended_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 14. `public.weather_cache`
Location-keyed caching table for Open-Meteo micro-forecasts.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `latitude` (NUMERIC(8,4), NOT NULL)
  - `longitude` (NUMERIC(8,4), NOT NULL)
  - `forecast_data` (JSONB, NOT NULL)
  - `fetched_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** Read-only for authenticated users.

---

### 2.4 Agronomic AI & Advisory Intelligence

#### 15. `public.ai_conversations`
Multi-turn conversational sessions with the AI Agronomist.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE SET NULL)
  - `title` (TEXT, default `'Farm Consultation'`)
  - `language` (TEXT, default `'en'`)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 16. `public.ai_messages`
Individual conversational prompts and responses.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `conversation_id` (UUID, references `public.ai_conversations(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `role` (TEXT, NOT NULL)
  - `content` (TEXT, NOT NULL)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 17. `public.crop_diagnoses`
Vision-based crop pathology and pest diagnostic records.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE SET NULL)
  - `crop_name` (TEXT, NOT NULL)
  - `disease_name` (TEXT, NOT NULL)
  - `confidence_score` (NUMERIC(5,2), NOT NULL)
  - `image_url` (TEXT, NOT NULL)
  - `symptoms` (TEXT)
  - `organic_treatment` (TEXT)
  - `chemical_treatment` (TEXT)
  - `preventive_measures` (TEXT)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 18. `public.crop_recommendations`
Seasonal crop selection advice based on soil chemistry and weather.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE SET NULL)
  - `soil_type` (TEXT)
  - `recommended_crops` (JSONB, NOT NULL)
  - `reasoning` (TEXT)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 19. `public.yield_predictions`
ML-driven crop yield forecasts and confidence bounds.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `crop_name` (TEXT, NOT NULL)
  - `predicted_yield_tons_per_acre` (NUMERIC(8,2), NOT NULL)
  - `confidence_range_min` (NUMERIC(8,2))
  - `confidence_range_max` (NUMERIC(8,2))
  - `influencing_factors` (JSONB)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 20. `public.ai_farm_insights`
Automated proactive insights generated from telemetry and satellite runs.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `category` (TEXT, NOT NULL)
  - `insight` (TEXT, NOT NULL)
  - `action_plan` (TEXT)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

---

### 2.5 Mandi Intelligence & Agricultural Commerce

#### 21. `public.mandi_records`
Daily spot market prices from national APMCs.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `state` (TEXT, NOT NULL)
  - `district` (TEXT, NOT NULL)
  - `market` (TEXT, NOT NULL)
  - `commodity` (TEXT, NOT NULL)
  - `variety` (TEXT)
  - `arrival_date` (DATE, NOT NULL)
  - `min_price` (NUMERIC(10,2), NOT NULL)
  - `max_price` (NUMERIC(10,2), NOT NULL)
  - `modal_price` (NUMERIC(10,2), NOT NULL)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** Authenticated read-only access.

#### 22. `public.mandi_price_history`
Historical price time-series for trend detection and regression.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `market` (TEXT, NOT NULL)
  - `commodity` (TEXT, NOT NULL)
  - `price_date` (DATE, NOT NULL)
  - `modal_price` (NUMERIC(10,2), NOT NULL)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** Authenticated read-only access.

#### 23. `public.farmer_mandi_watchlists`
Farmer-curated lists of tracked commodities and target APMC yards.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `commodity` (TEXT, NOT NULL)
  - `target_market` (TEXT)
  - `alert_threshold_price` (NUMERIC(10,2))
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 24. `public.mandi_transport_calculations`
Saved logistics optimizations evaluating haulage, cess, and realized profit.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `commodity` (TEXT, NOT NULL)
  - `quantity_quintals` (NUMERIC(8,2), NOT NULL)
  - `origin_district` (TEXT, NOT NULL)
  - `destination_mandi` (TEXT, NOT NULL)
  - `distance_km` (NUMERIC(8,2), NOT NULL)
  - `gross_revenue_inr` (NUMERIC(12,2), NOT NULL)
  - `freight_cost_inr` (NUMERIC(10,2), NOT NULL)
  - `labor_cost_inr` (NUMERIC(10,2), NOT NULL)
  - `cess_cost_inr` (NUMERIC(10,2), NOT NULL)
  - `weighing_cost_inr` (NUMERIC(10,2), NOT NULL)
  - `net_realized_price_per_quintal` (NUMERIC(10,2), NOT NULL)
  - `calculated_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

---

### 2.6 Geospatial & Remote Sensing Intelligence

#### 25. `public.farm_geometries`
Polygonal boundary coordinates, vertices, and GPS geo-fences.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `polygon_geojson` (JSONB, NOT NULL)
  - `calculated_area_acres` (NUMERIC(8,2), NOT NULL)
  - `boundary_source` (`boundary_source_type` ENUM: `'manual'`, `'gps_walk'`, `'cadastral_survey'`, `'satellite_traced'`)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 26. `public.satellite_observations`
Sentinel-2 spectral band analyses and vegetation indices.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `observation_date` (DATE, NOT NULL)
  - `provider` (`satellite_provider_type` ENUM: `'sentinel_2'`, `'landsat_8'`, `'modis'`)
  - `cloud_cover_percentage` (NUMERIC(5,2))
  - `mean_ndvi` (NUMERIC(5,4), NOT NULL)
  - `mean_evi` (NUMERIC(5,4), NOT NULL)
  - `mean_ndre` (NUMERIC(5,4))
  - `mean_ndwi` (NUMERIC(5,4))
  - `health_classification` (TEXT)
  - `created_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 27. `public.drone_uploads`
High-resolution UAV imagery metadata and storage pointer.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `file_url` (TEXT, NOT NULL)
  - `file_size_bytes` (BIGINT, NOT NULL)
  - `flight_altitude_meters` (NUMERIC(6,2))
  - `uploaded_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 28. `public.drone_analyses`
Computer vision weed canopy detection and plant density metrics.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `upload_id` (UUID, references `public.drone_uploads(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `weed_infestation_percentage` (NUMERIC(5,2), NOT NULL)
  - `canopy_coverage_percentage` (NUMERIC(5,2), NOT NULL)
  - `plant_count_estimate` (INTEGER)
  - `heat_stress_zones` (JSONB)
  - `analyzed_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

---

### 2.7 Simulation & Predictive Analytics

#### 29. `public.farm_simulation_scenarios`
Agronomic stress scenarios and what-if simulation inputs.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `scenario_name` (TEXT, NOT NULL)
  - `rainfall_deviation_pct` (NUMERIC(5,2), default 0)
  - `temperature_delta_celsius` (NUMERIC(4,2), default 0)
  - `irrigation_reduction_pct` (NUMERIC(5,2), default 0)
  - `projected_yield_impact_pct` (NUMERIC(5,2), NOT NULL)
  - `water_deficit_stress_score` (INTEGER, NOT NULL)
  - `simulated_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

#### 30. `public.predictive_insights`
Synthesized 14-day crop stress curves combining IoT and Sentinel-2 data.
- **Columns:**
  - `id` (UUID, Primary Key, default `gen_random_uuid()`)
  - `farm_id` (UUID, references `public.farms(id)` ON DELETE CASCADE)
  - `user_id` (UUID, references `auth.users(id)` ON DELETE CASCADE)
  - `risk_level` (TEXT, NOT NULL)
  - `stress_forecast_curve` (JSONB, NOT NULL)
  - `recommended_interventions` (JSONB, NOT NULL)
  - `generated_at` (TIMESTAMPTZ, default `now()`)
- **RLS Policies:** `user_id = auth.uid()`.

---

## 3. Storage Bucket Configuration

1. **`crop-images`**
   - Public: `true`
   - Purpose: Farmer crop leaf photographs uploaded for diagnostic pathology.
   - Max file size: 15 MB
   - Security Policy: Authenticated users can write only to their own folder (`storage.foldername(name)[1] = auth.uid()::text`). Anyone can read public image URLs.

2. **`drone-surveys`**
   - Public: `false`
   - Purpose: High-resolution aerial orthomosaics and multispectral drone imagery.
   - Max file size: 25 MB
   - Security Policy: Private to the authenticated user owning the survey (`storage.foldername(name)[1] = auth.uid()::text` for SELECT and INSERT).

