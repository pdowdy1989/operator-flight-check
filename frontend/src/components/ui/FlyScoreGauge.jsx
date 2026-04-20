import { useEffect, useMemo, useState } from "react";

function getGaugeColor(score, disabled) {
  if (disabled) return "#374151";
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export default function FlyScoreGauge({
  score = 0,
  size = 160,
  strokeWidth = 12,
  label = "FLY SCORE",
  disabled = false,
}) {
  const safeScore = disabled ? 0 : Math.max(0, Math.min(100, Number(score) || 0));
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (disabled) {
      setAnimatedScore(0);
      return;
    }

    let frameId;
    let startTime;
    const duration = 1000;

    const animate = (timestamp) => {
      if (startTime == null) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      setAnimatedScore(Math.round(safeScore * progress));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    setAnimatedScore(0);
    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [safeScore, disabled]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (animatedScore / 100) * circumference;
  const color = useMemo(() => getGaugeColor(safeScore, disabled), [safeScore, disabled]);

  return (
    <div className="fly-score-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="fly-score-gauge__svg">
        <circle
          className="fly-score-gauge__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="fly-score-gauge__progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={disabled ? 0 : dashOffset}
          style={{ transition: disabled ? "none" : undefined }}
        />
      </svg>
      <div className="fly-score-gauge__content">
        <span className="fly-score-gauge__value" style={{ color }}>{disabled ? "--" : animatedScore}</span>
        <span className="fly-score-gauge__label">{label}</span>
      </div>
    </div>
  );
}
