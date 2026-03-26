import { useState } from "react";

// Reusable Card component — white background, rounded, soft shadow.
// Pass expandable=true to get collapse/expand behavior.
export default function Card({
  children,
  className = "",
  expandable = false,
  defaultExpanded = true,
  title,
  headerRight,
  onClick,
  ...props
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const isClickable = !expandable && typeof onClick === "function";

  return (
    <div
      className={[
        "bg-white rounded-2xl border border-border shadow-card",
        isClickable ? "cursor-pointer hover:shadow-card-hover active:scale-[0.99]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={isClickable ? onClick : undefined}
      {...props}
    >
      {(title || expandable) && (
        <div
          className={[
            "flex items-center justify-between px-4 py-3 border-b border-border",
            expandable ? "cursor-pointer select-none" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={expandable ? () => setExpanded((v) => !v) : undefined}
          role={expandable ? "button" : undefined}
          aria-expanded={expandable ? expanded : undefined}
          tabIndex={expandable ? 0 : undefined}
          onKeyDown={
            expandable
              ? (e) => e.key === "Enter" && setExpanded((v) => !v)
              : undefined
          }
        >
          {title && (
            <span className="font-semibold text-text-primary">{title}</span>
          )}
          {headerRight && !expandable && (
            <span>{headerRight}</span>
          )}
          {expandable && (
            <span
              className="text-text-muted text-lg leading-none"
              aria-hidden="true"
            >
              {expanded ? "−" : "+"}
            </span>
          )}
        </div>
      )}
      {(!expandable || expanded) && <div>{children}</div>}
    </div>
  );
}
