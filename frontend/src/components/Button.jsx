const variantClasses = {
  primary:
    "border border-orange-300/80 bg-[linear-gradient(135deg,#f97316,#ea580c)] text-white shadow-[0_14px_30px_rgba(234,88,12,0.28)] hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_18px_36px_rgba(234,88,12,0.34)]",
  secondary:
    "border border-slate-200 bg-white/88 text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/80",
  ghost:
    "bg-transparent text-slate-600 hover:bg-orange-50 hover:text-slate-900",
  danger:
    "border border-rose-200 bg-[linear-gradient(135deg,#fb7185,#ef4444)] text-white shadow-[0_14px_30px_rgba(239,68,68,0.24)] hover:-translate-y-0.5",
};

const sizeClasses = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
