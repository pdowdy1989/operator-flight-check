// LoadingSpinner — centered animated ring for async states
export default function LoadingSpinner({ size = "md", label = "Loading…", className = "" }) {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label={label}
    >
      <div
        className={`${sizes[size]} rounded-full border-border border-t-brand-orange animate-spin`}
        aria-hidden="true"
      />
      {label && (
        <span className="text-sm text-text-secondary">{label}</span>
      )}
    </div>
  );
}
