'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { iotService } from '@/lib/services/iotService';
import { farmService } from '@/lib/services/farmService';
import { Button } from '@/components/ui/Button';
import type { Farm, Field, IoTSensor, MonitoringAlert, AlertSeverity, AlertStatus } from '@/lib/supabase/types';
import {
  Bell,
  ArrowLeft,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  Check,
  Eye,
  Clock,
  MapPin,
  Layers,
  Sparkles,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function MonitoringAlertsPage() {
  const { user } = useAuth();

  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | AlertSeverity>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | AlertStatus>('All');
  const [farmFilter, setFarmFilter] = useState('All');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allAlerts, allSensors, allFarms, allFields] = await Promise.all([
        iotService.getAlerts({ userId: user?.id }),
        iotService.getSensors(undefined, undefined, user?.id),
        farmService.getFarms(user?.id),
        farmService.getFields(undefined, user?.id),
      ]);
      setAlerts(allAlerts);
      setSensors(allSensors);
      setFarms(allFarms);
      setFields(allFields);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Mark as Acknowledged
  const handleAcknowledge = async (alertId: string) => {
    await iotService.resolveAlert(alertId, 'acknowledged', user?.id);
    setToastMessage('Alert marked as acknowledged.');
    setTimeout(() => setToastMessage(null), 3000);
    await loadData();
  };

  // Handle Resolve Alert
  const handleResolve = async (alertId: string) => {
    await iotService.resolveAlert(alertId, 'resolved', user?.id);
    setToastMessage('Alert marked as resolved.');
    setTimeout(() => setToastMessage(null), 3000);
    await loadData();
  };

  // Filtered alerts
  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.alert_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'All' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesFarm = farmFilter === 'All' || a.farm_id === farmFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesFarm;
  });

  // KPI counters
  const counts = useMemo(() => {
    const active = alerts.filter((a) => a.status === 'active').length;
    const critical = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
    const warning = alerts.filter((a) => a.severity === 'warning' && a.status === 'active').length;
    const resolved = alerts.filter((a) => a.status === 'resolved').length;

    return { active, critical, warning, resolved };
  }, [alerts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Loading threshold alerts & incident logs...
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
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <span>Threshold Alert System & Incident Feed</span>
            {counts.active > 0 && (
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                {counts.active} Active
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Automated threshold evaluation engine with 30-minute deduplication and cautious agronomic guidance.
          </p>
        </div>
      </div>

      {/* KPI Severity Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase">Active Alerts</span>
          <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {counts.active}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-rose-100 dark:border-rose-900/40 shadow-sm">
          <span className="text-[11px] font-semibold text-rose-600 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Critical Breaches
          </span>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
            {counts.critical}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-amber-100 dark:border-amber-900/40 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-600 uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Warnings
          </span>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
            {counts.warning}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Resolved Incidents
          </span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {counts.resolved}
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
              placeholder="Search alerts by title or description..."
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
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as 'All' | AlertSeverity)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-emerald-800/60 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
            >
              <option value="All">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Information</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | AlertStatus)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-emerald-800/60 bg-gray-50 dark:bg-emerald-950/40 text-gray-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Feed Cards List */}
      {filteredAlerts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#062419] border border-dashed border-emerald-200 dark:border-emerald-800/60 space-y-4">
          <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {searchQuery || severityFilter !== 'All' ? 'No matching alerts found' : 'No Environmental Breaches Detected'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {searchQuery || severityFilter !== 'All'
              ? 'Try adjusting your search criteria.'
              : 'All active virtual sensor nodes are currently operating within their safe configured threshold envelopes.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const sensor = sensors.find((s) => s.id === alert.sensor_id);
            const farm = farms.find((f) => f.id === alert.farm_id);
            const field = fields.find((f) => f.id === alert.field_id);

            // Severity formatting
            let severityBadge = (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                Warning
              </span>
            );
            if (alert.severity === 'critical') {
              severityBadge = (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 animate-pulse">
                  Critical Breach
                </span>
              );
            } else if (alert.severity === 'info') {
              severityBadge = (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300">
                  Info
                </span>
              );
            }

            return (
              <div
                key={alert.id}
                className={`p-6 rounded-3xl bg-white dark:bg-[#062419] border transition-all space-y-4 ${
                  alert.status === 'active'
                    ? alert.severity === 'critical'
                      ? 'border-rose-300 dark:border-rose-800/80 shadow-md ring-1 ring-rose-500/20'
                      : 'border-amber-300 dark:border-amber-800/80 shadow-md'
                    : 'border-gray-200 dark:border-emerald-800/40 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {severityBadge}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          alert.status === 'active'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950'
                            : alert.status === 'acknowledged'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950'
                        }`}
                      >
                        Status: {alert.status}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {alert.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                      {alert.description}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    {alert.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledge(alert.id)}
                        className="text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </Button>
                    )}

                    {alert.status !== 'resolved' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleResolve(alert.id)}
                        className="text-xs flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Technical Reading Context Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-gray-100 dark:border-emerald-800/30">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Sensor Node</span>
                    <span className="font-semibold text-gray-900 dark:text-white font-mono">
                      {sensor?.sensor_code || 'Sensor'} ({sensor?.parameter})
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px]">Recorded Reading</span>
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">
                      {alert.triggered_value} {sensor?.unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px]">Breached Threshold</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Limit: {alert.threshold_value} {sensor?.unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[11px]">Location</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 truncate block">
                      {farm?.name || 'Farm'} / {field?.name || 'Field'}
                    </span>
                  </div>
                </div>

                {/* Recommended Action Pill */}
                {alert.recommended_action && (
                  <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Cautious Agronomic Advisory:</strong>
                      <p className="mt-0.5 leading-relaxed">{alert.recommended_action}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

