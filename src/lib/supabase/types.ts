export type UserRole =
  | 'Farmer'
  | 'Agricultural Consultant'
  | 'Administrator'
  | 'farmer'
  | 'agronomist'
  | 'researcher'
  | 'student'
  | 'fpo_manager';

export type AppTheme = 'light' | 'dark' | 'system';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  phone_number?: string | null;
  preferred_language: string;
  theme?: 'light' | 'dark' | 'system';
  role: UserRole;
  state?: string | null;
  district?: string | null;
  village?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  weather_alerts_enabled: boolean;
  mandi_alerts_enabled: boolean;
  disease_detection_notifications: boolean;
  irrigation_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactInquiry {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  subject: string;
  message: string;
  preferred_language: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
}

// ==============================================================================
// PHASE 2: FARM, FIELD, CROP & FINANCE TYPES
// ==============================================================================

export type FarmOwnership = 'owned' | 'leased' | 'shared';

export type CropGrowthStage =
  | 'Sowing'
  | 'Germination'
  | 'Vegetative'
  | 'Flowering'
  | 'Yield Formation'
  | 'Ripening'
  | 'Harvested';

export type CropStatus = 'active' | 'harvested' | 'failed';

export type ExpenseCategory =
  | 'Seeds'
  | 'Fertilizers'
  | 'Pesticides'
  | 'Machinery & Fuel'
  | 'Labor'
  | 'Irrigation'
  | 'Storage & Logistics'
  | 'Other';

export type ActivityType =
  | 'Sowing'
  | 'Weeding'
  | 'Irrigation'
  | 'Fertilization'
  | 'Pesticide Spray'
  | 'Pruning'
  | 'Harvesting'
  | 'Soil Test'
  | 'Other';

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  state: string;
  district: string;
  taluk?: string | null;
  village?: string | null;
  pincode?: string | null;
  address?: string | null;
  area: number;
  area_unit: 'acres' | 'hectares';
  soil_type: string;
  irrigation_type: string;
  ownership: FarmOwnership;
  image_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Field {
  id: string;
  farm_id: string;
  user_id: string;
  name: string;
  size: number;
  area_unit: 'acres' | 'hectares';
  soil_type: string;
  soil_ph?: number | null;
  irrigation_method: string;
  water_source?: string | null;
  description?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Crop {
  id: string;
  field_id: string;
  farm_id: string;
  user_id: string;
  name: string;
  variety?: string | null;
  sowing_date: string;
  expected_harvest_date?: string | null;
  actual_harvest_date?: string | null;
  growth_stage: CropGrowthStage;
  status: CropStatus;
  yield_quantity?: number | null;
  yield_unit?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmingActivity {
  id: string;
  farm_id: string;
  field_id: string;
  crop_id?: string | null;
  user_id: string;
  activity_type: ActivityType;
  date: string;
  description: string;
  operator_name?: string | null;
  cost?: number;
  notes?: string | null;
  created_at: string;
}

export interface FarmingExpense {
  id: string;
  farm_id: string;
  field_id?: string | null;
  crop_id?: string | null;
  user_id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  payment_method?: string;
  receipt_url?: string | null;
  created_at: string;
}

// ==============================================================================
// PHASE 3: VIRTUAL IOT, WEATHER INTELLIGENCE & SMART MONITORING
// ==============================================================================

export type SensorCategory =
  | 'soil'
  | 'weather'
  | 'temperature'
  | 'humidity'
  | 'rainfall'
  | 'light'
  | 'multi_parameter';

export type SensorParameter =
  | 'soil_moisture'
  | 'soil_temperature'
  | 'air_temperature'
  | 'air_humidity'
  | 'soil_ph'
  | 'rainfall'
  | 'wind_speed'
  | 'light_intensity';

export type SensorStatus = 'active' | 'inactive' | 'maintenance' | 'offline';

export type ReadingSource = 'simulated' | 'manual' | 'csv';

export type SimulationStatus = 'running' | 'paused' | 'stopped';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface IoTSensor {
  id: string;
  user_id: string;
  farm_id: string;
  field_id: string;
  sensor_name: string;
  sensor_code: string;
  sensor_type: SensorCategory;
  parameter: SensorParameter;
  unit: string;
  min_threshold: number;
  max_threshold: number;
  status: SensorStatus;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SensorReading {
  id: string;
  user_id: string;
  sensor_id: string;
  farm_id: string;
  field_id: string;
  parameter: SensorParameter;
  value: number;
  unit: string;
  data_source: ReadingSource;
  notes?: string | null;
  recorded_at: string;
  created_at: string;
}

export interface SensorSimulation {
  id: string;
  user_id: string;
  sensor_id: string;
  status: SimulationStatus;
  interval_seconds: number;
  simulation_profile: string;
  started_at?: string | null;
  stopped_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonitoringAlert {
  id: string;
  user_id: string;
  farm_id: string;
  field_id: string;
  sensor_id: string;
  alert_type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  triggered_value: number;
  threshold_value: number;
  status: AlertStatus;
  recommended_action?: string | null;
  created_at: string;
  resolved_at?: string | null;
}

export interface IrrigationRecommendation {
  id: string;
  user_id: string;
  farm_id: string;
  field_id: string;
  crop_id?: string | null;
  soil_moisture?: number | null;
  rainfall?: number | null;
  recommendation: string;
  explanation: string;
  data_sources: string;
  created_at: string;
}

export interface WeatherCache {
  id: string;
  farm_id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  weather_payload: any;
  fetched_at: string;
  expires_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      contact_inquiries: {
        Row: ContactInquiry;
        Insert: Omit<ContactInquiry, 'id' | 'status' | 'created_at'>;
        Update: Partial<Omit<ContactInquiry, 'id' | 'created_at'>>;
      };
      farms: {
        Row: Farm;
        Insert: Omit<Farm, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Farm, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      fields: {
        Row: Field;
        Insert: Omit<Field, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Field, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      crops: {
        Row: Crop;
        Insert: Omit<Crop, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Crop, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      farming_activities: {
        Row: FarmingActivity;
        Insert: Omit<FarmingActivity, 'id' | 'created_at'>;
        Update: Partial<Omit<FarmingActivity, 'id' | 'user_id' | 'created_at'>>;
      };
      farming_expenses: {
        Row: FarmingExpense;
        Insert: Omit<FarmingExpense, 'id' | 'created_at'>;
        Update: Partial<Omit<FarmingExpense, 'id' | 'user_id' | 'created_at'>>;
      };
      iot_sensors: {
        Row: IoTSensor;
        Insert: Omit<IoTSensor, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<IoTSensor, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      sensor_readings: {
        Row: SensorReading;
        Insert: Omit<SensorReading, 'id' | 'created_at'>;
        Update: Partial<Omit<SensorReading, 'id' | 'user_id' | 'created_at'>>;
      };
      sensor_simulations: {
        Row: SensorSimulation;
        Insert: Omit<SensorSimulation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SensorSimulation, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      monitoring_alerts: {
        Row: MonitoringAlert;
        Insert: Omit<MonitoringAlert, 'id' | 'created_at'>;
        Update: Partial<Omit<MonitoringAlert, 'id' | 'user_id' | 'created_at'>>;
      };
      irrigation_recommendations: {
        Row: IrrigationRecommendation;
        Insert: Omit<IrrigationRecommendation, 'id' | 'created_at'>;
        Update: Partial<Omit<IrrigationRecommendation, 'id' | 'user_id' | 'created_at'>>;
      };
      weather_cache: {
        Row: WeatherCache;
        Insert: Omit<WeatherCache, 'id'>;
        Update: Partial<Omit<WeatherCache, 'id' | 'user_id'>>;
      };
    };
  };
};
