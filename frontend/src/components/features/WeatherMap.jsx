import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useTheme } from '../../context/ThemeContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './WeatherMap.css';

function makeIcon() {
  return L.divIcon({
    className: '',
    html: '<span class="weather-map__pin"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function FlyTo({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 13, { animate: true });
  }, [lat, lon, map]);
  return null;
}

export default function WeatherMap({ lat, lon, label }) {
  const { theme } = useTheme();

  const tileUrl = theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="weather-map">
      <MapContainer
        center={[lat, lon]}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={false}
        className="weather-map__leaflet"
        attributionControl={false}
      >
        <TileLayer key={tileUrl} url={tileUrl} maxZoom={19} />
        <FlyTo lat={lat} lon={lon} />
        <Marker position={[lat, lon]} icon={makeIcon()} />
      </MapContainer>
      {label && <div className="weather-map__label">{label}</div>}
    </div>
  );
}
