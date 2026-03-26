import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import DroneProfileSelector from "../components/DroneProfileSelector";
import LocationSearch from "../components/LocationSearch";
import { useToast } from "../context/ToastContext";
import { mockDroneProfiles } from "../utils/mockDroneProfiles";
import { mockForecast } from "../utils/mockForecast";
import { mockHourlyForecast } from "../utils/mockHourlyForecast";
import { calculateFlyability, calculateForecastSummary } from "../utils/scoring";

const statusClasses = {
  GREEN: {
    badge: "border border-emerald-200 bg-emerald-50 text-emerald-800",
    card: "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(220,252,231,0.72))]",
    accent: "text-emerald-700",
  },
  YELLOW: {
    badge: "border border-amber-200 bg-amber-50 text-amber-800",
    card: "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(254,243,199,0.76))]",
    accent: "text-amber-700",
  },
  RED: {
    badge: "border border-rose-200 bg-rose-50 text-rose-800",
    card: "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,0.96),rgba(254,226,226,0.74))]",
    accent: "text-rose-700",
  },
};

function ForecastDayCard({ item, selected, onSelect }) {
  const tone = statusClasses[item.status];

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`rounded-[1.75rem] border p-5 text-left shadow-[0_16px_34px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 ${
        selected ? "ring-2 ring-cyan-500/70 ring-offset-2 ring-offset-white" : ""
      } ${tone.card}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
            {item.day}
          </p>
          <p className="mt-1 text-sm text-slate-500">{item.date}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] ${tone.badge}`}
        >
          {item.status}
        </span>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Fly score</p>
          <p className={`mt-2 text-4xl font-semibold ${tone.accent}`}>{item.flyScore}</p>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/78 px-4 py-3 text-right text-sm text-slate-600">
          <p>Wind {item.windMph} mph</p>
          <p>Gusts {item.gustMph} mph</p>
          <p>Precip {item.precipPct}%</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-slate-600">{item.summary}</p>
    </button>
  );
}

export default function DashboardPage() {
  const [spotName, setSpotName] = useState("Laguna Cliffs");
  const [locationMeta, setLocationMeta] = useState({
    address: "Laguna Cliffs, CA",
    lat: 33.5427,
    lon: -117.7831,
  });
  const [selectedProfile, setSelectedProfile] = useState(mockDroneProfiles[1]);
  const { showToast } = useToast();
  const scoredForecast = mockForecast.map((item) => calculateFlyability(item, selectedProfile));
  const { bestWindow, cautionDays, noFlyDays } = calculateForecastSummary(scoredForecast);
  const [selectedDayKey, setSelectedDayKey] = useState(scoredForecast[0].day);
  const selectedDay = scoredForecast.find((item) => item.day === selectedDayKey) ?? scoredForecast[0];
  const hourlyBreakdown = (mockHourlyForecast[selectedDay.day] ?? []).map((hour) =>
    calculateFlyability(
      {
        day: selectedDay.day,
        date: selectedDay.date,
        ...hour,
      },
      selectedProfile
    )
  );
  const bestHour =
    [...hourlyBreakdown].sort((a, b) => b.flyScore - a.flyScore)[0] ?? hourlyBreakdown[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card
          eyebrow="7-Day Outlook"
          title="Flyability forecast dashboard"
          description="Review the week ahead with color-coded status, a composite fly score, and the weather signals most likely to affect your go or no-go decision."
        >
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <LocationSearch
              value={spotName}
              onChange={setSpotName}
              onSelect={(location) => {
                setSpotName(location.label);
                setLocationMeta({
                  address: location.address,
                  lat: location.lat,
                  lon: location.lon,
                });
                showToast({
                  title: "Location updated",
                  description: `Forecast focus moved to ${location.label}.`,
                });
              }}
            />
            <DroneProfileSelector
              profiles={mockDroneProfiles}
              selectedProfileId={selectedProfile.id}
              onSelect={(profile) => {
                setSelectedProfile(profile);
                showToast({
                  title: "Profile changed",
                  description: `Forecast thresholds now reflect ${profile.name}.`,
                });
              }}
            />
          </div>

          <div className="mt-5 rounded-3xl border border-white/80 bg-[linear-gradient(135deg,rgba(217,242,255,0.62),rgba(255,255,255,0.9))] px-5 py-4 text-sm text-slate-600 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
            <p className="font-semibold text-slate-900">{spotName}</p>
            <p className="mt-1">{locationMeta.address}</p>
            <p className="mt-1">
              Lat {locationMeta.lat.toFixed(4)} | Lon {locationMeta.lon.toFixed(4)}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-emerald-100 bg-[linear-gradient(180deg,rgba(236,253,245,1),rgba(220,252,231,0.78))] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
                Best day
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {bestWindow.day} {bestWindow.date}
              </p>
              <p className="mt-1 text-sm text-slate-600">Fly score {bestWindow.flyScore}</p>
            </div>
            <div className="rounded-3xl border border-amber-100 bg-[linear-gradient(180deg,rgba(255,251,235,1),rgba(254,243,199,0.8))] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                Caution days
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{cautionDays} days</p>
              <p className="mt-1 text-sm text-slate-600">Watch gusts and precipitation windows.</p>
            </div>
            <div className="rounded-3xl border border-rose-100 bg-[linear-gradient(180deg,rgba(255,241,242,1),rgba(254,226,226,0.76))] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-700">
                No-fly days
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{noFlyDays} day</p>
              <p className="mt-1 text-sm text-slate-600">Wind exceeds safe operating thresholds.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() =>
                showToast({
                  title: "Forecast refreshed",
                  description: "A fresh 7-day planning view is ready for this location.",
                })
              }
            >
              Refresh outlook
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                showToast({
                  title: "Saved for later",
                  description: `Forecast snapshot queued for ${spotName}.`,
                })
              }
            >
              Save snapshot
            </Button>
            <Button variant="ghost">Switch spot</Button>
          </div>
        </Card>

        <Card
          eyebrow="Pilot Summary"
          title="This week at a glance"
          description="A quick briefing before you drill into each day."
        >
          <div className="space-y-5">
            <div className="rounded-3xl bg-[linear-gradient(135deg,#10233B,#0F172A)] p-5 text-slate-100 shadow-[0_20px_40px_rgba(15,23,42,0.2)]">
              <p className="text-xs uppercase tracking-[0.25em] text-sky-300">Primary takeaway</p>
              <p className="mt-3 text-lg font-semibold text-white">
                Two strong flight windows, one definite no-fly day.
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Early week conditions are favorable, Thursday is a clear stand-down,
                and the weekend offers a workable recovery.
              </p>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/78 px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Most limiting factor
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">Gust spikes on Wed-Fri</p>
              <p className="mt-1 text-sm text-slate-600">
                Gust thresholds are what push multiple days out of the green range.
              </p>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/78 px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Selected setup
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">{selectedProfile.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                {selectedProfile.type} profile with wind limits {selectedProfile.windGreenMph}/
                {selectedProfile.windYellowMph} mph and gust limits {selectedProfile.gustGreenMph}/
                {selectedProfile.gustYellowMph} mph.
              </p>
            </div>
            <div className="rounded-3xl border border-white/80 bg-white/78 px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Scoring model
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">100-point fly score</p>
              <p className="mt-1 text-sm text-slate-600">
                Deductions come from wind, gust, precipitation, and severe-weather overrides.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <Card
          eyebrow="Daily Cards"
          title="Color-coded 7-day forecast"
          description="Each day now calculates status from profile thresholds, deductions, and severe-weather overrides. Select a day to inspect hourly windows."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
            {scoredForecast.map((item) => (
              <ForecastDayCard
                key={`${item.day}-${item.date}`}
                item={item}
                selected={item.day === selectedDayKey}
                onSelect={(day) => setSelectedDayKey(day.day)}
              />
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card
          eyebrow="Selected Day"
          title={`${selectedDay.day} ${selectedDay.date} hourly weather`}
          description="Use the hourly view to identify the safest flight window inside the selected day."
        >
          <div className="space-y-5">
            <div className="rounded-3xl bg-[linear-gradient(135deg,#10233B,#0F172A)] p-5 text-slate-100 shadow-[0_20px_40px_rgba(15,23,42,0.2)]">
              <p className="text-xs uppercase tracking-[0.25em] text-sky-300">Best window</p>
              <p className="mt-3 text-lg font-semibold text-white">{bestHour?.time ?? "No data"}</p>
              <p className="mt-2 text-sm text-slate-300">
                Fly score {bestHour?.flyScore ?? "--"} with wind {bestHour?.windMph ?? "--"} mph and
                gusts {bestHour?.gustMph ?? "--"} mph.
              </p>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/78 px-5 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                Planning note
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{selectedDay.summary}</p>
            </div>
          </div>
        </Card>

        <Card
          title="Hourly detail"
          description="Each hourly block uses the same flyability logic as the daily forecast so you can see when conditions tighten or improve."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {hourlyBreakdown.map((hour) => {
              const tone = statusClasses[hour.status];

              return (
                <article
                  key={`${hour.time}-${hour.day}`}
                  className={`rounded-[1.5rem] border p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)] ${tone.card}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-600">
                      {hour.time}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${tone.badge}`}
                    >
                      {hour.status}
                    </span>
                  </div>
                  <p className={`mt-4 text-3xl font-semibold ${tone.accent}`}>{hour.flyScore}</p>
                  <div className="mt-4 space-y-1 text-sm text-slate-600">
                    <p>Wind {hour.windMph} mph</p>
                    <p>Gusts {hour.gustMph} mph</p>
                    <p>Precip {hour.precipPct}%</p>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{hour.summary}</p>
                </article>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card
          title="Recommended plan"
          description="A simple mission summary based on the forecast trend."
        >
          <div className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              Schedule primary flights on Monday, Tuesday, or Saturday when wind and
              precipitation remain comfortably inside the profile threshold.
            </p>
            <p>
              Treat Wednesday and Friday as contingency days. They may work for
              shorter, lower-risk flights if gusts settle closer to the forecast floor.
            </p>
            <p>
              Avoid Thursday. Conditions are consistently outside a safe operating band.
            </p>
          </div>
        </Card>

        <Card
          title="What comes next"
          description="This dashboard is currently powered by mock forecast data, but it is structured to drop into live weather integration."
        >
          <ul className="space-y-3 text-sm text-slate-600">
            <li>Connect forecast cards to the OpenWeather backend when that story is implemented.</li>
            <li>Swap the text inputs for saved spots and real drone profile selectors.</li>
            <li>Persist daily go or no-go decisions directly into spot checks from the dashboard.</li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
