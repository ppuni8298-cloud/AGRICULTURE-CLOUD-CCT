# AgroCloud AI – Academic Project Submission Checklist & Viva Guide

**Project Title:** AgroCloud AI – Cloud-Native Multilingual Smart Agriculture & Precision Agronomy Platform  
**Target Submission:** Final Year B.Tech / B.E. / M.Tech / MCA Major Project Evaluation  
**Author / Developer:** Punith  
**Technology Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, PostgreSQL, Supabase, Recharts, Leaflet, Open-Meteo, Copernicus Sentinel-2  

---

## 1. Academic Submission Deliverables Checklist

| Deliverable Item | Format / File Path | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Final Project Report (Editable)** | `AgroCloud_AI_Final_Project_Report.docx` | Generated | Contains Abstract, Certificate, Declaration, Acknowledgement, Chapters 1–8, References, Appendix |
| **Final Project Report (Printable PDF)** | `AgroCloud_AI_Final_Project_Report.pdf` | Generated | High-resolution academic document formatted with standard margins and headings |
| **Complete Source Code Repository** | Root workspace directory | Complete | Next.js 14 TypeScript codebase with 14 functional modules |
| **Database Master Schema** | `supabase/agrocloud_complete_schema.sql` | Complete | 30 relational tables, RLS policies, 2 storage buckets, triggers |
| **Automated Test Suite** | `scripts/test-phase7.mjs` & `pnpm test` | Complete | 141 automated unit and integration tests passing ($100\%$) |
| **Technical Documentation Suite** | `README.md`, `PROJECT_ARCHITECTURE.md`, `DATABASE_DOCUMENTATION.md`, `API_DOCUMENTATION.md`, `INSTALLATION_GUIDE.md`, `USER_MANUAL.md`, `DEPLOYMENT_GUIDE.md`, `SECURITY_DOCUMENTATION.md` | Complete | Industry-grade system documentation |
| **Application Screenshot Checklist** | `SCREENSHOT_CHECKLIST.md` | Complete | 17 verified UI views covering all platform features |

---

## 2. Pre-Submission Quality Verification

- [x] **Zero TypeScript Errors:** Verified via `npx tsc --noEmit` (0 errors).
- [x] **Zero Test Failures:** Verified via `pnpm test` (141 passed out of 141 tests).
- [x] **Production Build Clean:** Verified via `pnpm run build`.
- [x] **Localization Coverage:** 12 Indian languages verified with identical translation keys.
- [x] **Zero Sensitive Secret Leaks:** `.env.local` excluded in `.gitignore`; `.env.example` verified sanitized.
- [x] **User Data Tenant Isolation:** Row Level Security (RLS) policies defined for all user tables.

---

## 3. Project Viva Presentation Outline (10-15 Minutes)

1. **Slide 1: Title & Introduction (1 min):** Project title, student details, motivation addressing Indian agricultural fragmentation.
2. **Slide 2: Problem Statement & Existing Gaps (2 min):** Traditional fragmented apps, lack of native language support, absence of logistics deduction in mandi discovery, expensive IoT hardware.
3. **Slide 3: Proposed AgroCloud AI Architecture (2 min):** Explain the 3-tier architecture: Next.js frontend, mathematical service tier, Supabase PostgreSQL with RLS.
4. **Slide 4: Key Technical Modules & Innovations (3 min):**
   - 12-language localized UI.
   - Sentinel-2 NDVI/EVI vegetative indices calculation.
   - Geospatial spherical shoelace acreage calculation.
   - APMC mandi freight, cess, and net realized price engine.
   - Virtual IoT simulator for zero-hardware testing.
5. **Slide 5: Live Application Demonstration (4 min):**
   - Register a farmer account in a regional language (e.g., Kannada or Hindi).
   - Add a farm holding and draw a polygon in the Geospatial tool.
   - Run the Crop Doctor pathology diagnosis on a leaf photograph.
   - Demonstrate the Mandi Logistics calculator comparing prices across APMC yards.
6. **Slide 6: Testing, Results & Future Scope (2 min):** Test pass rates (141/141), sub-second page loads, future plans for edge drone video streaming and offline PWA.

---

## 4. Key Viva Questions & Model Answers

### Q1: What makes AgroCloud AI different from existing agriculture portals like e-NAM or Kisan Suvidha?
> **Answer:** Existing portals provide raw mandi prices without considering the farmer's transport cost, loading labor (hamali), and market cess. AgroCloud AI introduces the **Realized Price Engine**, which calculates the net profit per quintal after deducting transport expenses. Additionally, AgroCloud AI integrates 12 regional languages, virtual IoT simulation, computer vision leaf pathology, and Sentinel-2 satellite remote sensing within a unified single dashboard.

### Q2: How does the platform calculate farm acreage from drawn polygon coordinates?
> **Answer:** The system implements the **Spherical Shoelace algorithm** (`geospatialService.ts`). Given an array of latitude and longitude coordinates $(lat_i, lon_i)$ on the WGS-84 ellipsoid, it projects coordinates to radians, calculates spherical polygon excess area using Earth's authalic radius ($R = 6,371,007\text{ m}$), and converts the square meters to standard agricultural acres ($1\text{ Acre} \approx 4,046.86\text{ m}^2$).

### Q3: How do you calculate NDVI and EVI from satellite data?
> **Answer:** In `satelliteService.ts`, we process Sentinel-2 multispectral MSI bands:
> $$\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}} = \frac{B8 - B4}{B8 + B4}$$
> For high-canopy biomass where NDVI saturates, we compute the Enhanced Vegetation Index (EVI):
> $$\text{EVI} = 2.5 \times \frac{B8 - B4}{(B8 + 6 \times B4 - 7.5 \times B2 + 1)}$$

### Q4: How is user data isolated in the shared cloud database?
> **Answer:** We enforce **PostgreSQL Row Level Security (RLS)** at the database kernel level in Supabase. Every query executes in the context of the authenticated user's JWT. Policies enforce `USING (auth.uid() = user_id)`, ensuring that even if a user manipulates client-side request IDs, the database engine physically rejects queries trying to access another farmer's records.

