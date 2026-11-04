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
    };
  };
};

