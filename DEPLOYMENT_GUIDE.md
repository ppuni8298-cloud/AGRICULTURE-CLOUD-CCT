# AgroCloud AI – Production Deployment Guide

This guide details the procedure for deploying AgroCloud AI to **Vercel** with **Supabase**.

---

## 1. Prerequisites

1. A [GitHub](https://github.com) account with repository push access.
2. A [Vercel](https://vercel.com) account.
3. A [Supabase](https://supabase.com) account (project created at `https://virqitxonxadugycvdgp.supabase.co`).

---

## 2. Step 1: Provision the Supabase Database

1. Open your **Supabase Dashboard**:
   👉 [https://supabase.com/dashboard/project/virqitxonxadugycvdgp/sql/new](https://supabase.com/dashboard/project/virqitxonxadugycvdgp/sql/new)
2. Copy the entire contents of [`supabase/agrocloud_complete_schema.sql`](file:///c:/Users/ADMIN/OneDrive/Pictures/Desktop/cloud%20agri/supabase/agrocloud_complete_schema.sql).
3. Paste into the SQL Editor and click **Run**.
4. Verify all 23 tables are created under **Database** &rarr; **Tables**.

### Configure Authentication Redirects:
1. In Supabase, navigate to **Authentication** &rarr; **URL Configuration**.
2. Set **Site URL** to your production URL:
   `https://your-app.vercel.app`
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/**` (for local development)
   - `https://your-app.vercel.app/**` (for production)
4. Click **Save**.

---

## 3. Step 2: Deploy to Vercel

### Method A: Connect via Vercel Web Dashboard (Recommended)
1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository (`agrocloud-ai`).
3. Select **Framework Preset:** `Next.js`.
4. In **Environment Variables**, add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://virqitxonxadugycvdgp.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_IRUjjh1yZc4HhuGNE6zlLA_3vh64mco
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_IRUjjh1yZc4HhuGNE6zlLA_3vh64mco
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
   *(Optional AI / Mandi / Satellite keys: `GEMINI_API_KEY`, `DATA_GOV_IN_API_KEY`, `SENTINEL_HUB_CLIENT_ID`)*
5. Click **Deploy**.
6. Deployment will complete in under 2 minutes.

### Method B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Deploy to production
vercel --prod
```

---

## 4. Step 3: Production Health Check

Verify the deployment by testing the following routes:
1. **Landing Page:** `https://your-app.vercel.app/`
2. **Authentication:** Register a new farmer at `https://your-app.vercel.app/auth/register`
3. **Overview Dashboard:** `https://your-app.vercel.app/dashboard`
4. **Farm Management:** `https://your-app.vercel.app/dashboard/farms`
5. **Virtual IoT Monitoring:** `https://your-app.vercel.app/dashboard/monitoring`
6. **Mandi Intelligence:** `https://your-app.vercel.app/dashboard/mandi`
7. **Digital Farm Twin:** `https://your-app.vercel.app/dashboard/digital-twin`
8. **What-If Simulator:** `https://your-app.vercel.app/dashboard/farm-simulator`
9. **Language Switcher:** Select Kannada, Hindi, or Telugu to verify instant multilingual translation.

