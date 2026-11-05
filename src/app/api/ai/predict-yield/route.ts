import { NextRequest, NextResponse } from 'next/server';
import type { InfluencingFactor } from '@/lib/supabase/types';

interface YieldBaseline {
  crop: string;
  unit: string;
  min_per_acre: number;
  max_per_acre: number;
  optimal_soil_moisture: [number, number];
  temp_comfort: [number, number];
}

const CROP_BASELINES: Record<string, YieldBaseline> = {
  tomato: {
    crop: 'Tomato',
    unit: 'Quintals/Acre',
    min_per_acre: 180,
    max_per_acre: 240,
    optimal_soil_moisture: [50, 75],
    temp_comfort: [20, 30],
  },
  rice: {
    crop: 'Paddy (Rice)',
    unit: 'Quintals/Acre',
    min_per_acre: 22,
    max_per_acre: 28,
    optimal_soil_moisture: [60, 85],
    temp_comfort: [22, 34],
  },
  paddy: {
    crop: 'Paddy (Rice)',
    unit: 'Quintals/Acre',
    min_per_acre: 22,
    max_per_acre: 28,
    optimal_soil_moisture: [60, 85],
    temp_comfort: [22, 34],
  },
  maize: {
    crop: 'Maize',
    unit: 'Quintals/Acre',
    min_per_acre: 24,
    max_per_acre: 32,
    optimal_soil_moisture: [45, 65],
    temp_comfort: [20, 32],
  },
  cotton: {
    crop: 'Cotton',
    unit: 'Quintals/Acre',
    min_per_acre: 9,
    max_per_acre: 14,
    optimal_soil_moisture: [40, 65],
    temp_comfort: [22, 36],
  },
  groundnut: {
    crop: 'Groundnut',
    unit: 'Quintals/Acre',
    min_per_acre: 10,
    max_per_acre: 15,
    optimal_soil_moisture: [40, 60],
    temp_comfort: [22, 30],
  },
  chilli: {
    crop: 'Chilli',
    unit: 'Quintals/Acre',
    min_per_acre: 14,
    max_per_acre: 20,
    optimal_soil_moisture: [45, 70],
    temp_comfort: [22, 32],
  },
  soybean: {
    crop: 'Soybean',
    unit: 'Quintals/Acre',
    min_per_acre: 8,
    max_per_acre: 12,
    optimal_soil_moisture: [50, 70],
    temp_comfort: [20, 30],
  },
  ragi: {
    crop: 'Ragi (Finger Millet)',
    unit: 'Quintals/Acre',
    min_per_acre: 12,
    max_per_acre: 18,
    optimal_soil_moisture: [35, 60],
    temp_comfort: [20, 32],
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cropName = 'Tomato',
      growthStage = 'Vegetative',
      area = 2.5,
      historicalYield,
      soilMoisture = 52,
      soilTemperature = 25,
      airTemperature = 28,
      airHumidity = 65,
      rainfallForecast = 12,
    } = body;

    const key = Object.keys(CROP_BASELINES).find((k) =>
      cropName.toLowerCase().includes(k)
    );
    const baseline = key
      ? CROP_BASELINES[key]
      : {
          crop: cropName,
          unit: 'Quintals/Acre',
          min_per_acre: 15,
          max_per_acre: 25,
          optimal_soil_moisture: [45, 70] as [number, number],
          temp_comfort: [20, 32] as [number, number],
        };

    const influencingFactors: InfluencingFactor[] = [];
    let modifier = 1.0;
    let confidenceScore = 82;
    const missingDataPoints: string[] = [];

    // 1. Growth Stage Multiplier
    if (growthStage === 'Sowing' || growthStage === 'Germination') {
      modifier *= 0.95;
      confidenceScore -= 12; // Far from harvest, higher uncertainty
      influencingFactors.push({
        factor: 'Early Phenological Stage',
        impact: 'neutral',
        weight: 20,
        description: 'Crop is in early establishment phase. Extreme weather or pest pressures over the next 60-90 days will dominate actual harvest yield.',
      });
    } else if (growthStage === 'Yield Formation' || growthStage === 'Ripening') {
      modifier *= 1.05;
      confidenceScore += 8; // Close to harvest, higher certainty
      influencingFactors.push({
        factor: 'Advanced Reproductive Maturity',
        impact: 'positive',
        weight: 25,
        description: 'Crop has successfully formed biomass and entered grain/fruit fill phase with reduced developmental risk.',
      });
    } else {
      influencingFactors.push({
        factor: 'Active Vegetative Canopy Growth',
        impact: 'positive',
        weight: 15,
        description: 'Vigorous leaf area index supports strong photosynthetic accumulation.',
      });
    }

    // 2. Soil Moisture Telemetry
    const moisture = Number(soilMoisture) || 50;
    if (moisture >= baseline.optimal_soil_moisture[0] && moisture <= baseline.optimal_soil_moisture[1]) {
      modifier *= 1.03;
      influencingFactors.push({
        factor: 'Optimal Root-Zone Soil Moisture',
        impact: 'positive',
        weight: 20,
        description: `Current volumetric soil moisture (${moisture}%) matches optimal vegetative transpiration range (${baseline.optimal_soil_moisture[0]}–${baseline.optimal_soil_moisture[1]}%).`,
      });
    } else if (moisture < baseline.optimal_soil_moisture[0] - 10) {
      modifier *= 0.90;
      influencingFactors.push({
        factor: 'Sub-Optimal Water Deficit',
        impact: 'negative',
        weight: 25,
        description: `Soil moisture (${moisture}%) is below minimum comfort point, risking moisture stress and reduced leaf cell expansion.`,
      });
    } else {
      influencingFactors.push({
        factor: 'Elevated Soil Saturation',
        impact: 'negative',
        weight: 15,
        description: `Elevated root moisture (${moisture}%) reduces soil oxygenation, potentially slowing nutrient uptake.`,
      });
    }

    // 3. Thermal Comfort
    const temp = Number(airTemperature) || 28;
    if (temp >= baseline.temp_comfort[0] && temp <= baseline.temp_comfort[1]) {
      modifier *= 1.02;
      influencingFactors.push({
        factor: 'Canopy Thermal Comfort',
        impact: 'positive',
        weight: 15,
        description: `Ambient temperature (${temp}°C) is in the physiological sweet-spot for pollen viability and enzyme activity.`,
      });
    } else if (temp > baseline.temp_comfort[1] + 4) {
      modifier *= 0.92;
      influencingFactors.push({
        factor: 'Heat Stress Factor',
        impact: 'negative',
        weight: 20,
        description: `Elevated temperatures (${temp}°C) increase respiration loss and elevate blossom drop risk.`,
      });
    }

    // 4. Historical Yield Anchor
    if (historicalYield && Number(historicalYield) > 0) {
      const hist = Number(historicalYield);
      const ratio = hist / ((baseline.min_per_acre + baseline.max_per_acre) / 2);
      if (ratio > 0.5 && ratio < 1.8) {
        modifier = (modifier + ratio) / 2;
        confidenceScore += 6;
        influencingFactors.push({
          factor: 'Farmer Historical Track Record',
          impact: ratio >= 1.0 ? 'positive' : 'neutral',
          weight: 25,
          description: `Grounded in your historical plot productivity of ${hist} ${baseline.unit}.`,
        });
      }
    } else {
      missingDataPoints.push('Previous season harvest records for this plot');
      confidenceScore -= 5;
    }

    // Calculate final ranges
    const calculatedMin = Math.round(baseline.min_per_acre * modifier * 10) / 10;
    const calculatedMax = Math.round(baseline.max_per_acre * modifier * 10) / 10;
    const totalMin = Math.round(calculatedMin * Number(area));
    const totalMax = Math.round(calculatedMax * Number(area));

    const confidenceExplanation =
      confidenceScore >= 80
        ? `High statistical stability based on active phenology and verified telemetry metrics.`
        : `Moderate confidence (${confidenceScore}%). Forecast accuracy increases with additional historical harvest logs and local soil nutrient test data.`;

    const dataSufficiencyNote =
      missingDataPoints.length > 0
        ? `Model accuracy can be improved by adding: ${missingDataPoints.join(', ')}.`
        : `Sufficient plot data available for predictive modeling.`;

    return NextResponse.json({
      success: true,
      crop_name: baseline.crop,
      unit: baseline.unit,
      predicted_per_acre_range: [calculatedMin, calculatedMax],
      predicted_total_range: [totalMin, totalMax],
      area_acres: Number(area),
      confidence_score: Math.min(95, Math.max(50, confidenceScore)),
      confidence_explanation: confidenceExplanation,
      influencing_factors: influencingFactors,
      data_sufficiency_note: dataSufficiencyNote,
      is_guaranteed: false,
      disclaimer:
        'Yield predictions are statistical agronomic estimates based on historical benchmarks, phenology, and simulated/weather telemetry. Production is subject to unforecasted climatic anomalies, pest outbreaks, and farm management practices and is not guaranteed.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/ai/predict-yield error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Yield prediction calculation failed.' },
      { status: 500 }
    );
  }
}

