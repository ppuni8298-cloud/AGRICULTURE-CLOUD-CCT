import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type {
  IoTSensor,
  SensorReading,
  MonitoringAlert,
  SensorParameter,
} from '@/lib/supabase/types';
import { SENSOR_PARAMETERS } from '@/lib/validations/monitoring';

const STORAGE_KEYS = {
  SENSORS: 'agrocloud_iot_sensors',
  READINGS: 'agrocloud_sensor_readings',
  ALERTS: 'agrocloud_monitoring_alerts',
};

// Initial Seed Virtual Sensors across Karnataka holdings
const SEED_SENSORS: IoTSensor[] = [
  {
    id: 'sensor-001',
    user_id: 'demo-farmer-001',
    farm_id: 'farm-001',
    field_id: 'field-101',
    sensor_name: 'North Terrace Soil Moisture Probe',
    sensor_code: 'KOL-SOIL-01',
    sensor_type: 'soil',
    parameter: 'soil_moisture',
    unit: '%',
    min_threshold: 40,
    max_threshold: 80,
    status: 'active',
    description: 'FDR soil capacitance probe calibrated for Red Sandy Loam at 15cm depth.',
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-24T12:00:00Z',
  },
  {
    id: 'sensor-002',
    user_id: 'demo-farmer-001',
    farm_id: 'farm-001',
    field_id: 'field-101',
    sensor_name: 'Block A Sub-surface Temperature',
    sensor_code: 'KOL-STEMP-01',
    sensor_type: 'temperature',
    parameter: 'soil_temperature',
    unit: '°C',
    min_threshold: 18,
    max_threshold: 32,
    status: 'active',
    description: 'Thermistor probe measuring soil microbial activity zone.',
    created_at: '2026-10-01T08:15:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'sensor-003',
    user_id: 'demo-farmer-001',
    farm_id: 'farm-001',
    field_id: 'field-101',
    sensor_name: 'Canopy Micro-Climate Air Temp',
    sensor_code: 'KOL-ATEMP-01',
    sensor_type: 'temperature',
    parameter: 'air_temperature',
    unit: '°C',
    min_threshold: 15,
    max_threshold: 36,
    status: 'active',
    description: 'Radiation-shielded air thermometer at tomato canopy height.',
    created_at: '2026-10-02T09:00:00Z',
    updated_at: '2026-10-22T14:00:00Z',
  },
  {
    id: 'sensor-004',
    user_id: 'demo-farmer-001',
    farm_id: 'farm-001',
    field_id: 'field-101',
    sensor_name: 'Canopy Relative Humidity Sensor',
    sensor_code: 'KOL-HUM-01',
    sensor_type: 'humidity',
    parameter: 'air_humidity',
    unit: '%',
    min_threshold: 45,
    max_threshold: 85,
    status: 'active',
    description: 'Capacitive relative humidity hygrometer for blight risk detection.',
    created_at: '2026-10-02T09:15:00Z',
    updated_at: '2026-10-22T14:30:00Z',
  },
  {
    id: 'sensor-005',
    user_id: 'demo-farmer-001',
    farm_id: 'farm-001',
    field_id: 'field-102',
    sensor_name: 'South Slope Soil pH Ion Probe',
    sensor_code: 'KOL-PH-01',
    sensor_type: 'soil',
    parameter: 'soil_ph',
    unit: 'pH',
    min_threshold: 6.0,
    max_threshold: 7.5,
    status: 'active',
    description: 'Glass electrode subsoil ion probe for chilli bed acid balance.',
    created_at: '2026-10-05T11:00:00Z',
    updated_at: '2026-10-20T16:00:00Z',
  },
  {
    id: 'sensor-006',
    user_id: 'demo-farmer-001',
    farm_id: 'farm-001',
    field_id: 'field-101',
    sensor_name: 'Farm Yard Optical Rain Gauge',
    sensor_code: 'KOL-RAIN-01',
    sensor_type: 'rainfall',
    parameter: 'rainfall',
    unit: 'mm',
    min_threshold: 0,
    max_threshold: 40,
    status: 'active',
    description: 'Tipping-bucket rainfall gauge measuring real-time cloud precipitation.',
    created_at: '2026-10-06T10:00:00Z',
    updated_at: '2026-10-25T08:00:00Z',
  },
  {
    id: 'sensor-007',
    user_id: 'demo-farmer-001',
    farm_id: 'farm-002',
    field_id: 'field-201',
    sensor_name: 'Haveri Basin Ultrasonic Anemometer',
    sensor_code: 'HAV-WIND-01',
    sensor_type: 'weather',
    parameter: 'wind_speed',
    unit: 'km/h',
    min_threshold: 0,
    max_threshold: 28,
    status: 'active',
    description: 'Measures horizontal wind drift over Black Cotton acreage.',
    created_at: '2026-10-10T12:00:00Z',
    updated_at: '2026-10-26T15:00:00Z',
  },
  {
    id: 'sensor-008',
    user_id: 'demo-farmer-001',
    farm_id: 'farm-002',
    field_id: 'field-201',
    sensor_name: 'Cotton Canopy Solar Lux Sensor',
    sensor_code: 'HAV-LUX-01',
    sensor_type: 'light',
    parameter: 'light_intensity',
    unit: 'lux',
    min_threshold: 12000,
    max_threshold: 80000,
    status: 'active',
    description: 'Silicon photodiode measuring PAR solar irradiance.',
    created_at: '2026-10-10T12:30:00Z',
    updated_at: '2026-10-26T15:30:00Z',
  },
];

// Generate 48 hours of realistic historical readings
function generateHistoricalSeedReadings(): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = Date.now();
  const ONE_HOUR = 3600 * 1000;

  // Parameters with realistic baseline and diurnal swing
  const paramProfiles: Record<string, { base: number; swing: number; unit: string; sensorId: string; farmId: string; fieldId: string }> = {
    soil_moisture: { base: 62, swing: 6, unit: '%', sensorId: 'sensor-001', farmId: 'farm-001', fieldId: 'field-101' },
    soil_temperature: { base: 25.5, swing: 3, unit: '°C', sensorId: 'sensor-002', farmId: 'farm-001', fieldId: 'field-101' },
    air_temperature: { base: 28.5, swing: 7, unit: '°C', sensorId: 'sensor-003', farmId: 'farm-001', fieldId: 'field-101' },
    air_humidity: { base: 68, swing: 16, unit: '%', sensorId: 'sensor-004', farmId: 'farm-001', fieldId: 'field-101' },
    soil_ph: { base: 6.7, swing: 0.2, unit: 'pH', sensorId: 'sensor-005', farmId: 'farm-001', fieldId: 'field-102' },
    rainfall: { base: 0, swing: 3, unit: 'mm', sensorId: 'sensor-006', farmId: 'farm-001', fieldId: 'field-101' },
    wind_speed: { base: 14, swing: 8, unit: 'km/h', sensorId: 'sensor-007', farmId: 'farm-002', fieldId: 'field-201' },
    light_intensity: { base: 45000, swing: 40000, unit: 'lux', sensorId: 'sensor-008', farmId: 'farm-002', fieldId: 'field-201' },
  };

  // Generate hourly readings for last 36 hours
  for (let i = 36; i >= 0; i--) {
    const time = new Date(now - i * ONE_HOUR);
    const hour = time.getHours();
    // Diurnal factor between -1 and 1 (peaks at 14:00, trough at 04:00)
    const diurnal = Math.sin(((hour - 8) / 24) * 2 * Math.PI);

    Object.entries(paramProfiles).forEach(([param, cfg]) => {
      let val = cfg.base + diurnal * cfg.swing;
      if (param === 'air_humidity') {
        // Humidity is inverse to temperature
        val = cfg.base - diurnal * cfg.swing;
      } else if (param === 'rainfall') {
        // Occasional light rain
        val = i === 12 || i === 13 ? 4.5 : i === 24 ? 2.0 : 0;
      } else if (param === 'light_intensity') {
        // Light is 0 during night (19:00 to 06:00)
        val = hour >= 6 && hour <= 18 ? Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI) * 82000) : 0;
      }

      // Add a small pseudo-random ripple
      const ripple = (Math.sin(i * 1.7) * (cfg.swing * 0.1));
      val = Math.max(0, val + ripple);
      if (param === 'soil_ph') val = Number(val.toFixed(2));
      else val = Number(val.toFixed(1));

      readings.push({
        id: `seed-reading-${param}-${i}`,
        user_id: 'demo-farmer-001',
        sensor_id: cfg.sensorId,
        farm_id: cfg.farmId,
        field_id: cfg.fieldId,
        parameter: param as SensorParameter,
        value: val,
        unit: cfg.unit,
        data_source: 'simulated',
        notes: i === 0 ? 'Latest virtual IoT telemetry' : undefined,
        recorded_at: time.toISOString(),
        created_at: time.toISOString(),
      });
    });
  }

  return readings;
}

const SEED_READINGS: SensorReading[] = generateHistoricalSeedReadings();

const SEED_ALERTS: MonitoringAlert[] = [
  {
    id: 'alert-001',
    user_id: 'demo-farmer-001',
    farm_id: 'farm-001',
    field_id: 'field-101',
    sensor_id: 'sensor-001',
    alert_type: 'Low Soil Moisture Threshold Exceeded',
    severity: 'warning',
    title: 'Soil Moisture Below Minimum Comfort Zone',
    description: 'North Terrace FDR probe recorded 38.2% volumetric moisture, crossing the 40% threshold.',
    triggered_value: 38.2,
    threshold_value: 40.0,
    status: 'active',
    recommended_action: 'Initiate 90-minute drip irrigation cycle during morning or early evening.',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'alert-002',
    user_id: 'demo-farmer-001',
    farm_id: 'farm-001',
    field_id: 'field-101',
    sensor_id: 'sensor-004',
    alert_type: 'High Ambient Humidity Alert',
    severity: 'info',
    title: 'Canopy Relative Humidity Elevated',
    description: 'Relative humidity rose to 88.5%, exceeding the 85% threshold. Fungal spore germination risk increased.',
    triggered_value: 88.5,
    threshold_value: 85.0,
    status: 'acknowledged',
    recommended_action: 'Ensure trellis aeration suckers are pruned; avoid late evening overhead sprinkling.',
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'alert-003',
    user_id: 'demo-farmer-001',
    farm_id: 'farm-002',
    field_id: 'field-201',
    sensor_id: 'sensor-007',
    alert_type: 'High Wind Velocity Alert',
    severity: 'warning',
    title: 'Excessive Wind Speed for Foliar Spray',
    description: 'Ultrasonic anemometer detected wind gusts of 33.4 km/h, exceeding the safe spray limit of 28 km/h.',
    triggered_value: 33.4,
    threshold_value: 28.0,
    status: 'resolved',
    recommended_action: 'Postpone pesticide spraying to prevent airborne chemical drift.',
    created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
];

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

export const iotService = {
  // ============================================================================
  // SENSORS CRUD
  // ============================================================================
  async getSensors(farmId?: string, fieldId?: string, userId?: string): Promise<IoTSensor[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any).from('iot_sensors').select('*').order('created_at', { ascending: false });
        if (farmId) q = q.eq('farm_id', farmId);
        if (fieldId) q = q.eq('field_id', fieldId);
        if (userId) q = q.eq('user_id', userId);
        const { data, error } = await q;
        if (!error && data) return data as IoTSensor[];
      }
    }

    const all = getLocalItem<IoTSensor[]>(STORAGE_KEYS.SENSORS, SEED_SENSORS);
    let filtered = all;
    if (userId) filtered = filtered.filter((s) => s.user_id === userId || s.user_id === 'demo-farmer-001');
    if (farmId) filtered = filtered.filter((s) => s.farm_id === farmId);
    if (fieldId) filtered = filtered.filter((s) => s.field_id === fieldId);
    return filtered;
  },

  async getSensorById(sensorId: string, userId?: string): Promise<IoTSensor | null> {
    const all = await this.getSensors(undefined, undefined, userId);
    return all.find((s) => s.id === sensorId) || null;
  },

  async createSensor(
    sensorData: Omit<IoTSensor, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<IoTSensor> {
    const newSensor: IoTSensor = {
      ...sensorData,
      id: `sensor-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('iot_sensors')
          .insert([{ ...sensorData, user_id: userId }])
          .select()
          .single();
        if (!error && data) return data as IoTSensor;
      }
    }

    const all = getLocalItem<IoTSensor[]>(STORAGE_KEYS.SENSORS, SEED_SENSORS);
    const updated = [newSensor, ...all];
    setLocalItem(STORAGE_KEYS.SENSORS, updated);
    return newSensor;
  },

  async updateSensor(
    sensorId: string,
    sensorData: Partial<IoTSensor>,
    userId?: string
  ): Promise<IoTSensor | null> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('iot_sensors')
          .update({ ...sensorData, updated_at: new Date().toISOString() })
          .eq('id', sensorId)
          .select()
          .single();
        if (!error && data) return data as IoTSensor;
      }
    }

    const all = getLocalItem<IoTSensor[]>(STORAGE_KEYS.SENSORS, SEED_SENSORS);
    const idx = all.findIndex((s) => s.id === sensorId);
    if (idx === -1) return null;

    const updated = {
      ...all[idx],
      ...sensorData,
      updated_at: new Date().toISOString(),
    };
    all[idx] = updated;
    setLocalItem(STORAGE_KEYS.SENSORS, all);
    return updated;
  },

  async deleteSensor(sensorId: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any).from('iot_sensors').delete().eq('id', sensorId);
        if (userId) q = q.eq('user_id', userId);
        const { error } = await q;
        if (!error) return true;
      }
    }

    const sensors = getLocalItem<IoTSensor[]>(STORAGE_KEYS.SENSORS, SEED_SENSORS).filter((s) => s.id !== sensorId);
    const readings = getLocalItem<SensorReading[]>(STORAGE_KEYS.READINGS, SEED_READINGS).filter(
      (r) => r.sensor_id !== sensorId
    );
    const alerts = getLocalItem<MonitoringAlert[]>(STORAGE_KEYS.ALERTS, SEED_ALERTS).filter(
      (a) => a.sensor_id !== sensorId
    );

    setLocalItem(STORAGE_KEYS.SENSORS, sensors);
    setLocalItem(STORAGE_KEYS.READINGS, readings);
    setLocalItem(STORAGE_KEYS.ALERTS, alerts);
    return true;
  },

  // ============================================================================
  // SENSOR READINGS
  // ============================================================================
  async getReadings(params?: {
    sensorId?: string;
    farmId?: string;
    fieldId?: string;
    parameter?: SensorParameter;
    limit?: number;
    userId?: string;
  }): Promise<SensorReading[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any).from('sensor_readings').select('*').order('recorded_at', { ascending: false });
        if (params?.sensorId) q = q.eq('sensor_id', params.sensorId);
        if (params?.farmId) q = q.eq('farm_id', params.farmId);
        if (params?.fieldId) q = q.eq('field_id', params.fieldId);
        if (params?.parameter) q = q.eq('parameter', params.parameter);
        if (params?.userId) q = q.eq('user_id', params.userId);
        if (params?.limit) q = q.limit(params.limit);
        const { data, error } = await q;
        if (!error && data) return data as SensorReading[];
      }
    }

    const all = getLocalItem<SensorReading[]>(STORAGE_KEYS.READINGS, SEED_READINGS);
    let filtered = all;
    if (params?.userId) filtered = filtered.filter((r) => r.user_id === params.userId || r.user_id === 'demo-farmer-001');
    if (params?.sensorId) filtered = filtered.filter((r) => r.sensor_id === params.sensorId);
    if (params?.farmId) filtered = filtered.filter((r) => r.farm_id === params.farmId);
    if (params?.fieldId) filtered = filtered.filter((r) => r.field_id === params.fieldId);
    if (params?.parameter) filtered = filtered.filter((r) => r.parameter === params.parameter);

    filtered.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    if (params?.limit) filtered = filtered.slice(0, params.limit);
    return filtered;
  },

  async createReading(
    readingData: Omit<SensorReading, 'id' | 'user_id' | 'created_at'>,
    userId: string
  ): Promise<SensorReading> {
    const newReading: SensorReading = {
      ...readingData,
      id: `reading-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('sensor_readings')
          .insert([{ ...readingData, user_id: userId }])
          .select()
          .single();
        if (!error && data) return data as SensorReading;
      }
    }

    const all = getLocalItem<SensorReading[]>(STORAGE_KEYS.READINGS, SEED_READINGS);
    // Keep max 2000 readings locally
    const updated = [newReading, ...all].slice(0, 2000);
    setLocalItem(STORAGE_KEYS.READINGS, updated);

    // Evaluate threshold alert automatically
    this.evaluateThresholds(newReading, userId);

    return newReading;
  },

  async createBatchReadings(
    readingsData: Omit<SensorReading, 'id' | 'user_id' | 'created_at'>[],
    userId: string
  ): Promise<{ insertedCount: number }> {
    const newItems: SensorReading[] = readingsData.map((r, i) => ({
      ...r,
      id: `batch-${Date.now()}-${i}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        await (supabase as any).from('sensor_readings').insert(
          readingsData.map((r) => ({ ...r, user_id: userId }))
        );
      }
    }

    const all = getLocalItem<SensorReading[]>(STORAGE_KEYS.READINGS, SEED_READINGS);
    const updated = [...newItems, ...all].slice(0, 3000);
    setLocalItem(STORAGE_KEYS.READINGS, updated);

    return { insertedCount: newItems.length };
  },

  // ============================================================================
  // THRESHOLD EVALUATION & ALERTS
  // ============================================================================
  async getAlerts(params?: {
    farmId?: string;
    fieldId?: string;
    status?: 'active' | 'acknowledged' | 'resolved' | 'All';
    severity?: 'critical' | 'warning' | 'info' | 'All';
    userId?: string;
  }): Promise<MonitoringAlert[]> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let q = (supabase as any).from('monitoring_alerts').select('*').order('created_at', { ascending: false });
        if (params?.farmId) q = q.eq('farm_id', params.farmId);
        if (params?.fieldId) q = q.eq('field_id', params.fieldId);
        if (params?.status && params.status !== 'All') q = q.eq('status', params.status);
        if (params?.severity && params.severity !== 'All') q = q.eq('severity', params.severity);
        if (params?.userId) q = q.eq('user_id', params.userId);
        const { data, error } = await q;
        if (!error && data) return data as MonitoringAlert[];
      }
    }

    const all = getLocalItem<MonitoringAlert[]>(STORAGE_KEYS.ALERTS, SEED_ALERTS);
    let filtered = all;
    if (params?.userId) filtered = filtered.filter((a) => a.user_id === params.userId || a.user_id === 'demo-farmer-001');
    if (params?.farmId) filtered = filtered.filter((a) => a.farm_id === params.farmId);
    if (params?.fieldId) filtered = filtered.filter((a) => a.field_id === params.fieldId);
    if (params?.status && params.status !== 'All') filtered = filtered.filter((a) => a.status === params.status);
    if (params?.severity && params.severity !== 'All') filtered = filtered.filter((a) => a.severity === params.severity);

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return filtered;
  },

  async resolveAlert(alertId: string, status: 'resolved' | 'acknowledged' = 'resolved', userId?: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        await (supabase as any)
          .from('monitoring_alerts')
          .update({
            status,
            resolved_at: status === 'resolved' ? new Date().toISOString() : null,
          })
          .eq('id', alertId);
      }
    }

    const all = getLocalItem<MonitoringAlert[]>(STORAGE_KEYS.ALERTS, SEED_ALERTS);
    const idx = all.findIndex((a) => a.id === alertId);
    if (idx !== -1) {
      all[idx].status = status;
      all[idx].resolved_at = status === 'resolved' ? new Date().toISOString() : null;
      setLocalItem(STORAGE_KEYS.ALERTS, all);
      return true;
    }
    return false;
  },

  async evaluateThresholds(reading: SensorReading, userId: string): Promise<MonitoringAlert | null> {
    const sensor = await this.getSensorById(reading.sensor_id, userId);
    if (!sensor || sensor.status !== 'active') return null;

    const val = Number(reading.value);
    const min = Number(sensor.min_threshold);
    const max = Number(sensor.max_threshold);

    let breached = false;
    let title = '';
    let description = '';
    let thresholdVal = 0;
    let severity: 'critical' | 'warning' | 'info' = 'warning';
    let action = '';

    if (val < min) {
      breached = true;
      thresholdVal = min;
      const pctBelow = min > 0 ? ((min - val) / min) * 100 : 20;
      severity = pctBelow > 30 ? 'critical' : 'warning';
      title = `Low ${sensor.sensor_name} Threshold Crossed`;
      description = `Measured ${val} ${sensor.unit}, falling below the configured minimum safe limit of ${min} ${sensor.unit}.`;

      if (sensor.parameter === 'soil_moisture') {
        action = 'Moisture depletion detected. Review field conditions and prepare irrigation cycle.';
      } else if (sensor.parameter === 'soil_ph') {
        action = 'Sub-soil acidity elevated. Consider agricultural lime or dolomite soil conditioning.';
      } else {
        action = 'Check environmental parameters against seasonal crop tolerance ranges.';
      }
    } else if (val > max) {
      breached = true;
      thresholdVal = max;
      const pctAbove = max > 0 ? ((val - max) / max) * 100 : 20;
      severity = pctAbove > 30 ? 'critical' : 'warning';
      title = `High ${sensor.sensor_name} Threshold Exceeded`;
      description = `Measured ${val} ${sensor.unit}, exceeding the configured maximum threshold of ${max} ${sensor.unit}.`;

      if (sensor.parameter === 'soil_moisture') {
        action = 'Soil saturation risk. Pause irrigation and ensure surface drainage channels are clear.';
      } else if (sensor.parameter === 'air_temperature') {
        action = 'Canopy heat stress. Monitor for leaf wilt; consider early morning misting if feasible.';
      } else if (sensor.parameter === 'air_humidity') {
        action = 'High humidity elevates fungal infection risk. Avoid overhead canopy wetting.';
      } else if (sensor.parameter === 'wind_speed') {
        action = 'Excessive wind. Halt any planned foliar spraying to prevent chemical drift.';
      } else {
        action = 'Monitor crop canopy for physiological stress symptoms.';
      }
    }

    if (!breached) return null;

    // Cooldown / Deduplication check: Avoid alert flood if alert for same sensor was created in last 30 minutes
    const existing = await this.getAlerts({ userId });
    const recentDuplicate = existing.find(
      (a) =>
        a.sensor_id === sensor.id &&
        a.status === 'active' &&
        Date.now() - new Date(a.created_at).getTime() < 30 * 60 * 1000
    );

    if (recentDuplicate) return null;

    const newAlert: MonitoringAlert = {
      id: `alert-${Date.now()}`,
      user_id: userId,
      farm_id: sensor.farm_id,
      field_id: sensor.field_id,
      sensor_id: sensor.id,
      alert_type: `${sensor.parameter.toUpperCase()}_THRESHOLD_BREACH`,
      severity,
      title,
      description,
      triggered_value: val,
      threshold_value: thresholdVal,
      status: 'active',
      recommended_action: action,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        await (supabase as any).from('monitoring_alerts').insert([newAlert]);
      }
    }

    const allAlerts = getLocalItem<MonitoringAlert[]>(STORAGE_KEYS.ALERTS, SEED_ALERTS);
    setLocalItem(STORAGE_KEYS.ALERTS, [newAlert, ...allAlerts]);

    return newAlert;
  },

  // ============================================================================
  // CSV DATA PARSING, IMPORT & EXPORT
  // ============================================================================
  parseCSVReadings(
    csvText: string,
    sensors: IoTSensor[]
  ): {
    validRows: Omit<SensorReading, 'id' | 'user_id' | 'created_at'>[];
    errors: { line: number; message: string; raw: string }[];
  } {
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const validRows: Omit<SensorReading, 'id' | 'user_id' | 'created_at'>[] = [];
    const errors: { line: number; message: string; raw: string }[] = [];

    if (lines.length <= 1) {
      return {
        validRows: [],
        errors: [{ line: 1, message: 'CSV file contains no data rows.', raw: csvText }],
      };
    }

    // Header validation
    const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const sensorIdIdx = header.indexOf('sensor_id');
    const paramIdx = header.indexOf('parameter');
    const valIdx = header.indexOf('value');
    const unitIdx = header.indexOf('unit');
    const timeIdx = header.indexOf('recorded_at');

    if (sensorIdIdx === -1 || paramIdx === -1 || valIdx === -1 || unitIdx === -1 || timeIdx === -1) {
      return {
        validRows: [],
        errors: [
          {
            line: 1,
            message:
              'Missing required CSV header columns. Required: sensor_id, parameter, value, unit, recorded_at',
            raw: lines[0],
          },
        ],
      };
    }

    const sensorMap = new Map(sensors.map((s) => [s.id, s]));
    const sensorCodeMap = new Map(sensors.map((s) => [s.sensor_code.toLowerCase(), s]));

    for (let i = 1; i < lines.length; i++) {
      const rowNum = i + 1;
      const rawLine = lines[i];
      const cols = rawLine.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));

      if (cols.length < 5) {
        errors.push({ line: rowNum, message: 'Incomplete row: fewer than 5 columns provided.', raw: rawLine });
        continue;
      }

      const rawSensorRef = cols[sensorIdIdx];
      const rawParam = cols[paramIdx].toLowerCase();
      const rawVal = parseFloat(cols[valIdx]);
      const rawUnit = cols[unitIdx];
      const rawTime = cols[timeIdx];

      // Match sensor by id or sensor_code
      const matchedSensor = sensorMap.get(rawSensorRef) || sensorCodeMap.get(rawSensorRef.toLowerCase());

      if (!matchedSensor) {
        errors.push({
          line: rowNum,
          message: `Unknown sensor identifier "${rawSensorRef}". Must match a registered sensor ID or code.`,
          raw: rawLine,
        });
        continue;
      }

      if (isNaN(rawVal)) {
        errors.push({
          line: rowNum,
          message: `Invalid numerical measurement "${cols[valIdx]}"`,
          raw: rawLine,
        });
        continue;
      }

      const parsedDate = new Date(rawTime);
      if (isNaN(parsedDate.getTime())) {
        errors.push({
          line: rowNum,
          message: `Invalid ISO-8601 timestamp "${rawTime}" (expected YYYY-MM-DDTHH:mm:ssZ)`,
          raw: rawLine,
        });
        continue;
      }

      validRows.push({
        sensor_id: matchedSensor.id,
        farm_id: matchedSensor.farm_id,
        field_id: matchedSensor.field_id,
        parameter: (rawParam in SENSOR_PARAMETERS ? rawParam : matchedSensor.parameter) as SensorParameter,
        value: rawVal,
        unit: rawUnit || matchedSensor.unit,
        data_source: 'csv',
        notes: `Imported via CSV on ${new Date().toLocaleDateString('en-IN')}`,
        recorded_at: parsedDate.toISOString(),
      });
    }

    return { validRows, errors };
  },

  getSampleCSVTemplate(): string {
    return [
      'sensor_id,parameter,value,unit,recorded_at,notes',
      'KOL-SOIL-01,soil_moisture,58.4,%,2026-11-04T08:00:00Z,Morning capacitance probe check',
      'KOL-STEMP-01,soil_temperature,26.2,°C,2026-11-04T08:00:00Z,Sub-surface reading',
      'KOL-ATEMP-01,air_temperature,28.5,°C,2026-11-04T08:00:00Z,Canopy shade temp',
      'KOL-HUM-01,air_humidity,64.0,%,2026-11-04T08:00:00Z,Early morning humidity',
      'KOL-PH-01,soil_ph,6.8,pH,2026-11-04T08:00:00Z,Block A soil test',
    ].join('\n');
  },

  exportReadingsToCSV(readings: SensorReading[], sensors: IoTSensor[]): string {
    const sensorMap = new Map(sensors.map((s) => [s.id, s]));
    const headers = ['sensor_id', 'sensor_code', 'parameter', 'value', 'unit', 'data_source', 'recorded_at', 'notes'];
    const rows = readings.map((r) => {
      const s = sensorMap.get(r.sensor_id);
      return [
        r.sensor_id,
        s?.sensor_code || '',
        r.parameter,
        r.value,
        `"${r.unit}"`,
        r.data_source,
        r.recorded_at,
        `"${r.notes || ''}"`,
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  },
};

