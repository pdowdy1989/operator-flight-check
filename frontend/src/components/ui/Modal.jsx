import { useEffect } from "react";
import Button from "./Button";
import "./Modal.css";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  primaryLabel = "Confirm",
  secondaryLabel = "Cancel",
  primaryDisabled = false,
  footer,
  size = "md",
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`modal-content modal-${size}`} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          {title ? <h2 className="modal-title">{title}</h2> : null}
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? (
          <div className="modal-footer">{footer}</div>
        ) : (primaryAction || secondaryLabel) ? (
          <div className="modal-footer">
            {secondaryLabel ? (
              <Button variant="secondary" onClick={onClose}>
                {secondaryLabel}
              </Button>
            ) : null}
            {primaryAction ? (
              <Button onClick={primaryAction} disabled={primaryDisabled}>
                {primaryLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
