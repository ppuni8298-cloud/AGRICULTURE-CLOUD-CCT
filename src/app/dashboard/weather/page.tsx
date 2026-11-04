'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { farmService } from '@/lib/services/farmService';
import { weatherService, WeatherData, DISTRICT_COORDINATES } from '@/lib/services/weatherService';
import { Button } from '@/components/ui/Button';
import type { Farm } from '@/lib/supabase/types';
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  RefreshCw,
  MapPin,
  Sunrise,
  Sunset,
  Sparkles,
  ShieldAlert,
  Calendar,
} from 'lucide-react';

export default function WeatherIntelligencePage() {
  const { user } = useAuth();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('Kolar');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load farms & weather
  const loadWeatherData = useCallback(async (loc: string) => {
    setRefreshing(true);
    try {
      const data = await weatherService.fetchWeather(loc);
      setWeather(data);
    } catch (err) {
      console.error('Failed to load weather data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const userFarms = await farmService.getFarms(user?.id);
        setFarms(userFarms);
        const initialLoc = userFarms.length > 0 ? userFarms[0].district : 'Kolar';
        setSelectedLocation(initialLoc);
        await loadWeatherData(initialLoc);
      } catch (err) {
        console.error(err);
        await loadWeatherData('Kolar');
      }
    }
    init();
  }, [user?.id, loadWeatherData]);

  const handleLocationChange = (loc: string) => {
    setSelectedLocation(loc);
    loadWeatherData(loc);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Fetching hyperlocal atmospheric data from Open-Meteo...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header & Location Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Agricultural Weather Intelligence
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real Open-Meteo numerical weather prediction model with hourly spray windows & 7-day precipitation forecasts.
          </p>
        </div>

        {/* Location Dropdown & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Target Region:</span>
          </div>
          <select
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-emerald-800 bg-white dark:bg-[#062419] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            {farms.length > 0 && (
              <optgroup label="Your Farm Locations">
                {farms.map((f) => (
                  <option key={f.id} value={f.district}>
                    {f.name} ({f.district})
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="Major Agricultural Districts">
              {Object.entries(DISTRICT_COORDINATES).map(([k, c]) => (
                <option key={k} value={c.name.split(',')[0]}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadWeatherData(selectedLocation)}
            disabled={refreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Offline / Caching Notice (If applicable) */}
      {weather?.errorNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold">Offline / Fallback Meteorological Notice</span>
            <p>{weather.errorNotice}</p>
          </div>
        </div>
      )}

      {/* Severe Weather Warning Banners */}
      {weather?.highTempAlert && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-extrabold uppercase">High Temperature Heatwave Alert ({weather.current.temperature}°C)</span>
            <p>Elevated ambient temperature will induce rapid evapotranspiration and leaf wilt. Consider checking irrigation adequacy.</p>
          </div>
        </div>
      )}

      {weather?.heavyRainAlert && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-3 shadow-sm">
          <CloudRain className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-extrabold uppercase">Heavy Rainfall Precipitation Advisory</span>
            <p>Substantial rainfall detected or forecast soon. Suspend planned foliar fertilizer sprays to prevent chemical runoff.</p>
          </div>
        </div>
      )}

      {/* Current Weather Hero Banner */}
      {weather && (
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-[#063826] text-white p-6 sm:p-8 shadow-xl overflow-hidden border border-emerald-700/50">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-700/60 border border-emerald-500/40 text-emerald-200">
                  {weather.dataSource === 'OPEN_METEO_LIVE' ? 'Live Open-Meteo API' : 'Cached Regional Model'}
                </span>
                <span className="text-xs text-emerald-300 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-lime-400" />
                  {weather.locationName} ({weather.latitude.toFixed(2)}°N, {weather.longitude.toFixed(2)}°E)
                </span>
              </div>

              <div className="flex items-baseline gap-4 pt-1">
                <div className="text-5xl sm:text-6xl font-black tracking-tight">
                  {weather.current.temperature}°C
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-bold text-lime-300 block">
                    {weather.current.conditionText}
                  </span>
                  <span className="text-xs text-emerald-200/80">
                    Feels like {weather.current.apparentTemperature}°C
                  </span>
                </div>
              </div>

              <div className="text-xs text-emerald-200/90 pt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated: {new Date(weather.fetchedAt).toLocaleTimeString('en-IN')} &bull; Timezone: {weather.timezone}</span>
              </div>
            </div>

            {/* Quick Micro-Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 min-w-[280px]">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Droplets className="w-3.5 h-3.5 text-lime-400" />
                  <span>Relative Humidity</span>
                </div>
                <div className="mt-1 text-xl font-black text-white">
                  {weather.current.relativeHumidity}%
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <CloudRain className="w-3.5 h-3.5 text-lime-400" />
                  <span>Precipitation</span>
                </div>
                <div className="mt-1 text-xl font-black text-white">
                  {weather.current.rain} <span className="text-xs font-semibold">mm</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Wind className="w-3.5 h-3.5 text-lime-400" />
                  <span>Wind Speed</span>
                </div>
                <div className="mt-1 text-xl font-black text-white">
                  {weather.current.windSpeed} <span className="text-xs font-semibold">km/h</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Compass className="w-3.5 h-3.5 text-lime-400" />
                  <span>Wind Azimuth</span>
                </div>
                <div className="mt-1 text-xl font-black text-white">
                  {weather.current.windDirection}°
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spray Window & Agronomic Advisory Card */}
      {weather && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Agronomic Spraying & Foliar Window
            </span>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {weather.current.windSpeed < 18 && weather.current.rain === 0
                ? 'Optimal Foliar Application Conditions'
                : 'Caution: Adverse Spraying Conditions Detected'}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Wind speed is {weather.current.windSpeed} km/h (recommended safe limit &lt; 20 km/h) &bull; Current rainfall: {weather.current.rain} mm.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right text-xs">
              <span className="text-gray-400 block">Sunrise / Sunset</span>
              <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex items-center gap-1 text-amber-500"><Sunrise className="w-3.5 h-3.5" /> {weather.daily[0]?.sunrise || '06:08'}</span>
                <span className="flex items-center gap-1 text-orange-500"><Sunset className="w-3.5 h-3.5" /> {weather.daily[0]?.sunset || '18:14'}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hourly Forecast Strip (Next 24 Hours) */}
      {weather && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Hourly Micro-Climate Forecast (Next 24 Hours)</span>
          </h2>

          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-max">
              {weather.hourly.map((h, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#062419] border border-emerald-100 dark:border-emerald-800/40 shadow-sm text-center min-w-[105px] space-y-1.5"
                >
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block">
                    {h.hour}
                  </span>
                  <div className="text-base font-black text-gray-900 dark:text-white">
                    {h.temperature}°C
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3" />
                    <span>{h.humidity}%</span>
                  </div>
                  {h.precipitationProbability > 0 && (
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                      {h.precipitationProbability}% rain
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Forecast Grid */}
      {weather && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>7-Day Synoptic Weather Outlook</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {weather.daily.map((d, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-center transition-all space-y-2 ${
                  idx === 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-white dark:bg-[#062419] border-emerald-100 dark:border-emerald-800/40 shadow-sm'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    {d.dayName}
                  </span>
                  <span className="text-[10px] text-gray-400">{d.date.substring(5)}</span>
                </div>

                <div className="py-1">
                  <span className="text-lg font-black text-gray-900 dark:text-white block">
                    {d.maxTemp}°
                  </span>
                  <span className="text-xs text-gray-400 font-semibold block">
                    {d.minTemp}°C
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 leading-tight">
                  {d.conditionText}
                </div>

                {d.precipitationSum > 0 ? (
                  <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 pt-1 border-t border-gray-100 dark:border-emerald-800/30">
                    {d.precipitationSum} mm ({d.precipitationProbability}%)
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-100 dark:border-emerald-800/30">
                    0 mm rain
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimers & Licensing */}
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-emerald-950/20 border border-gray-100 dark:border-emerald-800/20 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700 dark:text-gray-300">
          Open-Meteo Meteorological Attribution:
        </p>
        <p>
          Weather data provided under the Open Database License (ODbL) by Open-Meteo.com. Numerical weather model predictions are probabilistic and may vary due to localized convective micro-climates. No forecast is guaranteed.
        </p>
      </div>
    </div>
  );
}
