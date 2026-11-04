import type { Farm, Field, Crop, SensorReading, IrrigationRecommendation } from '@/lib/supabase/types';
import type { WeatherData } from '@/lib/services/weatherService';

export interface IrrigationAnalysisResult {
  status: 'URGENT' | 'RECOMMENDED' | 'POSTPONE' | 'OPTIMAL' | 'OVER_SATURATED' | 'INSUFFICIENT_DATA';
  statusTitle: string;
  statusBadgeColor: string;
  recommendation: string;
  explanation: string;
  soilMoistureValue: number | null;
  soilMoistureStatus: string;
  recentRainfallMm: number;
  forecastRainfallMm: number;
  forecastRainProbability: number;
  dataSources: string[];
  limitations: string;
  cropName?: string;
  growthStage?: string;
  soilType?: string;
  irrigationMethod?: string;
}

export const irrigationService = {
  /**
   * Rule-based agronomic evaluation of field moisture and weather forecasts
   */
  evaluateIrrigation(params: {
    farm: Farm;
    field: Field;
    activeCrop?: Crop | null;
    latestMoistureReading?: SensorReading | null;
    userCustomMinMoisture?: number;
    userCustomMaxMoisture?: number;
    weather?: WeatherData | null;
  }): IrrigationAnalysisResult {
    const {
      farm,
      field,
      activeCrop,
      latestMoistureReading,
      userCustomMinMoisture,
      userCustomMaxMoisture,
      weather,
    } = params;

    const dataSources: string[] = [];
    if (latestMoistureReading) {
      dataSources.push(`Soil Moisture: ${latestMoistureReading.value}% (${latestMoistureReading.data_source.toUpperCase()})`);
    } else {
      dataSources.push('Soil Moisture: None registered (Threshold check unavailable)');
    }

    if (weather) {
      dataSources.push(`Weather: Open-Meteo (${weather.dataSource === 'OPEN_METEO_LIVE' ? 'Live API' : 'Cached'})`);
    }

    if (activeCrop) {
      dataSources.push(`Crop Cycle: ${activeCrop.name} (${activeCrop.growth_stage})`);
    }

    // Moisture limits
    const minMoisture = userCustomMinMoisture ?? 40;
    const maxMoisture = userCustomMaxMoisture ?? 75;

    // Forecast rain in next 24-48 hours
    const forecastRainSum = weather?.daily?.[0]?.precipitationSum || 0;
    const tomorrowRainSum = weather?.daily?.[1]?.precipitationSum || 0;
    const next24hRainProbability = Math.max(
      weather?.current?.rain || 0,
      weather?.daily?.[0]?.precipitationProbability || 0,
      weather?.hourly?.[0]?.precipitationProbability || 0
    );
    const recentRainfall = weather?.current?.precipitation || 0;

    const moisture = latestMoistureReading ? Number(latestMoistureReading.value) : null;

    // When no moisture telemetry is available
    if (moisture === null) {
      return {
        status: 'INSUFFICIENT_DATA',
        statusTitle: 'Insufficient Telemetry Data',
        statusBadgeColor: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300',
        recommendation:
          'No active virtual soil moisture readings detected for this field. Enter a manual reading or start a virtual probe simulation to calculate irrigation advisories.',
        explanation:
          'Rule-based calculation requires either a registered virtual FDR moisture probe, an uploaded CSV log, or a manual reading entry.',
        soilMoistureValue: null,
        soilMoistureStatus: 'Telemetry Not Found',
        recentRainfallMm: recentRainfall,
        forecastRainfallMm: forecastRainSum + tomorrowRainSum,
        forecastRainProbability: next24hRainProbability,
        dataSources,
        limitations:
          'Advisory generated without real-time soil capacitance data. Physical soil ball testing or visual inspection advised before pump operation.',
        cropName: activeCrop?.name,
        growthStage: activeCrop?.growth_stage,
        soilType: field.soil_type,
        irrigationMethod: field.irrigation_method,
      };
    }

    // Moisture status text
    let moistureStatusText = 'Optimal (Field Capacity)';
    if (moisture < minMoisture) moistureStatusText = `Below Minimum Threshold (${minMoisture}%)`;
    else if (moisture > maxMoisture) moistureStatusText = `Above Maximum Threshold (${maxMoisture}%)`;

    // Rule 1: Impending rain event (>10mm or >65% probability)
    const heavyRainComing = forecastRainSum >= 8 || tomorrowRainSum >= 12 || next24hRainProbability >= 65;

    if (heavyRainComing && moisture >= minMoisture - 5) {
      return {
        status: 'POSTPONE',
        statusTitle: 'Postpone Planned Irrigation (Precipitation Expected)',
        statusBadgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
        recommendation: `Rainfall (${(forecastRainSum + tomorrowRainSum).toFixed(1)} mm, ${next24hRainProbability}% probability) is forecast across ${farm.district}. Postpone scheduled irrigation to prevent waterlogging and fertilizer leaching.`,
        explanation: `Soil moisture is at ${moisture}% (safe minimum is ${minMoisture}%). Given the meteorological rain projection for the next 24-48 hours, natural precipitation will recharge the root zone without electric pumping expenditure.`,
        soilMoistureValue: moisture,
        soilMoistureStatus: moistureStatusText,
        recentRainfallMm: recentRainfall,
        forecastRainfallMm: Number((forecastRainSum + tomorrowRainSum).toFixed(1)),
        forecastRainProbability: next24hRainProbability,
        dataSources,
        limitations:
          'Rainfall forecast is probabilistic based on Open-Meteo numerical weather prediction models; local micro-climate convective showers may vary.',
        cropName: activeCrop?.name,
        growthStage: activeCrop?.growth_stage,
        soilType: field.soil_type,
        irrigationMethod: field.irrigation_method,
      };
    }

    // Rule 2: Soil Over-saturated
    if (moisture > maxMoisture + 10) {
      return {
        status: 'OVER_SATURATED',
        statusTitle: 'Soil Saturation / Anaerobic Root Stress Risk',
        statusBadgeColor: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-300',
        recommendation: `Soil moisture is exceptionally high at ${moisture}%, crossing the maximum ${maxMoisture}% limit. Suspend all watering and inspect plot drainage ditches.`,
        explanation: `Excess sub-soil moisture starves root hairs of oxygen, fostering fungal collar rot and wilting in sensitive crops like ${activeCrop?.name || 'vegetables'}.`,
        soilMoistureValue: moisture,
        soilMoistureStatus: 'Excessively Saturated',
        recentRainfallMm: recentRainfall,
        forecastRainfallMm: Number(forecastRainSum.toFixed(1)),
        forecastRainProbability: next24hRainProbability,
        dataSources,
        limitations: 'High clay soils (like Black Cotton Soil) retain water longer and take 48-72h to drain naturally.',
        cropName: activeCrop?.name,
        growthStage: activeCrop?.growth_stage,
        soilType: field.soil_type,
        irrigationMethod: field.irrigation_method,
      };
    }

    // Rule 3: Depleted Soil Moisture (Below minimum)
    if (moisture < minMoisture) {
      const isCriticalStage = activeCrop && ['Flowering', 'Yield Formation'].includes(activeCrop.growth_stage);

      return {
        status: isCriticalStage ? 'URGENT' : 'RECOMMENDED',
        statusTitle: isCriticalStage
          ? 'Urgent Irrigation Advisory (Critical Flowering Window)'
          : 'Irrigation Recommended (Depleted Soil Moisture)',
        statusBadgeColor: isCriticalStage
          ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
          : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
        recommendation: `Soil moisture (${moisture}%) has dropped below the farmer-configured minimum threshold (${minMoisture}%). Initiate a ${field.irrigation_method} cycle.`,
        explanation: isCriticalStage
          ? `${activeCrop?.name} is in the moisture-sensitive "${activeCrop?.growth_stage}" stage. Prolonged moisture stress at this stage causes flower abscission and yield drop.`
          : `Moisture depletion in ${field.soil_type} has reached stress levels. Standard irrigation cycle recommended during early morning or late afternoon to minimize evaporative loss.`,
        soilMoistureValue: moisture,
        soilMoistureStatus: moistureStatusText,
        recentRainfallMm: recentRainfall,
        forecastRainfallMm: Number(forecastRainSum.toFixed(1)),
        forecastRainProbability: next24hRainProbability,
        dataSources,
        limitations:
          'Rule-based calculation; does not command physical solenoid valves. Verify pump pressure and emitter lines before operation.',
        cropName: activeCrop?.name,
        growthStage: activeCrop?.growth_stage,
        soilType: field.soil_type,
        irrigationMethod: field.irrigation_method,
      };
    }

    // Rule 4: Optimal equilibrium
    return {
      status: 'OPTIMAL',
      statusTitle: 'Optimal Soil Moisture Equilibrium',
      statusBadgeColor: 'bg-lime-100 text-lime-900 border-lime-300 dark:bg-lime-950 dark:text-lime-300',
      recommendation: `Soil moisture (${moisture}%) is well within the comfortable agronomic range (${minMoisture}% – ${maxMoisture}%). Continue standard monitoring.`,
      explanation: `Current root-zone moisture conditions provide sufficient capillary water for transpiration without oxygen starvation. No immediate water input required.`,
      soilMoistureValue: moisture,
      soilMoistureStatus: 'Adequate Moisture Available',
      recentRainfallMm: recentRainfall,
      forecastRainfallMm: Number(forecastRainSum.toFixed(1)),
      forecastRainProbability: next24hRainProbability,
      dataSources,
      limitations: 'Continue checking telemetry twice daily during peak summer or high wind conditions.',
      cropName: activeCrop?.name,
      growthStage: activeCrop?.growth_stage,
      soilType: field.soil_type,
      irrigationMethod: field.irrigation_method,
    };
  },
};

