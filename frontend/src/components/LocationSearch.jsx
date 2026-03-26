import { useMemo, useState } from "react";
import Button from "./Button";
import Input from "./Input";

const presetLocations = [
  { label: "Laguna Cliffs", address: "Laguna Cliffs, CA", lat: 33.5427, lon: -117.7831 },
  { label: "Newport Back Bay", address: "Newport Back Bay, CA", lat: 33.6373, lon: -117.8653 },
  { label: "Huntington Pier", address: "Huntington Beach Pier, CA", lat: 33.6552, lon: -118.0017 },
  { label: "Griffith Park", address: "Griffith Park, Los Angeles, CA", lat: 34.1366, lon: -118.2942 },
  { label: "Torrey Pines", address: "Torrey Pines Gliderport, CA", lat: 32.8898, lon: -117.2522 },
];

function formatGps(coords) {
  return `GPS: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
}

export default function LocationSearch({
  value,
  onChange,
  onSelect,
  onUseCurrentLocation,
}) {
  const [searchValue, setSearchValue] = useState(value ?? "");
  const [gpsStatus, setGpsStatus] = useState("");
  const [gpsError, setGpsError] = useState("");

  const suggestions = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();

    if (!normalized) {
      return presetLocations.slice(0, 4);
    }

    return presetLocations.filter((location) =>
      `${location.label} ${location.address}`.toLowerCase().includes(normalized)
    ).slice(0, 4);
  }, [searchValue]);

  const handleInputChange = (event) => {
    const nextValue = event.target.value;
    setSearchValue(nextValue);
    onChange?.(nextValue);
  };

  const handleSelect = (location) => {
    setSearchValue(location.label);
    setGpsStatus("");
    setGpsError("");
    onChange?.(location.label);
    onSelect?.(location);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("GPS is not supported in this browser.");
      return;
    }

    setGpsError("");
    setGpsStatus("Finding your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          label: "Current Location",
          address: formatGps(position.coords),
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        setSearchValue(currentLocation.label);
        setGpsStatus(`Using ${currentLocation.address}`);
        onChange?.(currentLocation.label);
        onSelect?.(currentLocation);
        onUseCurrentLocation?.(currentLocation);
      },
      () => {
        setGpsStatus("");
        setGpsError("Unable to access your GPS location. Please search by name instead.");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
      }
    );
  };

  return (
    <div className="space-y-3">
      <Input
        id="location-search"
        label="Flight location"
        value={searchValue}
        onChange={handleInputChange}
        placeholder="Search by city, park, beach, or launch site"
        hint="Type a location name or use your current GPS position."
      />

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={handleUseCurrentLocation}>
          Use Current GPS
        </Button>
      </div>

      {gpsStatus ? <p className="text-sm font-medium text-tide">{gpsStatus}</p> : null}
      {gpsError ? <p className="text-sm font-medium text-rose-600">{gpsError}</p> : null}

      <div className="grid gap-2">
        {suggestions.map((location) => (
          <button
            key={location.address}
            type="button"
            onClick={() => handleSelect(location)}
            className="rounded-2xl border border-white/80 bg-white/82 px-4 py-3 text-left shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/80"
          >
            <p className="text-sm font-semibold text-slate-900">{location.label}</p>
            <p className="mt-1 text-xs text-slate-500">{location.address}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
