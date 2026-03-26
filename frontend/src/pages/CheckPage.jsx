import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FlyScoreGauge from "../components/features/FlyScoreGauge";
import LocationSearch from "../components/features/LocationSearch";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import { GaugeSkeleton } from "../components/ui/LoadingSkeletons";
import { useFlightData } from "../context/FlightDataContext";
import { useSelectedLocation } from "../context/LocationContext";
import { useProfile } from "../context/ProfileContext";
import { useToast } from "../context/ToastContext";
import { useWeather } from "../hooks/useWeather";
import { mockHourlyForecast } from "../utils/mockHourlyForecast";
import { calculateForecastSummary } from "../utils/scoring";

export default function CheckPage() {
  const { activeProfile } = useProfile();
  const { saveCheck } = useFlightData();
  const { selectedLocation, selectLocation } = useSelectedLocation();
  const { showToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { loading, forecast, fetchForecast, lastUpdated } = useWeather(selectedLocation, activeProfile);

  useEffect(() => {
    if (activeProfile) {
      fetchForecast();
      setSaved(false);
    }
  }, [activeProfile, fetchForecast, selectedLocation]);

  const today = forecast[0] ?? null;
  const weekSummary = useMemo(
    () => (forecast.length ? calculateForecastSummary(forecast) : null),
    [forecast]
  );

  const hourlyToday = mockHourlyForecast[today?.day] ?? [];
  const bestTimeWindow =
    hourlyToday.length > 0
      ? [...hourlyToday].sort((a, b) => a.windMph + a.precipPct - (b.windMph + b.precipPct))[0]?.time ?? null
      : null;
  const confidence = today
    ? today.status === "GREEN" && today.gustMph - today.windMph <= 4
      ? "High"
      : today.status === "YELLOW"
        ? "Moderate"
        : "Low"
    : null;

  const breakdown = useMemo(() => {
    if (!today || !activeProfile) return [];

    return [
      {
        label: "Wind",
        actual: today.windMph,
        threshold: `≤ ${activeProfile.windGreenMph} mph green / ≤ ${activeProfile.windYellowMph} mph caution`,
        impact: -(today.deductions.find((item) => item.label === "Wind")?.value ?? 0),
        evaluation:
          today.windMph <= activeProfile.windGreenMph
            ? "within limit"
            : today.windMph <= activeProfile.windYellowMph
              ? "inside caution band"
              : "over limit",
      },
      {
        label: "Gust",
        actual: today.gustMph,
        threshold: `≤ ${activeProfile.gustGreenMph} mph green / ≤ ${activeProfile.gustYellowMph} mph caution`,
        impact: -(today.deductions.find((item) => item.label === "Gusts")?.value ?? 0),
        evaluation:
          today.gustMph <= activeProfile.gustGreenMph
            ? "within limit"
            : today.gustMph <= activeProfile.gustYellowMph
              ? "inside caution band"
              : "over limit",
      },
      {
        label: "Rain",
        actual: today.precipPct,
        threshold: `≤ ${activeProfile.precipGreenPct}% green / ≤ ${activeProfile.precipYellowPct}% caution`,
        impact: -(today.deductions.find((item) => item.label === "Precip")?.value ?? 0),
        evaluation:
          today.precipPct <= activeProfile.precipGreenPct
            ? "within limit"
            : today.precipPct <= activeProfile.precipYellowPct
              ? "inside caution band"
              : "over limit",
      },
    ];
  }, [activeProfile, today]);

  const handleSave = () => {
    if (!today || !activeProfile) return;

    saveCheck({
      location: selectedLocation,
      profile: activeProfile,
      result: today,
      metrics: {
        windMph: today.windMph,
        gustMph: today.gustMph,
        precipPct: today.precipPct,
      },
      breakdown,
      bestTimeWindow,
      confidence,
      lastUpdated,
    });
    setSaved(true);
    showToast({
      title: "Check saved",
      description: `${selectedLocation.label} logged to your history.`,
      variant: "success",
    });
  };

  return (
    <PageWrapper title="Go / No-Go" subtitle="Your fly score for today">
      <div className="mb-6">
        <LocationSearch value={selectedLocation} onChange={selectLocation} />
      </div>

      {loading ? (
        <GaugeSkeleton />
      ) : !today ? (
        <div className="text-center text-text-secondary py-12">No forecast data available.</div>
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-border shadow-card p-6 flex flex-col items-center gap-4 mb-5 animate-fade-in-up">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              {today.day} {today.date} · {selectedLocation.label}
            </div>
            <FlyScoreGauge score={today.flyScore} status={today.status} size="lg" />
            <div className="flex flex-wrap justify-center gap-2">
              <MetricPill label="Wind" value={`${today.windMph} mph`} />
              <MetricPill label="Gust" value={`${today.gustMph} mph`} />
              <MetricPill label="Rain" value={`${today.precipPct}%`} />
            </div>
            <p className="text-sm text-text-secondary text-center max-w-xs">{today.summary}</p>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-text-muted">
              {confidence ? <span>Confidence: <strong className="text-text-primary">{confidence}</strong></span> : null}
              {bestTimeWindow ? <span>Best time window: <strong className="text-text-primary">{bestTimeWindow}</strong></span> : null}
              {lastUpdated ? <span>Last updated {new Date(lastUpdated).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span> : null}
            </div>

            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <Button variant="primary" onClick={handleSave} disabled={saved} aria-label="Save this check to your flight log">
                {saved ? "✓ Saved to log" : "Log decision"}
              </Button>
              <Link to="/safety">
                <Button variant="secondary" aria-label="Open safety checklist">
                  Safety checklist
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden mb-5">
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              aria-label={expanded ? "Hide score breakdown" : "Show score breakdown"}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-secondary"
            >
              <span className="font-semibold text-text-primary text-sm">Score breakdown</span>
              <span className={`text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            {expanded ? (
              <div className="px-4 pb-4 pt-2 border-t border-border">
                <div className="flex flex-col gap-3">
                  {breakdown.map((item) => (
                    <div key={item.label} className="rounded-xl bg-surface-secondary px-3 py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-text-primary">{item.label}</span>
                        <span className="font-semibold text-status-red-text">{item.impact}</span>
                      </div>
                      <p className="mt-1 text-text-secondary">
                        {item.label}: {item.actual}
                        {item.label === "Rain" ? "%" : " mph"} ({item.evaluation}) → deduction {item.impact}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">Threshold: {item.threshold}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                  <span>Aircraft:</span>
                  <span className="font-medium text-text-primary">{activeProfile?.name}</span>
                </div>
              </div>
            ) : null}
          </div>

          {weekSummary ? (
            <div className="bg-white rounded-2xl border border-border shadow-card p-4 animate-fade-in-up">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">This week</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-black text-status-green-text">{weekSummary.bestWindow?.day}</div>
                  <div className="text-xs text-text-muted">Best day</div>
                </div>
                <div>
                  <div className="text-lg font-black text-status-yellow-text">{weekSummary.cautionDays}</div>
                  <div className="text-xs text-text-muted">Caution days</div>
                </div>
                <div>
                  <div className="text-lg font-black text-status-red-text">{weekSummary.noFlyDays}</div>
                  <div className="text-xs text-text-muted">No-fly days</div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </PageWrapper>
  );
}

function MetricPill({ label, value }) {
  return (
    <span className="rounded-full border border-border bg-surface-secondary px-3 py-1 text-sm font-medium text-text-secondary">
      <span className="text-text-primary">{value}</span> {label}
    </span>
  );
}
