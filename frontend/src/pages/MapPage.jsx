import { useEffect, useMemo } from "react";
import FlightMap from "../components/features/FlightMap";
import LocationSearch from "../components/features/LocationSearch";
import StatusBadge from "../components/ui/StatusBadge";
import { MapSkeleton } from "../components/ui/LoadingSkeletons";
import Skeleton from "../components/ui/Skeleton";
import PageWrapper from "../components/layout/PageWrapper";
import { useFlightData } from "../context/FlightDataContext";
import { useSelectedLocation } from "../context/LocationContext";
import { useProfile } from "../context/ProfileContext";
import { useWeather } from "../hooks/useWeather";

export default function MapPage() {
  const { activeProfile } = useProfile();
  const { spots, checks } = useFlightData();
  const { selectedLocation, selectLocation } = useSelectedLocation();
  const { loading, forecast, lastUpdated, fetchForecast } = useWeather(selectedLocation, activeProfile);

  useEffect(() => {
    if (activeProfile) {
      fetchForecast();
    }
  }, [activeProfile, fetchForecast, selectedLocation]);

  const todayScore = useMemo(() => forecast[0] ?? null, [forecast]);

  const spotsWithLatestCheck = useMemo(
    () =>
      spots.map((spot) => {
        const latestCheck = checks.find((check) => check.spotId === spot.id) ?? null;
        return {
          ...spot,
          latestFlyScore: latestCheck?.flyScore ?? null,
          lastStatus: latestCheck?.status ?? spot.lastStatus,
        };
      }),
    [checks, spots]
  );

  return (
    <PageWrapper title="Map" subtitle={`Fly conditions near ${selectedLocation.label}`}>
      <div className="mb-6">
        <LocationSearch value={selectedLocation} onChange={selectLocation} />
      </div>

      {loading ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-12 w-28" />
                <Skeleton className="h-8 w-28" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          <MapSkeleton />
        </div>
      ) : (
        <>
          {todayScore ? (
            <div className="bg-white rounded-2xl border border-border shadow-card p-5 mb-5 animate-fade-in-up">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Today · {todayScore.day} {todayScore.date}
                  </p>
                  <p className="text-5xl font-black text-text-primary leading-none mb-1">
                    {todayScore.flyScore}
                    <span className="text-xl font-normal text-text-muted ml-1">/ 100</span>
                  </p>
                  <StatusBadge status={todayScore.status} size="md" />
                </div>
                <div className="text-right text-sm text-text-secondary flex flex-col gap-1">
                  <span>💨 {todayScore.windMph} mph wind</span>
                  <span>🌬️ {todayScore.gustMph} mph gusts</span>
                  <span>🌧️ {todayScore.precipPct}% rain</span>
                </div>
              </div>
              {todayScore.summary ? (
                <p className="text-sm text-text-secondary mt-3 pt-3 border-t border-border">
                  {todayScore.summary}
                </p>
              ) : null}
              {lastUpdated ? (
                <p className="mt-3 text-xs text-text-muted">
                  Last updated {new Date(lastUpdated).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mb-5 animate-fade-in-up">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-text-primary">Interactive Map</h2>
              <p className="text-xs text-text-muted">Saved spots are color-coded by their latest logged check.</p>
            </div>
            <FlightMap center={selectedLocation} spots={spotsWithLatestCheck} onSelectLocation={selectLocation} />
          </div>

          <div className="animate-fade-in-up">
            <h2 className="text-base font-bold text-text-primary mb-3">Saved Spots</h2>
            <div className="flex flex-col gap-3">
              {spotsWithLatestCheck.map((spot) => (
                <SpotMapCard key={spot.id} spot={spot} />
              ))}
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
}

function SpotMapCard({ spot }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-card px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-primary truncate">{spot.label}</span>
          {spot.isFavorite ? <span className="text-brand-orange text-sm" aria-label="Favorite">★</span> : null}
        </div>
        <p className="text-xs text-text-muted truncate mt-0.5">{spot.address}</p>
      </div>
      {spot.lastStatus ? <StatusBadge status={spot.lastStatus} size="sm" showDot={false} /> : null}
    </div>
  );
}
