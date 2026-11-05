import { NextRequest, NextResponse } from 'next/server';
import type { AIFarmInsight } from '@/lib/supabase/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      farms = [],
      crops = [],
      readings = [],
      weather,
      alerts = [],
      activities = [],
    } = body;

    const insights: Array<Omit<AIFarmInsight, 'id' | 'user_id' | 'created_at'>> = [];

    // 1. Soil Moisture Telemetry Analysis
    const moistureReading = readings.find((r: any) => r.parameter === 'soil_moisture');
    if (moistureReading) {
      const val = Number(moistureReading.value);
      if (val < 40) {
        insights.push({
          title: 'Root-Zone Moisture Depletion Alert',
          category: 'irrigation',
          priority: 'high',
          explanation: `Soil moisture in root zone measured ${val}%, which is below the 40% threshold for optimal vegetative transpiration.`,
          supporting_data: { current_moisture: val, optimal_min: 40, unit: '%' },
          suggested_action: 'Initiate 90-minute drip irrigation cycle during early morning to restore field capacity without evaporation loss.',
          data_source: 'SIMULATED IoT (FDR Probe)',
        });
      } else if (val > 80) {
        insights.push({
          title: 'Soil Saturation & Root Hypoxia Warning',
          category: 'soil',
          priority: 'high',
          explanation: `Volumetric soil moisture reached ${val}%. Prolonged water saturation reduces root aeration and promotes fungal collar rots.`,
          supporting_data: { current_moisture: val, safety_max: 80, unit: '%' },
          suggested_action: 'Inspect field peripheral drainage trenches. Defer any planned irrigation cycles until moisture drops below 70%.',
          data_source: 'SIMULATED IoT (FDR Probe)',
        });
      } else {
        insights.push({
          title: 'Root-Zone Hydration at Ideal Field Capacity',
          category: 'irrigation',
          priority: 'low',
          explanation: `Soil moisture is at a healthy ${val}%, supporting steady nutrient flow through xylem vessels.`,
          supporting_data: { current_moisture: val, target_band: '40–75%' },
          suggested_action: 'Maintain current irrigation interval; no emergency moisture adjustment needed.',
          data_source: 'SIMULATED IoT (FDR Probe)',
        });
      }
    }

    // 2. Weather & Spray Window Opportunity
    if (weather) {
      const wind = Number(weather.wind_speed) || 10;
      const rainProb = Number(weather.rain_prob) || 0;
      const temp = Number(weather.temp) || 28;

      if (wind > 18) {
        insights.push({
          title: 'Spray Drift Hazard: High Canopy Winds',
          category: 'weather',
          priority: 'high',
          explanation: `Wind gusts of ${wind} km/h detected. Chemical spray droplets will drift away from target foliage onto non-target areas.`,
          supporting_data: { wind_speed: wind, threshold: 15, unit: 'km/h' },
          suggested_action: 'Postpone any scheduled fungicide or insecticide foliar spraying until wind speeds decrease below 12 km/h.',
          data_source: 'OPEN-METEO NUMERICAL FORECAST',
        });
      } else if (rainProb > 65) {
        insights.push({
          title: 'Precipitation Warning: Spray Wash-Off Risk',
          category: 'weather',
          priority: 'medium',
          explanation: `Forecast indicates a ${rainProb}% probability of rainfall within the next 24 hours. Contact chemical sprays applied now will be washed off before systemic absorption.`,
          supporting_data: { rain_probability: rainProb, unit: '%' },
          suggested_action: 'Delay pesticide applications or use a non-ionic organosilicone surfactant/spreader if emergency spray is unavoidable.',
          data_source: 'OPEN-METEO NUMERICAL FORECAST',
        });
      } else if (wind < 12 && rainProb < 20 && temp < 32) {
        insights.push({
          title: 'Optimal Foliar Spraying Window Active',
          category: 'weather',
          priority: 'low',
          explanation: `Calm wind (${wind} km/h), minimal rain probability (${rainProb}%), and moderate temperatures provide ideal conditions for nutrient or pest sprays.`,
          supporting_data: { wind_speed: wind, rain_prob: rainProb, temp },
          suggested_action: 'Utilize this 4-hour atmospheric window for micronutrient foliar sprays or preventive biocontrol releases.',
          data_source: 'OPEN-METEO NUMERICAL FORECAST',
        });
      }
    }

    // 3. Crop Growth Stage Nutrition
    const activeCrop = crops.find((c: any) => c.status === 'active');
    if (activeCrop) {
      if (activeCrop.growth_stage === 'Flowering') {
        insights.push({
          title: `Critical Reproductive Phase: ${activeCrop.name}`,
          category: 'crop_growth',
          priority: 'medium',
          explanation: `${activeCrop.name} is currently in the Flowering stage. Boron and Potassium assimilation are critical to prevent blossom drop and encourage uniform fruit/pod setting.`,
          supporting_data: { crop: activeCrop.name, stage: activeCrop.growth_stage },
          suggested_action: 'Apply soluble Solubor (Boron 20%) @ 1g/L and 00:00:50 (Potassium Sulphate) @ 5g/L via drip or foliar spray.',
          data_source: 'CROP PHENOLOGY CALENDAR',
        });
      } else if (activeCrop.growth_stage === 'Vegetative') {
        insights.push({
          title: `Vegetative Canopy Acceleration: ${activeCrop.name}`,
          category: 'crop_growth',
          priority: 'low',
          explanation: `Active vegetative leaf development observed for ${activeCrop.name}. Ensure adequate nitrogenous top-dressing before flower bud differentiation.`,
          supporting_data: { crop: activeCrop.name, stage: activeCrop.growth_stage },
          suggested_action: 'Verify split urea scheduling or vermicompost top-dressing to maintain photosynthetic leaf index.',
          data_source: 'CROP PHENOLOGY CALENDAR',
        });
      }
    }

    // 4. Threshold Breaches & Alert Summary
    if (alerts && alerts.length > 0) {
      const activeCount = alerts.filter((a: any) => a.status === 'active').length;
      if (activeCount > 0) {
        insights.push({
          title: `${activeCount} Unresolved System Threshold Breaches`,
          category: 'pest_disease',
          priority: 'high',
          explanation: `There are ${activeCount} active threshold alerts registered across your virtual sensors requiring agronomist review.`,
          supporting_data: { active_alert_count: activeCount },
          suggested_action: 'Review the Alert Feed in the Monitoring Console and execute suggested corrective agronomic actions.',
          data_source: 'SYSTEM THRESHOLD ENGINE',
        });
      }
    }

    // Fallback default insight if no records exist yet
    if (insights.length === 0) {
      insights.push({
        title: 'Initial Agricultural Baselines Established',
        category: 'general',
        priority: 'low',
        explanation: 'AgroCloud AI has initialized monitoring parameters for your agricultural holdings. Live telemetry, weather trends, and crop cycle events will automatically generate prioritized agronomic insights.',
        supporting_data: { status: 'Ready' },
        suggested_action: 'Add your first farm and field or start the Virtual IoT simulation engine to see live dynamic insights.',
        data_source: 'AGROCLOUD ECOSYSTEM ENGINE',
      });
    }

    // Sort by priority (high > medium > low)
    const priorityWeights: Record<string, number> = { high: 3, medium: 2, low: 1 };
    insights.sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);

    return NextResponse.json({
      success: true,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API /api/ai/insights error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate farm insights.' },
      { status: 500 }
    );
  }
}

