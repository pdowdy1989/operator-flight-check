import { useState } from "react";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";

export default function SpotCheckCard({ check, onSaveNote, onRepeat }) {
  const [expanded, setExpanded] = useState(false);
  const [noteDraft, setNoteDraft] = useState(check.notes ?? "");
  const {
    date,
    locationLabel,
    flyScore,
    status,
    profile,
    summary,
    metrics,
    breakdown,
    confidence,
    bestTimeWindow,
  } = check;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden animate-fade-in-up">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-label={`Check on ${date} at ${locationLabel}, status ${status}. Tap to ${expanded ? "collapse" : "expand"}.`}
        className="w-full text-left px-4 py-3 hover:bg-surface-secondary"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg"
            style={{
              backgroundColor:
                status === "GREEN" ? "#DCFCE7" : status === "YELLOW" ? "#FEF9C3" : "#FEE2E2",
              color:
                status === "GREEN" ? "#15803D" : status === "YELLOW" ? "#A16207" : "#B91C1C",
            }}
            aria-hidden="true"
          >
            {flyScore}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-text-primary text-sm truncate">{locationLabel}</span>
              <StatusBadge status={status} size="sm" showDot={false} />
            </div>
            <div className="flex gap-3 mt-0.5">
              <span className="text-xs text-text-muted">{date}</span>
              {profile ? <span className="text-xs text-text-muted">· {profile}</span> : null}
            </div>
          </div>

          <span
            className={`text-text-muted transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </button>

      {expanded ? (
        <div className="px-4 py-3 border-t border-border bg-surface-secondary">
          {summary ? <p className="text-sm text-text-secondary mb-2">{summary}</p> : null}
          {metrics ? (
            <div className="mb-3 flex flex-wrap gap-2">
              <MetricPill label="Wind" value={`${metrics.windMph} mph`} />
              <MetricPill label="Gust" value={`${metrics.gustMph} mph`} />
              <MetricPill label="Rain" value={`${metrics.precipPct}%`} />
            </div>
          ) : null}
          {breakdown?.length ? (
            <div className="mb-3 space-y-2 rounded-xl bg-white p-3">
              {breakdown.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-text-primary">{item.label}</p>
                    <p className="text-text-secondary">
                      {item.actual}
                      {item.label === "Rain" ? "%" : " mph"} · {item.evaluation}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted">{item.threshold}</p>
                    <p className="font-semibold text-status-red-text">{item.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-text-muted">
            {confidence ? <span>Confidence: <strong className="text-text-primary">{confidence}</strong></span> : null}
            {bestTimeWindow ? <span>Best window: <strong className="text-text-primary">{bestTimeWindow}</strong></span> : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-text-muted" htmlFor={`note-${check.id}`}>
              Add note
            </label>
            <textarea
              id={`note-${check.id}`}
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              className="min-h-[88px] w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange"
              placeholder="Add field notes, airspace reminders, or decision context."
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onSaveNote?.(check.id, noteDraft)}>
                Save note
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onRepeat?.(check)}>
                Repeat check
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MetricPill({ label, value }) {
  return (
    <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-text-secondary">
      <span className="text-text-primary">{value}</span> {label}
    </span>
  );
}
