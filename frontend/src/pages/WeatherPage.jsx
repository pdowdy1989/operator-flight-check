import { useState } from "react";
import PageShell from "../components/ui/PageShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import FlyScoreGauge from "../components/ui/FlyScoreGauge";
import { StatusBadge } from "../components/ui/StatusBadge";
import { weatherService } from "../services/weatherService";
import { formatPrecip, formatWind, scoreToLabel } from "../utils/formatters";
import "./WeatherPage.css";

const PRESET_LOCATIONS = [
  { name: "Columbus, OH", lat: "39.9612", lon: "-82.9988" },
  { name: "Charlotte, NC", lat: "35.2271", lon: "-80.8431" },
  { name: "Denver, CO", lat: "39.7392", lon: "-104.9903" },
];

function getDefaultMissionDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function WeatherPage() {
  const [form, setForm] = useState({
    lat: PRESET_LOCATIONS[0].lat,
    lon: PRESET_LOCATIONS[0].lon,
    missionDate: getDefaultMissionDate(),
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const applyPreset = (preset) => {
    setForm((current) => ({
      ...current,
      lat: preset.lat,
      lon: preset.lon,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const preview = await weatherService.getMissionWeatherPreview({
        lat: Number(form.lat),
        lon: Number(form.lon),
        missionDate: form.missionDate,
      });
      setResult(preview);
    } catch (err) {
      setError(err.message || "Unable to load weather preview.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Weather"
      subtitle="Run a flight-readiness check inside the app without bouncing back to the landing page."
    >
      <div className="weather-page">
        <Card className="weather-page__panel">
          <div className="weather-page__intro">
            <div>
              <p className="weather-page__eyebrow">Flight outlook</p>
              <h2 className="weather-page__heading">Check a location and mission date</h2>
            </div>
            <div className="weather-page__preset-row">
              {PRESET_LOCATIONS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="weather-page__preset"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <form className="weather-page__form" onSubmit={handleSubmit}>
            <Input
              id="weather-lat"
              label="Latitude"
              value={form.lat}
              onChange={setField("lat")}
              placeholder="39.9612"
            />
            <Input
              id="weather-lon"
              label="Longitude"
              value={form.lon}
              onChange={setField("lon")}
              placeholder="-82.9988"
            />
            <Input
              id="weather-date"
              label="Mission date"
              type="date"
              value={form.missionDate}
              onChange={setField("missionDate")}
            />
            <div className="weather-page__submit">
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "Checking weather..." : "Check weather"}
              </Button>
            </div>
          </form>

          {error ? <div className="weather-page__error">{error}</div> : null}
        </Card>

        <div className="weather-page__result-grid">
          <Card className="weather-page__score-card">
            {result ? (
              <div className="weather-page__score-layout">
                <div className="weather-page__score-main">
                  <p className="weather-page__eyebrow">Readiness</p>
                  <div className="weather-page__status-row">
                    <h3 className="weather-page__result-title">{scoreToLabel(result.score)}</h3>
                    <StatusBadge status={result.status} size="sm" />
                  </div>
                  <p className="weather-page__result-copy">
                    {result.conditionLabel} with winds around {formatWind(result.windMph)} and precipitation near{" "}
                    {formatPrecip(result.precipPct)}.
                  </p>
                </div>
                <FlyScoreGauge score={result.score} size={180} />
              </div>
            ) : (
              <div className="weather-page__empty">
                <p className="weather-page__eyebrow">Readiness</p>
                <h3 className="weather-page__result-title">No weather check yet</h3>
                <p className="weather-page__result-copy">
                  Pick a location, run the forecast, and the fly score will appear here.
                </p>
              </div>
            )}
          </Card>

          <Card className="weather-page__metrics-card" title="Weather breakdown">
            <div className="weather-page__metrics">
              <div className="weather-page__metric">
                <span>Wind</span>
                <strong>{result ? formatWind(result.windMph) : "--"}</strong>
              </div>
              <div className="weather-page__metric">
                <span>Gusts</span>
                <strong>{result ? formatWind(result.gustMph) : "--"}</strong>
              </div>
              <div className="weather-page__metric">
                <span>Precipitation</span>
                <strong>{result ? formatPrecip(result.precipPct) : "--"}</strong>
              </div>
              <div className="weather-page__metric">
                <span>Conditions</span>
                <strong>{result ? result.conditionLabel : "--"}</strong>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
