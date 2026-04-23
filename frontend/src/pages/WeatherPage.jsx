import { useEffect, useRef, useState } from "react";
import axios from "axios";
import PageShell from "../components/ui/PageShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import AddressFields from "../components/ui/AddressFields";
import FlyScoreGauge from "../components/ui/FlyScoreGauge";
import WeatherMap from "../components/features/WeatherMap";
import { StatusBadge } from "../components/ui/StatusBadge";
import apiClient from "../services/apiClient";
import { weatherService } from "../services/weatherService";
import { formatPrecip, formatWind, scoreToLabel } from "../utils/formatters";
import "./WeatherPage.css";

function getDefaultMissionDate() {
  return new Date().toISOString().slice(0, 10);
}

function getJobField(job, camelKey, snakeKey = camelKey) {
  return job?.[camelKey] ?? job?.[snakeKey] ?? "";
}

function formatJobDate(value) {
  if (!value) return "Date not scheduled";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toGeoQuery(combined) {
  const parts = combined.split(",").map(s => s.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const city = parts[1];
    const stateOnly = parts[2].replace(/\d{5}(-\d{4})?$/, "").trim();
    return `${city}, ${stateOnly}, US`;
  }
  if (parts.length === 2) return `${parts[0]}, ${parts[1]}, US`;
  return `${combined}, US`;
}

export default function WeatherPage() {
  const [missionDate, setMissionDate] = useState(getDefaultMissionDate());
  const [address, setAddress] = useState("");
  const [addrKey, setAddrKey] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [result, setResult] = useState(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError] = useState("");
  const dateDebounce = useRef(null);

  const geocode = async (rawAddress) => {
    const trimmed = rawAddress.trim();
    if (!trimmed) return null;

    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) throw new Error("OpenWeather API key is not configured.");

    const response = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
      params: { q: toGeoQuery(trimmed), limit: 1, appid: apiKey },
    });

    const [match] = Array.isArray(response.data) ? response.data : [];
    if (!match || typeof match.lat !== "number") return null;

    return {
      lat: match.lat,
      lon: match.lon,
      label: match.state ? `${match.name}, ${match.state}` : match.name,
    };
  };

  const runCheck = async (addr, date) => {
    if (!addr?.trim()) return;
    setLoading(true);
    setError("");
    try {
      const coords = await geocode(addr);
      if (!coords) {
        setError("Address not found — try entering city and state.");
        setResult(null);
        return;
      }
      setLocationLabel(coords.label || addr);
      setCoords({ lat: coords.lat, lon: coords.lon });
      const preview = await weatherService.getMissionWeatherPreview({
        lat: coords.lat,
        lon: coords.lon,
        missionDate: date,
      });
      setResult(preview);
    } catch (err) {
      setError(err.message || "Unable to load weather.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Load upcoming jobs, auto-run check on first job
  useEffect(() => {
    let ignore = false;
    (async () => {
      setJobsLoading(true);
      try {
        const response = await apiClient.get("/jobs/upcoming");
        const nextJobs = Array.isArray(response.data) ? response.data : [];
        if (ignore) return;
        setJobs(nextJobs);
        if (nextJobs.length > 0) {
          const first = nextJobs[0];
          setSelectedJob(first);
          const addr = getJobField(first, "siteAddress", "site_address");
          const date = getJobField(first, "scheduledDate", "scheduled_date") || getDefaultMissionDate();
          setAddress(addr);
          setMissionDate(date);
          setAddrKey(k => k + 1);
          if (addr) runCheck(addr, date);
        }
      } catch {
        if (!ignore) setJobs([]);
      } finally {
        if (!ignore) setJobsLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Re-run when date changes (only if we already have an address)
  useEffect(() => {
    if (!address?.trim()) return;
    clearTimeout(dateDebounce.current);
    dateDebounce.current = setTimeout(() => runCheck(address, missionDate), 400);
    return () => clearTimeout(dateDebounce.current);
  }, [missionDate]);

  const handleJobSelect = (job) => {
    const addr = getJobField(job, "siteAddress", "site_address");
    const date = getJobField(job, "scheduledDate", "scheduled_date") || missionDate;
    setSelectedJob(job);
    setAddress(addr);
    setMissionDate(date);
    setAddrKey(k => k + 1);
    runCheck(addr, date);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runCheck(address, missionDate);
  };

  const goNoGoLabel = result
    ? result.status === "GREEN" ? "GO" : result.status === "YELLOW" ? "CAUTION" : "NO-GO"
    : null;

  return (
    <PageShell
      title="Weather"
      subtitle="Flight-readiness check anchored to your job sites."
    >
      <div className="weather-page">
        {/* Input panel */}
        <Card className="weather-page__panel">
          <div className="weather-page__intro">
            <div className="weather-page__intro-copy">
              <p className="weather-page__eyebrow">Flight outlook</p>
              <h2 className="weather-page__heading">Check a location and mission date</h2>
              <p className="weather-page__intro-text">
                Anchor each readiness check to a real place so the forecast feels grounded in the mission area.
              </p>
            </div>
            <div className="weather-page__preset-row">
              {jobs.length > 0 ? (
                jobs.map((job) => {
                  const jobId = getJobField(job, "id");
                  const title = getJobField(job, "title") || "Untitled job";
                  const jobAddress = getJobField(job, "siteAddress", "site_address") || "Address unavailable";
                  const scheduledDate = formatJobDate(getJobField(job, "scheduledDate", "scheduled_date"));
                  return (
                    <button
                      key={jobId || `${title}-${scheduledDate}`}
                      type="button"
                      className={`weather-page__preset${selectedJob?.id === jobId ? " weather-page__preset--active" : ""}`}
                      onClick={() => handleJobSelect(job)}
                    >
                      <strong>{title}</strong>
                      <span>📍 {jobAddress}</span>
                      <span>🗓 {scheduledDate}</span>
                    </button>
                  );
                })
              ) : jobsLoading ? (
                <p className="weather-page__result-copy">Loading jobs…</p>
              ) : (
                <p className="weather-page__result-copy">No jobs scheduled</p>
              )}
            </div>
          </div>

          <form className="weather-page__form" onSubmit={handleSubmit}>
            <div className="weather-page__addr-wrap">
              <label className="weather-page__addr-label">Address</label>
              <AddressFields
                key={addrKey}
                defaultValue={address}
                onChange={val => { setAddress(val); setSelectedJob(null); }}
              />
            </div>
            <div className="weather-page__date-wrap">
              <label className="weather-page__addr-label" htmlFor="weather-date">Mission date</label>
              <input
                id="weather-date"
                className="weather-page__date-input"
                type="date"
                value={missionDate}
                onChange={e => setMissionDate(e.target.value)}
              />
            </div>
            <div className="weather-page__submit">
              <Button type="submit" size="lg" disabled={loading || !address?.trim()}>
                {loading ? "Checking…" : "Check weather"}
              </Button>
            </div>
          </form>

          {error && <div className="weather-page__error">{error}</div>}
        </Card>

        {/* Results */}
        <div className="weather-page__result-grid">
          <Card className="weather-page__score-card">
            {loading ? (
              <div className="weather-page__loading-state">
                <div className="weather-page__spinner" />
                <p className="weather-page__result-copy">Checking conditions…</p>
              </div>
            ) : result ? (
              <div className="weather-page__score-layout">
                <div className="weather-page__score-main">
                  <div className="weather-page__score-header">
                    {locationLabel && (
                      <h3 className="weather-page__location-name">{locationLabel}</h3>
                    )}
                    <span className={`weather-page__go-badge weather-page__go-badge--${result.status.toLowerCase()}`}>
                      {goNoGoLabel}
                    </span>
                  </div>
                  <p className="weather-page__result-copy">
                    {result.conditionLabel} conditions with winds around {formatWind(result.windMph)} and precipitation near {formatPrecip(result.precipPct)}.
                  </p>
                </div>
                <FlyScoreGauge score={result.score} size={180} />
              </div>
            ) : (
              <div className="weather-page__empty">
                <p className="weather-page__eyebrow">Readiness</p>
                <h3 className="weather-page__result-title">No weather check yet</h3>
                <p className="weather-page__result-copy">
                  Enter an address and mission date, then hit Check weather.
                </p>
              </div>
            )}
            {coords ? (
              <WeatherMap lat={coords.lat} lon={coords.lon} label={locationLabel} />
            ) : null}
          </Card>

          <Card className="weather-page__metrics-card" title="Weather breakdown">
            <div className="weather-page__metrics">
              {[
                { label: "Wind", value: result ? formatWind(result.windMph) : null, state: result?.metricStates?.wind },
                { label: "Gusts", value: result ? formatWind(result.gustMph) : null, state: result?.metricStates?.gusts },
                { label: "Precipitation", value: result ? formatPrecip(result.precipPct) : null, state: result?.metricStates?.precip },
                { label: "Conditions", value: result ? result.conditionLabel : null },
              ].map(({ label, value, state }) => (
                <div key={label} className="weather-page__metric">
                  <span>{label}</span>
                  <strong className={state ? `weather-page__metric--${state}` : ""}>
                    {loading ? <span className="weather-page__metric-loading" /> : (value ?? "--")}
                  </strong>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
