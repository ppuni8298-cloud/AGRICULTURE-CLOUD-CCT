# AgroCloud AI – Comprehensive User Manual

**Product:** AgroCloud AI – Cloud-Native Multilingual Smart Agriculture Platform  
**Target Users:** Smallholder & Commercial Farmers, Agronomists, Agri-Consultants, FPOs, and Platform Administrators  
**Supported Languages:** 12 Indian Languages (English, Hindi, Kannada, Telugu, Tamil, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Odia, Assamese)  

---

## 1. Introduction & User Roles

AgroCloud AI provides an integrated, end-to-end digital ecosystem for Indian agriculture. The system supports three primary user roles:

1. **Farmer (Default Role):**
   - Manage multiple land holdings, fields, and seasonal crops.
   - Monitor real-time IoT soil sensors (moisture, NPK, temperature, pH).
   - Diagnose crop pests and diseases using leaf photographs.
   - Check APMC mandi rates and calculate net freight profitability.
   - Access satellite NDVI health maps and drone surveys.

2. **Agricultural Consultant / Agronomist:**
   - Multi-farm monitoring and advisory dispatch.
   - Review diagnostic history and calibrate fertilizer/irrigation schedules.
   - Conduct what-if climate simulations for farm stress planning.

3. **Platform Administrator:**
   - Manage user accounts, role permissions, and tenant isolation policies.
   - Oversee API connectivity to Sentinel-2, AGMARKNET, and Open-Meteo feeds.

---

## 2. Getting Started & Account Management

### 2.1 User Registration (`/auth/register`)
1. Click **Get Started** or **Register** on the landing page navigation bar.
2. Enter your **Full Name**, **10-Digit Mobile Number**, and **Email Address**.
3. Select your **State / Union Territory** and **Preferred Language**.
4. Choose your account role (**Farmer**, **Agricultural Consultant**, or **Administrator**).
5. Set a strong password (minimum 8 characters).
6. Click **Create AgroCloud Account**.
7. If needed, click **← Back to Home** to return to the landing page at any time.

### 2.2 User Login (`/auth/login`)
1. Enter your registered email address and password.
2. Click **Sign In to Dashboard**.
3. Upon authentication, you will be redirected to the secure **Main Dashboard** (`/dashboard`).

### 2.3 Language Selection (12 Languages)
- Click the language selector dropdown in the top header navigation bar.
- Choose between English, हिन्दी (Hindi), ಕನ್ನಡ (Kannada), తెలుగు (Telugu), தமிழ் (Tamil), മലയാളം (Malayalam), मराठी (Marathi), ગુજરાતી (Gujarati), বাংলা (Bengali), ਪੰਜਾਬੀ (Punjabi), ଓଡ଼ିଆ (Odia), or অসমীয়া (Assamese).
- The entire interface, navigation menus, labels, and advisories instantly update in real-time.

---

## 3. Module Walkthroughs

### Module 1: Executive Dashboard (`/dashboard`)
- **Key Metrics:** Shows total active acreage, healthy vs stressed plots, live soil moisture averages, and today's weather summary.
- **Quick Actions:** Instant navigation to Crop Doctor, Mandi Prices, Weather Advisory, and Farm Twin.
- **Proactive AI Notifications:** Real-time banner alerts regarding soil moisture deficits, pest disease risks, or price spikes in nearby APMC yards.

### Module 2: Farm & Field Management (`/dashboard/farms`)
- **Creating a Farm:** Click **Add New Farm**, enter Farm Name, State, District, Taluk, Total Acreage, Dominant Soil Type, and Primary Irrigation System.
- **Adding Fields:** Subdivide your farm into individual plots (e.g., "North Acre Block", "Canal Plot").
- **Crop Lifecycle:** Assign active plantings, specify seed variety, sowing date, and projected harvest window.

### Module 3: Virtual IoT Telemetry (`/dashboard/iot`)
- **Sensor Parameters:** Displays real-time gauges for Soil Moisture (%), Soil Temperature (°C), Nitrogen (mg/kg), Phosphorus (mg/kg), Potassium (mg/kg), and pH level.
- **Virtual Telemetry Simulator:** Farmers without physical hardware can toggle the built-in sensor simulator (`Normal`, `Heatwave Deficit`, `Monsoon Saturation`) to preview automated alerts and irrigation triggers.

### Module 4: Weather & Irrigation Advisory (`/dashboard/weather`)
- **Hyperlocal 7-Day Micro-Forecasts:** Hourly temperature, humidity, precipitation probability, wind speed, and solar radiation sourced from Open-Meteo.
- **Smart Irrigation Scheduling:** Calculates evapotranspiration ($ET_0$) using the FAO-56 Penman-Monteith method and outputs recommended irrigation water volume in liters.

### Module 5: Multilingual AI Agronomist (`/dashboard/ai-assistant`)
- **Conversational Chat:** Type or dictate questions regarding soil conditioning, organic pest management, crop rotation, and fertilizer schedules.
- **Context Awareness:** The assistant automatically incorporates your farm's state, soil type, and active crops into its guidance.

### Module 6: Crop Doctor & Pathology Diagnosis (`/dashboard/crop-doctor`)
- **Image Upload:** Upload or photograph a diseased leaf (Tomato, Potato, Corn, Rice, Wheat, Cotton, etc.).
- **Diagnostic Engine:** Returns disease classification, severity rating (Low, Moderate, Severe), confidence percentage, and dual treatment plans:
  - *Organic / Biological Remedy:* Neem oil, Trichoderma viride, bio-fertilizers.
  - *Chemical Protocol:* Recommended fungicides/insecticides with precise dilution dosages ($g/L$ or $ml/L$).

### Module 7: Seasonal Crop Recommendation (`/dashboard/crop-recommendation`)
- Select your state, district, upcoming agrarian season (Kharif, Rabi, Zaid), and soil profile.
- Generates a suitability-ranked list of crops with projected yield, water requirements, and economic returns.

### Module 8: ML Yield Prediction (`/dashboard/yield-prediction`)
- Enter planned crop variety, farm acreage, soil test parameters (N-P-K), and historical rainfall.
- Computes estimated harvest yield in tons per acre with upper and lower confidence corridors ($90\%$ confidence interval).

### Module 9: All-India APMC Mandi Intelligence (`/dashboard/mandi`)
- **Spot Prices:** Search 1,000+ national APMC yards by commodity, state, and district.
- **30-Day Trends:** Interactive Recharts price graphs tracking modal rates vs minimum/maximum bands.
- **Logistics & Freight Calculator:** Select your origin farm and target wholesale mandi. The system calculates freight distance, diesel costs, loading labor (hamali), APMC cess ($1.5\%$), and outputs the **Net Realized Price per Quintal** to find the most profitable market.

### Module 10: Digital Farm Twin (`/dashboard/digital-twin`)
- Interactive 3D visualization of your farm plots, showing elevation contours, crop canopy height, irrigation pipe networks, and sensor node placements.

### Module 11: Sentinel-2 Satellite Remote Sensing (`/dashboard/satellite`)
- Multispectral satellite monitoring of vegetative vigor.
- **NDVI (Normalized Difference Vegetation Index):** Colors canopy health from Red ($<0.2$, bare soil/stressed) to Emerald Green ($>0.6$, dense vigorous canopy).
- **EVI (Enhanced Vegetation Index):** Corrects for atmospheric aerosols and soil canopy background noise in high-biomass crops.

### Module 12: Drone Aerial Survey & Weed Detection (`/dashboard/drone`)
- Upload high-resolution UAV orthomosaics.
- Automatically calculates weed infestation percentage, crop canopy density, and highlights spatial heat-stress patches.

### Module 13: What-If Agronomic Simulator (`/dashboard/simulator`)
- Adjust rainfall deviation sliders ($-50\%$ to $+50\%$), temperature changes ($-2^\circ C$ to $+5^\circ C$), and irrigation availability.
- Immediately calculates projected crop yield loss and water deficit stress index.

### Module 14: Cadastral Geospatial Parcel Mapping (`/dashboard/geospatial`)
- Interactive Leaflet / OpenStreetMap mapping interface.
- Trace farm boundary vertices on satellite basemaps.
- Computes ground acreage automatically using the spherical shoelace geodesic algorithm.

---

## 4. Farmer Helpdesk & Support

For technical assistance or advisory inquiries:
- **Email:** `support@agrocloud.ai`
- **Toll-Free Kisan Helpline:** `1800-180-1551`
- **Office:** AgroCloud AI Digital Agriculture Innovation Lab, Bengaluru, Karnataka, India

