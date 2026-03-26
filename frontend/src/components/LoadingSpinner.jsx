export default function LoadingSpinner({ label = "Loading", size = "md" }) {
  const sizeClass = size === "sm" ? "h-4 w-4 border-2" : "h-6 w-6 border-[3px]";

  return (
    <span className="inline-flex items-center gap-3 text-sm text-slate-600">
      <span
        className={`${sizeClass} inline-block animate-spin rounded-full border-slate-200 border-t-tide`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
