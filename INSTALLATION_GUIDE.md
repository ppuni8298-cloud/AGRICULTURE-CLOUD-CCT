# AgroCloud AI – Installation & Setup Guide

This guide provides step-by-step instructions to set up, configure, test, and run the **AgroCloud AI** platform on your local workstation or production server.

---

## 1. System Requirements & Prerequisites

- **Operating System:** Windows 10/11, macOS 12+, or Ubuntu/Debian Linux 20.04+
- **Node.js:** `v18.18.0` or higher (Recommended: Node `v20.x` or `v22.x`)
- **Package Manager:** `pnpm` (Recommended: `v9.x+`) or `npm` (`v10.x+`)
- **Git:** `v2.30+` installed on PATH
- **Web Browser:** Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari (Modern Evergreen browsers with WebGL & Canvas support)

---

## 2. Step-by-Step Installation

### Step 2.1: Clone the Repository
Open your terminal (PowerShell, bash, or zsh) and clone the project:
```bash
git clone https://github.com/punith233/cloud-agri.git
cd "cloud agri"
```

### Step 2.2: Install Dependencies
Install all required Node dependencies using `pnpm`:
```bash
pnpm install
```
*(If using npm, run `npm install`)*

---

## 3. Remote Database Setup (Supabase)

AgroCloud AI uses **Supabase** (PostgreSQL + Auth + Storage).

### Step 3.1: Create a Free Supabase Project
1. Visit [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, choose an organization, and set:
   - **Project Name:** `AgroCloud-AI`
   - **Database Password:** (Choose a secure password and save it)
   - **Region:** `Central India (Mumbai)` or nearest geographical region.
3. Wait 2–3 minutes for the database cluster to initialize.

### Step 3.2: Execute Master Schema
1. In the Supabase Project Dashboard, navigate to the **SQL Editor** tab (terminal icon on left bar).
2. Click **New Query**.
3. Open `supabase/agrocloud_complete_schema.sql` from this repository.
4. Copy the entire contents and paste into the Supabase SQL Editor.
5. Click **Run** (green button).
6. Verify output shows: `Success. No rows returned`.
7. Navigate to the **Table Editor** to confirm all 30 tables are listed with RLS enabled.
8. Navigate to **Storage** to confirm the `crop-images` and `drone-surveys` buckets exist.

---

## 4. Environment Variables Configuration

Create a file named `.env.local` in the project root by copying the template:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual project credentials:
```env
# -----------------------------------------------------------------------------
# SUPABASE DATABASE & AUTHENTICATION
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# -----------------------------------------------------------------------------
# THIRD-PARTY SATELLITE & AGRONOMIC APIS (Optional for Mock/Virtual Mode)
# -----------------------------------------------------------------------------
DATA_GOV_IN_API_KEY=your_optional_agmarknet_api_key
SENTINEL_HUB_CLIENT_ID=your_optional_sentinel_client_id
SENTINEL_HUB_CLIENT_SECRET=your_optional_sentinel_secret

# -----------------------------------------------------------------------------
# LLM / AI AGENT ENGINE (Optional - Fallbacks to Built-in Agronomic Rules)
# -----------------------------------------------------------------------------
GEMINI_API_KEY=your_gemini_api_key_or_leave_blank
```

> **Security Note:** Never commit `.env.local` to Git. It is already safely listed in `.gitignore`.

---

## 5. Verification & Running the Platform

### Step 5.1: Run the Automated Test Suite
Verify that all 141 integration and mathematical tests pass:
```bash
pnpm test
```
**Expected Output:**
```
================================================================
TOTAL TESTS EXECUTED: 141
PASSED: 141
FAILED: 0
================================================================
✅ ALL TESTS PASSED SUCCESSFULLY! AgroCloud AI is production-ready.
```

### Step 5.2: Run TypeScript Type Check
```bash
npx tsc --noEmit
```
**Expected Output:** Exits with code 0 and no error messages.

### Step 5.3: Start Local Development Server
```bash
pnpm dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 6. Troubleshooting Common Issues

### Issue 1: `Failed to save farm: Could not find the table 'public.farms' in the schema cache`
- **Cause:** The master SQL schema has not yet been executed in your Supabase SQL Editor, or the PostgREST cache has not reloaded.
- **Fix:** Open Supabase Dashboard &rarr; **SQL Editor** &rarr; paste and run `supabase/agrocloud_complete_schema.sql`. Then navigate to **Settings** &rarr; **API** &rarr; click **Reload Schema Cache**.

### Issue 2: `email rate limit exceeded` on User Signup
- **Cause:** Supabase free tier rate-limits confirmation emails to 3 per hour.
- **Fix:**
  1. Go to Supabase Dashboard &rarr; **Authentication** &rarr; **Providers** &rarr; **Email**.
  2. Toggle **OFF** "Confirm email" during development and college evaluation.
  3. User accounts will now be automatically activated upon registration without email verification delays.

### Issue 3: Port 3000 already in use
- **Cause:** Another process is running on port 3000.
- **Fix:** Start on a different port:
  ```bash
  pnpm dev -p 3001
  ```

