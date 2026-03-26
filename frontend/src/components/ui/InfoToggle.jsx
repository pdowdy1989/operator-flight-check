import { useState } from "react";

// InfoToggle — ℹ️ icon button that reveals hidden description text
export default function InfoToggle({ description, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <span className={`inline-flex flex-col gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Hide details" : "Show details"}
        aria-expanded={open}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-text-muted hover:text-brand-orange hover:bg-brand-orange-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-orange"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
      {open && (
        <span className="text-sm text-text-secondary bg-surface-secondary rounded-xl px-3 py-2 block max-w-xs">
          {description}
        </span>
      )}
    </span>
  );
}
