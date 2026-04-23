import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './JobsMap.css';

const STATUS_COLORS = {
  REQUESTED:   '#f59e0b',
  ACCEPTED:    '#22a7ff',
  SCHEDULED:   '#8b5cf6',
  IN_PROGRESS: '#06b6d4',
  COMPLETED:   '#22c55e',
  DELIVERED:   '#22c55e',
  CANCELLED:   '#ef4444',
};

const CACHE_PREFIX = 'ped.geo.';
let lastRequestAt = 0;

async function geocode(address) {
  const key = CACHE_PREFIX + address;
  const hit = localStorage.getItem(key);
  if (hit !== null) return JSON.parse(hit);

  const gap = Date.now() - lastRequestAt;
  if (gap < 1100) await new Promise(r => setTimeout(r, 1100 - gap));
  lastRequestAt = Date.now();

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
    );
    const data = await res.json();
    const result = data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
    localStorage.setItem(key, JSON.stringify(result));
    return result;
  } catch {
    return null;
  }
}

function makeIcon(status) {
  const color = STATUS_COLORS[status] || '#22a7ff';
  return L.divIcon({
    className: '',
    html: `<span class="jobs-map__pin" style="background:${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -14],
  });
}

function FitBounds({ pins }) {
  const map = useMap();
  const prev = useRef(0);

  useEffect(() => {
    if (pins.length === 0 || pins.length === prev.current) return;
    prev.current = pins.length;
    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 13);
    } else {
      map.fitBounds(pins.map(p => [p.lat, p.lng]), { padding: [40, 40] });
    }
  }, [pins, map]);

  return null;
}

export default function JobsMap({ jobs }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [pins, setPins] = useState([]);
  const [locating, setLocating] = useState(false);

  const addressedJobs = jobs?.filter(j => j.siteAddress) ?? [];

  useEffect(() => {
    if (addressedJobs.length === 0) return;
    let cancelled = false;
    setLocating(true);

    (async () => {
      const results = [];
      for (const job of addressedJobs) {
        if (cancelled) break;
        const coords = await geocode(job.siteAddress);
        if (coords) results.push({ ...coords, job });
        if (!cancelled) setPins([...results]);
      }
      if (!cancelled) setLocating(false);
    })();

    return () => { cancelled = true; };
  }, [jobs]);

  const tileUrl = theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  if (addressedJobs.length === 0) {
    return (
      <div className="jobs-map jobs-map--empty">
        <p>No job sites with addresses yet.</p>
      </div>
    );
  }

  return (
    <div className="jobs-map">
      <MapContainer
        center={[39.96, -82.99]}
        zoom={10}
        scrollWheelZoom={false}
        className="jobs-map__leaflet"
        zoomControl={false}
      >
        <TileLayer
          key={tileUrl}
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com">CARTO</a>'
          maxZoom={19}
        />
        <FitBounds pins={pins} />
        {pins.map(({ lat, lng, job }) => (
          <Marker
            key={job.id}
            position={[lat, lng]}
            icon={makeIcon(job.status)}
            eventHandlers={{ click: () => navigate(`/jobs/${job.id}`) }}
          >
            <Popup>
              <strong>{job.title}</strong>
              <br />
              <span style={{ fontSize: 12, opacity: 0.8 }}>{job.siteAddress}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {locating && pins.length === 0 && (
        <div className="jobs-map__status">Locating job sites…</div>
      )}
      {!locating && pins.length > 0 && (
        <div className="jobs-map__status">{pins.length} site{pins.length !== 1 ? 's' : ''} mapped</div>
      )}
    </div>
  );
}
