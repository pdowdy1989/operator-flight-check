import { useCallback } from "react";

export default function DroneProfileSelector({
  profiles,
  activeProfileId,
  onSelect,
  onCustomize,
}) {
  const handleSelect = useCallback(
    (profile) => onSelect && onSelect(profile),
    [onSelect]
  );

  return (
    <div className="flex flex-col gap-3" role="radiogroup" aria-label="Drone profile selection">
      {profiles.map((profile) => {
        const active = profile.id === activeProfileId;

        return (
          <div
            key={profile.id}
            className={[
              "w-full rounded-2xl border px-4 py-3 shadow-card transition-all animate-fade-in-up",
              active
                ? "border-brand-orange bg-brand-orange-bg ring-2 ring-brand-orange"
                : "border-border bg-white hover:border-brand-orange hover:shadow-card-hover",
            ].join(" ")}
          >
            <button
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${profile.name} — ${profile.type} class`}
              onClick={() => handleSelect(profile)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">{profile.name}</span>
                    <span className="text-xs font-medium bg-surface-secondary text-text-secondary px-2 py-0.5 rounded-full">
                      {profile.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    <ThresholdPill label="Wind" value={`≤${profile.windGreenMph} mph`} />
                    <ThresholdPill label="Gust" value={`≤${profile.gustGreenMph} mph`} />
                    <ThresholdPill label="Rain" value={`≤${profile.precipGreenPct}%`} />
                  </div>
                  {profile.addOns?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.addOns.map((item) => (
                        <span
                          key={`${profile.id}-${item}`}
                          className="rounded-full bg-surface-secondary px-2.5 py-1 text-[11px] font-medium text-text-secondary"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                {active ? (
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                ) : null}
              </div>
            </button>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => onCustomize?.(profile)}
                className="inline-flex min-h-[36px] items-center rounded-xl border border-brand-orange px-3 text-sm font-semibold text-brand-orange hover:bg-brand-orange-bg"
              >
                Edit profile
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ThresholdPill({ label, value }) {
  return (
    <span className="text-xs text-text-secondary">
      <span className="font-medium text-text-primary">{value}</span> {label}
    </span>
  );
}
