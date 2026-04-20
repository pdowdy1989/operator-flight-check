import { useState } from "react";
import "./Card.css";

export default function Card({
  children,
  className = "",
  expandable = false,
  defaultExpanded = true,
  title,
  headerRight,
  header,
  footer,
  noPadding = false,
  onClick,
  ...props
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isClickable = !expandable && typeof onClick === "function";

  return (
    <div
      className={`ui-card ${isClickable ? "ui-card--clickable" : ""} ${className}`}
      onClick={isClickable ? onClick : undefined}
      {...props}
    >
      {(title || expandable || headerRight) && (
        <div
          className="ui-card-topbar"
          onClick={expandable ? () => setExpanded((value) => !value) : undefined}
          role={expandable ? "button" : undefined}
          aria-expanded={expandable ? expanded : undefined}
          tabIndex={expandable ? 0 : undefined}
          onKeyDown={expandable ? (event) => event.key === "Enter" && setExpanded((value) => !value) : undefined}
        >
          {title ? <span className="ui-card-heading">{title}</span> : <span />}
          {headerRight && !expandable ? <span>{headerRight}</span> : null}
          {expandable ? <span className="ui-card-toggle">{expanded ? "−" : "+"}</span> : null}
        </div>
      )}
      {header ? <div className="ui-card-header">{header}</div> : null}
      {(!expandable || expanded) ? <div className={`ui-card-body ${noPadding ? "no-padding" : ""}`}>{children}</div> : null}
      {footer ? <div className="ui-card-footer">{footer}</div> : null}
    </div>
  );
}
