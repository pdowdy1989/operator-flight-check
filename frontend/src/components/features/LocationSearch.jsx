import { useState, useCallback, useRef, useEffect } from "react";

const PRESETS = [
  { label: "Laguna Cliffs", address: "Laguna Cliffs, Dana Point, CA", lat: 33.4614, lon: -117.6983 },
  { label: "Newport Back Bay", address: "Upper Newport Bay, Newport Beach, CA", lat: 33.6439, lon: -117.8851 },
  { label: "Huntington Pier", address: "Huntington Beach Pier, Huntington Beach, CA", lat: 33.6541, lon: -118.0046 },
  { label: "Griffith Park", address: "Griffith Park, Los Angeles, CA", lat: 34.1365, lon: -118.2942 },
  { label: "Torrey Pines", address: "Torrey Pines State Beach, La Jolla, CA", lat: 32.9175, lon: -117.2555 },
];

// LocationSearch — search input + GPS button for picking a fly location
export default function LocationSearch({ value, onChange }) {
  const [query, setQuery] = useState(value?.label || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    setQuery(value?.label || "");
  }, [value]);

  // Filter presets by query
  const handleInput = useCallback((e) => {
    const q = e.target.value;
    setQuery(q);
    if (q.trim().length > 0) {
      const filtered = PRESETS.filter(
        (p) =>
          p.label.toLowerCase().includes(q.toLowerCase()) ||
          p.address.toLowerCase().includes(q.toLowerCase())
      );
      setSuggestions(filtered.length ? filtered : PRESETS);
      setOpen(true);
    } else {
      setSuggestions(PRESETS);
      setOpen(true);
    }
  }, []);

  const handleSelect = useCallback(
    (preset) => {
      setQuery(preset.label);
      setOpen(false);
      onChange && onChange(preset);
    },
    [onChange]
  );

  const handleGps = useCallback(() => {
    setGpsError(null);
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const loc = {
          label: "Current Location",
          address: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setQuery(loc.label);
        onChange && onChange(loc);
      },
      () => {
        setGpsLoading(false);
        setGpsError("Location access denied. Please select a preset.");
      }
    );
  }, [onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={() => { setSuggestions(PRESETS); setOpen(true); }}
            placeholder="Search location…"
            aria-label="Search for a fly location"
            aria-autocomplete="list"
            aria-expanded={open}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange min-h-[44px]"
          />
        </div>
        <button
          type="button"
          onClick={handleGps}
          disabled={gpsLoading}
          aria-label="Use my current GPS location"
          className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-white text-text-secondary hover:border-brand-orange hover:text-brand-orange disabled:opacity-50"
        >
          {gpsLoading ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0110 10" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
            </svg>
          )}
        </button>
      </div>

      {gpsError && (
        <p className="text-sm text-status-red mt-1" role="alert">{gpsError}</p>
      )}

      {/* Dropdown suggestions */}
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          aria-label="Location suggestions"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-card-hover z-50 overflow-hidden max-h-60 overflow-y-auto"
        >
          {suggestions.map((s) => (
            <li key={s.label} role="option" aria-selected={query === s.label}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 hover:bg-surface-secondary border-b border-border last:border-0 min-h-[44px]"
              >
                <div className="font-medium text-text-primary text-sm">{s.label}</div>
                <div className="text-xs text-text-muted">{s.address}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
