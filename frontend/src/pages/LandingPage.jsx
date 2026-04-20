import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer } from "react-leaflet";
import { CloudSun, FileClock, MapPinned, ShieldCheck } from "lucide-react";
import Button from "../components/ui/Button";
import FlyScoreGauge from "../components/ui/FlyScoreGauge";
import { weatherService } from "../services/weatherService";
import { formatPrecip, formatWind, scoreToLabel } from "../utils/formatters";
import "./LandingPage.css";

const STEPS = [
  {
    num: 1,
    icon: "Pin",
    title: "Pick your spot",
    summary: "Search or drop a pin where you plan to fly",
    detail:
      "Search by name or use your device GPS to set a precise launch point. Save your favorite locations for quick access on future checks.",
  },
  {
    num: 2,
    icon: "Cloud",
    title: "Check the forecast",
    summary: "See 7-day weather matched to your drone",
    detail:
      "View a full week of wind, gust, and precipitation forecasts. Expand any day to find the safest flight window.",
  },
  {
    num: 3,
    icon: "Plane",
    title: "Know your limits",
    summary: "Set thresholds for each aircraft",
    detail:
      "Store your aircraft and operating limits so every forecast is scored against the right machine and mission.",
  },
  {
    num: 4,
    icon: "Check",
    title: "Get your go or no-go",
    summary: "One score, one color, one answer",
    detail:
      "A fly score makes the decision easy to scan. Green means go, yellow means caution, red means stand down.",
  },
  {
    num: 5,
    icon: "Log",
    title: "Log your decision",
    summary: "Build a history of field decisions",
    detail:
      "Save checks, notes, and project context so your team can review patterns and prove diligence over time.",
  },
];

const FEATURES = [
  {
    icon: CloudSun,
    eyebrow: "Forecast",
    title: "Weather plus thresholds",
    description:
      "Wind, gusts, and precipitation are compared against your operating limits so you can make the call faster.",
  },
  {
    icon: MapPinned,
    eyebrow: "Locations",
    title: "Saved locations",
    description:
      "Bookmark launch sites, revisit them quickly, and keep your most common planning locations close at hand.",
  },
  {
    icon: FileClock,
    eyebrow: "History",
    title: "Decision history",
    description:
      "Track prior checks, notes, and outcomes for pilots, clients, and insurance work in one place.",
  },
];

const SIGNUP_OPTIONS = [
  { to: "/register/pilot", label: "Pilot signup" },
  { to: "/register/client", label: "Client signup" },
  { to: "/register/company", label: "Company signup" },
];

const HERO_LOCATION = {
  name: "Columbus, OH",
  lat: 39.9612,
  lon: -82.9988,
  missionDate: new Date().toISOString(),
};

const HERO_ROUTE = [
  [39.9682, -83.0213],
  [39.9612, -82.9988],
  [39.9508, -82.9825],
];

const FALLBACK_PREVIEW = {
  score: 82,
  status: "GREEN",
  windMph: 9,
  gustMph: 14,
  precipPct: 12,
  conditionLabel: "Clear",
};

function statusToTone(status) {
  if (status === "GREEN") return "landing-hero-score__tone--green";
  if (status === "YELLOW") return "landing-hero-score__tone--yellow";
  return "landing-hero-score__tone--red";
}

function HeroMapBackdrop() {
  return (
    <div className="landing-hero__map" aria-hidden="true">
      <MapContainer
        center={[HERO_LOCATION.lat, HERO_LOCATION.lon]}
        zoom={12}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Polyline positions={HERO_ROUTE} pathOptions={{ color: "#f97316", weight: 3, opacity: 0.8 }} />
        <CircleMarker center={[HERO_LOCATION.lat, HERO_LOCATION.lon]} radius={12} pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#f97316", fillOpacity: 0.95 }} />
        <CircleMarker center={[39.9682, -83.0213]} radius={7} pathOptions={{ color: "#0f172a", weight: 1, fillColor: "#38b6ff", fillOpacity: 0.9 }} />
        <CircleMarker center={[39.9508, -82.9825]} radius={7} pathOptions={{ color: "#0f172a", weight: 1, fillColor: "#38b6ff", fillOpacity: 0.9 }} />
      </MapContainer>
      <div className="landing-hero__map-scrim" />
      <div className="landing-hero__map-grid" />
    </div>
  );
}

function HeroFlightScoreCard({ preview, isLoading }) {
  const toneClass = statusToTone(preview.status);

  return (
    <aside className="landing-hero-score">
      <div className="landing-hero-score__header">
        <div>
          <p className="landing-hero-score__eyebrow">Live sample outlook</p>
          <h2 className="landing-hero-score__title">{HERO_LOCATION.name}</h2>
        </div>
        <span className={`landing-hero-score__tone ${toneClass}`}>
          {isLoading ? "Refreshing" : scoreToLabel(preview.score)}
        </span>
      </div>

      <div className="landing-hero-score__gauge">
        <FlyScoreGauge score={preview.score} size={170} />
      </div>

      <p className="landing-hero-score__summary">
        {preview.conditionLabel} conditions with winds around {formatWind(preview.windMph)}.
      </p>

      <div className="landing-hero-score__stats">
        <div>
          <span>Wind</span>
          <strong>{formatWind(preview.windMph)}</strong>
        </div>
        <div>
          <span>Gusts</span>
          <strong>{formatWind(preview.gustMph)}</strong>
        </div>
        <div>
          <span>Precip</span>
          <strong>{formatPrecip(preview.precipPct)}</strong>
        </div>
      </div>
    </aside>
  );
}

function StepRow({ step }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="flex gap-4 items-start">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {step.num}
        </div>
        {step.num < STEPS.length ? (
          <div className="w-px flex-1 bg-border mt-1 min-h-[24px]" aria-hidden="true" />
        ) : null}
      </div>
      <div className="pb-6 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span aria-hidden="true" className="text-xl">{step.icon}</span>
          <span className="font-bold text-text-primary">{step.title}</span>
          <span className="text-text-secondary text-sm">- {step.summary}</span>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? `Hide details for ${step.title}` : `Show details for ${step.title}`}
            aria-expanded={open}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-text-muted hover:text-brand-orange hover:bg-brand-orange-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-orange"
          >
            i
          </button>
        </div>
        {open ? (
          <p className="mt-2 text-sm text-text-secondary bg-surface-secondary rounded-xl px-3 py-2.5 max-w-md">
            {step.detail}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <article className="landing-feature-card">
      <div className="landing-feature-card__icon-wrap">
        <Icon size={22} strokeWidth={2} aria-hidden="true" />
      </div>
      <p className="landing-feature-card__eyebrow">{feature.eyebrow}</p>
      <h3 className="landing-feature-card__title">{feature.title}</h3>
      <p className="landing-feature-card__description">{feature.description}</p>
    </article>
  );
}

function SignupLinks({ cardStyle = "" }) {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-3">
      {SIGNUP_OPTIONS.map((option) => (
        <Link
          key={option.to}
          to={option.to}
          className={`rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-brand-orange hover:bg-brand-orange/5 ${cardStyle}`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [heroPreview, setHeroPreview] = useState(FALLBACK_PREVIEW);
  const [isHeroPreviewLoading, setIsHeroPreviewLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHeroPreview() {
      try {
        const preview = await weatherService.getMissionWeatherPreview(HERO_LOCATION);
        if (!cancelled) {
          setHeroPreview(preview);
        }
      } catch {
        if (!cancelled) {
          setHeroPreview(FALLBACK_PREVIEW);
        }
      } finally {
        if (!cancelled) {
          setIsHeroPreviewLoading(false);
        }
      }
    }

    loadHeroPreview();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-white/90 backdrop-blur sticky top-0 z-20">
        <span className="text-brand-orange font-bold text-lg tracking-tight">PED AERIAL</span>
        <div className="flex gap-2">
          <Link to="/login">
            <Button variant="secondary" size="sm">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <HeroMapBackdrop />
        <div className="landing-hero__content">
          <div className="landing-hero__copy">
            <p className="landing-hero__eyebrow">Weather, airspace awareness, and mission confidence</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              One screen.<br />Go or no-go.
            </h1>
            <p className="landing-hero__lede">
              Flight planning built around your drone, your location, and your conditions, now with a live map backdrop and an instant flight score preview.
            </p>
            <div className="landing-hero__actions">
              <Link to="/register" className="block">
                <Button size="lg" className="w-full sm:w-auto">Get started - it is free</Button>
              </Link>
            </div>
            <SignupLinks cardStyle="landing-hero__signup-card" />
            <p className="text-white/80 text-sm mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-orange-300 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <HeroFlightScoreCard preview={heroPreview} isLoading={isHeroPreviewLoading} />
        </div>
      </section>

      <section className="px-6 py-10 bg-surface-secondary">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-text-primary mb-6">How it works</h2>
          <ul className="list-none p-0 m-0" role="list">
            {STEPS.map((step) => (
              <StepRow key={step.num} step={step} />
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <p className="landing-section__eyebrow text-center">Platform at a glance</p>
          <h2 className="text-xl font-bold text-text-primary mb-3 text-center">
            What is inside
          </h2>
          <p className="landing-section__lede text-center">
            The homepage should preview capability fast: clear inputs, clear scoring, and a trail of decisions your team can trust.
          </p>
          <div className="grid gap-5 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta__panel">
          <div className="landing-cta__badge">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Ready for preflight?</span>
          </div>
          <h2 className="landing-cta__title">Choose the account flow that fits your mission.</h2>
          <p className="landing-cta__copy">
            Pilots, clients, and insurance teams all get a tailored way into the same flight readiness workflow.
          </p>
          <div className="landing-cta__actions">
            <Link to="/register" className="block">
              <Button size="lg">Create an account</Button>
            </Link>
            <Link to="/login" className="landing-cta__signin">
              Sign in instead
            </Link>
          </div>
          <SignupLinks cardStyle="landing-cta__signup-card" />
        </div>
      </section>

      <footer className="text-center text-xs text-text-muted py-6 border-t border-border">
        (c) 2026 PED AERIAL | Operator Flight Check | UCI 2123
      </footer>
    </div>
  );
}
