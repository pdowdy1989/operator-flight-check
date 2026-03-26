export default function Input({
  id,
  label,
  hint,
  error,
  className = "",
  ...props
}) {
  return (
    <label className={`block ${className}`} htmlFor={id}>
      {label ? (
        <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
      ) : null}
      <input
        id={id}
        className={`w-full rounded-2xl border bg-white/85 px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
            : "border-slate-200 focus:border-cyan-400 focus:ring-cyan-100"
        }`}
        {...props}
      />
      {hint && !error ? <span className="mt-2 block text-xs text-slate-500">{hint}</span> : null}
      {error ? <span className="mt-2 block text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}
