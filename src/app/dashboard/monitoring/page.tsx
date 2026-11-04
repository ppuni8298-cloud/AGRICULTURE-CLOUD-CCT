'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { iotService } from '@/lib/services/iotService';
import { farmService } from '@/lib/services/farmService';
import { simulationEngine, SimulationProfileType } from '@/lib/services/simulationEngine';
import {
  SENSOR_PARAMETERS,
  SIMULATION_PROFILES,
  manualReadingSchema,
} from '@/lib/validations/monitoring';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Farm, Field, Crop, IoTSensor, SensorReading, MonitoringAlert, SensorParameter } from '@/lib/supabase/types';
import {
  Activity,
  Play,
  Pause,
  Square,
  Sparkles,
  AlertTriangle,
  Upload,
  Download,
  Plus,
  RefreshCw,
  Clock,
  MapPin,
  Layers,
  Wheat,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  FileSpreadsheet,
  Settings,
  Bell,
  BarChart3,
  Flame,
  CloudRain,
  Sun,
  Droplets,
  Wind,
  Thermometer,
  Compass,
} from 'lucide-react';

export default function SmartMonitoringDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedFarmId, setSelectedFarmId] = useState<string>('All');
  const [selectedFieldId, setSelectedFieldId] = useState<string>('All');
  const [selectedParam, setSelectedParam] = useState<string>('All');

  // Simulation Engine State
  const [engineState, setEngineState] = useState(simulationEngine.getState());

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);

  // Manual Reading Form
  const [manualSensorId, setManualSensorId] = useState('');
  const [manualParam, setManualParam] = useState<SensorParameter>('soil_moisture');
  const [manualValue, setManualValue] = useState('');
  const [manualUnit, setManualUnit] = useState('%');
  const [manualDateTime, setManualDateTime] = useState(new Date().toISOString().substring(0, 16));
  const [manualNotes, setManualNotes] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  // CSV Upload State
  const [csvContent, setCsvContent] = useState('');
  const [csvPreview, setCsvPreview] = useState<{
    validRows: Omit<SensorReading, 'id' | 'user_id' | 'created_at'>[];
    errors: { line: number; message: string; raw: string }[];
  } | null>(null);
  const [csvImportSuccess, setCsvImportSuccess] = useState<string | null>(null);

  // Anomaly Injection Form
  const [anomalySensorId, setAnomalySensorId] = useState('');
  const [anomalyType, setAnomalyType] = useState<'critical_low' | 'critical_high'>('critical_low');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load all initial monitoring data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allFarms, allFields, allCrops, allSensors, allReadings, allAlerts] = await Promise.all([
        farmService.getFarms(user?.id),
        farmService.getFields(undefined, user?.id),
        farmService.getCrops(undefined, undefined, user?.id),
        iotService.getSensors(undefined, undefined, user?.id),
        iotService.getReadings({ limit: 500, userId: user?.id }),
        iotService.getAlerts({ status: 'active', userId: user?.id }),
      ]);

      setFarms(allFarms);
      setFields(allFields);
      setCrops(allCrops);
      setSensors(allSensors);
      setReadings(allReadings);
      setAlerts(allAlerts);

      // Initialize engine target sensors
      simulationEngine.setSensors(allSensors);

      if (allSensors.length > 0) {
        setManualSensorId(allSensors[0].id);
        setManualParam(allSensors[0].parameter);
        setManualUnit(allSensors[0].unit);
        setAnomalySensorId(allSensors[0].id);
      }
    } catch (err) {
      console.error('Failed to load IoT monitoring records:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscribe to real-time simulation updates
  useEffect(() => {
    const unsubscribe = simulationEngine.subscribe((state, latestReading) => {
      setEngineState({ ...state });
      if (latestReading) {
        setReadings((prev) => [latestReading, ...prev.slice(0, 499)]);
        // Check if latest reading created an alert
        iotService.getAlerts({ status: 'active', userId: user?.id }).then(setAlerts);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  // Filter fields based on selected farm
  const availableFields = useMemo(() => {
    if (selectedFarmId === 'All') return fields;
    return fields.filter((f) => f.farm_id === selectedFarmId);
  }, [fields, selectedFarmId]);

  // Compute latest reading for each of the 8 parameters
  const latestParameterTelemetry = useMemo(() => {
    const result: Record<
      string,
      {
        reading: SensorReading | null;
        sensor: IoTSensor | null;
        history: number[];
        trend: 'up' | 'down' | 'steady';
        status: 'normal' | 'breach_low' | 'breach_high' | 'offline' | 'no_sensor';
      }
    > = {};

    Object.keys(SENSOR_PARAMETERS).forEach((paramKey) => {
      // Filter readings by farm/field filters
      let paramReadings = readings.filter((r) => r.parameter === paramKey);
      if (selectedFarmId !== 'All') paramReadings = paramReadings.filter((r) => r.farm_id === selectedFarmId);
      if (selectedFieldId !== 'All') paramReadings = paramReadings.filter((r) => r.field_id === selectedFieldId);

      // Find matching sensor
      let paramSensor = sensors.find((s) => s.parameter === paramKey);
      if (selectedFarmId !== 'All') paramSensor = sensors.find((s) => s.parameter === paramKey && s.farm_id === selectedFarmId);
      if (selectedFieldId !== 'All') paramSensor = sensors.find((s) => s.parameter === paramKey && s.field_id === selectedFieldId);

      const latest = paramReadings.length > 0 ? paramReadings[0] : null;

      // Extract last 6 readings for mini-trend
      const history = paramReadings.slice(0, 6).map((r) => r.value).reverse();

      // Determine trend
      let trend: 'up' | 'down' | 'steady' = 'steady';
      if (history.length >= 2) {
        const diff = history[history.length - 1] - history[history.length - 2];
        if (diff > 0.3) trend = 'up';
        else if (diff < -0.3) trend = 'down';
      }

      // Determine status
      let status: 'normal' | 'breach_low' | 'breach_high' | 'offline' | 'no_sensor' = 'no_sensor';
      if (paramSensor) {
        if (paramSensor.status === 'offline') {
          status = 'offline';
        } else if (latest) {
          if (latest.value < paramSensor.min_threshold) status = 'breach_low';
          else if (latest.value > paramSensor.max_threshold) status = 'breach_high';
          else status = 'normal';
        } else {
          status = 'no_sensor';
        }
      }

      result[paramKey] = {
        reading: latest,
        sensor: paramSensor || null,
        history,
        trend,
        status,
      };
    });

    return result;
  }, [readings, sensors, selectedFarmId, selectedFieldId]);

  // Simulation Controls Handlers
  const handleStartSimulation = () => {
    simulationEngine.start(sensors, user?.id || 'demo-farmer-001', engineState.profile, engineState.intervalSeconds);
    setToastMessage('Virtual IoT telemetry stream started.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePauseSimulation = () => {
    simulationEngine.pause();
    setToastMessage('Simulation paused.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResumeSimulation = () => {
    simulationEngine.resume();
    setToastMessage('Simulation resumed.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStopSimulation = () => {
    simulationEngine.stop();
    setToastMessage('Simulation stopped.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTriggerSingleReading = async () => {
    setIsSubmitting(true);
    try {
      const generated = await simulationEngine.triggerManualReading();
      setToastMessage(`Generated ${generated.length} fresh simulated telemetry packet(s).`);
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInjectAnomaly = async (e: React.FormEvent) => {
    e.preventDefault();
    const sensor = sensors.find((s) => s.id === anomalySensorId);
    if (!sensor) return;

    setIsSubmitting(true);
    try {
      await simulationEngine.injectAnomaly(sensor, anomalyType);
      setIsAnomalyModalOpen(false);
      setToastMessage(`Injected threshold test anomaly on ${sensor.sensor_name}. Check alerts feed!`);
      setTimeout(() => setToastMessage(null), 4000);
      const updatedAlerts = await iotService.getAlerts({ status: 'active', userId: user?.id });
      setAlerts(updatedAlerts);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manual Reading Handler
  const handleSaveManualReading = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    setIsSubmitting(true);

    try {
      const parsedVal = parseFloat(manualValue);
      const validation = manualReadingSchema.safeParse({
        sensor_id: manualSensorId,
        parameter: manualParam,
        value: parsedVal,
        unit: manualUnit,
        recorded_at: new Date(manualDateTime).toISOString(),
        notes: manualNotes.trim() || null,
      });

      if (!validation.success) {
        setManualError(validation.error.errors[0]?.message || 'Please check reading values');
        setIsSubmitting(false);
        return;
      }

      const sensor = sensors.find((s) => s.id === manualSensorId);
      if (!sensor) {
        setManualError('Target virtual sensor not found');
        setIsSubmitting(false);
        return;
      }

      const newReading = await iotService.createReading(
        {
          sensor_id: sensor.id,
          farm_id: sensor.farm_id,
          field_id: sensor.field_id,
          parameter: manualParam,
          value: parsedVal,
          unit: manualUnit,
          data_source: 'manual',
          notes: manualNotes.trim() || 'Manual farmer entry',
          recorded_at: new Date(manualDateTime).toISOString(),
        },
        user?.id || 'demo-farmer-001'
      );

      setReadings((prev) => [newReading, ...prev]);
      setIsManualModalOpen(false);
      setManualValue('');
      setManualNotes('');
      setToastMessage('Manual sensor reading recorded and evaluated.');
      setTimeout(() => setToastMessage(null), 4000);
      const updatedAlerts = await iotService.getAlerts({ status: 'active', userId: user?.id });
      setAlerts(updatedAlerts);
    } catch (err: unknown) {
      setManualError(err instanceof Error ? err.message : 'Failed to save manual reading');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV Import Handlers
  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      const parsed = iotService.parseCSVReadings(text, sensors);
      setCsvPreview(parsed);
      setCsvImportSuccess(null);
    };
    reader.readAsText(file);
  };

  const handleConfirmCSVImport = async () => {
    if (!csvPreview || csvPreview.validRows.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await iotService.createBatchReadings(csvPreview.validRows, user?.id || 'demo-farmer-001');
      setCsvImportSuccess(`Successfully imported ${res.insertedCount} sensor records into Supabase!`);
      setToastMessage(`CSV Import: ${res.insertedCount} readings saved.`);
      setTimeout(() => setToastMessage(null), 4000);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadSampleCSV = () => {
    const template = iotService.getSampleCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agrocloud_iot_sensor_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportReadings = () => {
    const csv = iotService.exportReadingsToCSV(readings, sensors);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrocloud_telemetry_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getParameterIcon = (key: string) => {
    switch (key) {
      case 'soil_moisture':
        return Droplets;
      case 'soil_temperature':
        return Thermometer;
      case 'air_temperature':
        return Sun;
      case 'air_humidity':
        return CloudRain;
      case 'soil_ph':
        return Compass;
      case 'rainfall':
        return CloudRain;
      case 'wind_speed':
        return Wind;
      case 'light_intensity':
        return Zap;
      default:
        return Activity;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Connecting to virtual IoT sensor telemetry nodes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs text-emerald-700 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Mandatory Prominent Simulation Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-extrabold uppercase tracking-wide">
            SIMULATED IoT DATA – NOT FROM PHYSICAL HARDWARE
          </span>
          <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
            This platform uses a realistic software-based simulation engine to model root-zone capacitance and micro-climate parameters. No physical hardware connection is active.
          </p>
        </div>
      </div>

      {/* Top Header & Navigation Links */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <span>Smart Farm Telemetry & IoT Monitoring</span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className={`w-2 h-2 rounded-full ${engineState.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              Engine: {engineState.status}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time environmental telemetry across {sensors.length} virtual sensor probes in your farm plots.
          </p>
        </div>

        {/* Quick Route Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/monitoring/sensors">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span>Sensors ({sensors.length})</span>
            </Button>
          </Link>

          <Link href="/dashboard/monitoring/alerts">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1.5 ${
                alerts.length > 0 ? 'text-amber-600 border-amber-300 dark:border-amber-800' : ''
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts ({alerts.length})</span>
            </Button>
          </Link>

          <Link href="/dashboard/monitoring/analytics">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </Button>
          </Link>

          <Link href="/dashboard/weather">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5" />
              <span>Weather</span>
            </Button>
          </Link>

          <Link href="/dashboard/irrigation">
            <Button variant="primary" size="sm" className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" />
              <span>Irrigation Advisor</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Simulation Engine Control Center Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-[#063826] text-white shadow-xl border border-emerald-700/50 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lime-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Software Simulation Engine Controller
              </span>
            </div>
            <h2 className="text-xl font-black">
              {engineState.status === 'running'
                ? `Actively Generating Telemetry (${engineState.totalTicks} packets streamed)`
                : engineState.status === 'paused'
                ? 'Simulation Paused'
                : 'Simulation Engine Idle (Ready to start)'}
            </h2>
            <p className="text-xs text-emerald-200/90">
              Profiles inject diurnal fluctuations and environmental stress models across all registered virtual probes.
            </p>
          </div>

          {/* Engine Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {engineState.status === 'running' ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePauseSimulation}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <Pause className="w-3.5 h-3.5 mr-1" />
                  <span>Pause</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopSimulation}
                  className="bg-white/10 text-white border-white/20 hover:bg-rose-500/80"
                >
                  <Square className="w-3.5 h-3.5 mr-1" />
                  <span>Stop</span>
                </Button>
              </>
            ) : engineState.status === 'paused' ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleResumeSimulation}
                  className="bg-lime-500 hover:bg-lime-600 text-emerald-950 font-bold"
                >
                  <Play className="w-3.5 h-3.5 mr-1" />
                  <span>Resume</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopSimulation}
                  className="bg-white/10 text-white border-white/20"
                >
                  <Square className="w-3.5 h-3.5 mr-1" />
                  <span>Stop</span>
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartSimulation}
                className="bg-lime-500 hover:bg-lime-600 text-emerald-950 font-bold shadow-lg shadow-lime-500/20"
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                <span>Start Telemetry Stream</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerSingleReading}
              disabled={isSubmitting}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Trigger 1 Reading</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnomalyModalOpen(true)}
              className="bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30"
            >
              <Flame className="w-3.5 h-3.5 mr-1" />
              <span>Inject Anomaly</span>
            </Button>
          </div>
        </div>

        {/* Engine Settings: Profile + Rate */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-emerald-700/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-200 font-semibold">Simulation Profile:</span>
            <select
              value={engineState.profile}
              onChange={(e) => simulationEngine.updateProfile(e.target.value as SimulationProfileType)}
              className="px-2.5 py-1 rounded-xl bg-black/30 border border-white/20 text-white font-medium"
            >
              {SIMULATION_PROFILES.map((p) => (
                <option key={p.value} value={p.value} className="bg-emerald-900 text-white">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-200 font-semibold">Packet Rate:</span>
            <select
              value={engineState.intervalSeconds}
              onChange={(e) => simulationEngine.updateInterval(parseInt(e.target.value))}
              className="px-2.5 py-1 rounded-xl bg-black/30 border border-white/20 text-white font-medium"
            >
              <option value={2} className="bg-emerald-900 text-white">High Speed (Every 2s)</option>
              <option value={5} className="bg-emerald-900 text-white">Normal (Every 5s)</option>
              <option value={10} className="bg-emerald-900 text-white">Moderate (Every 10s)</option>
              <option value={30} className="bg-emerald-900 text-white">Eco (Every 30s)</option>
            </select>
          </div>

          <div className="text-emerald-300 ml-auto flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Last packet: {engineState.lastTickAt ? new Date(engineState.lastTickAt).toLocaleTimeString('en-IN') : 'None yet'}</span>
          </div>
        </div>
      </div>

      {/* Manual Entry & CSV Controls Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Farm:</span>
          </div>
          <select
            value={selectedFarmId}
            onChange={(e) => {
              setSelectedFarmId(e.target.value);
              setSelectedFieldId('All');
            }}
            className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-emerald-800 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
          >
            <option value="All">All Farms</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold ml-2">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Field:</span>
          </div>
          <select
            value={selectedFieldId}
            onChange={(e) => setSelectedFieldId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-emerald-800 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
          >
            <option value="All">All Fields</option>
            {availableFields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Data Source Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReadings}
            className="flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* 8 Parameters Monitoring Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(SENSOR_PARAMETERS).map(([paramKey, meta]) => {
          const telemetry = latestParameterTelemetry[paramKey];
          const Icon = getParameterIcon(paramKey);
          const hasReading = telemetry.reading !== null;

          // Status Badge Style
          let statusBadge = (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Optimal
            </span>
          );

          if (telemetry.status === 'breach_low') {
            statusBadge = (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                Below Threshold
              </span>
            );
          } else if (telemetry.status === 'breach_high') {
            statusBadge = (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                Above Threshold
              </span>
            );
          } else if (telemetry.status === 'no_sensor') {
            statusBadge = (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500">
                No Sensor
              </span>
            );
          }

          // Data source badge
          let sourceLabel = 'Simulated IoT';
          let sourceBadgeClass = 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200';
          if (telemetry.reading?.data_source === 'manual') {
            sourceLabel = 'Manually Entered';
            sourceBadgeClass = 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200';
          } else if (telemetry.reading?.data_source === 'csv') {
            sourceLabel = 'CSV Upload';
            sourceBadgeClass = 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200';
          }

          return (
            <div
              key={paramKey}
              className="p-5 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Icon, Parameter Name, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                        {meta.name}
                      </h3>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {meta.unit}
                      </span>
                    </div>
                  </div>

                  {statusBadge}
                </div>

                {/* Main Value Display */}
                <div className="pt-2">
                  {hasReading ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">
                        {telemetry.reading?.value}
                      </span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {meta.unit}
                      </span>

                      {/* Trend indicator */}
                      <span className="ml-auto flex items-center text-xs font-semibold">
                        {telemetry.trend === 'up' && (
                          <span className="text-emerald-600 flex items-center" title="Rising trend">
                            <TrendingUp className="w-4 h-4 mr-0.5" />
                            Up
                          </span>
                        )}
                        {telemetry.trend === 'down' && (
                          <span className="text-rose-600 flex items-center" title="Falling trend">
                            <TrendingDown className="w-4 h-4 mr-0.5" />
                            Down
                          </span>
                        )}
                        {telemetry.trend === 'steady' && (
                          <span className="text-gray-400 flex items-center" title="Steady trend">
                            <Minus className="w-4 h-4 mr-0.5" />
                            Steady
                          </span>
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="py-2 text-xs text-gray-400 italic">
                      No readings logged yet for this parameter.
                    </div>
                  )}
                </div>

                {/* Threshold context */}
                {telemetry.sensor && (
                  <div className="text-[11px] text-gray-500 flex justify-between pt-1 border-t border-gray-100 dark:border-emerald-800/30">
                    <span>Safe Range:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {telemetry.sensor.min_threshold} – {telemetry.sensor.max_threshold} {meta.unit}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer: Data Source Label & Last Updated */}
              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-emerald-800/30 flex items-center justify-between text-[11px]">
                <span className={`px-2 py-0.5 rounded-md font-semibold border ${sourceBadgeClass}`}>
                  {sourceLabel}
                </span>

                <span className="text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {telemetry.reading
                    ? new Date(telemetry.reading.recorded_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Alerts Panel (If any exist) */}
      {alerts.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>Active Environmental Threshold Alerts ({alerts.length})</span>
            </h2>

            <Link
              href="/dashboard/monitoring/alerts"
              className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline"
            >
              View Full Alert Feed &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.slice(0, 4).map((alt) => (
              <div
                key={alt.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#062419] border border-amber-200/80 dark:border-amber-800/40 shadow-sm flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">{alt.title}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(alt.created_at).toLocaleTimeString('en-IN')}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{alt.description}</p>
                  {alt.recommended_action && (
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                      Action: {alt.recommended_action}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: MANUAL SENSOR DATA ENTRY
         ========================================================================= */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Manual Sensor Telemetry Entry"
        size="md"
      >
        <form onSubmit={handleSaveManualReading} className="space-y-4">
          {manualError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {manualError}
            </div>
          )}

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
            <strong>Data Source Tag:</strong> Readings submitted through this form will be clearly labeled as{' '}
            <span className="font-bold">"MANUALLY ENTERED"</span> to distinguish them from virtual simulation.
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Virtual Sensor Target *
            </label>
            <select
              value={manualSensorId}
              onChange={(e) => {
                setManualSensorId(e.target.value);
                const s = sensors.find((item) => item.id === e.target.value);
                if (s) {
                  setManualParam(s.parameter);
                  setManualUnit(s.unit);
                }
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            >
              {sensors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sensor_name} ({s.sensor_code}) &bull; {s.parameter}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Reading Measurement Value *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 58.5"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Measurement Unit
              </label>
              <input
                type="text"
                disabled
                value={manualUnit}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-emerald-900 bg-gray-100 dark:bg-emerald-950/40 text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Recorded Timestamp *
            </label>
            <input
              type="datetime-local"
              required
              value={manualDateTime}
              onChange={(e) => setManualDateTime(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Agronomic Observation Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Field capacitance test before scheduled drip cycle."
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" type="button" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Manual Reading'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 2: CSV SENSOR DATA UPLOAD
         ========================================================================= */}
      <Modal
        isOpen={isCsvModalOpen}
        onClose={() => {
          setIsCsvModalOpen(false);
          setCsvPreview(null);
          setCsvImportSuccess(null);
        }}
        title="Import Sensor Readings from CSV"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-emerald-950/30 border border-gray-200 dark:border-emerald-800/50">
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-gray-900 dark:text-white block">Download Sample Template</span>
              <p className="text-gray-500 dark:text-gray-400">
                Columns: <code>sensor_id, parameter, value, unit, recorded_at, notes</code>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSampleCSV}
              className="flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </Button>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleCSVFileChange}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 dark:file:bg-emerald-900 dark:file:text-emerald-200"
            />
          </div>

          {/* Import Success Message */}
          {csvImportSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{csvImportSuccess}</span>
            </div>
          )}

          {/* CSV Preview and Validation Report */}
          {csvPreview && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-700 dark:text-gray-300">
                  Validation Results: <strong className="text-emerald-600">{csvPreview.validRows.length} Valid Rows</strong>
                  {csvPreview.errors.length > 0 && (
                    <span className="text-rose-600 ml-2">({csvPreview.errors.length} Invalid Rows)</span>
                  )}
                </span>
              </div>

              {/* Error Breakdown (Does not silently discard invalid rows) */}
              {csvPreview.errors.length > 0 && (
                <div className="max-h-36 overflow-y-auto p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 space-y-1 text-[11px] text-rose-800 dark:text-rose-300">
                  <span className="font-bold block">Rows with Validation Errors:</span>
                  {csvPreview.errors.map((err, i) => (
                    <div key={i}>
                      Line {err.line}: {err.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Preview Table of First 3 Valid Rows */}
              {csvPreview.validRows.length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-emerald-800 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-emerald-950 text-gray-700 dark:text-gray-300">
                      <tr>
                        <th className="py-2 px-3">Parameter</th>
                        <th className="py-2 px-3">Value</th>
                        <th className="py-2 px-3">Unit</th>
                        <th className="py-2 px-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-emerald-800/40">
                      {csvPreview.validRows.slice(0, 3).map((r, i) => (
                        <tr key={i}>
                          <td className="py-1.5 px-3">{r.parameter}</td>
                          <td className="py-1.5 px-3 font-bold">{r.value}</td>
                          <td className="py-1.5 px-3">{r.unit}</td>
                          <td className="py-1.5 px-3 text-gray-500">{new Date(r.recorded_at).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" onClick={() => setIsCsvModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmCSVImport}
              disabled={isSubmitting || !csvPreview || csvPreview.validRows.length === 0}
            >
              {isSubmitting ? 'Importing...' : `Import ${csvPreview?.validRows.length || 0} Records`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 3: INJECT CONTROLLED ANOMALY
         ========================================================================= */}
      <Modal
        isOpen={isAnomalyModalOpen}
        onClose={() => setIsAnomalyModalOpen(false)}
        title="Inject Controlled Anomaly (Threshold Alert Test)"
        size="md"
      >
        <form onSubmit={handleInjectAnomaly} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300">
            This tool injects a simulated reading specifically calibrated to cross the selected sensor's configured threshold, testing the automatic alert engine and deduplication logic.
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Target Virtual Sensor *
            </label>
            <select
              value={anomalySensorId}
              onChange={(e) => setAnomalySensorId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            >
              {sensors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sensor_name} &bull; Min: {s.min_threshold} | Max: {s.max_threshold} {s.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Anomaly Trigger Type *
            </label>
            <select
              value={anomalyType}
              onChange={(e) => setAnomalyType(e.target.value as 'critical_low' | 'critical_high')}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            >
              <option value="critical_low">Critical Sub-Threshold Dip (e.g. 18% moisture, pH 4.8)</option>
              <option value="critical_high">Critical High Spike (e.g. 42°C temp, 92% moisture, 48 km/h wind)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" type="button" onClick={() => setIsAnomalyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSubmitting ? 'Injecting...' : 'Inject Anomaly & Trigger Alert'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

