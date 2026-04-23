import "./MapContainerShell.css";

export default function MapContainerShell({
  eyebrow = "Area Snapshot",
  title = "Mission corridor",
  badge = "Location aware",
  caption = "Visual shell only",
  compact = false,
  className = "",
}) {
  return (
    <div className={`map-shell ${compact ? "map-shell--compact" : ""} ${className}`}>
      <div className="map-shell__route" aria-hidden="true" />
      <div className="map-shell__marker map-shell__marker--primary" aria-hidden="true" />
      <div className="map-shell__marker map-shell__marker--secondary" aria-hidden="true" />
      <div className="map-shell__content">
        <div>
          <p className="map-shell__eyebrow">{eyebrow}</p>
          <h3 className="map-shell__title">{title}</h3>
        </div>
        <div className="map-shell__meta">
          <span className="map-shell__badge">{badge}</span>
          <span className="map-shell__caption">{caption}</span>
        </div>
      </div>
    </div>
  );
}
