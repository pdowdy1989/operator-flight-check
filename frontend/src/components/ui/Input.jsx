import "./Input.css";

export default function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  hint,
  helper,
  icon,
  disabled = false,
  required = false,
  autoComplete,
  fullWidth = true,
  className = "",
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const helperText = helper || hint;

  return (
    <div className={`ui-input-group ${fullWidth ? "full-width" : ""} ${className}`}>
      {label ? (
        <label htmlFor={inputId} className="ui-input-label">
          {label}
          {required ? <span className="ui-input-required" aria-hidden="true">*</span> : null}
        </label>
      ) : null}
      <div className={`ui-input-wrapper ${error ? "has-error" : ""} ${disabled ? "is-disabled" : ""}`}>
        {icon ? <span className="ui-input-icon">{icon}</span> : null}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-hint` : undefined}
          className="ui-input"
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="ui-input-error" role="alert">
          {error}
        </p>
      ) : null}
      {helperText && !error ? (
        <p id={`${inputId}-hint`} className="ui-input-helper">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
