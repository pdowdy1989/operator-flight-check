import "./Button.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  fullWidth = false,
  className = "",
  "aria-label": ariaLabel,
  ...props
}) {
  return (
    <button
      type={type}
      className={`ui-btn ui-btn-${variant} ui-btn-${size} ${fullWidth ? "full-width" : ""} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? <span className="btn-spinner" /> : icon ? <span className="btn-icon">{icon}</span> : null}
      {children}
    </button>
  );
}
