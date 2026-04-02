export default function MetricCard({
  icon,
  label,
  value,
  unit,
  threshold,
  currentValue,
}) {
  const numericValue = Number(currentValue ?? value ?? 0);
  const thresholdExceeded = typeof threshold === "number" && numericValue > threshold;
  const progress = typeof threshold === "number" && threshold > 0
    ? Math.min(100, Math.round((numericValue / threshold) * 100))
    : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md dark:bg-black/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
          <p className={`mt-2 text-3xl font-black ${thresholdExceeded ? "text-ped-orange" : "text-white"}`}>
            {value}
            {unit ? <span className="ml-1 text-sm font-medium text-slate-400">{unit}</span> : null}
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2 text-xl backdrop-blur-sm">
          {icon}
        </div>
      </div>
      {typeof threshold === "number" ? (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
            <span>Threshold</span>
            <span>{threshold}{unit ? ` ${unit}` : ""}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${thresholdExceeded ? "bg-ped-orange" : "bg-green-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
