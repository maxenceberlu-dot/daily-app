"use client";

import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  isDay: boolean;
  hourlyRain: { time: string; precipitation: number }[];
  willRain: boolean;
  rainHour: string | null;
}

const WEATHER_DESCRIPTIONS: Record<number, { label: string; icon: string }> = {
  0: { label: "Ciel dégagé", icon: "☀️" },
  1: { label: "Peu nuageux", icon: "🌤️" },
  2: { label: "Partiellement nuageux", icon: "⛅" },
  3: { label: "Couvert", icon: "☁️" },
  45: { label: "Brouillard", icon: "🌫️" },
  48: { label: "Brouillard givrant", icon: "🌫️" },
  51: { label: "Bruine légère", icon: "🌦️" },
  53: { label: "Bruine modérée", icon: "🌦️" },
  55: { label: "Bruine forte", icon: "🌧️" },
  61: { label: "Pluie légère", icon: "🌧️" },
  63: { label: "Pluie modérée", icon: "🌧️" },
  65: { label: "Pluie forte", icon: "🌧️" },
  66: { label: "Pluie verglaçante", icon: "🌧️" },
  67: { label: "Pluie verglaçante forte", icon: "🌧️" },
  71: { label: "Neige légère", icon: "🌨️" },
  73: { label: "Neige modérée", icon: "🌨️" },
  75: { label: "Neige forte", icon: "❄️" },
  77: { label: "Grains de neige", icon: "❄️" },
  80: { label: "Averses légères", icon: "🌦️" },
  81: { label: "Averses modérées", icon: "🌧️" },
  82: { label: "Averses violentes", icon: "⛈️" },
  85: { label: "Averses de neige", icon: "🌨️" },
  86: { label: "Averses de neige fortes", icon: "🌨️" },
  95: { label: "Orage", icon: "⛈️" },
  96: { label: "Orage avec grêle", icon: "⛈️" },
  99: { label: "Orage violent avec grêle", icon: "⛈️" },
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchWeather() {
    try {
      setLoading(true);
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,is_day&hourly=precipitation&timezone=Europe/Paris&forecast_days=1"
      );
      if (!res.ok) throw new Error("Erreur API météo");
      const data = await res.json();

      const now = new Date();
      const currentHourIndex = now.getHours();

      const hourlyRain = data.hourly.time
        .slice(currentHourIndex, currentHourIndex + 12)
        .map((time: string, i: number) => ({
          time,
          precipitation: data.hourly.precipitation[currentHourIndex + i] || 0,
        }));

      const firstRain = hourlyRain.find(
        (h: { precipitation: number }) => h.precipitation > 0
      );

      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        apparentTemperature: Math.round(data.current.apparent_temperature),
        weatherCode: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        isDay: data.current.is_day === 1,
        hourlyRain,
        willRain: !!firstRain,
        rainHour: firstRain
          ? new Date(firstRain.time).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
      });
      setError(null);
    } catch {
      setError("Impossible de charger la météo");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !weather) return <WeatherSkeleton />;

  if (error && !weather) {
    return (
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
        <p className="text-sm text-[var(--danger)]">{error}</p>
        <button
          onClick={fetchWeather}
          className="text-sm text-[var(--accent)] mt-2 hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!weather) return null;

  const weatherInfo = WEATHER_DESCRIPTIONS[weather.weatherCode] || {
    label: "Inconnu",
    icon: "🌡️",
  };

  const maxPrecip = Math.max(
    ...weather.hourlyRain.map((h) => h.precipitation),
    1
  );

  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📍</span>
        <h2 className="text-lg font-semibold">Paris</h2>
        <span className="ml-auto text-xs text-[var(--muted)]">
          Mis à jour{" "}
          {new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className="text-5xl">{weatherInfo.icon}</span>
        <div>
          <p className="text-4xl font-bold">{weather.temperature}°C</p>
          <p className="text-sm text-[var(--muted)]">{weatherInfo.label}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="rounded-lg bg-[var(--accent-light)] p-2">
          <p className="text-xs text-[var(--muted)]">Ressenti</p>
          <p className="text-sm font-semibold">{weather.apparentTemperature}°C</p>
        </div>
        <div className="rounded-lg bg-[var(--accent-light)] p-2">
          <p className="text-xs text-[var(--muted)]">Humidité</p>
          <p className="text-sm font-semibold">{weather.humidity}%</p>
        </div>
        <div className="rounded-lg bg-[var(--accent-light)] p-2">
          <p className="text-xs text-[var(--muted)]">Vent</p>
          <p className="text-sm font-semibold">{weather.windSpeed} km/h</p>
        </div>
      </div>

      {/* Rain alert */}
      <div
        className={`rounded-lg p-3 mb-4 ${
          weather.willRain
            ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
            : "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
        }`}
      >
        {weather.willRain ? (
          <p className="text-sm">
            🌧️ <strong>Pluie prévue</strong> vers {weather.rainHour}
          </p>
        ) : (
          <p className="text-sm">
            ☀️ <strong>Pas de pluie</strong> dans les prochaines heures
          </p>
        )}
      </div>

      {/* Rain chart */}
      <div>
        <p className="text-xs text-[var(--muted)] mb-2">
          Précipitations (12 prochaines heures)
        </p>
        <div className="flex items-end gap-1 h-16">
          {weather.hourlyRain.map((h, i) => {
            const height = (h.precipitation / maxPrecip) * 100;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-0.5"
              >
                <div
                  className="w-full rounded-sm bg-blue-400 dark:bg-blue-500 min-h-[2px] transition-all"
                  style={{ height: `${Math.max(height, 3)}%` }}
                  title={`${h.precipitation}mm`}
                />
                {i % 3 === 0 && (
                  <span className="text-[10px] text-[var(--muted)]">
                    {new Date(h.time).getHours()}h
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm animate-pulse">
      <div className="h-6 bg-[var(--card-border)] rounded w-24 mb-4" />
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-[var(--card-border)] rounded-full" />
        <div>
          <div className="h-10 bg-[var(--card-border)] rounded w-24 mb-2" />
          <div className="h-4 bg-[var(--card-border)] rounded w-32" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="h-14 bg-[var(--card-border)] rounded-lg" />
        <div className="h-14 bg-[var(--card-border)] rounded-lg" />
        <div className="h-14 bg-[var(--card-border)] rounded-lg" />
      </div>
      <div className="h-12 bg-[var(--card-border)] rounded-lg" />
    </div>
  );
}
