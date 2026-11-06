import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type {
  Farm,
  Field,
  Crop,
  FarmingActivity,
  FarmingExpense,
} from '@/lib/supabase/types';

// Storage keys for local sandbox mode
const STORAGE_KEYS = {
  FARMS: 'agrocloud_farms',
  FIELDS: 'agrocloud_fields',
  CROPS: 'agrocloud_crops',
  ACTIVITIES: 'agrocloud_activities',
  EXPENSES: 'agrocloud_expenses',
};

function formatDbError(action: string, error: { message: string; code?: string }): Error {
  if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('not find the table')) {
    return new Error(
      `Database tables not yet initialized in Supabase. Please copy and run 'supabase/agrocloud_complete_schema.sql' in your Supabase SQL Editor.`
    );
  }
  return new Error(`Failed to ${action}: ${error.message}`);
}

// Realistic initial Indian Agricultural Dataset
const SEED_FARMS: Farm[] = [
  {
    id: 'farm-001',
    user_id: 'demo-farmer-001',
    name: 'Kolar Green Valley Farm',
    description: 'Commercial vegetable terrace & fruit orchard holding in the fertile Eastern Dry Zone of Karnataka.',
    state: 'Karnataka',
    district: 'Kolar',
    taluk: 'Bangarapet',
    village: 'Desihalli',
    pincode: '563114',
    address: 'Survey No. 142/2B, Near Bethamangala Road',
    area: 5.75,
    area_unit: 'acres',
    soil_type: 'Red Sandy Loam',
    irrigation_type: 'Drip Irrigation',
    ownership: 'owned',
    image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    notes: 'Borewell yield 2.5 inches; automated solenoid drip timer installed in 2025.',
    created_at: '2026-08-10T09:00:00Z',
    updated_at: '2026-10-24T14:30:00Z',
  },
  {
    id: 'farm-002',
    user_id: 'demo-farmer-001',
    name: 'Haveri Black Soil Plantation',
    description: 'Cotton and pulse rotational acreage along Tungabhadra river basin.',
    state: 'Karnataka',
    district: 'Haveri',
    taluk: 'Ranebennur',
    village: 'Chalageri',
    pincode: '581115',
    address: 'NH-4 Highway Crossing, Survey 89',
    area: 8.5,
    area_unit: 'acres',
    soil_type: 'Black Cotton Soil (Regur)',
    irrigation_type: 'Furrow / Flood Irrigation',
    ownership: 'leased',
    image_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
    notes: 'Lease active until 2029; high clay holding capacity requiring minimal summer watering.',
    created_at: '2026-09-01T11:00:00Z',
    updated_at: '2026-10-20T16:15:00Z',
  },
];

const SEED_FIELDS: Field[] = [
  {
    id: 'field-101',
    farm_id: 'farm-001',
    user_id: 'demo-farmer-001',
    name: 'North Terrace Field (Block A)',
    size: 3.5,
    area_unit: 'acres',
    soil_type: 'Red Sandy Loam',
    soil_ph: 6.8,
    irrigation_method: 'Drip Irrigation',
    water_source: 'Borewell / Deep Tube Well',
    description: 'High-density trellis tomato cultivation with mulching film.',
    notes: 'Soil organic carbon 0.65%; drip lines spaced at 4 feet.',
    created_at: '2026-08-12T10:00:00Z',
    updated_at: '2026-09-15T12:00:00Z',
  },
  {
    id: 'field-102',
    farm_id: 'farm-001',
    user_id: 'demo-farmer-001',
    name: 'South Slope Field (Block B)',
    size: 2.25,
    area_unit: 'acres',
    soil_type: 'Red Sandy Loam',
    soil_ph: 6.5,
    irrigation_method: 'Micro-Sprinkler',
    water_source: 'Farm Pond / Check Dam',
    description: 'Dedicated to green chilli (G4) and coriander intercropping.',
    notes: 'Equipped with solar fence to prevent wild boar encroachment.',
    created_at: '2026-08-14T10:30:00Z',
    updated_at: '2026-09-18T11:20:00Z',
  },
  {
    id: 'field-201',
    farm_id: 'farm-002',
    user_id: 'demo-farmer-001',
    name: 'Canal Ridge Plot',
    size: 5.0,
    area_unit: 'acres',
    soil_type: 'Black Cotton Soil (Regur)',
    soil_ph: 7.6,
    irrigation_method: 'Furrow / Flood Irrigation',
    water_source: 'Canal / River Network',
    description: 'Long-staple Bt Cotton planting.',
    notes: 'Good deep moisture retention; potassium application completed.',
    created_at: '2026-09-02T08:00:00Z',
    updated_at: '2026-10-01T09:00:00Z',
  },
  {
    id: 'field-202',
    farm_id: 'farm-002',
    user_id: 'demo-farmer-001',
    name: 'Lower Basin Field',
    size: 3.5,
    area_unit: 'acres',
    soil_type: 'Clay Loam',
    soil_ph: 7.2,
    irrigation_method: 'Rainfed (Monsoon Dependent)',
    water_source: 'Rainwater Harvesting',
    description: 'Yellow Soybean & Pigeon Pea (Arhar) pulse rotation.',
    notes: 'Nitrogen-fixing crop cycle preparing soil for rabi season.',
    created_at: '2026-09-03T09:00:00Z',
    updated_at: '2026-10-05T10:00:00Z',
  },
];

const SEED_CROPS: Crop[] = [
  {
    id: 'crop-201',
    farm_id: 'farm-001',
    field_id: 'field-101',
    user_id: 'demo-farmer-001',
    name: 'Tomato',
    variety: 'Syngenta Sahu-522',
    sowing_date: '2026-09-15',
    expected_harvest_date: '2026-12-10',
    growth_stage: 'Flowering',
    status: 'active',
    yield_quantity: null,
    yield_unit: 'quintals',
    notes: 'Flower cluster initiation observed; applying 19:19:19 water-soluble fertigation.',
    created_at: '2026-09-15T08:00:00Z',
    updated_at: '2026-10-28T14:00:00Z',
  },
  {
    id: 'crop-202',
    farm_id: 'farm-001',
    field_id: 'field-102',
    user_id: 'demo-farmer-001',
    name: 'Green Chilli',
    variety: 'Teja-334 Hot',
    sowing_date: '2026-08-20',
    expected_harvest_date: '2026-12-25',
    growth_stage: 'Yield Formation',
    status: 'active',
    yield_quantity: null,
    yield_unit: 'quintals',
    notes: 'First picking scheduled in 2 weeks; monitored with yellow sticky traps.',
    created_at: '2026-08-20T08:00:00Z',
    updated_at: '2026-10-25T11:00:00Z',
  },
  {
    id: 'crop-203',
    farm_id: 'farm-002',
    field_id: 'field-201',
    user_id: 'demo-farmer-001',
    name: 'Cotton',
    variety: 'Shankar-6 Long Staple',
    sowing_date: '2026-07-10',
    expected_harvest_date: '2026-11-30',
    growth_stage: 'Ripening',
    status: 'active',
    yield_quantity: null,
    yield_unit: 'quintals',
    notes: 'Bolls cracking open nicely; picking labor reserved.',
    created_at: '2026-07-10T07:00:00Z',
    updated_at: '2026-10-30T10:00:00Z',
  },
];

const SEED_ACTIVITIES: FarmingActivity[] = [
  {
    id: 'act-301',
    farm_id: 'farm-001',
    field_id: 'field-101',
    crop_id: 'crop-201',
    user_id: 'demo-farmer-001',
    activity_type: 'Fertilization',
    date: '2026-10-28',
    description: 'Injected 0:52:34 (MKP) via venturi drip system @ 4 kg/acre.',
    operator_name: 'Anand (Labor Supervisor)',
    cost: 1650,
    notes: 'Applied during morning 7 AM cycle.',
    created_at: '2026-10-28T09:30:00Z',
  },
  {
    id: 'act-302',
    farm_id: 'farm-001',
    field_id: 'field-101',
    crop_id: 'crop-201',
    user_id: 'demo-farmer-001',
    activity_type: 'Pruning',
    date: '2026-10-24',
    description: 'Removed lower side suckers and diseased bottom foliage to promote vertical canopy.',
    operator_name: '4 Field Laborers',
    cost: 2000,
    notes: 'Good air circulation achieved around stem collars.',
    created_at: '2026-10-24T17:00:00Z',
  },
  {
    id: 'act-303',
    farm_id: 'farm-001',
    field_id: 'field-102',
    crop_id: 'crop-202',
    user_id: 'demo-farmer-001',
    activity_type: 'Pesticide Spray',
    date: '2026-10-20',
    description: 'Prophylactic neem oil spray (10,000 ppm) for whitefly & thrips deterrence.',
    operator_name: 'Rajesh Gowda',
    cost: 850,
    notes: 'No chemical pesticide used this cycle.',
    created_at: '2026-10-20T08:00:00Z',
  },
  {
    id: 'act-304',
    farm_id: 'farm-002',
    field_id: 'field-201',
    crop_id: 'crop-203',
    user_id: 'demo-farmer-001',
    activity_type: 'Weeding',
    date: '2026-10-15',
    description: 'Inter-row mechanical cultivator weeding using mini tractor.',
    operator_name: 'Kumar Machinery Services',
    cost: 3200,
    notes: 'Soil aerated effectively between 3-ft rows.',
    created_at: '2026-10-15T16:00:00Z',
  },
  {
    id: 'act-305',
    farm_id: 'farm-001',
    field_id: 'field-101',
    crop_id: 'crop-201',
    user_id: 'demo-farmer-001',
    activity_type: 'Irrigation',
    date: '2026-11-02',
    description: '2.5 hour drip cycle following soil moisture telemetry trigger.',
    operator_name: 'Automated Controller',
    cost: 180,
    notes: 'Electricity charges recorded.',
    created_at: '2026-11-02T07:00:00Z',
  },
];

const SEED_EXPENSES: FarmingExpense[] = [
  {
    id: 'exp-401',
    farm_id: 'farm-001',
    field_id: 'field-101',
    crop_id: 'crop-201',
    user_id: 'demo-farmer-001',
    category: 'Seeds',
    amount: 5400,
    date: '2026-09-10',
    description: 'Purchased 6 packets Syngenta Sahu Hybrid Tomato seeds with GST invoice.',
    payment_method: 'UPI',
    created_at: '2026-09-10T11:00:00Z',
  },
  {
    id: 'exp-402',
    farm_id: 'farm-001',
    field_id: 'field-101',
    crop_id: 'crop-201',
    user_id: 'demo-farmer-001',
    category: 'Fertilizers',
    amount: 8800,
    date: '2026-09-18',
    description: 'Basal dose: DAP 50kg, MOP 50kg, and 5 tons enriched farmyard manure.',
    payment_method: 'Cash',
    created_at: '2026-09-18T14:00:00Z',
  },
  {
    id: 'exp-403',
    farm_id: 'farm-001',
    field_id: 'field-102',
    crop_id: 'crop-202',
    user_id: 'demo-farmer-001',
    category: 'Labor',
    amount: 6200,
    date: '2026-09-22',
    description: 'Nursery seedling transplanting and bed laying labor (8 workers).',
    payment_method: 'Cash',
    created_at: '2026-09-22T18:00:00Z',
  },
  {
    id: 'exp-404',
    farm_id: 'farm-001',
    field_id: 'field-101',
    crop_id: 'crop-201',
    user_id: 'demo-farmer-001',
    category: 'Machinery & Fuel',
    amount: 3600,
    date: '2026-09-08',
    description: 'Tractor rotavator deep tillage & raised bed formation (6 hours rental).',
    payment_method: 'UPI',
    created_at: '2026-09-08T16:00:00Z',
  },
  {
    id: 'exp-405',
    farm_id: 'farm-002',
    field_id: 'field-201',
    crop_id: 'crop-203',
    user_id: 'demo-farmer-001',
    category: 'Pesticides',
    amount: 4100,
    date: '2026-10-10',
    description: 'Bio-pesticide and pheromone trap lures for pink bollworm management.',
    payment_method: 'Card',
    created_at: '2026-10-10T12:00:00Z',
  },
  {
    id: 'exp-406',
    farm_id: 'farm-001',
    field_id: 'field-101',
    crop_id: 'crop-201',
    user_id: 'demo-farmer-001',
    category: 'Irrigation',
    amount: 4500,
    date: '2026-08-25',
    description: 'Replaced 200 meters inline drip lateral tubing and micro-emitters.',
    payment_method: 'UPI',
    created_at: '2026-08-25T15:00:00Z',
  },
];

// Helper to access LocalStorage safely
function getLocalItem<T>(key: string, seed: T): T {
  if (typeof window === 'undefined') return seed;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

function setLocalItem<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export const farmService = {
  // ============================================================================
  // FARMS CRUD
  // ============================================================================
  async getFarms(userId?: string): Promise<Farm[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let query = supabase.from('farms').select('*').order('created_at', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await query;
        if (error) {
          if (error.code === 'PGRST205') {
            console.warn('[Supabase Notice]: Table "farms" not found in schema cache. Run agrocloud_complete_schema.sql.');
            return [];
          }
          console.error('[Supabase getFarms error]:', error.message);
          throw new Error(`Supabase query failed: ${error.message}`);
        }
        return (data || []) as Farm[];
      }
    }
    const all = getLocalItem<Farm[]>(STORAGE_KEYS.FARMS, SEED_FARMS);
    if (!userId) return all;
    return all.filter((f) => f.user_id === userId || f.user_id === 'demo-farmer-001');
  },

  async getFarmById(farmId: string, userId?: string): Promise<Farm | null> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let query = supabase.from('farms').select('*').eq('id', farmId);
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await query.single();
        if (error) {
          if (error.code === 'PGRST116' || error.code === 'PGRST205') return null;
          console.error('[Supabase getFarmById error]:', error.message);
          throw new Error(`Supabase query failed: ${error.message}`);
        }
        return data as Farm;
      }
    }
    const all = await this.getFarms(userId);
    return all.find((f) => f.id === farmId) || null;
  },

  async createFarm(
    farmData: Omit<Farm, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<Farm> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('farms')
          .insert([{ ...farmData, user_id: userId }])
          .select()
          .single();
        if (error) {
          console.error('[Supabase createFarm error]:', error.message);
          throw formatDbError('save farm to Supabase', error);
        }
        return data as Farm;
      }
    }

    const newFarm: Farm = {
      ...farmData,
      id: `farm-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const all = getLocalItem<Farm[]>(STORAGE_KEYS.FARMS, SEED_FARMS);
    const updated = [newFarm, ...all];
    setLocalItem(STORAGE_KEYS.FARMS, updated);
    return newFarm;
  },

  async updateFarm(
    farmId: string,
    farmData: Partial<Farm>,
    userId?: string
  ): Promise<Farm | null> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any)
          .from('farms')
          .update({ ...farmData, updated_at: new Date().toISOString() })
          .eq('id', farmId);
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q.select().single();
        if (error) {
          console.error('[Supabase updateFarm error]:', error.message);
          throw formatDbError('update farm in Supabase', error);
        }
        return data as Farm;
      }
    }

    const all = getLocalItem<Farm[]>(STORAGE_KEYS.FARMS, SEED_FARMS);
    const idx = all.findIndex((f) => f.id === farmId);
    if (idx === -1) return null;

    const updatedFarm: Farm = {
      ...all[idx],
      ...farmData,
      updated_at: new Date().toISOString(),
    };
    all[idx] = updatedFarm;
    setLocalItem(STORAGE_KEYS.FARMS, all);
    return updatedFarm;
  },

  async deleteFarm(farmId: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = supabase.from('farms').delete().eq('id', farmId);
        if (userId) q = q.eq('user_id', userId);
        const { error } = await q;
        if (error) {
          console.error('[Supabase deleteFarm error]:', error.message);
          throw new Error(`Failed to delete farm from Supabase: ${error.message}`);
        }
        return true;
      }
    }

    // Local cascading delete
    const farms = getLocalItem<Farm[]>(STORAGE_KEYS.FARMS, SEED_FARMS).filter((f) => f.id !== farmId);
    const fields = getLocalItem<Field[]>(STORAGE_KEYS.FIELDS, SEED_FIELDS).filter((f) => f.farm_id !== farmId);
    const crops = getLocalItem<Crop[]>(STORAGE_KEYS.CROPS, SEED_CROPS).filter((c) => c.farm_id !== farmId);
    const activities = getLocalItem<FarmingActivity[]>(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES).filter(
      (a) => a.farm_id !== farmId
    );
    const expenses = getLocalItem<FarmingExpense[]>(STORAGE_KEYS.EXPENSES, SEED_EXPENSES).filter(
      (e) => e.farm_id !== farmId
    );

    setLocalItem(STORAGE_KEYS.FARMS, farms);
    setLocalItem(STORAGE_KEYS.FIELDS, fields);
    setLocalItem(STORAGE_KEYS.CROPS, crops);
    setLocalItem(STORAGE_KEYS.ACTIVITIES, activities);
    setLocalItem(STORAGE_KEYS.EXPENSES, expenses);

    return true;
  },

  // ============================================================================
  // FIELDS CRUD
  // ============================================================================
  async getFields(farmId?: string, userId?: string): Promise<Field[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = supabase.from('fields').select('*').order('created_at', { ascending: false });
        if (farmId) q = q.eq('farm_id', farmId);
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (error) {
          if (error.code === 'PGRST205') {
            console.warn('[Supabase Notice]: Table "fields" not found in schema cache. Run agrocloud_complete_schema.sql.');
            return [];
          }
          console.error('[Supabase getFields error]:', error.message);
          throw new Error(`Supabase query failed: ${error.message}`);
        }
        return (data || []) as Field[];
      }
    }

    const all = getLocalItem<Field[]>(STORAGE_KEYS.FIELDS, SEED_FIELDS);
    let filtered = all;
    if (userId) filtered = filtered.filter((f) => f.user_id === userId || f.user_id === 'demo-farmer-001');
    if (farmId) filtered = filtered.filter((f) => f.farm_id === farmId);
    return filtered;
  },

  async getFieldById(fieldId: string, userId?: string): Promise<Field | null> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = supabase.from('fields').select('*').eq('id', fieldId);
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q.single();
        if (error) {
          if (error.code === 'PGRST116' || error.code === 'PGRST205') return null;
          console.error('[Supabase getFieldById error]:', error.message);
          throw new Error(`Supabase query failed: ${error.message}`);
        }
        return data as Field;
      }
    }
    const all = await this.getFields(undefined, userId);
    return all.find((f) => f.id === fieldId) || null;
  },

  async createField(
    fieldData: Omit<Field, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<Field> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('fields')
          .insert([{ ...fieldData, user_id: userId }])
          .select()
          .single();
        if (error) {
          console.error('[Supabase createField error]:', error.message);
          throw formatDbError('save field to Supabase', error);
        }
        return data as Field;
      }
    }

    const newField: Field = {
      ...fieldData,
      id: `field-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const all = getLocalItem<Field[]>(STORAGE_KEYS.FIELDS, SEED_FIELDS);
    const updated = [newField, ...all];
    setLocalItem(STORAGE_KEYS.FIELDS, updated);
    return newField;
  },

  async updateField(
    fieldId: string,
    fieldData: Partial<Field>,
    userId?: string
  ): Promise<Field | null> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any)
          .from('fields')
          .update({ ...fieldData, updated_at: new Date().toISOString() })
          .eq('id', fieldId);
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q.select().single();
        if (error) {
          console.error('[Supabase updateField error]:', error.message);
          throw new Error(`Failed to update field in Supabase: ${error.message}`);
        }
        return data as Field;
      }
    }

    const all = getLocalItem<Field[]>(STORAGE_KEYS.FIELDS, SEED_FIELDS);
    const idx = all.findIndex((f) => f.id === fieldId);
    if (idx === -1) return null;

    const updatedField: Field = {
      ...all[idx],
      ...fieldData,
      updated_at: new Date().toISOString(),
    };
    all[idx] = updatedField;
    setLocalItem(STORAGE_KEYS.FIELDS, all);
    return updatedField;
  },

  async deleteField(fieldId: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = supabase.from('fields').delete().eq('id', fieldId);
        if (userId) q = q.eq('user_id', userId);
        const { error } = await q;
        if (error) {
          console.error('[Supabase deleteField error]:', error.message);
          throw new Error(`Failed to delete field from Supabase: ${error.message}`);
        }
        return true;
      }
    }

    const fields = getLocalItem<Field[]>(STORAGE_KEYS.FIELDS, SEED_FIELDS).filter((f) => f.id !== fieldId);
    const crops = getLocalItem<Crop[]>(STORAGE_KEYS.CROPS, SEED_CROPS).filter((c) => c.field_id !== fieldId);
    const activities = getLocalItem<FarmingActivity[]>(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES).filter(
      (a) => a.field_id !== fieldId
    );
    const expenses = getLocalItem<FarmingExpense[]>(STORAGE_KEYS.EXPENSES, SEED_EXPENSES).filter(
      (e) => e.field_id !== fieldId
    );

    setLocalItem(STORAGE_KEYS.FIELDS, fields);
    setLocalItem(STORAGE_KEYS.CROPS, crops);
    setLocalItem(STORAGE_KEYS.ACTIVITIES, activities);
    setLocalItem(STORAGE_KEYS.EXPENSES, expenses);
    return true;
  },

  // ============================================================================
  // CROPS CRUD
  // ============================================================================
  async getCrops(fieldId?: string, farmId?: string, userId?: string): Promise<Crop[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = supabase.from('crops').select('*').order('created_at', { ascending: false });
        if (fieldId) q = q.eq('field_id', fieldId);
        if (farmId) q = q.eq('farm_id', farmId);
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (error) {
          if (error.code === 'PGRST205') {
            console.warn('[Supabase Notice]: Table "crops" not found in schema cache. Run agrocloud_complete_schema.sql.');
            return [];
          }
          console.error('[Supabase getCrops error]:', error.message);
          throw new Error(`Supabase query failed: ${error.message}`);
        }
        return (data || []) as Crop[];
      }
    }

    const all = getLocalItem<Crop[]>(STORAGE_KEYS.CROPS, SEED_CROPS);
    let filtered = all;
    if (userId) filtered = filtered.filter((c) => c.user_id === userId || c.user_id === 'demo-farmer-001');
    if (farmId) filtered = filtered.filter((c) => c.farm_id === farmId);
    if (fieldId) filtered = filtered.filter((c) => c.field_id === fieldId);
    return filtered;
  },

  async createCrop(
    cropData: Omit<Crop, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<Crop> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('crops')
          .insert([{ ...cropData, user_id: userId }])
          .select()
          .single();
        if (error) {
          console.error('[Supabase createCrop error]:', error.message);
          throw formatDbError('save crop to Supabase', error);
        }
        return data as Crop;
      }
    }

    const newCrop: Crop = {
      ...cropData,
      id: `crop-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const all = getLocalItem<Crop[]>(STORAGE_KEYS.CROPS, SEED_CROPS);
    const updated = [newCrop, ...all];
    setLocalItem(STORAGE_KEYS.CROPS, updated);
    return newCrop;
  },

  async updateCrop(cropId: string, cropData: Partial<Crop>, userId?: string): Promise<Crop | null> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any)
          .from('crops')
          .update({ ...cropData, updated_at: new Date().toISOString() })
          .eq('id', cropId);
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q.select().single();
        if (error) {
          console.error('[Supabase updateCrop error]:', error.message);
          throw new Error(`Failed to update crop in Supabase: ${error.message}`);
        }
        return data as Crop;
      }
    }

    const all = getLocalItem<Crop[]>(STORAGE_KEYS.CROPS, SEED_CROPS);
    const idx = all.findIndex((c) => c.id === cropId);
    if (idx === -1) return null;

    const updatedCrop: Crop = {
      ...all[idx],
      ...cropData,
      updated_at: new Date().toISOString(),
    };
    all[idx] = updatedCrop;
    setLocalItem(STORAGE_KEYS.CROPS, all);
    return updatedCrop;
  },

  async deleteCrop(cropId: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = supabase.from('crops').delete().eq('id', cropId);
        if (userId) q = q.eq('user_id', userId);
        const { error } = await q;
        if (error) {
          console.error('[Supabase deleteCrop error]:', error.message);
          throw new Error(`Failed to delete crop from Supabase: ${error.message}`);
        }
        return true;
      }
    }

    const all = getLocalItem<Crop[]>(STORAGE_KEYS.CROPS, SEED_CROPS).filter((c) => c.id !== cropId);
    setLocalItem(STORAGE_KEYS.CROPS, all);
    return true;
  },

  // ============================================================================
  // ACTIVITIES CRUD
  // ============================================================================
  async getActivities(farmId?: string, fieldId?: string, userId?: string): Promise<FarmingActivity[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = supabase.from('farming_activities').select('*').order('date', { ascending: false });
        if (farmId) q = q.eq('farm_id', farmId);
        if (fieldId) q = q.eq('field_id', fieldId);
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (error) {
          if (error.code === 'PGRST205') {
            console.warn('[Supabase Notice]: Table "farming_activities" not found in schema cache.');
            return [];
          }
          console.error('[Supabase getActivities error]:', error.message);
          throw new Error(`Supabase query failed: ${error.message}`);
        }
        return (data || []) as FarmingActivity[];
      }
    }

    const all = getLocalItem<FarmingActivity[]>(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES);
    let filtered = all;
    if (userId) filtered = filtered.filter((a) => a.user_id === userId || a.user_id === 'demo-farmer-001');
    if (farmId) filtered = filtered.filter((a) => a.farm_id === farmId);
    if (fieldId) filtered = filtered.filter((a) => a.field_id === fieldId);
    return filtered;
  },

  async createActivity(
    activityData: Omit<FarmingActivity, 'id' | 'user_id' | 'created_at'>,
    userId: string
  ): Promise<FarmingActivity> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('farming_activities')
          .insert([{ ...activityData, user_id: userId }])
          .select()
          .single();
        if (error) {
          console.error('[Supabase createActivity error]:', error.message);
          throw formatDbError('save activity to Supabase', error);
        }
        return data as FarmingActivity;
      }
    }

    const newAct: FarmingActivity = {
      ...activityData,
      id: `act-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    const all = getLocalItem<FarmingActivity[]>(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES);
    const updated = [newAct, ...all];
    setLocalItem(STORAGE_KEYS.ACTIVITIES, updated);
    return newAct;
  },

  async deleteActivity(activityId: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = supabase.from('farming_activities').delete().eq('id', activityId);
        if (userId) q = q.eq('user_id', userId);
        const { error } = await q;
        if (error) {
          console.error('[Supabase deleteActivity error]:', error.message);
          throw new Error(`Failed to delete activity from Supabase: ${error.message}`);
        }
        return true;
      }
    }

    const all = getLocalItem<FarmingActivity[]>(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES).filter(
      (a) => a.id !== activityId
    );
    setLocalItem(STORAGE_KEYS.ACTIVITIES, all);
    return true;
  },

  // ============================================================================
  // EXPENSES CRUD
  // ============================================================================
  async getExpenses(farmId?: string, fieldId?: string, userId?: string): Promise<FarmingExpense[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = supabase.from('farming_expenses').select('*').order('date', { ascending: false });
        if (farmId) q = q.eq('farm_id', farmId);
        if (fieldId) q = q.eq('field_id', fieldId);
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (error) {
          if (error.code === 'PGRST205') {
            console.warn('[Supabase Notice]: Table "farming_expenses" not found in schema cache.');
            return [];
          }
          console.error('[Supabase getExpenses error]:', error.message);
          throw new Error(`Supabase query failed: ${error.message}`);
        }
        return (data || []) as FarmingExpense[];
      }
    }

    const all = getLocalItem<FarmingExpense[]>(STORAGE_KEYS.EXPENSES, SEED_EXPENSES);
    let filtered = all;
    if (userId) filtered = filtered.filter((e) => e.user_id === userId || e.user_id === 'demo-farmer-001');
    if (farmId) filtered = filtered.filter((e) => e.farm_id === farmId);
    if (fieldId) filtered = filtered.filter((e) => e.field_id === fieldId);
    return filtered;
  },

  async createExpense(
    expenseData: Omit<FarmingExpense, 'id' | 'user_id' | 'created_at'>,
    userId: string
  ): Promise<FarmingExpense> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('farming_expenses')
          .insert([{ ...expenseData, user_id: userId }])
          .select()
          .single();
        if (error) {
          console.error('[Supabase createExpense error]:', error.message);
          throw formatDbError('save expense to Supabase', error);
        }
        return data as FarmingExpense;
      }
    }

    const newExp: FarmingExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    const all = getLocalItem<FarmingExpense[]>(STORAGE_KEYS.EXPENSES, SEED_EXPENSES);
    const updated = [newExp, ...all];
    setLocalItem(STORAGE_KEYS.EXPENSES, updated);
    return newExp;
  },

  async deleteExpense(expenseId: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = supabase.from('farming_expenses').delete().eq('id', expenseId);
        if (userId) q = q.eq('user_id', userId);
        const { error } = await q;
        if (error) {
          console.error('[Supabase deleteExpense error]:', error.message);
          throw new Error(`Failed to delete expense from Supabase: ${error.message}`);
        }
        return true;
      }
    }

    const all = getLocalItem<FarmingExpense[]>(STORAGE_KEYS.EXPENSES, SEED_EXPENSES).filter(
      (e) => e.id !== expenseId
    );
    setLocalItem(STORAGE_KEYS.EXPENSES, all);
    return true;
  },

  // ============================================================================
  // AGGREGATE DASHBOARD STATISTICS (Calculated from Real Database Records)
  // ============================================================================
  async getDashboardStats(userId?: string) {
    const [farms, fields, crops, expenses] = await Promise.all([
      this.getFarms(userId),
      this.getFields(undefined, userId),
      this.getCrops(undefined, undefined, userId),
      this.getExpenses(undefined, undefined, userId),
    ]);

    const totalFarms = farms.length;
    const totalFields = fields.length;
    const activeCrops = crops.filter((c) => c.status === 'active').length;

    // Convert all areas to acres for total summation (1 hectare = 2.47105 acres)
    const totalAreaAcres = farms.reduce((acc, f) => {
      const acres = f.area_unit === 'hectares' ? f.area * 2.47105 : f.area;
      return acc + (Number(acres) || 0);
    }, 0);

    const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    return {
      totalFarms,
      totalCultivatedArea: Number(totalAreaAcres.toFixed(2)),
      totalFields,
      activeCrops,
      totalExpenses: Math.round(totalExpenses),
    };
  },
};

