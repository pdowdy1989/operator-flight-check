import "./StatusBadge.css";

const CONFIG = {
  GREEN: { color: "green", label: "Go" },
  YELLOW: { color: "yellow", label: "Caution" },
  RED: { color: "red", label: "No-Go" },
  PLANNED: { color: "blue", label: "Planned" },
  COMPLETED: { color: "green", label: "Completed" },
  CANCELLED: { color: "red", label: "Cancelled" },
  DRAFT: { color: "gray", label: "Draft" },
  SENT: { color: "blue", label: "Sent" },
  PAID: { color: "green", label: "Paid" },
  OVERDUE: { color: "red", label: "Overdue" },
};

export function StatusBadge({ status, size = "md", showDot = true, className = "" }) {
  const cfg = CONFIG[status] || { color: "gray", label: status };
  const sizeClass = size === "sm" ? "status-badge--sm" : size === "lg" ? "status-badge--lg" : "";

  return (
    <span className={`status-badge status-${cfg.color} ${sizeClass} ${className}`} aria-label={`Status: ${status} - ${cfg.label}`}>
      {showDot ? <span className="status-badge__dot" aria-hidden="true" /> : null}
      <span>{status}</span>
      <span>{cfg.label}</span>
    </span>
  );
}
