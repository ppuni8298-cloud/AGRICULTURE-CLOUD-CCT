import { z } from 'zod';

export const SENSOR_CATEGORIES = [
  { value: 'soil', label: 'Soil Probe (Capacitance & pH)' },
  { value: 'weather', label: 'Micro-Weather Station' },
  { value: 'temperature', label: 'Ambient Temperature Sensor' },
  { value: 'humidity', label: 'Relative Humidity Sensor' },
  { value: 'rainfall', label: 'Optical Rain Gauge' },
  { value: 'light', label: 'Solar Radiation / Lux Meter' },
  { value: 'multi_parameter', label: 'Multi-Parameter Agronomic Node' },
] as const;

export interface ParameterMetadata {
  name: string;
  unit: string;
  defaultMinThreshold: number;
  defaultMaxThreshold: number;
  absoluteMin: number;
  absoluteMax: number;
  description: string;
  recommendedCategory: string;
}

export const SENSOR_PARAMETERS: Record<string, ParameterMetadata> = {
  soil_moisture: {
    name: 'Soil Moisture',
    unit: '%',
    defaultMinThreshold: 35,
    defaultMaxThreshold: 80,
    absoluteMin: 0,
    absoluteMax: 100,
    description: 'Volumetric soil water content at root zone depth (15-30cm).',
    recommendedCategory: 'soil',
  },
  soil_temperature: {
    name: 'Soil Temperature',
    unit: '°C',
    defaultMinThreshold: 18,
    defaultMaxThreshold: 32,
    absoluteMin: 0,
    absoluteMax: 60,
    description: 'Sub-surface root temperature influencing nutrient assimilation.',
    recommendedCategory: 'soil',
  },
  air_temperature: {
    name: 'Air Temperature',
    unit: '°C',
    defaultMinThreshold: 15,
    defaultMaxThreshold: 38,
    absoluteMin: -10,
    absoluteMax: 60,
    description: 'Ambient canopy air temperature.',
    recommendedCategory: 'temperature',
  },
  air_humidity: {
    name: 'Air Humidity',
    unit: '%',
    defaultMinThreshold: 40,
    defaultMaxThreshold: 85,
    absoluteMin: 0,
    absoluteMax: 100,
    description: 'Relative humidity of the canopy air boundary.',
    recommendedCategory: 'humidity',
  },
  soil_ph: {
    name: 'Soil pH',
    unit: 'pH',
    defaultMinThreshold: 6.0,
    defaultMaxThreshold: 7.5,
    absoluteMin: 3.0,
    absoluteMax: 10.0,
    description: 'Hydrogen ion concentration affecting mineral solubility.',
    recommendedCategory: 'soil',
  },
  rainfall: {
    name: 'Rainfall',
    unit: 'mm',
    defaultMinThreshold: 0,
    defaultMaxThreshold: 50,
    absoluteMin: 0,
    absoluteMax: 300,
    description: 'Cumulative or rate precipitation measured at the canopy.',
    recommendedCategory: 'rainfall',
  },
  wind_speed: {
    name: 'Wind Speed',
    unit: 'km/h',
    defaultMinThreshold: 0,
    defaultMaxThreshold: 30,
    absoluteMin: 0,
    absoluteMax: 120,
    description: 'Anemometer wind velocity influencing spray drift & evapotranspiration.',
    recommendedCategory: 'weather',
  },
  light_intensity: {
    name: 'Light Intensity',
    unit: 'lux',
    defaultMinThreshold: 15000,
    defaultMaxThreshold: 85000,
    absoluteMin: 0,
    absoluteMax: 150000,
    description: 'Photosynthetically active ambient solar illuminance.',
    recommendedCategory: 'light',
  },
};

export const SENSOR_STATUSES = ['active', 'inactive', 'maintenance', 'offline'] as const;

export const READING_SOURCES = ['simulated', 'manual', 'csv'] as const;

export const SIMULATION_PROFILES = [
  { value: 'standard', label: 'Standard Normal (Typical Karnataka Day)' },
  { value: 'heatwave', label: 'Heatwave & Dry Stress (High Temp, Low Moisture)' },
  { value: 'monsoon', label: 'Monsoon Heavy Downpour (High Rain & Humidity)' },
  { value: 'drought', label: 'Severe Soil Moisture Depletion (Critical Alert)' },
  { value: 'optimal', label: 'Optimal Agronomic Equilibrium' },
] as const;

// 1. Sensor Registration / Edit Schema
export const sensorFormSchema = z.object({
  farm_id: z.string().min(1, 'Please select a farm holding'),
  field_id: z.string().min(1, 'Please select a field partition'),
  sensor_name: z.string().min(2, 'Sensor name must be at least 2 characters').max(80),
  sensor_code: z
    .string()
    .min(3, 'Sensor code must be at least 3 characters')
    .max(30)
    .regex(/^[A-Za-z0-9-_]+$/, 'Code can only contain letters, numbers, hyphens, and underscores'),
  sensor_type: z.enum([
    'soil',
    'weather',
    'temperature',
    'humidity',
    'rainfall',
    'light',
    'multi_parameter',
  ]),
  parameter: z.enum([
    'soil_moisture',
    'soil_temperature',
    'air_temperature',
    'air_humidity',
    'soil_ph',
    'rainfall',
    'wind_speed',
    'light_intensity',
  ]),
  unit: z.string().min(1, 'Unit is required'),
  min_threshold: z.coerce.number(),
  max_threshold: z.coerce.number(),
  status: z.enum(SENSOR_STATUSES).default('active'),
  description: z.string().max(300).optional().nullable(),
});

export type SensorFormData = z.infer<typeof sensorFormSchema>;

// 2. Manual Reading Schema
export const manualReadingSchema = z.object({
  sensor_id: z.string().min(1, 'Please select a virtual sensor'),
  parameter: z.enum([
    'soil_moisture',
    'soil_temperature',
    'air_temperature',
    'air_humidity',
    'soil_ph',
    'rainfall',
    'wind_speed',
    'light_intensity',
  ]),
  value: z.coerce.number(),
  unit: z.string().min(1),
  recorded_at: z.string().min(1, 'Date and time is required'),
  notes: z.string().max(300).optional().nullable(),
});

export type ManualReadingFormData = z.infer<typeof manualReadingSchema>;

// 3. CSV Upload Row Schema
export const csvRowSchema = z.object({
  sensor_id: z.string().min(1, 'sensor_id is required'),
  parameter: z.string().min(1, 'parameter is required'),
  value: z.coerce.number({ invalid_type_error: 'value must be a valid number' }),
  unit: z.string().min(1, 'unit is required'),
  recorded_at: z.string().min(1, 'recorded_at timestamp is required'),
  notes: z.string().optional(),
});

