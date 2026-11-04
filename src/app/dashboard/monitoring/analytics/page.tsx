'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { iotService } from '@/lib/services/iotService';
import { farmService } from '@/lib/services/farmService';
import { SENSOR_PARAMETERS } from '@/lib/validations/monitoring';
import { Button } from '@/components/ui/Button';
import type { Farm, Field, IoTSensor, SensorReading, SensorParameter } from '@/lib/supabase/types';
import {
  BarChart3,
  ArrowLeft,
  Download,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  Activity,
  Droplets,
  Thermometer,
  Sun,
  CloudRain,
  Wind,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function HistoricalAnalyticsPage() {
  const { user } = useAuth();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Chart Controls
  const [selectedSensorId, setSelectedSensorId] = useState<string>('All');
  const [selectedParam, setSelectedParam] = useState<SensorParameter>('soil_moisture');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar' | 'comparison'>('area');
  const [comparisonParam, setComparisonParam] = useState<SensorParameter>('air_humidity');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allFarms, allSensors, allReadings] = await Promise.all([
        farmService.getFarms(user?.id),
        iotService.getSensors(undefined, undefined, user?.id),
        iotService.getReadings({ limit: 1000, userId: user?.id }),
      ]);
      setFarms(allFarms);
      setSensors(allSensors);
      setReadings(allReadings);

      if (allSensors.length > 0) {
        setSelectedSensorId(allSensors[0].id);
        setSelectedParam(allSensors[0].parameter);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Active parameter metadata
  const paramMeta = SENSOR_PARAMETERS[selectedParam] || SENSOR_PARAMETERS.soil_moisture;
  const compareMeta = SENSOR_PARAMETERS[comparisonParam] || SENSOR_PARAMETERS.air_humidity;

  // Filtered readings based on time range and parameter
  const filteredDataset = useMemo(() => {
    const now = Date.now();
    const rangeMs =
      timeRange === '24h'
        ? 24 * 3600 * 1000
        : timeRange === '7d'
        ? 7 * 86400 * 1000
        : 30 * 86400 * 1000;

    let list = readings.filter((r) => now - new Date(r.recorded_at).getTime() <= rangeMs);

    if (selectedSensorId !== 'All') {
      list = list.filter((r) => r.sensor_id === selectedSensorId);
    } else {
      list = list.filter((r) => r.parameter === selectedParam);
    }

    // Sort chronologically ascending for chart rendering
    list.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
    return list;
  }, [readings, timeRange, selectedSensorId, selectedParam]);

  // Aggregate KPI Statistics
  const stats = useMemo(() => {
    if (filteredDataset.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0, latest: 0 };
    }
    const vals = filteredDataset.map((r) => Number(r.value));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = sum / vals.length;
    const latest = vals[vals.length - 1];

    return {
      min: Number(min.toFixed(1)),
      max: Number(max.toFixed(1)),
      avg: Number(avg.toFixed(1)),
      count: vals.length,
      latest: Number(latest.toFixed(1)),
    };
  }, [filteredDataset]);

  // Chart Data Mapping: Group into smooth intervals
  const chartData = useMemo(() => {
    if (filteredDataset.length === 0) return [];

    if (chartType === 'bar') {
      // Group daily averages
      const dailyMap = new Map<string, { sum: number; count: number }>();
      filteredDataset.forEach((r) => {
        const d = new Date(r.recorded_at).toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        const curr = dailyMap.get(d) || { sum: 0, count: 0 };
        dailyMap.set(d, { sum: curr.sum + Number(r.value), count: curr.count + 1 });
      });

      return Array.from(dailyMap.entries()).map(([day, v]) => ({
        timestamp: day,
        value: Number((v.sum / v.count).toFixed(1)),
      }));
    }

    if (chartType === 'comparison') {
      // Overlay comparison parameter readings
      const compReadings = readings
        .filter((r) => r.parameter === comparisonParam)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

      return filteredDataset.slice(-30).map((r, i) => {
        const comp = compReadings[i];
        return {
          timestamp: new Date(r.recorded_at).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          [paramMeta.name]: r.value,
          [compareMeta.name]: comp ? comp.value : null,
        };
      });
    }

    // Default Area / Line format
    return filteredDataset.slice(-40).map((r) => ({
      timestamp: new Date(r.recorded_at).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      fullDate: new Date(r.recorded_at).toLocaleString('en-IN'),
      value: r.value,
      source: r.data_source,
    }));
  }, [filteredDataset, chartType, readings, comparisonParam, paramMeta, compareMeta]);

  const handleExportCSV = () => {
    const csv = iotService.exportReadingsToCSV(filteredDataset, sensors);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrocloud_${selectedParam}_analytics_${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Synthesizing historical telemetry charts...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header & Breadcrumb */}
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
            Historical Sensor Telemetry Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Multi-temporal environmental trend analysis across hourly, daily, and monthly intervals.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics CSV</span>
        </Button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Latest Telemetry</span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {stats.latest} <span className="text-xs font-semibold">{paramMeta.unit}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Minimum Reading</span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {stats.min} <span className="text-xs font-semibold">{paramMeta.unit}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Maximum Reading</span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {stats.max} <span className="text-xs font-semibold">{paramMeta.unit}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Mean Average</span>
          <div className="text-2xl font-black text-lime-700 dark:text-lime-400 mt-1">
            {stats.avg} <span className="text-xs font-semibold">{paramMeta.unit}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Packets Evaluated</span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {stats.count}
          </div>
        </div>
      </div>

      {/* Control Bar: Parameter, Sensor, Range, Chart Type */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Target Sensor / Parameter */}
          <div>
            <select
              value={selectedSensorId}
              onChange={(e) => {
                setSelectedSensorId(e.target.value);
                const s = sensors.find((item) => item.id === e.target.value);
                if (s) setSelectedParam(s.parameter);
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-emerald-800 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
            >
              <option value="All">All Probes &bull; {paramMeta.name}</option>
              {sensors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sensor_name} ({s.sensor_code})
                </option>
              ))}
            </select>
          </div>

          {/* Time Granularity */}
          <div className="flex items-center rounded-xl bg-gray-100 dark:bg-emerald-950 p-1 border border-gray-200 dark:border-emerald-800">
            {(['24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  timeRange === r
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-emerald-700'
                }`}
              >
                {r === '24h' ? 'Last 24 Hours' : r === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          {/* Comparison Mode Selector */}
          {chartType === 'comparison' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-semibold">Compare With:</span>
              <select
                value={comparisonParam}
                onChange={(e) => setComparisonParam(e.target.value as SensorParameter)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-emerald-800 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
              >
                {Object.entries(SENSOR_PARAMETERS).map(([k, meta]) => (
                  <option key={k} value={k}>
                    {meta.name} ({meta.unit})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-semibold mr-1">Chart Type:</span>
          {[
            { id: 'area', label: 'Area' },
            { id: 'line', label: 'Line' },
            { id: 'bar', label: 'Daily Averages' },
            { id: 'comparison', label: 'Compare 2 Sensors' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setChartType(type.id as typeof chartType)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                chartType === type.id
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold'
                  : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-emerald-900 hover:bg-gray-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-emerald-800/30">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>
                {chartType === 'comparison'
                  ? `${paramMeta.name} vs ${compareMeta.name} Multi-Sensor Overlay`
                  : chartType === 'bar'
                  ? `Daily Average ${paramMeta.name} Trend`
                  : `${paramMeta.name} Dynamic Telemetry Envelope`}
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Y-Axis Unit: <strong>{paramMeta.unit}</strong> &bull; Safe Agronomic Range:{' '}
              <strong>{paramMeta.defaultMinThreshold} – {paramMeta.defaultMaxThreshold} {paramMeta.unit}</strong>
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Simulated & Verified Sensor Data
          </span>
        </div>

        {chartData.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-xs text-gray-400 space-y-2">
            <Activity className="w-8 h-8 text-gray-300" />
            <span>No historical telemetry records found for this time window.</span>
          </div>
        ) : (
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#84CC16" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="timestamp" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#062419',
                      borderColor: '#059669',
                      borderRadius: '1rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={paramMeta.name}
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#analyticsGradient)"
                  />
                </AreaChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="timestamp" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#062419',
                      borderColor: '#059669',
                      borderRadius: '1rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={paramMeta.name}
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ fill: '#84CC16', r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : chartType === 'bar' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="timestamp" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#062419',
                      borderColor: '#059669',
                      borderRadius: '1rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" name={`Avg ${paramMeta.name}`} fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="timestamp" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#062419',
                      borderColor: '#059669',
                      borderRadius: '1rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={paramMeta.name}
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={compareMeta.name}
                    stroke="#84CC16"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

