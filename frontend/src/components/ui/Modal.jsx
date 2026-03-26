import { useEffect } from "react";

// Modal component — overlay with close button and body slot
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  primaryLabel = "Confirm",
  secondaryLabel = "Cancel",
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Trap scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          {title && (
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          )}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="ml-auto text-text-muted hover:text-text-primary rounded-lg p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-orange"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-4">{children}</div>
        {/* Footer */}
        {(primaryAction || secondaryLabel) && (
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-text-primary font-medium hover:bg-surface-hover min-h-[44px]"
            >
              {secondaryLabel}
            </button>
            {primaryAction && (
              <button
                onClick={primaryAction}
                className="px-5 py-2 rounded-xl bg-brand-orange text-white font-semibold hover:bg-brand-orange-dark min-h-[44px]"
              >
                {primaryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
