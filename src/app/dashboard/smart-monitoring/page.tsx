'use client';

import React from 'react';
import { Activity, Droplets, BatteryCharging, Wifi, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SmartMonitoringPage() {
  const sensorNodes = [
    {
      id: 'NODE-01',
      location: 'Plot A – Tomato Field (North)',
      depth: '15 cm root zone',
      moisture: '64% Optimal',
      temp: '26.4°C',
      battery: '94%',
      signal: 'Strong (LoRaWAN)',
      status: 'Normal',
    },
    {
      id: 'NODE-02',
      location: 'Plot B – Chilli Canopy (South)',
      depth: '30 cm sub-soil',
      moisture: '58% Adequate',
      temp: '27.1°C',
      battery: '88%',
      signal: 'Good (4G-LTE)',
      status: 'Normal',
    },
    {
      id: 'NODE-03',
      location: 'Plot C – Orchard Nursery',
      depth: '10 cm topsoil',
      moisture: '42% Low - Needs Irrigation in 6h',
      temp: '28.8°C',
      battery: '91%',
      signal: 'Strong (LoRaWAN)',
      status: 'Warning',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-6 border-b border-emerald-100 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
              Smart Farm Telemetry & IoT Monitoring
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-emerald-300/80 mt-1">
            Real-time root-zone capacitance probes, ambient micro-meteorology, and battery metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1.5 rounded-full border border-emerald-300/60 dark:border-emerald-800">
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          <span>3 Nodes Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sensorNodes.map((node) => (
          <div
            key={node.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#0A2920] border border-emerald-100 dark:border-emerald-800/80 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {node.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    node.status === 'Normal'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {node.status}
                </span>
              </div>

              <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                {node.location}
              </h2>
              <span className="text-[11px] text-stone-400 dark:text-emerald-400 block mt-0.5">
                Depth: {node.depth}
              </span>

              <div className="mt-4 p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-emerald-400 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-emerald-600" /> Moisture:
                  </span>
                  <span className="font-bold text-emerald-950 dark:text-emerald-100">{node.moisture}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-emerald-400">Soil Temperature:</span>
                  <span className="font-bold text-emerald-950 dark:text-emerald-100">{node.temp}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-emerald-400 flex items-center gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" /> Battery:
                  </span>
                  <span className="font-bold text-emerald-950 dark:text-emerald-100">{node.battery}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between text-[11px] text-stone-400 dark:text-emerald-400">
              <span>{node.signal}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer hover:underline">
                Node Diagnostics &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

