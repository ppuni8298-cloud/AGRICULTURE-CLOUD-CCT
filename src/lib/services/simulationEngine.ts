import type { IoTSensor, SensorReading, SensorParameter } from '@/lib/supabase/types';
import { iotService } from '@/lib/services/iotService';
import { SENSOR_PARAMETERS } from '@/lib/validations/monitoring';

export type SimulationProfileType =
  | 'standard'
  | 'heatwave'
  | 'monsoon'
  | 'drought'
  | 'optimal';

export interface SimulationEngineState {
  status: 'stopped' | 'running' | 'paused';
  profile: SimulationProfileType;
  intervalSeconds: number;
  totalTicks: number;
  lastTickAt: string | null;
  activeSensorCount: number;
}

type SimulationListener = (state: SimulationEngineState, latestReading?: SensorReading) => void;

class VirtualIoTSimulationEngine {
  private timer: NodeJS.Timeout | null = null;
  private status: 'stopped' | 'running' | 'paused' = 'stopped';
  private profile: SimulationProfileType = 'standard';
  private intervalSeconds: number = 5;
  private totalTicks: number = 0;
  private lastTickAt: string | null = null;
  private activeSensors: IoTSensor[] = [];
  private currentUserId: string = 'demo-farmer-001';
  private listeners: Set<SimulationListener> = new Set();
  private maxSafetyTicks: number = 600; // Auto-pause after ~50 minutes of continuous running to save client memory

  public getState(): SimulationEngineState {
    return {
      status: this.status,
      profile: this.profile,
      intervalSeconds: this.intervalSeconds,
      totalTicks: this.totalTicks,
      lastTickAt: this.lastTickAt,
      activeSensorCount: this.activeSensors.length,
    };
  }

  public subscribe(listener: SimulationListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(latestReading?: SensorReading) {
    const st = this.getState();
    this.listeners.forEach((l) => l(st, latestReading));
  }

  public start(
    sensors: IoTSensor[],
    userId: string,
    profile: SimulationProfileType = 'standard',
    intervalSeconds: number = 5
  ) {
    this.stop();
    this.activeSensors = sensors.filter((s) => s.status === 'active');
    this.currentUserId = userId;
    this.profile = profile;
    this.intervalSeconds = Math.max(2, Math.min(60, intervalSeconds));
    this.status = 'running';
    this.totalTicks = 0;

    // Immediately trigger first tick
    this.tick();

    this.timer = setInterval(() => {
      if (this.status === 'running') {
        this.tick();
      }
    }, this.intervalSeconds * 1000);

    this.notify();
  }

  public pause() {
    if (this.status === 'running') {
      this.status = 'paused';
      this.notify();
    }
  }

  public resume() {
    if (this.status === 'paused') {
      this.status = 'running';
      this.notify();
    }
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.status = 'stopped';
    this.notify();
  }

  public updateProfile(profile: SimulationProfileType) {
    this.profile = profile;
    this.notify();
  }

  public updateInterval(intervalSeconds: number) {
    this.intervalSeconds = Math.max(2, Math.min(60, intervalSeconds));
    if (this.status === 'running') {
      // Restart interval with new rate
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (this.status === 'running') this.tick();
      }, this.intervalSeconds * 1000);
    }
    this.notify();
  }

  public setSensors(sensors: IoTSensor[]) {
    this.activeSensors = sensors.filter((s) => s.status === 'active');
    this.notify();
  }

  /**
   * Manual Single Tick: Generates a reading on-demand for one or all sensors
   */
  public async triggerManualReading(sensorId?: string): Promise<SensorReading[]> {
    const targets = sensorId
      ? this.activeSensors.filter((s) => s.id === sensorId)
      : this.activeSensors;

    const results: SensorReading[] = [];
    for (const sensor of targets) {
      const val = this.calculateSimulatedValue(sensor.parameter, this.profile);
      const reading = await iotService.createReading(
        {
          sensor_id: sensor.id,
          farm_id: sensor.farm_id,
          field_id: sensor.field_id,
          parameter: sensor.parameter,
          value: val,
          unit: sensor.unit,
          data_source: 'simulated',
          notes: `Simulated via ${this.profile.toUpperCase()} profile (Manual Trigger)`,
          recorded_at: new Date().toISOString(),
        },
        this.currentUserId
      );
      results.push(reading);
      this.notify(reading);
    }

    return results;
  }

  /**
   * Controlled Anomaly Injection for threshold testing:
   * Immediately generates a reading designed to breach configured min or max thresholds
   */
  public async injectAnomaly(
    sensor: IoTSensor,
    type: 'critical_low' | 'critical_high'
  ): Promise<SensorReading> {
    let anomalyVal: number;
    const min = Number(sensor.min_threshold);
    const max = Number(sensor.max_threshold);

    if (type === 'critical_low') {
      anomalyVal = Number((min * 0.65).toFixed(1));
      if (sensor.parameter === 'soil_ph') anomalyVal = 4.8;
      if (sensor.parameter === 'soil_moisture') anomalyVal = 18.5;
    } else {
      anomalyVal = Number((max * 1.35).toFixed(1));
      if (sensor.parameter === 'soil_ph') anomalyVal = 8.9;
      if (sensor.parameter === 'soil_moisture') anomalyVal = 92.0;
      if (sensor.parameter === 'air_temperature') anomalyVal = 42.5;
      if (sensor.parameter === 'wind_speed') anomalyVal = 48.0;
      if (sensor.parameter === 'rainfall') anomalyVal = 65.0;
    }

    const reading = await iotService.createReading(
      {
        sensor_id: sensor.id,
        farm_id: sensor.farm_id,
        field_id: sensor.field_id,
        parameter: sensor.parameter,
        value: anomalyVal,
        unit: sensor.unit,
        data_source: 'simulated',
        notes: `[TEST ANOMALY INJECTED] ${type === 'critical_low' ? 'Critical Sub-Threshold' : 'Critical Spike'}`,
        recorded_at: new Date().toISOString(),
      },
      this.currentUserId
    );

    this.notify(reading);
    return reading;
  }

  private async tick() {
    if (this.activeSensors.length === 0) return;

    this.totalTicks++;
    this.lastTickAt = new Date().toISOString();

    // Safety auto-pause
    if (this.totalTicks >= this.maxSafetyTicks) {
      this.pause();
      console.warn('Simulation auto-paused to preserve client memory after 600 ticks.');
      return;
    }

    // Pick 1-3 random active sensors per tick to simulate natural wireless telemetry packets
    const shuffled = [...this.activeSensors].sort(() => 0.5 - Math.random());
    const sampleSize = Math.max(1, Math.min(3, shuffled.length));
    const selected = shuffled.slice(0, sampleSize);

    for (const sensor of selected) {
      const val = this.calculateSimulatedValue(sensor.parameter, this.profile);
      const reading = await iotService.createReading(
        {
          sensor_id: sensor.id,
          farm_id: sensor.farm_id,
          field_id: sensor.field_id,
          parameter: sensor.parameter,
          value: val,
          unit: sensor.unit,
          data_source: 'simulated',
          notes: `Simulated packet #${this.totalTicks} (${this.profile})`,
          recorded_at: new Date().toISOString(),
        },
        this.currentUserId
      );

      this.notify(reading);
    }
  }

  /**
   * Generates realistic continuous meteorological & agronomic data
   */
  public calculateSimulatedValue(param: SensorParameter, profile: SimulationProfileType): number {
    const hour = new Date().getHours();
    // Diurnal cycle: peaks ~14:00 (+1), lowest ~04:00 (-1)
    const diurnal = Math.sin(((hour - 8) / 24) * 2 * Math.PI);
    // Gaussian-like noise
    const noise = (Math.random() - 0.5) * 1.5;

    switch (param) {
      case 'soil_moisture': {
        // Normal 50-70%
        let base = 60 + diurnal * 4;
        if (profile === 'drought') base = 32;
        if (profile === 'heatwave') base = 38;
        if (profile === 'monsoon') base = 82;
        if (profile === 'optimal') base = 65;
        const val = Math.max(5, Math.min(98, base + noise * 1.2));
        return Number(val.toFixed(1));
      }

      case 'soil_temperature': {
        // Normal 22-28°C
        let base = 25 + diurnal * 2.5;
        if (profile === 'heatwave') base = 34;
        if (profile === 'monsoon') base = 21;
        if (profile === 'optimal') base = 24;
        const val = Math.max(10, Math.min(50, base + noise * 0.4));
        return Number(val.toFixed(1));
      }

      case 'air_temperature': {
        // Normal 20-33°C
        let base = 27 + diurnal * 6;
        if (profile === 'heatwave') base = 39 + diurnal * 4;
        if (profile === 'monsoon') base = 22 + diurnal * 2;
        if (profile === 'optimal') base = 26 + diurnal * 3;
        const val = Math.max(5, Math.min(55, base + noise * 0.8));
        return Number(val.toFixed(1));
      }

      case 'air_humidity': {
        // Normal 55-80% (inversely correlated with temperature)
        let base = 68 - diurnal * 12;
        if (profile === 'heatwave') base = 35 - diurnal * 8;
        if (profile === 'monsoon') base = 90 - diurnal * 5;
        if (profile === 'optimal') base = 65;
        const val = Math.max(15, Math.min(99, base + noise * 1.8));
        return Number(val.toFixed(1));
      }

      case 'soil_ph': {
        // Normal 6.4 - 7.2
        let base = 6.8;
        if (profile === 'monsoon') base = 6.5; // slight leaching
        const val = Math.max(3.5, Math.min(9.5, base + (Math.random() - 0.5) * 0.2));
        return Number(val.toFixed(2));
      }

      case 'rainfall': {
        if (profile === 'monsoon') {
          return Number((Math.random() * 12 + 2).toFixed(1));
        }
        // Mostly 0 except rare shower
        return Math.random() > 0.92 ? Number((Math.random() * 3.5).toFixed(1)) : 0;
      }

      case 'wind_speed': {
        // Normal 6-22 km/h
        let base = 12 + Math.abs(diurnal) * 5;
        if (profile === 'monsoon') base = 26;
        if (profile === 'heatwave') base = 18;
        const val = Math.max(0, Math.min(85, base + noise * 2.5));
        return Number(val.toFixed(1));
      }

      case 'light_intensity': {
        // Daylight 06:00 to 18:00
        if (hour < 6 || hour > 18) return 0;
        const sunFactor = Math.sin(((hour - 6) / 12) * Math.PI);
        let maxLux = 75000;
        if (profile === 'monsoon') maxLux = 28000; // overcast
        if (profile === 'heatwave') maxLux = 95000; // glaring sun
        const val = Math.max(0, sunFactor * maxLux + (Math.random() - 0.5) * 3000);
        return Math.round(val);
      }

      default:
        return 50;
    }
  }
}

export const simulationEngine = new VirtualIoTSimulationEngine();

