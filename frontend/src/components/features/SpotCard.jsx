import { useCallback } from "react";
import StatusBadge from "../ui/StatusBadge";

// SpotCard — saved spot with label, address, last check status, favorite toggle
export default function SpotCard({ spot, onSelect, onToggleFavorite, isSelected }) {
  const { id, label, address, lastStatus, isFavorite } = spot;

  const handleFav = useCallback(
    (e) => {
      e.stopPropagation();
      onToggleFavorite && onToggleFavorite(id);
    },
    [id, onToggleFavorite]
  );

  return (
    <div
      className={[
        "bg-white rounded-2xl border shadow-card overflow-hidden transition-all",
        isSelected ? "ring-2 ring-brand-orange border-brand-orange" : "border-border hover:shadow-card-hover",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onSelect && onSelect(spot)}
        aria-label={`Select spot: ${label}${isSelected ? " (selected)" : ""}`}
        className="w-full text-left px-4 py-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary truncate">{label}</span>
              {isFavorite && (
                <span aria-label="Favorite" className="text-brand-orange text-sm flex-shrink-0">★</span>
              )}
            </div>
            {address && (
              <p className="text-xs text-text-muted mt-0.5 truncate">{address}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {lastStatus && <StatusBadge status={lastStatus} size="sm" showDot={false} />}
            <button
              type="button"
              onClick={handleFav}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className="text-text-muted hover:text-brand-orange p-1 rounded-lg"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={isFavorite ? "text-brand-orange" : ""} aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          </div>
        </div>
      </button>
    </div>
  );
}
