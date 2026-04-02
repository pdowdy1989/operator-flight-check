function getScoreConfig(score) {
  if (score >= 70) {
    return { color: "#22C55E", label: "GO" };
  }

  if (score >= 40) {
    return { color: "#FF6B2C", label: "CAUTION" };
  }

  return { color: "#EF4444", label: "NO-GO" };
}

export default function FlyScoreRing({ score = 0, size = 164 }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(100, Number(score) || 0));
  const offset = circumference - (normalized / 100) * circumference;
  const { color, label } = getScoreConfig(normalized);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white">{normalized}</span>
        <span className="text-xs font-semibold tracking-[0.25em] text-slate-300">{label}</span>
      </div>
    </div>
  );
}
