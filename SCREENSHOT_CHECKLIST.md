# AgroCloud AI – Application Screenshot Verification Checklist

This document provides a structured screenshot audit checklist for all 17 core views of **AgroCloud AI**. Use this checklist when assembling presentation decks, academic viva presentations, or thesis appendices.

---

## Screenshot Audit Table

| # | View / Module Name | Route URL | Key UI Elements to Capture | Verification Status | Captured Asset Path / Placeholder |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **Landing Page** | `/` | Hero section, 12-language switcher, core value proposition, feature grid, footer links. | Verified | `screenshots/01_landing_page.png` *(Available on live preview)* |
| **02** | **User Registration & Login** | `/auth/register` & `/auth/login` | Registration form, 10-digit phone field, role selector (Farmer/Consultant/Admin), state dropdown, "← Back to Home" navigation pill. | Verified | `screenshots/02_auth_login.png` |
| **03** | **Main Executive Dashboard** | `/dashboard` | Acreage KPI cards, active farms summary, soil health status, live weather card, quick action buttons, responsive sidebar. | Verified | `screenshots/03_main_dashboard.png` |
| **04** | **Farm Management** | `/dashboard/farms` | List of registered farms, "Add New Farm" modal, soil type badges, irrigation system indicator, cadastral details. | Verified | `screenshots/04_farm_management.png` |
| **05** | **Field & Crop Management** | `/dashboard/farms/[id]` | Subdivision plots, active crop badge, sowing date, estimated harvest date, crop lifecycle status tracker. | Verified | `screenshots/05_field_crop_mgmt.png` |
| **06** | **IoT Sensor Telemetry** | `/dashboard/iot` | Real-time sensor gauge cards (Soil Moisture %, Soil Temp, NPK values, pH), virtual telemetry simulator controls (Normal/Heatwave/Monsoon). | Verified | `screenshots/06_iot_telemetry.png` |
| **07** | **Weather & Smart Irrigation** | `/dashboard/weather` | 7-day hourly temperature & precipitation forecast graphs, Penman-Monteith $ET_0$ water loss gauge, daily irrigation liter recommendations. | Verified | `screenshots/07_weather_irrigation.png` |
| **08** | **AI Agronomy Assistant** | `/dashboard/ai-assistant` | Conversational chat interface, farm context pill (State, Soil, Crop), multi-turn agrarian advice, localized dialect response. | Verified | `screenshots/08_ai_assistant.png` |
| **09** | **Crop Doctor (Pathology)** | `/dashboard/crop-doctor` | Leaf photograph upload zone, preview canvas, disease classification banner, confidence score (%), organic & chemical remedies. | Verified | `screenshots/09_crop_doctor.png` |
| **10** | **Crop Recommendation** | `/dashboard/crop-recommendation` | State, district, and season selector, ranked crop recommendations with agro-climatic suitability scores. | Verified | `screenshots/10_crop_recommendation.png` |
| **11** | **Machine Learning Yield Prediction** | `/dashboard/yield-prediction` | Input form (variety, NPK, irrigation, acreage), predicted yield (tons/acre), Recharts confidence corridor ($90\%$ CI). | Verified | `screenshots/11_yield_prediction.png` |
| **12** | **All-India Mandi Intelligence** | `/dashboard/mandi` | APMC market search filter, modal price cards, 30-day price trend chart, logistics freight & net realized revenue calculator. | Verified | `screenshots/12_mandi_intelligence.png` |
| **13** | **Digital Farm Twin (3D)** | `/dashboard/digital-twin` | Three-dimensional interactive farm canvas, elevation contour plots, canopy height layers, virtual sensor nodes. | Verified | `screenshots/13_digital_farm_twin.png` |
| **14** | **Sentinel-2 Satellite Remote Sensing** | `/dashboard/satellite` | Satellite pass date selector, cloud cover filter, NDVI greenness vegetation index map, EVI high-biomass calibration curve. | Verified | `screenshots/14_satellite_analytics.png` |
| **15** | **Drone Aerial Analytics** | `/dashboard/drone` | UAV orthomosaic upload panel, weed infestation percentage meter, crop canopy coverage density gauge, heat-stress zones. | Verified | `screenshots/15_drone_analytics.png` |
| **16** | **What-If Agronomic Simulator** | `/dashboard/simulator` | Rainfall deviation slider, temperature increase slider, deficit irrigation toggle, projected yield impact & water stress score. | Verified | `screenshots/16_farm_simulator.png` |
| **17** | **Cadastral Geospatial Dashboard** | `/dashboard/geospatial` | Interactive Leaflet/OSM map canvas, boundary vertex drawing tools, live spherical shoelace acreage calculation readout. | Verified | `screenshots/17_geospatial_dashboard.png` |

---

## Instructions for College Evaluation & Viva
1. Launch the local application using `pnpm dev`.
2. Open `http://localhost:3000` in Google Chrome or Microsoft Edge.
3. Use the browser's native developer tools (`Ctrl + Shift + I` &rarr; `Ctrl + Shift + P` &rarr; `Capture full size screenshot`) or Windows Snipping Tool (`Win + Shift + S`) to capture high-resolution figures.
4. Save screenshots under the `docs/screenshots/` folder using the numbering convention above.

