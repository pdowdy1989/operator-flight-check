import { calculateDashboardFlyScore, getConditionLabel } from "../utils/scoring";

function toDateKey(input) {
  if (!input) return "";
  return new Date(input).toISOString().slice(0, 10);
}

function mapWeatherCodeToConditionCode(code) {
  if (code === 95 || code === 96 || code === 99) return 201;
  if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) return 601;
  if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) return 301;
  if (code === 45 || code === 48) return 741;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 501;
  if ([1, 2, 3].includes(code)) return 802;
  return 0;
}

function getConditionKind(conditionCode) {
  if (conditionCode >= 200 && conditionCode < 300) return "storm";
  if (conditionCode >= 500 && conditionCode < 700) return "rain";
  if (conditionCode === 741) return "fog";
  if (conditionCode >= 800) return "cloud";
  return "clear";
}

function aggregateMissionDay(payload, missionDate) {
  const targetDate = toDateKey(missionDate);
  const dates = payload?.daily?.time ?? [];
  const targetIndex = dates.findIndex((date) => toDateKey(date) === targetDate);
  const fallbackIndex = dates.length ? 0 : -1;
  const index = targetIndex >= 0 ? targetIndex : fallbackIndex;

  if (index < 0) {
    return null;
  }

  const weatherCode = Number(payload.daily.weather_code?.[index] ?? 0);
  const conditionCode = mapWeatherCodeToConditionCode(weatherCode);

  return {
    windMph: Math.round(Number(payload.daily.wind_speed_10m_max?.[index] ?? 0)),
    gustMph: Math.round(Number(payload.daily.wind_gusts_10m_max?.[index] ?? 0)),
    precipPct: Math.round(Number(payload.daily.precipitation_probability_max?.[index] ?? 0)),
    conditionCode,
  };
}

export const weatherService = {
  async getMissionWeatherPreview({ lat, lon, missionDate }) {
    if (Number.isNaN(Number(lat)) || Number.isNaN(Number(lon))) {
      throw new Error("Enter a valid latitude and longitude");
    }

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      "&daily=weather_code,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max" +
      "&timezone=auto&forecast_days=7&wind_speed_unit=mph&temperature_unit=fahrenheit";
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to load weather data");
    }

    const payload = await response.json();
    const aggregated = aggregateMissionDay(payload, missionDate);

    if (!aggregated) {
      throw new Error("No weather data available");
    }

    const scoring = calculateDashboardFlyScore(aggregated);

    return {
      ...aggregated,
      ...scoring,
      conditionLabel: getConditionLabel(aggregated.conditionCode),
      conditionKind: getConditionKind(aggregated.conditionCode),
    };
  },
};
