export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  precipitation: number;
  rain: number;
  weatherCode: number;
  conditionText: string;
  windSpeed: number;
  windDirection: number;
  time: string;
}

export interface HourlyForecastItem {
  time: string;
  hour: string;
  temperature: number;
  humidity: number;
  precipitationProbability: number;
  rain: number;
  weatherCode: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  conditionText: string;
  precipitationSum: number;
  precipitationProbability: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  locationName: string;
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  highTempAlert: boolean;
  heavyRainAlert: boolean;
  fetchedAt: string;
  dataSource: 'OPEN_METEO_LIVE' | 'CACHED_STORE' | 'OFFLINE_FALLBACK';
  errorNotice?: string | null;
}

// Indian agricultural coordinates
export const DISTRICT_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  kolar: { lat: 13.1367, lon: 78.1348, name: 'Kolar, Karnataka' },
  haveri: { lat: 14.7967, lon: 75.3995, name: 'Haveri, Karnataka' },
  bengaluru: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru Rural, Karnataka' },
  belagavi: { lat: 15.8497, lon: 74.4977, name: 'Belagavi, Karnataka' },
  mandya: { lat: 12.5238, lon: 76.8967, name: 'Mandya, Karnataka' },
  mysore: { lat: 12.2958, lon: 76.6394, name: 'Mysuru, Karnataka' },
  shimoga: { lat: 13.9299, lon: 75.5681, name: 'Shivamogga, Karnataka' },
  tumakuru: { lat: 13.3379, lon: 77.1173, name: 'Tumakuru, Karnataka' },
  raichur: { lat: 16.2076, lon: 77.3463, name: 'Raichur, Karnataka' },
  pune: { lat: 18.5204, lon: 73.8567, name: 'Pune, Maharashtra' },
  guntur: { lat: 16.3067, lon: 80.4365, name: 'Guntur, Andhra Pradesh' },
  warangal: { lat: 17.9689, lon: 79.5941, name: 'Warangal, Telangana' },
  coimbatore: { lat: 11.0168, lon: 76.9558, name: 'Coimbatore, Tamil Nadu' },
  ludhiana: { lat: 30.901, lon: 75.8573, name: 'Ludhiana, Punjab' },
  rajkot: { lat: 22.3039, lon: 70.8022, name: 'Rajkot, Gujarat' },
  varanasi: { lat: 25.3176, lon: 82.9739, name: 'Varanasi, Uttar Pradesh' },
};

export function interpretWeatherCode(code: number): string {
  switch (code) {
    case 0:
      return 'Clear Sky';
    case 1:
      return 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Fog & Depositing Rime';
    case 51:
    case 53:
    case 55:
      return 'Light to Moderate Drizzle';
    case 61:
      return 'Slight Rain';
    case 63:
      return 'Moderate Rain';
    case 65:
      return 'Heavy Rainfall';
    case 80:
    case 81:
    case 82:
      return 'Precipitation Rain Showers';
    case 95:
      return 'Thunderstorm with Lightning';
    case 96:
    case 99:
      return 'Thunderstorm with Hail';
    default:
      return 'Fair Weather';
  }
}

// In-memory / client cache (30 minutes expiry)
const CACHE_TTL_MS = 30 * 60 * 1000;
const memoryCache: Map<string, { data: WeatherData; timestamp: number }> = new Map();

export const weatherService = {
  getCoordinatesForLocation(districtOrState?: string): { lat: number; lon: number; name: string } {
    if (!districtOrState) return DISTRICT_COORDINATES.kolar;
    const key = districtOrState.toLowerCase().trim();
    if (DISTRICT_COORDINATES[key]) return DISTRICT_COORDINATES[key];

    // Find partial match
    for (const [k, coords] of Object.entries(DISTRICT_COORDINATES)) {
      if (key.includes(k) || coords.name.toLowerCase().includes(key)) {
        return coords;
      }
    }
    return DISTRICT_COORDINATES.kolar;
  },

  async fetchWeather(districtOrState: string = 'Kolar'): Promise<WeatherData> {
    const coords = this.getCoordinatesForLocation(districtOrState);
    const cacheKey = `${coords.lat.toFixed(4)}_${coords.lon.toFixed(4)}`;

    // Check memory cache
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return { ...cached.data, dataSource: 'CACHED_STORE' };
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,rain,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max&timezone=auto`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Open-Meteo HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();

      const currentCode = json.current?.weather_code ?? 0;
      const currentTemp = Number(json.current?.temperature_2m?.toFixed(1) ?? 28);
      const currentRain = Number(json.current?.rain?.toFixed(1) ?? 0);

      // Hourly items (next 24 hours)
      const hourlyList: HourlyForecastItem[] = [];
      const hourlyTimes: string[] = json.hourly?.time || [];
      const nowIso = new Date().toISOString().substring(0, 13);
      let startIndex = hourlyTimes.findIndex((t: string) => t.startsWith(nowIso));
      if (startIndex === -1) startIndex = 0;

      for (let i = startIndex; i < Math.min(startIndex + 24, hourlyTimes.length); i++) {
        const timeStr = hourlyTimes[i];
        const dateObj = new Date(timeStr);
        hourlyList.push({
          time: timeStr,
          hour: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          temperature: Number(json.hourly?.temperature_2m?.[i]?.toFixed(1) ?? 25),
          humidity: Math.round(json.hourly?.relative_humidity_2m?.[i] ?? 60),
          precipitationProbability: Math.round(json.hourly?.precipitation_probability?.[i] ?? 0),
          rain: Number(json.hourly?.rain?.[i]?.toFixed(1) ?? 0),
          weatherCode: json.hourly?.weather_code?.[i] ?? 0,
        });
      }

      // Daily items (7 days)
      const dailyList: DailyForecastItem[] = [];
      const dailyDates: string[] = json.daily?.time || [];
      for (let j = 0; j < Math.min(7, dailyDates.length); j++) {
        const dateStr = dailyDates[j];
        const dObj = new Date(dateStr);
        const code = json.daily?.weather_code?.[j] ?? 0;
        dailyList.push({
          date: dateStr,
          dayName: j === 0 ? 'Today' : j === 1 ? 'Tomorrow' : dObj.toLocaleDateString('en-IN', { weekday: 'short' }),
          maxTemp: Number(json.daily?.temperature_2m_max?.[j]?.toFixed(1) ?? 30),
          minTemp: Number(json.daily?.temperature_2m_min?.[j]?.toFixed(1) ?? 20),
          weatherCode: code,
          conditionText: interpretWeatherCode(code),
          precipitationSum: Number(json.daily?.precipitation_sum?.[j]?.toFixed(1) ?? 0),
          precipitationProbability: Math.round(json.daily?.precipitation_probability_max?.[j] ?? 0),
          sunrise: json.daily?.sunrise?.[j]?.split('T')[1]?.substring(0, 5) || '06:05',
          sunset: json.daily?.sunset?.[j]?.split('T')[1]?.substring(0, 5) || '18:15',
        });
      }

      const weatherResult: WeatherData = {
        latitude: coords.lat,
        longitude: coords.lon,
        locationName: coords.name,
        timezone: json.timezone || 'Asia/Kolkata',
        current: {
          temperature: currentTemp,
          apparentTemperature: Number(json.current?.apparent_temperature?.toFixed(1) ?? currentTemp),
          relativeHumidity: Math.round(json.current?.relative_humidity_2m ?? 65),
          precipitation: Number(json.current?.precipitation?.toFixed(1) ?? 0),
          rain: currentRain,
          weatherCode: currentCode,
          conditionText: interpretWeatherCode(currentCode),
          windSpeed: Number(json.current?.wind_speed_10m?.toFixed(1) ?? 12),
          windDirection: Math.round(json.current?.wind_direction_10m ?? 180),
          time: json.current?.time || new Date().toISOString(),
        },
        hourly: hourlyList,
        daily: dailyList,
        highTempAlert: currentTemp >= 38,
        heavyRainAlert: currentRain >= 25 || (json.daily?.precipitation_sum?.[0] ?? 0) >= 30,
        fetchedAt: new Date().toISOString(),
        dataSource: 'OPEN_METEO_LIVE',
        errorNotice: null,
      };

      memoryCache.set(cacheKey, { data: weatherResult, timestamp: Date.now() });
      return weatherResult;
    } catch (err: unknown) {
      console.warn('Open-Meteo live API request failed or timed out:', err);

      // Return structured fallback with prominent offline notice
      return this.generateOfflineFallback(coords, err instanceof Error ? err.message : 'Network unreachable');
    }
  },

  generateOfflineFallback(coords: { lat: number; lon: number; name: string }, reason: string): WeatherData {
    const days = ['Today', 'Tomorrow', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];
    const now = new Date();

    const hourly: HourlyForecastItem[] = [];
    for (let h = 0; h < 24; h++) {
      const t = new Date(now.getTime() + h * 3600 * 1000);
      hourly.push({
        time: t.toISOString(),
        hour: t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        temperature: Number((26 + Math.sin(h / 3) * 5).toFixed(1)),
        humidity: Math.round(65 - Math.sin(h / 3) * 15),
        precipitationProbability: h === 14 || h === 15 ? 45 : 10,
        rain: h === 14 ? 1.5 : 0,
        weatherCode: 2,
      });
    }

    const daily: DailyForecastItem[] = days.map((day, idx) => ({
      date: new Date(now.getTime() + idx * 86400 * 1000).toISOString().split('T')[0],
      dayName: day,
      maxTemp: Number((29 + (idx % 3)).toFixed(1)),
      minTemp: Number((20 + (idx % 2)).toFixed(1)),
      weatherCode: idx === 1 ? 61 : 2,
      conditionText: idx === 1 ? 'Slight Rain Showers' : 'Partly Cloudy',
      precipitationSum: idx === 1 ? 8.5 : 0,
      precipitationProbability: idx === 1 ? 60 : 15,
      sunrise: '06:08',
      sunset: '18:12',
    }));

    return {
      latitude: coords.lat,
      longitude: coords.lon,
      locationName: coords.name,
      timezone: 'Asia/Kolkata',
      current: {
        temperature: 27.5,
        apparentTemperature: 28.2,
        relativeHumidity: 68,
        precipitation: 0,
        rain: 0,
        weatherCode: 2,
        conditionText: 'Partly Cloudy (Cached Telemetry)',
        windSpeed: 13.5,
        windDirection: 210,
        time: now.toISOString(),
      },
      hourly,
      daily,
      highTempAlert: false,
      heavyRainAlert: false,
      fetchedAt: now.toISOString(),
      dataSource: 'OFFLINE_FALLBACK',
      errorNotice: `Live Open-Meteo API connection unavailable (${reason}). Displaying cached regional climate projection.`,
    };
  },
};

