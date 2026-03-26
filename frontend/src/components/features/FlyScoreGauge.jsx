import { useEffect, useMemo, useState } from "react";

export default function FlyScoreGauge({ score = 0, status = "RED", size = "lg" }) {
  const cfg = useMemo(
    () =>
      ({
        GREEN: { color: "#22C55E", glow: "rgba(34, 197, 94, 0.25)", label: "Go" },
        YELLOW: { color: "#EAB308", glow: "rgba(234, 179, 8, 0.25)", label: "Caution" },
        RED: { color: "#EF4444", glow: "rgba(239, 68, 68, 0.25)", label: "No-Go" },
      })[status] || { color: "#EF4444", glow: "rgba(239,68,68,0.25)", label: "No-Go" },
    [status]
  );

  const sizes = {
    sm: { dim: 120, stroke: 8, scoreSize: "text-2xl", labelSize: "text-xs" },
    md: { dim: 160, stroke: 10, scoreSize: "text-3xl", labelSize: "text-sm" },
    lg: { dim: 200, stroke: 12, scoreSize: "text-5xl", labelSize: "text-base" },
  };

  const { dim, stroke, scoreSize, labelSize } = sizes[size] || sizes.lg;
  const radius = (dim - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frameId;
    const start = performance.now();
    const duration = 900;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setAnimatedScore(Math.round(clampedScore * progress));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    setAnimatedScore(0);
    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [clampedScore]);

  const dashOffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div
      className="flex flex-col items-center gap-2"
      role="img"
      aria-label={`Fly score: ${clampedScore} out of 100. Status: ${status} — ${cfg.label}`}
    >
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} aria-hidden="true">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={stroke}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={cfg.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
            style={{ filter: `drop-shadow(0 0 6px ${cfg.glow})`, transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${scoreSize} font-black leading-none`} style={{ color: cfg.color }}>
            {animatedScore}
          </span>
          <span className="text-xs text-text-muted font-medium mt-0.5">/ 100</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: cfg.color }}
          aria-hidden="true"
        />
        <span className={`${labelSize} font-bold uppercase tracking-wide`} style={{ color: cfg.color }}>
          {status} — {cfg.label}
        </span>
      </div>
    </div>
  );
}
