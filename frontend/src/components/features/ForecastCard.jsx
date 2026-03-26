import { useCallback, useState } from "react";
import StatusBadge from "../ui/StatusBadge";

const statusColors = {
  GREEN: { bg: "bg-status-green-bg", border: "border-status-green", score: "text-status-green-text" },
  YELLOW: { bg: "bg-status-yellow-bg", border: "border-status-yellow", score: "text-status-yellow-text" },
  RED: { bg: "bg-status-red-bg", border: "border-status-red", score: "text-status-red-text" },
};

const WEATHER_ICON = {
  GREEN: "☀️",
  YELLOW: "⛅",
  RED: "🌧️",
};

export default function ForecastCard({
  forecast,
  hourly = [],
  isSelected = false,
  onClick,
  windTrend = "steady",
}) {
  const [expanded, setExpanded] = useState(false);
  const { day, date, windMph, gustMph, precipPct, flyScore, status, deductions, summary } = forecast;
  const cfg = statusColors[status] || statusColors.RED;

  const handleToggle = useCallback(() => {
    setExpanded((current) => !current);
    onClick?.(forecast);
  }, [forecast, onClick]);

  return (
    <div
      className={`animate-fade-in-up rounded-2xl border shadow-card overflow-hidden ${cfg.border} ${isSelected ? "ring-2 ring-brand-orange" : ""}`}
      aria-expanded={expanded}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`${day} ${date}, fly score ${flyScore}, status ${status}. Tap to ${expanded ? "collapse" : "expand"}.`}
        className={`w-full flex items-center gap-3 px-4 py-3 ${cfg.bg} hover:brightness-[0.97] active:scale-[0.99] text-left`}
      >
        <div className="flex-shrink-0 w-14 text-center">
          <div className="text-lg" aria-hidden="true">{WEATHER_ICON[status] ?? "⛅"}</div>
          <div className="text-sm font-bold text-text-primary">{day}</div>
          <div className="text-xs text-text-muted">{date}</div>
        </div>

        <div className={`flex-shrink-0 text-2xl font-black w-12 text-center ${cfg.score}`}>
          {flyScore}
        </div>

        <div className="flex-1 flex flex-wrap gap-2 min-w-0">
          <MetricPill icon="💨" value={`${windMph} mph`} label="Wind" />
          <MetricPill icon="🌬️" value={`${gustMph} mph`} label="Gust" />
          <MetricPill icon="🌧️" value={`${precipPct}%`} label="Rain" />
          <MetricPill
            icon={windTrend === "up" ? "↗" : windTrend === "down" ? "↘" : "→"}
            value={windTrend === "up" ? "Increasing" : windTrend === "down" ? "Decreasing" : "Steady"}
            label="Trend"
          />
        </div>

        <div className="flex-shrink-0">
          <StatusBadge status={status} size="sm" />
        </div>

        <span
          className={`flex-shrink-0 text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {expanded ? (
        <div className="bg-white px-4 py-3 border-t border-border">
          {summary ? <p className="text-sm text-text-secondary mb-3">{summary}</p> : null}
          {deductions && deductions.some((item) => item.value > 0) ? (
            <div className="mb-3">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Score deductions</p>
              <div className="flex flex-wrap gap-2">
                {deductions
                  .filter((item) => item.value > 0)
                  .map((item) => (
                    <span key={item.label} className="text-xs bg-surface-secondary rounded-lg px-2.5 py-1 font-medium text-text-secondary">
                      -{item.value} {item.label}
                    </span>
                  ))}
              </div>
            </div>
          ) : null}
          {hourly.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Hourly</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {hourly.map((hour) => (
                  <HourlyChip key={hour.time} hour={hour} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MetricPill({ icon, value, label }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-white/70 rounded-lg px-2 py-1 border border-white/50">
      <span aria-hidden="true">{icon}</span>
      <span className="font-semibold text-text-primary">{value}</span>
      <span className="text-text-muted">{label}</span>
    </span>
  );
}

function HourlyChip({ hour }) {
  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-0.5 bg-surface-secondary rounded-xl px-3 py-2 min-w-[60px]">
      <span className="text-xs text-text-muted font-medium">{hour.time}</span>
      <span className="text-sm font-bold text-text-primary">{hour.windMph}mph</span>
      <span className="text-xs text-text-muted">{hour.precipPct}%</span>
    </div>
  );
}
