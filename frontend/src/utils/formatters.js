// Shared formatting utilities

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatCurrency(value) {
  const amount = Number(value ?? 0);

  if (Number.isNaN(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatWind(mph) {
  if (mph == null) return "-";
  return `${mph} mph`;
}

export function formatPrecip(pct) {
  if (pct == null) return "-";
  return `${pct}%`;
}

export function truncate(str, maxLen = 40) {
  if (!str || str.length <= maxLen) return str;
  return `${str.slice(0, maxLen)}...`;
}

export function scoreToLabel(score) {
  if (score >= 75) return "Go";
  if (score >= 50) return "Caution";
  return "No-Go";
}
