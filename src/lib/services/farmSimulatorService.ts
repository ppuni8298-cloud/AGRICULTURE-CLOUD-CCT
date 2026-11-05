import type {
  FarmSimulationScenario,
  SimulationParameters,
  SimulationResults,
} from '@/lib/supabase/types';

const STORAGE_KEY = 'agrocloud_simulation_scenarios';

// Crop agronomic baseline requirements (per acre)
const CROP_BASELINES: Record<
  string,
  {
    baseYield: number;
    unit: string;
    optimalMoisture: number;
    waterDemandPerStage: Record<string, number>; // mm
    nitrogenDemandKg: number;
    phosphorusDemandKg: number;
    potassiumDemandKg: number;
  }
> = {
  tomato: {
    baseYield: 240, // quintals / acre
    unit: 'Quintals/Acre',
    optimalMoisture: 65,
    waterDemandPerStage: {
      Vegetative: 25,
      Flowering: 40,
      'Fruit Setting / Development': 55,
      Harvesting: 20,
    },
    nitrogenDemandKg: 60,
    phosphorusDemandKg: 40,
    potassiumDemandKg: 50,
  },
  cotton: {
    baseYield: 12,
    unit: 'Quintals/Acre',
    optimalMoisture: 55,
    waterDemandPerStage: {
      Vegetative: 30,
      Flowering: 50,
      'Boll Formation': 60,
      Maturity: 15,
    },
    nitrogenDemandKg: 50,
    phosphorusDemandKg: 25,
    potassiumDemandKg: 25,
  },
  wheat: {
    baseYield: 22,
    unit: 'Quintals/Acre',
    optimalMoisture: 60,
    waterDemandPerStage: {
      Vegetative: 35,
      Tillering: 45,
      'Grain Filling': 50,
      Ripening: 10,
    },
    nitrogenDemandKg: 55,
    phosphorusDemandKg: 30,
    potassiumDemandKg: 20,
  },
  onion: {
    baseYield: 180,
    unit: 'Quintals/Acre',
    optimalMoisture: 70,
    waterDemandPerStage: {
      Vegetative: 25,
      'Bulb Initiation': 45,
      'Bulb Development': 50,
      Maturity: 15,
    },
    nitrogenDemandKg: 45,
    phosphorusDemandKg: 35,
    potassiumDemandKg: 40,
  },
};

export const farmSimulatorService = {
  /**
   * Runs transparent agronomic simulation model based on FAO-56 principles
   */
  runSimulation(cropType: string, params: SimulationParameters): SimulationResults {
    const key = cropType.toLowerCase();
    const baseline = CROP_BASELINES[key] || CROP_BASELINES.tomato;

    // 1. Water balance calculations
    // 1 mm irrigation on 1 acre = 4,046.86 Liters = 4.047 m³
    const waterConsumedM3 = parseFloat((params.irrigation_mm * 4.047).toFixed(1));

    // Rainfall contribution
    let rainContributionMm = 0;
    if (params.rainfall_scenario === 'excess_30') rainContributionMm = 45;
    else if (params.rainfall_scenario === 'normal') rainContributionMm = 25;
    else if (params.rainfall_scenario === 'deficit_50') rainContributionMm = 10;
    else rainContributionMm = 0; // drought

    const totalWaterAvailableMm = params.irrigation_mm + rainContributionMm;
    const waterDemandMm = baseline.waterDemandPerStage[params.growth_stage] || 40;

    // Water Stress Index (0 = no stress, 100 = extreme stress)
    const waterDeficitRatio = Math.max(0, (waterDemandMm - totalWaterAvailableMm) / waterDemandMm);
    const moistureDeficitRatio = Math.max(
      0,
      (baseline.optimalMoisture - params.initial_moisture_pct) / baseline.optimalMoisture
    );

    // Heat stress factor
    const heatStressBonus = params.temp_anomaly_c > 2 ? (params.temp_anomaly_c - 2) * 8 : 0;

    const stressIndex = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          waterDeficitRatio * 50 + moistureDeficitRatio * 30 + heatStressBonus
        )
      )
    );

    // 2. Nutrient balance factor
    const nRatio = Math.min(1.2, params.nitrogen_kg_acre / (baseline.nitrogenDemandKg || 1));
    const pRatio = Math.min(1.2, params.phosphorus_kg_acre / (baseline.phosphorusDemandKg || 1));
    const kRatio = Math.min(1.2, params.potassium_kg_acre / (baseline.potassiumDemandKg || 1));
    const nutrientScore = (nRatio + pRatio + kRatio) / 3; // 1.0 is balanced

    // 3. Projected Yield Impact Delta (%)
    let yieldChangePct = 0;
    if (stressIndex > 60) {
      yieldChangePct = -Math.round(stressIndex * 0.45);
    } else if (stressIndex > 30) {
      yieldChangePct = -Math.round((stressIndex - 30) * 0.3);
    } else {
      // Good water, check nutrient boost
      const nutrientBoost = (nutrientScore - 1.0) * 15;
      yieldChangePct = parseFloat(Math.min(25, Math.max(-5, nutrientBoost)).toFixed(1));
    }

    // 4. Yield Range
    const expectedYieldBase = baseline.baseYield * (1 + yieldChangePct / 100);
    const yieldMin = parseFloat((expectedYieldBase * 0.92).toFixed(1));
    const yieldMax = parseFloat((expectedYieldBase * 1.08).toFixed(1));

    // 5. Resource Cost Calculation (Pumping electricity @ ₹12/m³ + Fertilizer at current Indian subsidy rates)
    // Urea ~ ₹6/kg, DAP ~ ₹27/kg, MOP ~ ₹34/kg
    const electricityCost = waterConsumedM3 * 12;
    const fertilizerCost =
      params.nitrogen_kg_acre * 6.5 +
      params.phosphorus_kg_acre * 26.5 +
      params.potassium_kg_acre * 33.0;
    const totalResourceCost = Math.round(electricityCost + fertilizerCost);

    // 6. 7-Day Moisture Trend Projection
    const trend: number[] = [];
    let curMoisture = params.initial_moisture_pct;
    const dailyEt = 4.2 + (params.temp_anomaly_c > 0 ? params.temp_anomaly_c * 0.4 : 0);

    for (let day = 0; day < 7; day++) {
      if (day === 0) {
        curMoisture = Math.min(95, curMoisture + params.irrigation_mm * 0.6);
      } else {
        curMoisture = Math.max(15, curMoisture - dailyEt * 1.2);
      }
      trend.push(parseFloat(curMoisture.toFixed(1)));
    }

    // 7. Risk Factors
    const riskFactors: string[] = [];
    if (params.temp_anomaly_c >= 3.0) {
      riskFactors.push('Elevated heat anomaly (+3°C) accelerates pollen sterility and flower drop.');
    }
    if (params.rainfall_scenario === 'drought' && params.irrigation_mm < 25) {
      riskFactors.push('Drought scenario without supplementary irrigation leads to severe vegetative stunting.');
    }
    if (params.rainfall_scenario === 'excess_30' && params.irrigation_mm > 35) {
      riskFactors.push('Excessive water supply poses root hypoxia and soil aeration risks.');
    }
    if (params.nitrogen_kg_acre > baseline.nitrogenDemandKg * 1.4) {
      riskFactors.push('Surplus nitrogen application risks excessive vegetative lodging and sap-sucking pest vulnerability.');
    }

    return {
      water_consumption_m3: waterConsumedM3,
      stress_index: stressIndex,
      projected_yield_change_pct: yieldChangePct,
      expected_yield_range: {
        min: yieldMin,
        max: yieldMax,
        unit: baseline.unit,
      },
      resource_cost_inr: totalResourceCost,
      soil_moisture_trend_pct: trend,
      risk_factors: riskFactors,
    };
  },

  /**
   * Retrieves saved scenarios for a farm
   */
  async getScenarios(farmId: string): Promise<FarmSimulationScenario[]> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const list: FarmSimulationScenario[] = JSON.parse(stored);
          const filtered = list.filter((s) => s.farm_id === farmId);
          if (filtered.length > 0) return filtered;
        } catch (e) {
          console.error('Error reading scenarios:', e);
        }
      }
    }
    return [
      {
        id: 'sim-baseline-001',
        farm_id: farmId,
        user_id: 'demo-farmer-001',
        scenario_name: 'Standard Monsoon Regimen (Baseline)',
        crop_type: 'Tomato',
        parameters_json: {
          irrigation_mm: 35,
          initial_moisture_pct: 60,
          nitrogen_kg_acre: 60,
          phosphorus_kg_acre: 40,
          potassium_kg_acre: 50,
          growth_stage: 'Flowering',
          temp_anomaly_c: 0,
          rainfall_scenario: 'normal',
        },
        results_json: {
          water_consumption_m3: 141.6,
          stress_index: 12,
          projected_yield_change_pct: 0,
          expected_yield_range: { min: 220.8, max: 259.2, unit: 'Quintals/Acre' },
          resource_cost_inr: 4850,
          soil_moisture_trend_pct: [78, 73, 68, 63, 58, 53, 48],
          risk_factors: [],
        },
        is_baseline: true,
        created_at: '2026-10-15T10:00:00Z',
        updated_at: '2026-10-15T10:00:00Z',
      },
    ];
  },

  /**
   * Saves a scenario
   */
  async saveScenario(
    farmId: string,
    name: string,
    cropType: string,
    params: SimulationParameters,
    results: SimulationResults
  ): Promise<FarmSimulationScenario> {
    const scenario: FarmSimulationScenario = {
      id: `sim-${Date.now()}`,
      farm_id: farmId,
      user_id: 'demo-farmer-001',
      scenario_name: name,
      crop_type: cropType,
      parameters_json: params,
      results_json: results,
      is_baseline: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list: FarmSimulationScenario[] = stored ? JSON.parse(stored) : [];
      list.unshift(scenario);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    return scenario;
  },
};
