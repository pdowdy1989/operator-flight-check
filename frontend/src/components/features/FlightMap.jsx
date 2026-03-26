import L from "leaflet";
import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import StatusBadge from "../ui/StatusBadge";

const STATUS_COLORS = {
  GREEN: "#22C55E",
  YELLOW: "#EAB308",
  RED: "#EF4444",
};

function MapRecenter({ center }) {
  const map = useMap();
  map.setView([center.lat, center.lon], map.getZoom(), { animate: true });
  return null;
}

function createPin(status) {
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.RED;
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:999px;background:${color};border:3px solid #fff;box-shadow:0 6px 16px rgba(15,23,42,0.18)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function FlightMap({ center, spots, onSelectLocation }) {
  const markers = useMemo(
    () =>
      spots
        .filter((spot) => typeof spot.lat === "number" && typeof spot.lon === "number")
        .map((spot) => ({
          ...spot,
          icon: createPin(spot.lastStatus),
        })),
    [spots]
  );

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border">
      <MapContainer center={[center.lat, center.lon]} zoom={10} className="h-[360px] w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter center={center} />

        {markers.map((spot) => (
          <Marker key={spot.id} position={[spot.lat, spot.lon]} icon={spot.icon}>
            <Popup>
              <div className="min-w-[210px] space-y-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{spot.label}</p>
                  <p className="text-xs text-text-muted">{spot.address}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-black text-text-primary">{spot.latestFlyScore ?? "--"}</span>
                  <StatusBadge status={spot.lastStatus} size="sm" showDot={false} />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectLocation(spot)}
                    className="inline-flex min-h-[36px] items-center rounded-xl border border-border px-3 text-sm font-medium text-text-primary hover:border-brand-orange hover:text-brand-orange"
                  >
                    Focus Spot
                  </button>
                  <Link
                    to="/check"
                    onClick={() => onSelectLocation(spot)}
                    className="inline-flex min-h-[36px] items-center rounded-xl bg-brand-orange px-3 text-sm font-semibold text-white hover:bg-brand-orange-dark"
                  >
                    Go to Check
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marker data is already normalized for a future cluster layer if pin volume grows. */}
      </MapContainer>
    </div>
  );
}
