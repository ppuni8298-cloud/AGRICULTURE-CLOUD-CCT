# AgroCloud AI – Environment Variables Guide

This document defines all configuration keys for local development, CI/CD, and Vercel production deployment.

---

## 1. Core Supabase Configuration (Client & Server)

| Variable | Required | Scope | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Client & Server | The URL of your Supabase project (e.g. `https://virqitxonxadugycvdgp.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Client & Server | The public anon key for browser authentication and data querying. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Yes** | Client & Server | Supabase Publishable Key (used interchangeably with Anon Key in modern Supabase SSR). |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | **Server-Only** | Admin secret for server actions. **NEVER prefix with NEXT_PUBLIC_**. |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Client & Server | Base URL of the deployment (e.g. `http://localhost:3000` or `https://agrocloud-ai.vercel.app`). |

---

## 2. Artificial Intelligence Providers (Phase 4 & 6)

| Variable | Required | Scope | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Optional | **Server-Only** | Google Gemini API Key for conversational agronomy and multimodal leaf pathology. Obtain from [Google AI Studio](https://aistudio.google.com). |
| `OPENAI_API_KEY` | Optional | **Server-Only** | Fallback OpenAI API key (gpt-4o / gpt-4o-mini). |
| *Default Fallback* | — | Built-in | If neither key is supplied, AgroCloud AI engages the **ICAR (Indian Council of Agricultural Research) Rule-Based Agronomic Engine** with 100% offline-ready advisory in 12 languages. |

---

## 3. Mandi & Market Intelligence Feeds (Phase 5)

| Variable | Required | Scope | Description |
|---|---|---|---|
| `DATA_GOV_IN_API_KEY` | Optional | **Server-Only** | API key for the Open Government Data Platform India ([data.gov.in](https://data.gov.in)) to retrieve official AGMARKNET feeds. |
| *Default Fallback* | — | Built-in | When omitted, AgroCloud AI operates using verified official benchmark records with explicit provenance attribution. |

---

## 4. Satellite Remote Sensing (Phase 6)

| Variable | Required | Scope | Description |
|---|---|---|---|
| `SENTINEL_HUB_CLIENT_ID` | Optional | **Server-Only** | Sentinel Hub OAuth Client ID. |
| `SENTINEL_HUB_CLIENT_SECRET` | Optional | **Server-Only** | Sentinel Hub OAuth Client Secret. |
| `COPERNICUS_API_KEY` | Optional | **Server-Only** | European Space Agency (ESA) Copernicus Data Space API Key ([dataspace.copernicus.eu](https://dataspace.copernicus.eu)). |
| *Default Fallback* | — | Built-in | When omitted, the system activates the **Sentinel-2 Benchmark Demonstration Mode** with calibrated Red ($B4$) and NIR ($B8$) reflectance and explicit `DEMO` labeling. |

---

## 5. Security & Deployment Best Practices

1. **Never commit `.env.local` to Git.** It is already listed in `.gitignore`.
2. **In Vercel:** Add environment variables under **Settings &rarr; Environment Variables**.
3. **In GitHub Actions:** Add secrets under **Settings &rarr; Secrets and variables &rarr; Actions**.
