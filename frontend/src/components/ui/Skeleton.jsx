export default function Skeleton({ className = "" }) {
  return <div className={`animate-shimmer rounded-xl bg-slate-200/80 ${className}`} aria-hidden="true" />;
}
