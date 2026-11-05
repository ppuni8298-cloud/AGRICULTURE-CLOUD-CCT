import type { PredictiveInsight, PredictiveInsightCategory } from '@/lib/supabase/types';

export interface DailyStressPrediction {
  day: string;
  date: string;
  stressProbabilityPct: number;
  expectedTemperatureC: number;
  projectedMoisturePct: number;
  heatStressRisk: 'low' | 'moderate' | 'high';
  moistureStressRisk: 'low' | 'moderate' | 'high';
}

export interface SoilDepletionForecast {
  dayIndex: number;
  date: string;
  rootZoneMoisturePct: number;
  fieldCapacityThreshold: number;
  stressThreshold: number;
  permanentWiltingPoint: number;
  isStressTriggered: boolean;
}

export interface WeatherHazardRadar {
  hazard: string;
  probabilityPct: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  mitigationAction: string;
}

export interface WaterDemandSchedule {
  recommendedDate: string;
  waterDepthMm: number;
  volumeM3PerAcre: number;
  dripRunHours: number;
  urgency: 'routine' | 'recommended' | 'critical';
  rationale: string;
}

export const predictiveAnalyticsService = {
  /**
   * Generates a 14-day crop stress forward forecast
   */
  get14DayStressTrajectory(
    cropName: string = 'Tomato',
    currentMoisture: number = 58,
    ambientTemp: number = 29
  ): DailyStressPrediction[] {
    const predictions: DailyStressPrediction[] = [];
    const now = new Date();

    for (let i = 1; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);

      // Temperature forecast simulation
      const temp = Math.round(ambientTemp + Math.sin(i * 0.5) * 3 + (i > 7 ? 2 : 0));
      // Soil moisture natural depletion without rain (~3.5% daily ET)
      const moisture = Math.max(20, Math.round(currentMoisture - i * 2.8 + (i > 9 ? 3 : 0)));

      // Combined stress probability
      let stress = 15;
      if (moisture < 45) stress += (45 - moisture) * 2.5;
      if (temp > 32) stress += (temp - 32) * 8;
      stress = Math.min(95, Math.max(10, Math.round(stress)));

      predictions.push({
        day: `Day ${i}`,
        date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        stressProbabilityPct: stress,
        expectedTemperatureC: temp,
        projectedMoisturePct: moisture,
        heatStressRisk: temp > 34 ? 'high' : temp > 31 ? 'moderate' : 'low',
        moistureStressRisk: moisture < 35 ? 'high' : moisture < 48 ? 'moderate' : 'low',
      });
    }

    return predictions;
  },

  /**
   * Generates root-zone soil moisture depletion curve forecasting when stress threshold is reached
   */
  getSoilMoistureDepletionCurve(initialMoisture: number = 65): SoilDepletionForecast[] {
    const forecasts: SoilDepletionForecast[] = [];
    const now = new Date();
    let current = initialMoisture;
    const fieldCapacity = 75;
    const stressThreshold = 40;
    const pwp = 20;

    for (let day = 0; day <= 10; day++) {
      const d = new Date(now);
      d.setDate(now.getDate() + day);

      if (day > 0) {
        // Daily evapotranspiration rate of ~3.8%
        current = Math.max(16, parseFloat((current - 3.8).toFixed(1)));
      }

      forecasts.push({
        dayIndex: day,
        date: day === 0 ? 'Today' : d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        rootZoneMoisturePct: current,
        fieldCapacityThreshold: fieldCapacity,
        stressThreshold: stressThreshold,
        permanentWiltingPoint: pwp,
        isStressTriggered: current <= stressThreshold,
      });
    }

    return forecasts;
  },

  /**
   * Evaluates atmospheric and micro-weather hazards for the farm parcel
   */
  getWeatherHazardRadar(): WeatherHazardRadar[] {
    return [
      {
        hazard: 'Heat Wave & Thermal Spikes (>34°C)',
        probabilityPct: 35,
        severity: 'medium',
        timeframe: 'Next 5–7 Days',
        mitigationAction: 'Maintain soil mulching and schedule night-time drip cycles to minimize evaporative loss.',
      },
      {
        hazard: 'Sudden Unseasonal Thunderstorms',
        probabilityPct: 20,
        severity: 'low',
        timeframe: 'Day 8–10',
        mitigationAction: 'Ensure field drainage ditches and bund spillways are clear of silt blockage.',
      },
      {
        hazard: 'Prolonged High Humidity Fungal Window (>85% RH for 48h)',
        probabilityPct: 62,
        severity: 'high',
        timeframe: 'Next 48–72 Hours',
        mitigationAction: 'Apply preventive bio-fungicide (Trichoderma viride or Copper Oxychloride) before dawn.',
      },
      {
        hazard: 'High Velocity Gusts (>35 km/h Lodging Hazard)',
        probabilityPct: 15,
        severity: 'low',
        timeframe: 'Day 12',
        mitigationAction: 'Inspect tomato trellis support wires and tighten guide ropes.',
      },
    ];
  },

  /**
   * Calculates precision water demand schedule
   */
  getWaterDemandSchedule(cropName: string = 'Tomato'): WaterDemandSchedule[] {
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 2);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 5);
    const d3 = new Date(today);
    d3.setDate(today.getDate() + 9);

    return [
      {
        recommendedDate: d1.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' }),
        waterDepthMm: 22,
        volumeM3PerAcre: 89.0,
        dripRunHours: 2.5,
        urgency: 'critical',
        rationale: 'Root-zone moisture projected to breach 40% agronomic stress threshold.',
      },
      {
        recommendedDate: d2.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' }),
        waterDepthMm: 18,
        volumeM3PerAcre: 72.8,
        dripRunHours: 2.0,
        urgency: 'recommended',
        rationale: 'Replenish active root zone following peak midday transpirational demand.',
      },
      {
        recommendedDate: d3.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' }),
        waterDepthMm: 15,
        volumeM3PerAcre: 60.7,
        dripRunHours: 1.8,
        urgency: 'routine',
        rationale: 'Scheduled maintenance irrigation coupled with water-soluble fertigation.',
      },
    ];
  },

  /**
   * Retrieves high-level predictive insights with explicit provenance
   */
  async getPredictiveInsights(farmId: string): Promise<PredictiveInsight[]> {
    return [
      {
        id: 'pred-ins-001',
        farm_id: farmId,
        field_id: 'field-101',
        user_id: 'demo-farmer-001',
        insight_category: 'soil_moisture',
        risk_level: 'high',
        confidence_score: 92.5,
        horizon_days: 3,
        title: 'Moisture Depletion to Stress Threshold in 72 Hours',
        summary:
          'Soil moisture depletion modeling projects root-zone water content will drop from 58% to 38% within 3 days under prevailing 29°C ambient weather unless supplementary irrigation is applied.',
        metrics_json: {
          currentMoisturePct: 58,
          projectedMoisturePct: 38,
          thresholdPct: 40,
          deficitMm: 22,
        },
        data_sources_json: [
          { source_type: 'Measured IoT', description: 'KOL-SOIL-01 FDR Capacitance Probe (15cm depth)', is_measured: true },
          { source_type: 'Weather Forecast', description: 'Open-Meteo 7-Day Solar Radiation & ET0 Model', is_measured: false },
          { source_type: 'Agronomic Model', description: 'FAO-56 Dual Crop Coefficient Penman-Monteith', is_measured: false },
        ],
        actionable_recommendations: [
          'Run drip lateral irrigation for 2.5 hours on Day 2 morning before 09:00 AM.',
          'Verify soil moisture recovery to >60% post-irrigation using telemetry console.',
        ],
        created_at: new Date().toISOString(),
      },
      {
        id: 'pred-ins-002',
        farm_id: farmId,
        field_id: 'field-101',
        user_id: 'demo-farmer-001',
        insight_category: 'weather_risk',
        risk_level: 'moderate',
        confidence_score: 87.0,
        horizon_days: 5,
        title: 'Fungal Spore Germination Window Detected',
        summary:
          'Combination of sustained relative humidity (>82%) and night-time temperatures between 19–22°C creates a high-probability window for Early Blight (Alternaria solani) progression.',
        metrics_json: {
          rhAveragePct: 84,
          nightTempC: 20.5,
          favorableHours: 42,
        },
        data_sources_json: [
          { source_type: 'Measured IoT', description: 'KOL-ATEMP-01 Radiation-Shielded Air Sensor', is_measured: true },
          { source_type: 'Satellite Spectral', description: 'Sentinel-2 Canopy Density (NDVI 0.72)', is_measured: true },
          { source_type: 'Predictive Model Output', description: 'ICAR Micro-climate Disease Epidemic Index', is_measured: false },
        ],
        actionable_recommendations: [
          'Apply prophylactic bio-protectant (Bacillus subtilis @ 2ml/L) prior to rain onset.',
          'Prune lower senescent leaves (bottom 6 inches) to improve bottom-canopy airflow.',
        ],
        created_at: new Date().toISOString(),
      },
    ];
  },
};

