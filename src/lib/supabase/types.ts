export type UserRole = 'Farmer' | 'Agricultural Consultant' | 'Administrator';
export type AppTheme = 'light' | 'dark' | 'system';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  preferred_language: string;
  state?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: AppTheme;
  language: string;
  notification_preferences: {
    email_alerts: boolean;
    sms_weather: boolean;
    mandi_updates: boolean;
    disease_warnings: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}

// ==============================================================================
// PHASE 2 DATA MODELS: Farms, Fields, Crops, Activities, Expenses
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
    };
  };
};
