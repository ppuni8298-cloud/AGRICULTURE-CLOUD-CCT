import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type {
  DroneUpload,
  DroneAnalysis,
  DroneVisibleIssue,
  DroneSensorType,
} from '@/lib/supabase/types';

const STORAGE_KEYS = {
  UPLOADS: 'agrocloud_drone_uploads',
  ANALYSES: 'agrocloud_drone_analyses',
};

// Seed drone survey uploads
const SEED_DRONE_UPLOADS: DroneUpload[] = [
  {
    id: 'drone-up-001',
    farm_id: 'farm-001',
    field_id: 'field-101',
    user_id: 'demo-farmer-001',
    file_name: 'Survey_Ortho_Kolar_BlockA_20261028.jpg',
    file_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
    storage_path: 'drone_surveys/demo-farmer-001/Survey_Ortho_Kolar_BlockA_20261028.jpg',
    file_size_bytes: 8450120, // ~8.4 MB
    mime_type: 'image/jpeg',
    capture_date: '2026-10-28',
    sensor_type: 'rgb_standard',
    flight_altitude_m: 45.0,
    notes: 'Morning orthomosaic survey flown at 45m AGL with 75% front-lap and 70% side-lap.',
    created_at: '2026-10-28T08:30:00Z',
  },
  {
    id: 'drone-up-002',
    farm_id: 'farm-001',
    field_id: 'field-101',
    user_id: 'demo-farmer-001',
    file_name: 'Survey_Ortho_Kolar_BlockA_20261014.jpg',
    file_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1200&auto=format&fit=crop&q=80',
    storage_path: 'drone_surveys/demo-farmer-001/Survey_Ortho_Kolar_BlockA_20261014.jpg',
    file_size_bytes: 7890410,
    mime_type: 'image/jpeg',
    capture_date: '2026-10-14',
    sensor_type: 'rgb_standard',
    flight_altitude_m: 45.0,
    notes: 'Mid-flowering verification survey prior to systemic booster spray.',
    created_at: '2026-10-14T08:15:00Z',
  },
];

const SEED_DRONE_ANALYSES: Record<string, DroneAnalysis> = {
  'drone-up-001': {
    id: 'analysis-001',
    upload_id: 'drone-up-001',
    user_id: 'demo-farmer-001',
    crop_health_score: 87.5,
    canopy_coverage_percent: 84.2,
    visible_issues_json: [
      {
        issue: 'Interveinal Chlorosis (Mild Iron/Nitrogen Deficiency)',
        severity: 'moderate',
        confidence: 89,
        description: 'Noticeable yellowing on newly emerged leaves concentrated along the South-West lateral rows.',
        location_quadrant: 'SW Quadrant (Rows 14–18)',
      },
      {
        issue: 'Localized Weed Competition (Cyperus rotundus patch)',
        severity: 'low',
        confidence: 94,
        description: 'Dense sedge weed cluster along perimeter drip header pipeline.',
        location_quadrant: 'Northern Headland Border',
      },
    ],
    chlorosis_yellowing_detected: true,
    lodging_detected: false,
    weed_infestation_level: 'low',
    ai_model_used: 'AgroCloud Multi-Scale Vision v4.2 (ICAR-Agronomy Fine-Tuned)',
    recommendations_json: [
      'Apply chelated micronutrient spray (Fe-EDTA 0.5g/L + Zinc 1g/L) during early morning hours to resolve interveinal chlorosis.',
      'Conduct spot mechanical weeding along North border to prevent sedge rhizome spread into root zones.',
      'Verify drip lateral pressure at terminal emitters on SW rows to confirm uniform fertigation dosage.',
    ],
    created_at: '2026-10-28T09:00:00Z',
  },
};

export const droneAnalyticsService = {
  /**
   * Retrieves all drone uploads for a farm
   */
  async getUploadsByFarm(farmId: string): Promise<DroneUpload[]> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.UPLOADS);
      if (stored) {
        try {
          const list: DroneUpload[] = JSON.parse(stored);
          const filtered = list.filter((u) => u.farm_id === farmId);
          if (filtered.length > 0) return filtered;
        } catch (e) {
          console.error('Error reading drone uploads:', e);
        }
      }
    }
    return SEED_DRONE_UPLOADS.filter((u) => u.farm_id === farmId);
  },

  /**
   * Retrieves analysis by upload ID
   */
  async getAnalysisByUploadId(uploadId: string): Promise<DroneAnalysis | null> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.ANALYSES);
      if (stored) {
        try {
          const map: Record<string, DroneAnalysis> = JSON.parse(stored);
          if (map[uploadId]) return map[uploadId];
        } catch (e) {
          console.error('Error reading drone analyses:', e);
        }
      }
    }
    return SEED_DRONE_ANALYSES[uploadId] || null;
  },

  /**
   * Saves a new drone upload
   */
  async recordUpload(payload: {
    farm_id: string;
    field_id?: string | null;
    file_name: string;
    file_url: string;
    file_size_bytes: number;
    mime_type: string;
    capture_date: string;
    sensor_type: DroneSensorType;
    flight_altitude_m?: number;
    notes?: string;
  }): Promise<DroneUpload> {
    const upload: DroneUpload = {
      id: `drone-up-${Date.now()}`,
      farm_id: payload.farm_id,
      field_id: payload.field_id || null,
      user_id: 'demo-farmer-001',
      file_name: payload.file_name,
      file_url: payload.file_url,
      storage_path: `drone_surveys/${payload.file_name}`,
      file_size_bytes: payload.file_size_bytes,
      mime_type: payload.mime_type,
      capture_date: payload.capture_date,
      sensor_type: payload.sensor_type,
      flight_altitude_m: payload.flight_altitude_m || 40,
      notes: payload.notes || '',
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.UPLOADS);
      const list: DroneUpload[] = stored ? JSON.parse(stored) : [...SEED_DRONE_UPLOADS];
      list.unshift(upload);
      localStorage.setItem(STORAGE_KEYS.UPLOADS, JSON.stringify(list));
    }

    return upload;
  },

  /**
   * Triggers automated visual AI analysis for an uploaded drone photograph
   */
  async analyzeDroneImage(uploadId: string, cropName: string = 'Tomato'): Promise<DroneAnalysis> {
    // In production, would call /api/ai/diagnose or vision service
    const analysis: DroneAnalysis = {
      id: `analysis-${Date.now()}`,
      upload_id: uploadId,
      user_id: 'demo-farmer-001',
      crop_health_score: 86.0,
      canopy_coverage_percent: 81.5,
      visible_issues_json: [
        {
          issue: `Canopy Chlorosis / Color Gradient in ${cropName}`,
          severity: 'moderate',
          confidence: 91,
          description: 'Slight yellowing detected in upper sun-exposed foliage indicating possible nitrogen or iron mobility stress.',
          location_quadrant: 'Central Rows 8–12',
        },
        {
          issue: 'Minor Trampling / Soil Compaction Zone',
          severity: 'low',
          confidence: 88,
          description: 'Wheel track compaction along spray path causing delayed lateral stem branching.',
          location_quadrant: 'Access Track 2',
        },
      ],
      chlorosis_yellowing_detected: true,
      lodging_detected: false,
      weed_infestation_level: 'low',
      ai_model_used: 'AgroCloud Multi-Scale Vision v4.2 (ICAR-Agronomy Fine-Tuned)',
      recommendations_json: [
        `Check root-zone electrical conductivity (EC) to confirm fertilizer uptake for ${cropName}.`,
        'Apply foliar soluble nitrogen booster (19:19:19 @ 5g/L) during cool morning hours.',
        'Avoid heavy machinery movement during saturated soil conditions to prevent compaction.',
      ],
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.ANALYSES);
      const map: Record<string, DroneAnalysis> = stored ? JSON.parse(stored) : { ...SEED_DRONE_ANALYSES };
      map[uploadId] = analysis;
      localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(map));
    }

    return analysis;
  },
};
