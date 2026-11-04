'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { iotService } from '@/lib/services/iotService';
import { farmService } from '@/lib/services/farmService';
import {
  SENSOR_CATEGORIES,
  SENSOR_PARAMETERS,
  SENSOR_STATUSES,
  sensorFormSchema,
} from '@/lib/validations/monitoring';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Farm, Field, IoTSensor, SensorReading, SensorCategory, SensorParameter, SensorStatus } from '@/lib/supabase/types';
import {
  Settings,
  Plus,
  ArrowLeft,
  Search,
  Filter,
  Activity,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Wifi,
  WifiOff,
  History,
  Droplets,
  Thermometer,
  Sun,
  CloudRain,
  Wind,
  Zap,
  MapPin,
  Layers,
  AlertTriangle,
} from 'lucide-react';

export default function VirtualSensorsManagementPage() {
  const { user } = useAuth();

  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [farmFilter, setFarmFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<IoTSensor | null>(null);
  const [deletingSensor, setDeletingSensor] = useState<IoTSensor | null>(null);
  const [viewHistorySensor, setViewHistorySensor] = useState<IoTSensor | null>(null);

  // Form State
  const [formFarmId, setFormFarmId] = useState('');
  const [formFieldId, setFormFieldId] = useState('');
  const [sensorName, setSensorName] = useState('');
  const [sensorCode, setSensorCode] = useState('');
  const [sensorType, setSensorType] = useState<SensorCategory>('soil');
  const [parameter, setParameter] = useState<SensorParameter>('soil_moisture');
  const [unit, setUnit] = useState('%');
  const [minThreshold, setMinThreshold] = useState('40');
  const [maxThreshold, setMaxThreshold] = useState('80');
  const [status, setStatus] = useState<SensorStatus>('active');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allSensors, allFarms, allFields, allReadings] = await Promise.all([
        iotService.getSensors(undefined, undefined, user?.id),
        farmService.getFarms(user?.id),
        farmService.getFields(undefined, user?.id),
        iotService.getReadings({ limit: 400, userId: user?.id }),
      ]);
      setSensors(allSensors);
      setFarms(allFarms);
      setFields(allFields);
      setReadings(allReadings);

      if (allFarms.length > 0 && !formFarmId) {
        setFormFarmId(allFarms[0].id);
        const related = allFields.filter((f) => f.farm_id === allFarms[0].id);
        if (related.length > 0) setFormFieldId(related[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, formFarmId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Available fields for currently selected farm in form
  const availableFields = useMemo(() => {
    return fields.filter((f) => f.farm_id === formFarmId);
  }, [fields, formFarmId]);

  // Compute Device Health Statistics
  const healthStats = useMemo(() => {
    const total = sensors.length;
    const active = sensors.filter((s) => s.status === 'active').length;
    const inactive = sensors.filter((s) => s.status === 'inactive').length;
    const offline = sensors.filter((s) => s.status === 'offline').length;
    const maintenance = sensors.filter((s) => s.status === 'maintenance').length;

    return { total, active, inactive, offline, maintenance };
  }, [sensors]);

  // Generate Unique Sensor Code Shortcut
  const generateNewSensorCode = () => {
    const prefix = parameter.substring(0, 3).toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    return `VIRT-${prefix}-${rand}`;
  };

  const handleOpenAddModal = () => {
    setEditingSensor(null);
    if (farms.length > 0) {
      setFormFarmId(farms[0].id);
      const matchingFields = fields.filter((f) => f.farm_id === farms[0].id);
      if (matchingFields.length > 0) setFormFieldId(matchingFields[0].id);
    }
    setSensorName('');
    const newCode = `VIRT-SOIL-${Math.floor(100 + Math.random() * 900)}`;
    setSensorCode(newCode);
    setSensorType('soil');
    setParameter('soil_moisture');
    setUnit('%');
    setMinThreshold('40');
    setMaxThreshold('80');
    setStatus('active');
    setDescription('');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (sensor: IoTSensor) => {
    setEditingSensor(sensor);
    setFormFarmId(sensor.farm_id);
    setFormFieldId(sensor.field_id);
    setSensorName(sensor.sensor_name);
    setSensorCode(sensor.sensor_code);
    setSensorType(sensor.sensor_type);
    setParameter(sensor.parameter);
    setUnit(sensor.unit);
    setMinThreshold(String(sensor.min_threshold));
    setMaxThreshold(String(sensor.max_threshold));
    setStatus(sensor.status);
    setDescription(sensor.description || '');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const parsedMin = parseFloat(minThreshold);
      const parsedMax = parseFloat(maxThreshold);

      if (parsedMin >= parsedMax) {
        setFormError('Minimum threshold must be strictly lower than maximum threshold.');
        setIsSubmitting(false);
        return;
      }

      const validation = sensorFormSchema.safeParse({
        farm_id: formFarmId,
        field_id: formFieldId,
        sensor_name: sensorName.trim(),
        sensor_code: sensorCode.trim().toUpperCase(),
        sensor_type: sensorType,
        parameter,
        unit,
        min_threshold: parsedMin,
        max_threshold: parsedMax,
        status,
        description: description.trim() || null,
      });

      if (!validation.success) {
        setFormError(validation.error.errors[0]?.message || 'Please check sensor fields');
        setIsSubmitting(false);
        return;
      }

      if (editingSensor) {
        await iotService.updateSensor(
          editingSensor.id,
          {
            farm_id: formFarmId,
            field_id: formFieldId,
            sensor_name: sensorName.trim(),
            sensor_code: sensorCode.trim().toUpperCase(),
            sensor_type: sensorType,
            parameter,
            unit,
            min_threshold: parsedMin,
            max_threshold: parsedMax,
            status,
            description: description.trim() || null,
          },
          user?.id
        );
        setToastMessage(`Updated sensor ${sensorName}`);
      } else {
        await iotService.createSensor(
          {
            farm_id: formFarmId,
            field_id: formFieldId,
            sensor_name: sensorName.trim(),
            sensor_code: sensorCode.trim().toUpperCase(),
            sensor_type: sensorType,
            parameter,
            unit,
            min_threshold: parsedMin,
            max_threshold: parsedMax,
            status,
            description: description.trim() || null,
          },
          user?.id || 'demo-farmer-001'
        );
        setToastMessage(`Registered new virtual sensor ${sensorName}`);
      }

      setIsAddModalOpen(false);
      setTimeout(() => setToastMessage(null), 4000);
      await loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save sensor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (sensor: IoTSensor) => {
    const nextStatus: SensorStatus = sensor.status === 'active' ? 'inactive' : 'active';
    await iotService.updateSensor(sensor.id, { status: nextStatus }, user?.id);
    setToastMessage(`Sensor ${sensor.sensor_code} marked as ${nextStatus.toUpperCase()}`);
    setTimeout(() => setToastMessage(null), 3000);
    await loadData();
  };

  const handleDeleteSensor = async () => {
    if (!deletingSensor) return;
    setIsSubmitting(true);
    try {
      await iotService.deleteSensor(deletingSensor.id, user?.id);
      setDeletingSensor(null);
      setToastMessage('Sensor deleted.');
      setTimeout(() => setToastMessage(null), 3000);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter sensors
  const filteredSensors = sensors.filter((s) => {
    const matchesSearch =
      s.sensor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sensor_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parameter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFarm = farmFilter === 'All' || s.farm_id === farmFilter;
    const matchesCategory = categoryFilter === 'All' || s.sensor_type === categoryFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesFarm && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Loading virtual IoT hardware configurations...
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

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard/monitoring"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Smart Monitoring</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Virtual IoT Sensor Nodes & Hardware Registry
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Provision, calibrate, and configure threshold alert envelopes for software-simulated sensor nodes.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 self-start sm:self-auto shadow-md shadow-emerald-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Virtual Sensor</span>
        </Button>
      </div>

      {/* Device Health Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Total Virtual Devices</span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {healthStats.total}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active
          </span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {healthStats.active}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Inactive
          </span>
          <div className="text-2xl font-black text-gray-700 dark:text-gray-300 mt-1">
            {healthStats.inactive}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-600 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Maintenance
          </span>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
            {healthStats.maintenance}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-rose-600 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Offline Mode
          </span>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
            {healthStats.offline}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sensors by name, code (e.g. KOL-SOIL-01), or parameter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-emerald-800/60 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={farmFilter}
              onChange={(e) => setFarmFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-emerald-800/60 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
            >
              <option value="All">All Farms</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-emerald-800/60 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
            >
              <option value="All">All Categories</option>
              {SENSOR_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-emerald-800/60 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              {SENSOR_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      {filteredSensors.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#062419] border border-dashed border-emerald-200 dark:border-emerald-800/60 space-y-4">
          <Wifi className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {searchQuery || farmFilter !== 'All' ? 'No matching virtual sensors found' : 'No Virtual Sensors Registered'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {searchQuery || farmFilter !== 'All'
              ? 'Try adjusting your search criteria.'
              : 'Provision virtual sensor probes to begin recording soil moisture, micro-climate temperatures, and rainfall.'}
          </p>
          {!searchQuery && farmFilter === 'All' && (
            <Button variant="primary" onClick={handleOpenAddModal}>
              + Provision First Sensor
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSensors.map((sensor) => {
            const parentFarm = farms.find((f) => f.id === sensor.farm_id);
            const parentField = fields.find((f) => f.id === sensor.field_id);
            const sensorReadings = readings.filter((r) => r.sensor_id === sensor.id);
            const latestReading = sensorReadings.length > 0 ? sensorReadings[0] : null;

            return (
              <div
                key={sensor.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {sensor.sensor_code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            sensor.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : sensor.status === 'offline'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {sensor.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1.5 leading-snug">
                        {sensor.sensor_name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(sensor)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          sensor.status === 'active'
                            ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={sensor.status === 'active' ? 'Deactivate Sensor' : 'Activate Sensor'}
                      >
                        {sensor.status === 'active' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(sensor)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        title="Edit Sensor Configuration"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingSensor(sensor)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Sensor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Location Context */}
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Farm: <strong>{parentFarm?.name || 'Assigned Farm'}</strong>
                    </p>
                    <p className="flex items-center gap-1 truncate">
                      <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Field: <strong>{parentField?.name || 'Assigned Field'}</strong>
                    </p>
                  </div>

                  {sensor.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {sensor.description}
                    </p>
                  )}

                  {/* Latest Reading Snippet */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-emerald-950/40 border border-gray-100 dark:border-emerald-800/30 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-500 block">Latest Telemetry</span>
                      <span className="text-base font-extrabold text-gray-900 dark:text-white">
                        {latestReading ? `${latestReading.value} ${sensor.unit}` : 'No readings yet'}
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-gray-400">
                      <span>Thresholds:</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300 block">
                        {sensor.min_threshold} – {sensor.max_threshold} {sensor.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-emerald-800/30 flex items-center justify-between">
                  <button
                    onClick={() => setViewHistorySensor(sensor)}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View History ({sensorReadings.length})</span>
                  </button>

                  <span className="text-[10px] text-gray-400">
                    {latestReading
                      ? `Last: ${new Date(latestReading.recorded_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                      : 'Idle'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD / EDIT VIRTUAL SENSOR
         ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingSensor ? `Configure Sensor: ${editingSensor.sensor_name}` : 'Provision Virtual IoT Sensor'}
        size="lg"
      >
        <form onSubmit={handleSaveSensor} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Parent Farm Holding *
              </label>
              <select
                required
                value={formFarmId}
                onChange={(e) => {
                  setFormFarmId(e.target.value);
                  const matching = fields.filter((f) => f.farm_id === e.target.value);
                  if (matching.length > 0) setFormFieldId(matching[0].id);
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Field Partition *
              </label>
              <select
                required
                value={formFieldId}
                onChange={(e) => setFormFieldId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {availableFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.size} {f.area_unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Sensor Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. North Terrace Soil Probe 1"
                value={sensorName}
                onChange={(e) => setSensorName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Sensor Code (Unique ID) *
                </label>
                <button
                  type="button"
                  onClick={() => setSensorCode(generateNewSensorCode())}
                  className="text-[11px] text-emerald-600 hover:underline"
                >
                  Generate Code
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. KOL-SOIL-01"
                value={sensorCode}
                onChange={(e) => setSensorCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Sensor Category *
              </label>
              <select
                value={sensorType}
                onChange={(e) => setSensorType(e.target.value as SensorCategory)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {SENSOR_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Measurement Parameter *
              </label>
              <select
                value={parameter}
                onChange={(e) => {
                  const p = e.target.value as SensorParameter;
                  setParameter(p);
                  const meta = SENSOR_PARAMETERS[p];
                  if (meta) {
                    setUnit(meta.unit);
                    setMinThreshold(String(meta.defaultMinThreshold));
                    setMaxThreshold(String(meta.defaultMaxThreshold));
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {Object.entries(SENSOR_PARAMETERS).map(([k, meta]) => (
                  <option key={k} value={k}>
                    {meta.name} ({meta.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Operational Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SensorStatus)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              >
                {SENSOR_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Minimum Safe Threshold ({unit}) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
              <span className="text-[10px] text-gray-400">Trigger alert if reading drops below this</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Maximum Safe Threshold ({unit}) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={maxThreshold}
                onChange={(e) => setMaxThreshold(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
              />
              <span className="text-[10px] text-gray-400">Trigger alert if reading spikes above this</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Sensor Hardware Description / Calibration Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Capacitance probe placed at 15cm root-zone depth."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingSensor ? 'Save Changes' : 'Provision Sensor'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 2: VIEW SENSOR HISTORY
         ========================================================================= */}
      <Modal
        isOpen={!!viewHistorySensor}
        onClose={() => setViewHistorySensor(null)}
        title={`Telemetry History: ${viewHistorySensor?.sensor_name || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-100 dark:border-emerald-800/30">
            <span>
              Sensor Code: <strong className="font-mono">{viewHistorySensor?.sensor_code}</strong>
            </span>
            <span>
              Thresholds: <strong>{viewHistorySensor?.min_threshold} – {viewHistorySensor?.max_threshold} {viewHistorySensor?.unit}</strong>
            </span>
          </div>

          {(() => {
            const list = readings.filter((r) => r.sensor_id === viewHistorySensor?.id);
            if (list.length === 0) {
              return (
                <div className="py-8 text-center text-xs text-gray-400">
                  No readings recorded yet for this sensor.
                </div>
              );
            }

            return (
              <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200 dark:border-emerald-800 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Value</th>
                      <th className="py-2.5 px-3">Data Source</th>
                      <th className="py-2.5 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-emerald-800/40">
                    {list.map((r) => (
                      <tr key={r.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20">
                        <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">
                          {new Date(r.recorded_at).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                          {r.value} {r.unit}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {r.data_source}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-500 max-w-xs truncate">
                          {r.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setViewHistorySensor(null)}>
              Close History
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Sensor Modal */}
      <Modal
        isOpen={!!deletingSensor}
        onClose={() => setDeletingSensor(null)}
        title="Delete Virtual Sensor"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete virtual sensor <strong>{deletingSensor?.sensor_name}</strong> ({deletingSensor?.sensor_code})?
            All historical telemetry readings for this sensor will also be deleted.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-emerald-800/40">
            <Button variant="outline" onClick={() => setDeletingSensor(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteSensor}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Sensor'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

