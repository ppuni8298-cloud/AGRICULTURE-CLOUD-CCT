# AgroCloud AI – Security Architecture & Threat Model

**Platform:** AgroCloud AI – Cloud-Native Agricultural Intelligence  
**Security Framework:** Defense-in-Depth, Zero-Trust Architecture, OWASP Top 10 Compliance  
**Database Security:** PostgreSQL Row Level Security (RLS) on all user-owned tables  
**Authentication:** Supabase Auth (JWT with short-lived tokens and secure cookie storage)  

---

## 1. Threat Modeling & STRIDE Analysis

| Threat Category | Potential Attack Vector | AgroCloud AI Mitigation Control |
| :--- | :--- | :--- |
| **Spoofing Identity** | Attacker impersonating another farmer's account | Cryptographic JWT signing with asymmetric RS256/HS256 tokens; strict bcrypt/Argon2 password hashing; session expiry and refresh token rotation. |
| **Tampering with Data** | Malicious modification of another user's farms, sensor readings, or expenses | Row Level Security (RLS) enforced at the PostgreSQL engine level (`USING (user_id = auth.uid())`). Direct API attempts to alter foreign rows result in zero modifications. |
| **Repudiation** | Denying an agronomic or financial activity logged in the ledger | Immutable audit timestamps (`created_at`, `updated_at`) and foreign key user attribution on every transaction. |
| **Information Disclosure** | Unauthorized read access to proprietary yield forecasts or private land parcels | Explicit RLS SELECT policies blocking unauthorized read; private storage bucket policies on drone surveys (`drone-surveys`). |
| **Denial of Service** | Flooding heavy satellite remote sensing or drone orthomosaic uploads | File size caps (15MB for leaf images, 25MB for drone files); client-side MIME type validation; Next.js route rate limiting and caching. |
| **Elevation of Privilege** | Normal farmer user attempting to access platform administrative features | Role-based access control (`user_role_type` ENUM: `'farmer'`, `'consultant'`, `'admin'`) validated by middleware and PostgreSQL RLS. |

---

## 2. Row Level Security (RLS) Architecture

Every user-owned table in the PostgreSQL database enforces strict tenant isolation:

```sql
-- Pattern enforced across all user-owned tables
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own farms"
    ON public.farms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own farms"
    ON public.farms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farms"
    ON public.farms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own farms"
    ON public.farms FOR DELETE
    USING (auth.uid() = user_id);
```

### Table-by-Table RLS Policy Matrix
- **`profiles`:** User can only select/update where `id = auth.uid()`.
- **`user_preferences`:** Isolated to `user_id = auth.uid()`.
- **`farms`, `fields`, `crops`:** Isolated to `user_id = auth.uid()`.
- **`farming_activities`, `farming_expenses`:** Isolated to `user_id = auth.uid()`.
- **`iot_sensors`, `sensor_readings`, `monitoring_alerts`:** Isolated to `user_id = auth.uid()`.
- **`ai_conversations`, `ai_messages`, `crop_diagnoses`:** Isolated to `user_id = auth.uid()`.
- **`farmer_mandi_watchlists`, `mandi_transport_calculations`:** Isolated to `user_id = auth.uid()`.
- **`farm_geometries`, `satellite_observations`, `drone_uploads`:** Isolated to `user_id = auth.uid()`.
- **`farm_simulation_scenarios`, `predictive_insights`:** Isolated to `user_id = auth.uid()`.
- **`mandi_records`, `mandi_price_history`:** Public read-only for authenticated platform users; modifications restricted to administrative backend services.

---

## 3. Storage Security & Media Asset Isolation

1. **`crop-images` Bucket:**
   - Publicly readable via CDN URLs for frontend rendering.
   - Upload policy strictly confines writes to the user's isolated subfolder:
     ```sql
     CREATE POLICY "User Crop Image Uploads"
         ON storage.objects FOR INSERT
         TO authenticated
         WITH CHECK (
             bucket_id = 'crop-images' AND
             (storage.foldername(name))[1] = auth.uid()::text
         );
     ```

2. **`drone-surveys` Bucket:**
   - Private bucket; unauthenticated access is strictly rejected.
   - Both upload and read policies enforce user folder ownership:
     ```sql
     CREATE POLICY "User Drone Survey Read Access"
         ON storage.objects FOR SELECT
         TO authenticated
         USING (
             bucket_id = 'drone-surveys' AND
             (storage.foldername(name))[1] = auth.uid()::text
         );
     ```

---

## 4. Secret Leakage & Credential Isolation

- **`.gitignore` Enforcement:** The `.gitignore` file explicitly lists `.env`, `.env.local`, `.env.production`, and credential bundles.
- **Client-Side vs Server-Side Separation:**
  - `NEXT_PUBLIC_` prefix is strictly restricted to non-sensitive publishable values (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
  - Sensitive backend tokens (`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `SENTINEL_HUB_CLIENT_SECRET`) never use the `NEXT_PUBLIC_` prefix and are never bundled into client JavaScript.
- **Automated CI Validation:** The automated test suite (`pnpm test` Suite 8) systematically scans `.gitignore` and `.env.example` to ensure no live production secret keys are inadvertently committed.

