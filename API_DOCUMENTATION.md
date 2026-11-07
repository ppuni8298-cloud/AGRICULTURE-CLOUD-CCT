# AgroCloud AI – API Specification Documentation

**Platform:** AgroCloud AI  
**Framework:** Next.js 14 App Router Route Handlers  
**Base URL:** `http://localhost:3000/api` (Local) / `https://<domain>/api` (Production)  
**Content-Type:** `application/json`  
**Authentication:** Bearer token / Supabase Auth session header (`sb-access-token` / `Authorization: Bearer <JWT>`)

---

## 1. Summary of API Endpoints

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **AI Agronomy** | `/api/ai/chat` | `POST` | Multi-turn conversational agronomy with context awareness |
| **AI Agronomy** | `/api/ai/diagnose` | `POST` | Computer vision crop disease pathology classification |
| **AI Agronomy** | `/api/ai/insights` | `POST` | Automated farm-wide health insights & intervention plans |
| **AI Agronomy** | `/api/ai/predict-yield` | `POST` | Machine learning crop yield estimation & confidence corridors |
| **AI Agronomy** | `/api/ai/recommend` | `POST` | Soil & climate conditioned crop variety selection engine |
| **Mandi Trade** | `/api/mandi/prices` | `GET` | Filtered APMC spot market rates, arrivals, & modal prices |
| **Mandi Trade** | `/api/mandi/analytics` | `GET` | Historical price trends, volatility metrics, & seasonality |
| **Mandi Trade** | `/api/mandi/compare` | `GET`, `POST` | Multi-market price spread & spatial arbitrage analysis |
| **Mandi Trade** | `/api/mandi/transport` | `POST` | Itemized freight, cess, labor, & net realized price engine |
| **Mandi Trade** | `/api/mandi/advisor` | `GET`, `POST` | Optimal selling window & dispatch timing advisor |

---

## 2. AI Agronomy Endpoints

### 2.1 Conversational Agronomy Assistant
- **Endpoint:** `POST /api/ai/chat`
- **Description:** Interacts with the agronomy knowledge model (Gemini 1.5 Pro / GPT-4o / Rule fallback) with farm context injection.
- **Request Body:**
  ```json
  {
    "message": "My tomato plants have black spots on lower leaves. What should I spray?",
    "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "farmContext": {
      "state": "Karnataka",
      "district": "Kolar",
      "soilType": "Red Sandy Loam",
      "crop": "Tomato"
    },
    "language": "en"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "reply": "Based on the symptoms of black spots with concentric rings on lower tomato leaves in Kolar's semi-arid soil, this is characteristic of Early Blight (Alternaria solani)...",
    "recommendations": [
      "Spray Mancozeb 75% WP @ 2.5g/L or Chlorothalonil @ 2g/L",
      "Ensure proper plant spacing for canopy aeration",
      "Remove infected lower foliage and dispose away from the field"
    ]
  }
  ```

### 2.2 Crop Disease Pathology Diagnosis
- **Endpoint:** `POST /api/ai/diagnose`
- **Description:** Analyzes uploaded crop leaf images, returns pathology diagnosis, severity score, and treatment protocols.
- **Request Body:**
  ```json
  {
    "imageUrl": "https://virqitxonxadugycvdgp.supabase.co/storage/v1/object/public/crop-images/user_123/leaf.jpg",
    "cropName": "Tomato",
    "farmId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "disease": "Tomato Early Blight",
    "confidence": 94.6,
    "severity": "Moderate",
    "organicRemedy": "Spray 10% cow urine extract or Neem oil @ 5ml/L every 7 days.",
    "chemicalRemedy": "Apply Azoxystrobin 23% SC @ 1 ml/L or Mancozeb 75% WP @ 2.5g/L.",
    "preventiveMeasures": "Implement crop rotation with non-solanaceous crops, avoid overhead sprinkler irrigation."
  }
  ```

### 2.3 Crop Yield Prediction
- **Endpoint:** `POST /api/ai/predict-yield`
- **Description:** Predicts harvest yield per acre based on historical weather, soil N-P-K, irrigation volume, and crop variety.
- **Request Body:**
  ```json
  {
    "crop": "Wheat",
    "areaAcres": 5.0,
    "soilN": 280,
    "soilP": 42,
    "soilK": 190,
    "rainfallMm": 650,
    "irrigationType": "Drip"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "predictedYieldTonsPerAcre": 3.85,
    "totalExpectedTons": 19.25,
    "confidenceRange": {
      "min": 3.42,
      "max": 4.15
    },
    "keyDrivers": [
      { "factor": "Optimal Nitrogen Ratio", "impact": "+12%" },
      { "factor": "Drip Irrigation Uniformity", "impact": "+18%" }
    ]
  }
  ```

### 2.4 Crop Selection Recommendation
- **Endpoint:** `POST /api/ai/recommend`
- **Description:** Recommends optimal crops and cultivars based on agro-climatic zone, season, and soil chemistry.
- **Request Body:**
  ```json
  {
    "state": "Maharashtra",
    "district": "Nashik",
    "season": "Kharif",
    "soilType": "Medium Black Soil",
    "waterAvailability": "Moderate"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "recommendations": [
      {
        "crop": "Soybean",
        "variety": "JS 335 / JS 93-05",
        "suitabilityScore": 92,
        "durationDays": 95,
        "rationale": "High tolerance to moderate moisture stress in medium black soils."
      },
      {
        "crop": "Cotton",
        "variety": "Bt Cotton Hybrid",
        "suitabilityScore": 88,
        "durationDays": 150,
        "rationale": "High market proximity and deep soil root anchorage."
      }
    ]
  }
  ```

### 2.5 Automated Farm Insights
- **Endpoint:** `POST /api/ai/insights`
- **Description:** Aggregates recent sensor readings, weather anomalies, and vegetative indices into actionable farm insights.
- **Request Body:**
  ```json
  {
    "farmId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "insights": [
      {
        "type": "irrigation",
        "severity": "high",
        "title": "Soil Moisture Depletion Detected in Sector B",
        "description": "Soil moisture has dropped below 32% Field Capacity during fruit development.",
        "action": "Schedule 45 minutes of drip irrigation before 10:00 AM."
      }
    ]
  }
  ```

---

## 3. Mandi Intelligence Endpoints

### 3.1 Live Mandi Prices
- **Endpoint:** `GET /api/mandi/prices?commodity=Tomato&state=Karnataka&market=Kolar`
- **Description:** Fetches current APMC wholesale auction rates and volume arrivals.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "market": "Kolar APMC",
        "district": "Kolar",
        "state": "Karnataka",
        "commodity": "Tomato",
        "variety": "Hybrid",
        "arrivalDate": "2026-11-06",
        "minPrice": 1800,
        "maxPrice": 2400,
        "modalPrice": 2200,
        "arrivalsTonnes": 142.5
      }
    ]
  }
  ```

### 3.2 Mandi Price Trends & Analytics
- **Endpoint:** `GET /api/mandi/analytics?commodity=Onion&market=Lasalgaon&days=30`
- **Description:** Returns 30-day price trend lines, moving averages, and volatility indices.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "commodity": "Onion",
    "market": "Lasalgaon",
    "currentModalPrice": 1950,
    "thirtyDayChangePercent": 8.3,
    "trendDirection": "upward",
    "timeSeries": [
      { "date": "2026-10-07", "price": 1800 },
      { "date": "2026-11-06", "price": 1950 }
    ]
  }
  ```

### 3.3 Inter-Mandi Price Arbitrage Compare
- **Endpoint:** `GET /api/mandi/compare?commodity=Potato&originMarket=Agra&targetMarkets=Azadpur,Kanpur`
- **Description:** Computes spatial price differences between origin and consuming APMC hubs.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "commodity": "Potato",
    "originMarket": { "name": "Agra APMC", "modalPrice": 1250 },
    "comparisons": [
      {
        "market": "Azadpur (Delhi)",
        "modalPrice": 1620,
        "grossSpreadPerQuintal": 370
      },
      {
        "market": "Kanpur APMC",
        "modalPrice": 1380,
        "grossSpreadPerQuintal": 130
      }
    ]
  }
  ```

### 3.4 Logistics & Realized Pricing Engine
- **Endpoint:** `POST /api/mandi/transport`
- **Description:** Deducts itemized freight, diesel consumption, loading labor (hamali), APMC mandi cess (1.5%), and weighing charges.
- **Request Body:**
  ```json
  {
    "commodity": "Wheat",
    "quantityQuintals": 50,
    "originDistrict": "Karnal",
    "destinationMandi": "Azadpur Mandi",
    "distanceKm": 135,
    "modalPrice": 2200
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "grossRevenue": 110000,
    "expenses": {
      "freightCost": 1500,
      "laborHamali": 1000,
      "apmcCess": 1650,
      "weighingCharges": 200,
      "totalDeductions": 4350
    },
    "netRealizedRevenue": 105650,
    "netRealizedPricePerQuintal": 2113.00,
    "profitMarginPercent": 96.05
  }
  ```

### 3.5 Dispatch Timing Advisor
- **Endpoint:** `GET /api/mandi/advisor?commodity=Paddy&market=Karnal`
- **Description:** Agronomic and price advisor evaluating arrival surges and weekend trading premiums to recommend sell vs hold.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "recommendation": "SELL_NOW",
    "confidenceScore": 87,
    "summary": "Arrivals are projected to peak in 48 hours following harvest completions in neighboring blocks. Current modal price of ₹2,380/Q is near 14-day high.",
    "optimalSellingWindow": "Next 48 Hours"
  }
  ```

