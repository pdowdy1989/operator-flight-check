// Reusable Button component — variants: primary, secondary, danger | sizes: sm, md, lg
export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  onClick,
  className = "",
  "aria-label": ariaLabel,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-brand-orange text-white hover:bg-brand-orange-dark active:scale-[0.98]",
    secondary:
      "bg-white text-text-primary border border-border hover:bg-surface-hover active:scale-[0.98]",
    danger:
      "bg-status-red text-white hover:bg-red-600 active:scale-[0.98]",
    ghost:
      "bg-transparent text-text-secondary hover:bg-surface-hover active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm min-h-[36px]",
    md: "px-5 py-2.5 text-base min-h-[44px]",
    lg: "px-7 py-3.5 text-lg min-h-[52px]",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
