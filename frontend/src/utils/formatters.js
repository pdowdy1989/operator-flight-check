// Shared formatting utilities

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatWind(mph) {
  if (mph == null) return "—";
  return `${mph} mph`;
}

export function formatPrecip(pct) {
  if (pct == null) return "—";
  return `${pct}%`;
}

export function truncate(str, maxLen = 40) {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "…";
}

export function scoreToLabel(score) {
  if (score >= 75) return "Go";
  if (score >= 50) return "Caution";
  return "No-Go";
}
