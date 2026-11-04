import { z } from 'zod';

export const SOIL_TYPES = [
  'Red Sandy Loam',
  'Black Cotton Soil (Regur)',
  'Alluvial Soil',
  'Clay Loam',
  'Laterite Soil',
  'Silty Loam',
  'Sandy Soil',
  'Peaty / Marshy Soil',
] as const;

export const IRRIGATION_TYPES = [
  'Drip Irrigation',
  'Sprinkler Irrigation',
  'Furrow / Flood Irrigation',
  'Rainfed (Monsoon Dependent)',
  'Micro-Sprinkler',
  'Borewell / Tube Well',
  'Canal Lift Irrigation',
] as const;

export const WATER_SOURCES = [
  'Borewell / Deep Tube Well',
  'Open Well',
  'Canal / River Network',
  'Farm Pond / Check Dam',
  'Municipal / Cooperative Supply',
  'Rainwater Harvesting',
] as const;

export const FARM_OWNERSHIP = ['owned', 'leased', 'shared'] as const;

export const CROP_GROWTH_STAGES = [
  'Sowing',
  'Germination',
  'Vegetative',
  'Flowering',
  'Yield Formation',
  'Ripening',
  'Harvested',
] as const;

export const CROP_STATUSES = ['active', 'harvested', 'failed'] as const;

export const EXPENSE_CATEGORIES = [
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Machinery & Fuel',
  'Labor',
  'Irrigation',
  'Storage & Logistics',
  'Other',
] as const;

export const ACTIVITY_TYPES = [
  'Sowing',
  'Weeding',
  'Irrigation',
  'Fertilization',
  'Pesticide Spray',
  'Pruning',
  'Harvesting',
  'Soil Test',
  'Other',
] as const;

// 1. Farm Form Schema
export const farmFormSchema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters').max(100, 'Farm name is too long'),
  description: z.string().max(500, 'Description is too long').optional().nullable(),
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  taluk: z.string().max(80).optional().nullable(),
  village: z.string().max(80).optional().nullable(),
  pincode: z.string().regex(/^\d{6}$/, 'PIN code must be a 6-digit number').optional().nullable().or(z.literal('')),
  address: z.string().max(250).optional().nullable(),
  area: z.coerce.number().positive('Area must be greater than 0'),
  area_unit: z.enum(['acres', 'hectares']).default('acres'),
  soil_type: z.string().min(2, 'Please select a soil type'),
  irrigation_type: z.string().min(2, 'Please select an irrigation type'),
  ownership: z.enum(FARM_OWNERSHIP).default('owned'),
  image_url: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  notes: z.string().max(500).optional().nullable(),
});

export type FarmFormData = z.infer<typeof farmFormSchema>;

// 2. Field Form Schema
export const fieldFormSchema = z.object({
  farm_id: z.string().min(1, 'Please select a parent farm'),
  name: z.string().min(2, 'Field name must be at least 2 characters').max(80, 'Field name is too long'),
  size: z.coerce.number().positive('Field size must be greater than 0'),
  area_unit: z.enum(['acres', 'hectares']).default('acres'),
  soil_type: z.string().min(2, 'Please select a soil type'),
  soil_ph: z.coerce
    .number()
    .min(3.0, 'pH must be at least 3.0')
    .max(10.0, 'pH cannot exceed 10.0')
    .optional()
    .nullable()
    .or(z.literal(NaN).transform(() => null)),
  irrigation_method: z.string().min(2, 'Please select an irrigation method'),
  water_source: z.string().optional().nullable(),
  description: z.string().max(300).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type FieldFormData = z.infer<typeof fieldFormSchema>;

// 3. Crop Form Schema
export const cropFormSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().min(1, 'Field is required'),
  name: z.string().min(2, 'Crop name must be at least 2 characters'),
  variety: z.string().max(80).optional().nullable(),
  sowing_date: z.string().min(1, 'Sowing date is required'),
  expected_harvest_date: z.string().optional().nullable(),
  actual_harvest_date: z.string().optional().nullable(),
  growth_stage: z.enum(CROP_GROWTH_STAGES).default('Vegetative'),
  status: z.enum(CROP_STATUSES).default('active'),
  yield_quantity: z.coerce.number().nonnegative().optional().nullable().or(z.literal(NaN).transform(() => null)),
  yield_unit: z.string().default('quintals'),
  notes: z.string().max(500).optional().nullable(),
});

export type CropFormData = z.infer<typeof cropFormSchema>;

// 4. Activity Form Schema
export const activityFormSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().min(1, 'Field is required'),
  crop_id: z.string().optional().nullable(),
  activity_type: z.enum(ACTIVITY_TYPES),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(3, 'Please provide a description of the activity'),
  operator_name: z.string().max(80).optional().nullable(),
  cost: z.coerce.number().nonnegative('Cost cannot be negative').default(0),
  notes: z.string().max(500).optional().nullable(),
});

export type ActivityFormData = z.infer<typeof activityFormSchema>;

// 5. Expense Form Schema
export const expenseFormSchema = z.object({
  farm_id: z.string().min(1, 'Farm is required'),
  field_id: z.string().optional().nullable(),
  crop_id: z.string().optional().nullable(),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(3, 'Please describe the expense'),
  payment_method: z.string().default('Cash'),
  receipt_url: z.string().url().optional().nullable().or(z.literal('')),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

