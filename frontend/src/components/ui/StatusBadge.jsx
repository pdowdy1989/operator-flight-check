// StatusBadge — chunky, bold status indicator for GREEN/YELLOW/RED
const CONFIG = {
  GREEN: {
    bg: "bg-status-green-bg",
    text: "text-status-green-text",
    border: "border-status-green",
    dot: "bg-status-green",
    label: "Go",
  },
  YELLOW: {
    bg: "bg-status-yellow-bg",
    text: "text-status-yellow-text",
    border: "border-status-yellow",
    dot: "bg-status-yellow",
    label: "Caution",
  },
  RED: {
    bg: "bg-status-red-bg",
    text: "text-status-red-text",
    border: "border-status-red",
    dot: "bg-status-red",
    label: "No-Go",
  },
};

export default function StatusBadge({ status, size = "md", showDot = true, className = "" }) {
  const cfg = CONFIG[status] || CONFIG.RED;

  const sizes = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizes[size]} ${className}`}
      aria-label={`Status: ${status} — ${cfg.label}`}
    >
      {showDot && (
        <span
          className={`inline-block rounded-full flex-shrink-0 ${cfg.dot} ${size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"}`}
          aria-hidden="true"
        />
      )}
      <span>{status}</span>
      <span className="font-medium opacity-80">— {cfg.label}</span>
    </span>
  );
}
