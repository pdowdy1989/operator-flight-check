import { useEffect, useMemo, useState } from "react";
import "./StatCard.css";

function parseAnimatedValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return { type: "number", target: value, prefix: "", suffix: "" };
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^([^0-9-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return null;
  }

  return {
    type: "number",
    prefix: match[1],
    target: Number(match[2]),
    suffix: match[3],
  };
}

function formatAnimatedValue(parsed, current) {
  if (!parsed) return null;
  const decimals = String(parsed.target).includes(".") ? 2 : 0;
  return `${parsed.prefix}${current.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${parsed.suffix}`;
}

export function StatCard({ icon, value, label, accent }) {
  const parsed = useMemo(() => parseAnimatedValue(value), [value]);
  const [displayValue, setDisplayValue] = useState(value ?? "-");

  useEffect(() => {
    if (!parsed) {
      setDisplayValue(value ?? "-");
      return undefined;
    }

    const startTime = performance.now();
    const duration = 700;

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = parsed.target * eased;
      setDisplayValue(formatAnimatedValue(parsed, current));

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      }
    }

    const frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [parsed, value]);

  return (
    <div className={`stat-card glass-card${accent ? " stat-card--accent" : ""}`}>
      <div className="stat-card__icon-wrap">
        {icon ? <span className="stat-card__icon">{icon}</span> : null}
        <span className="stat-card__spark" aria-hidden="true" />
      </div>
      <div className="stat-card__value">{displayValue ?? "-"}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}
