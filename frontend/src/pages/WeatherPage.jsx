import { useEffect, useMemo } from "react";
import ForecastCard from "../components/features/ForecastCard";
import LocationSearch from "../components/features/LocationSearch";
import PageWrapper from "../components/layout/PageWrapper";
import { ForecastCardSkeleton } from "../components/ui/LoadingSkeletons";
import { useSelectedLocation } from "../context/LocationContext";
import { useProfile } from "../context/ProfileContext";
import { useWeather } from "../hooks/useWeather";
import { calculateForecastSummary } from "../utils/scoring";

export default function WeatherPage() {
  const { activeProfile } = useProfile();
  const { selectedLocation, selectLocation } = useSelectedLocation();
  const { loading, forecast, hourly, error, fetchForecast, selectDay, selectedDay, lastUpdated } =
    useWeather(selectedLocation, activeProfile);

  useEffect(() => {
    if (activeProfile) {
      fetchForecast();
    }
  }, [activeProfile, fetchForecast, selectedLocation]);

  const summary = useMemo(
    () => (forecast.length ? calculateForecastSummary(forecast) : null),
    [forecast]
  );

  return (
    <PageWrapper title="7-Day Forecast" subtitle={selectedLocation.label}>
      <div className="mb-5">
        <LocationSearch value={selectedLocation} onChange={selectLocation} />
      </div>

      {summary ? (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <SummaryChip
            label="Best day"
            value={summary.bestWindow?.day ?? "—"}
            color="text-status-green-text"
            background="bg-status-green-bg"
            featured
          />
          <SummaryChip
            label="Caution days"
            value={summary.cautionDays}
            color="text-status-yellow-text"
            background="bg-status-yellow-bg"
          />
          <SummaryChip
            label="No-fly days"
            value={summary.noFlyDays}
            color="text-status-red-text"
            background="bg-status-red-bg"
          />
        </div>
      ) : null}

      {lastUpdated ? (
        <p className="mb-4 text-xs text-text-muted">
          Last updated {new Date(lastUpdated).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </p>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <ForecastCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-status-red-bg text-status-red-text rounded-2xl p-4 text-sm" role="alert">
          {error}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {forecast.map((day, index) => (
            <ForecastCard
              key={day.day}
              forecast={day}
              hourly={hourly[day.day] ?? []}
              isSelected={selectedDay?.day === day.day}
              onClick={selectDay}
              windTrend={
                index === 0
                  ? "steady"
                  : day.windMph > forecast[index - 1].windMph
                    ? "up"
                    : day.windMph < forecast[index - 1].windMph
                      ? "down"
                      : "steady"
              }
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

function SummaryChip({ label, value, color, background, featured = false }) {
  return (
    <div className={`${background} rounded-xl border border-border shadow-card px-3 py-2 text-center animate-fade-in-up`}>
      <div className={`${featured ? "text-2xl" : "text-xl"} font-black ${color}`}>{value}</div>
      <div className="text-xs text-text-muted mt-0.5">{label}</div>
    </div>
  );
}
