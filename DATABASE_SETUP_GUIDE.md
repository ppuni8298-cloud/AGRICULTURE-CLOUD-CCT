# AgroCloud AI – Supabase Database Setup & Provisioning Guide

This guide provides instructions for deploying the database schema to your Supabase project.

---

## 1. Quick One-Click Setup (Supabase SQL Editor)

Your project is connected to:
**Project URL:** `https://virqitxonxadugycvdgp.supabase.co`

### Steps to Provision:
1. Open your browser and navigate to your **Supabase Dashboard SQL Editor**:
   👉 [https://supabase.com/dashboard/project/virqitxonxadugycvdgp/sql/new](https://supabase.com/dashboard/project/virqitxonxadugycvdgp/sql/new)
2. In the SQL query window, copy and paste the entire contents of:
   📄 [`supabase/agrocloud_complete_schema.sql`](file:///c:/Users/ADMIN/OneDrive/Pictures/Desktop/cloud%20agri/supabase/agrocloud_complete_schema.sql)
3. Click the green **Run** button (or press `Ctrl + Enter` / `Cmd + Enter`).
4. You will see:
   `Success. No rows returned`
5. Your remote Supabase database is now fully provisioned with all tables, triggers, indexes, and Row Level Security (RLS) policies.

---

## 2. Verified Database Schema Architecture (23 Tables)

The master schema installs the following 23 tables across the 7 application phases:

### Phase 1: Authentication & User Profiles
- `profiles`: Farmer account details, full name, phone number, state, preferred language, role, and avatar URL.
- `user_preferences`: Notification preferences, theme selection (light/dark), and telemetry measurement units.
- `contact_inquiries`: Platform inquiries and support requests.

### Phase 2: Farm & Crop Lifecycle Management
- `farms`: Agricultural holdings, cadastral survey numbers, location coordinates, soil classification, irrigation type, and acreage.
- `fields`: Plot subdivisions inside individual farms with soil pH and dedicated water sources.
- `crops`: Cultivated crops, seed varieties, sowing dates, phenological growth stages, and projected harvest windows.
- `farming_activities`: Farm event log (sowing, spraying, weeding, fertilization, harvesting).
- `farming_expenses`: Operational expense tracking categorized by seeds, fertilizers, labor, machinery, and fuel.

### Phase 3: Virtual IoT & Smart Irrigation
- `iot_sensors`: Virtual telemetry sensors (FDR moisture probes, thermistors, humidity sensors).
- `sensor_readings`: Granular time-series measurements with source labels (`simulated`, `manual`, `csv_imported`).
- `sensor_simulations`: Configured telemetry simulation jobs with customized fluctuation parameters.
- `monitoring_alerts`: Threshold breach notifications (drought warnings, heat spikes, frost risks).
- `irrigation_recommendations`: Automated FAO-56 irrigation schedules with prescribed drip run-times.

### Phase 4: AI Farm Intelligence
- `ai_conversations`: Conversation sessions with the multilingual AI Farm Assistant.
- `ai_messages`: Turn-by-turn conversational agronomic advice.
- `crop_diagnoses`: AI Crop Doctor leaf pathology scans with detected diseases and pesticide remedies.
- `crop_recommendations`: Season and soil-matched crop selection recommendations.
- `yield_predictions`: Phenology and weather-modeled harvest yield projections.
- `ai_farm_insights`: Telemetry-driven prioritized agronomic insights.

### Phase 5: Mandi Intelligence & Logistics
- `mandi_records`: Official APMC market rates with modal prices, arrival volumes, and provenance attribution.
- `mandi_price_history`: Granular 7d, 30d, and 90d daily historical price trajectories.
- `farmer_mandi_watchlists`: Pinned commodities and target price threshold alerts.
- `mandi_transport_calculations`: Stored freight calculations, hamali labor, APMC cess (1.5%), and net realized price per quintal.

### Phase 6: Digital Twin, Satellite & Drone
- `farm_geometries`: WGS-84 GeoJSON cadastral boundary polygons with survey status and calculated acreage.
- `satellite_observations`: Sentinel-2 / Landsat spectral reflectance bands, NDVI, EVI, and cloud-cover metrics.
- `drone_uploads`: Aerial orthomosaic survey metadata, flight altitudes, and sensor classifications.
- `drone_analyses`: Multi-scale visual observations, canopy coverage %, lodging, and chlorosis detection.
- `farm_simulation_scenarios`: Stored What-If simulation scenarios with water consumption and yield impact.
- `predictive_insights`: Multi-source forward-looking agronomic predictions with data provenance badges.

---

## 3. Storage Bucket Configuration

For drone survey uploads and farm photographs:
1. In the Supabase Dashboard, go to **Storage** &rarr; **New Bucket**.
2. Create bucket named: `drone-surveys` (Public: Off, Allowed MIME types: `image/*`).
3. Create bucket named: `farm-images` (Public: On).
4. Run the storage RLS policy in SQL Editor:
   ```sql
   CREATE POLICY "Allow authenticated user uploads"
   ON storage.objects FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'drone-surveys' AND (storage.foldername(name))[1] = auth.uid()::text);
   ```

---

## 4. Row Level Security (RLS) Verification

Every farmer-specific table enforces user isolation:
```sql
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own farms"
ON farms FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```
Farmers cannot inspect or modify records belonging to other users. Public read access is granted strictly to non-sensitive benchmark data (`mandi_records`, `mandi_price_history`).
