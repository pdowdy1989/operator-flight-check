import { Link } from "react-router-dom";
import { useState } from "react";
import Button from "../components/ui/Button";

const STEPS = [
  {
    num: 1,
    icon: "📍",
    title: "Pick your spot",
    summary: "Search or drop a pin where you plan to fly",
    detail:
      "Search by name or use your device's GPS to set a precise launch point. Save your favorite locations for quick access on future checks.",
  },
  {
    num: 2,
    icon: "☁️",
    title: "Check the forecast",
    summary: "See 7-day weather matched to your drone",
    detail:
      "View a full week of wind, gust, and precipitation forecasts. Tap any day to expand an hourly breakdown so you can find your best window.",
  },
  {
    num: 3,
    icon: "✈️",
    title: "Know your limits",
    summary: "Set wind, gust, and precip thresholds per aircraft",
    detail:
      "Choose from Micro, Prosumer, or Heavy profiles — or customize your own. The app scores every forecast against your specific aircraft limits.",
  },
  {
    num: 4,
    icon: "✅",
    title: "Get your go or no-go",
    summary: "One score, one color, one answer",
    detail:
      "A 0–100 fly score tells you exactly how close you are to your limits. GREEN means go, YELLOW means proceed with caution, RED means stand down.",
  },
  {
    num: 5,
    icon: "📋",
    title: "Log your decision",
    summary: "Build a history of field decisions",
    detail:
      "Every check you save becomes part of your personal decision log — useful for regulatory compliance, reviewing patterns, and sharing with your crew.",
  },
];

const FEATURES = [
  {
    icon: "🌤️",
    title: "Weather + Thresholds",
    description:
      "Wind, gusts, and precipitation overlaid against your drone's operating limits. No manual math — the app does the comparison for you.",
  },
  {
    icon: "📌",
    title: "Saved Spots",
    description:
      "Bookmark your go-to launch sites with a single tap. Revisit them instantly and see the status from your last check.",
  },
  {
    icon: "📓",
    title: "Decision History",
    description:
      "Every spot check is logged with date, location, score, and notes. Search and filter your history by spot or outcome.",
  },
];

function StepRow({ step }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="flex gap-4 items-start">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {step.num}
        </div>
        {step.num < 5 && (
          <div className="w-px flex-1 bg-border mt-1 min-h-[24px]" aria-hidden="true" />
        )}
      </div>
      <div className="pb-6 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span aria-hidden="true" className="text-xl">{step.icon}</span>
          <span className="font-bold text-text-primary">{step.title}</span>
          <span className="text-text-secondary text-sm">— {step.summary}</span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? `Hide details for ${step.title}` : `Show details for ${step.title}`}
            aria-expanded={open}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-text-muted hover:text-brand-orange hover:bg-brand-orange-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-orange"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>
        {open && (
          <p className="mt-2 text-sm text-text-secondary bg-surface-secondary rounded-xl px-3 py-2.5 max-w-md">
            {step.detail}
          </p>
        )}
      </div>
    </li>
  );
}

function FeatureCard({ feature }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-border shadow-card p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">{feature.icon}</span>
          <h3 className="font-bold text-text-primary">{feature.title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Hide description" : "Show description"}
          aria-expanded={open}
          className="flex-shrink-0 w-7 h-7 rounded-full text-text-muted hover:text-brand-orange hover:bg-brand-orange-bg"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>
      </div>
      {open && (
        <p className="text-sm text-text-secondary">{feature.description}</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-white sticky top-0 z-10">
        <span className="text-brand-orange font-bold text-lg tracking-tight">PED AERIAL</span>
        <div className="flex gap-2">
          <Link to="/login">
            <Button variant="secondary" size="sm">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 text-center max-w-xl mx-auto w-full">
        <h1 className="text-4xl sm:text-5xl font-black text-text-primary leading-tight mb-4">
          One screen.<br />Go or no-go.
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          Flight planning built around your drone, your location, your conditions.
        </p>
        <Link to="/register" className="block">
          <Button size="lg" className="w-full sm:w-auto">Get Started — it&apos;s free</Button>
        </Link>
        <p className="text-text-muted text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-orange font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </section>

      {/* Workflow steps */}
      <section className="px-6 py-10 bg-surface-secondary">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-text-primary mb-6">How it works</h2>
          <ul className="list-none p-0 m-0" role="list">
            {STEPS.map((s) => (
              <StepRow key={s.num} step={s} />
            ))}
          </ul>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-text-primary mb-6 text-center">
            What&apos;s inside
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-brand-orange-bg border-t border-brand-orange-light px-6 py-12 text-center mt-auto">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Ready for preflight?</h2>
        <p className="text-text-secondary mb-6">Takes 30 seconds to set up.</p>
        <Link to="/register" className="block">
          <Button size="lg" className="w-full sm:w-auto">Create an account</Button>
        </Link>
        <p className="text-text-muted text-sm mt-3">
          or{" "}
          <Link to="/login" className="text-brand-orange font-medium hover:underline">
            sign in
          </Link>
        </p>
      </section>

      <footer className="text-center text-xs text-text-muted py-6 border-t border-border">
        © 2026 PED AERIAL · Operator Flight Check · UCI 2123
      </footer>
    </div>
  );
}
