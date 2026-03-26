import { createContext, useCallback, useContext, useRef, useState } from "react";
import Toast from "../components/ui/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ title, description, variant = "default", duration = 3500 }) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // Keep legacy alias for backwards compatibility
  const dismissToast = dismiss;

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, dismiss }}>
      {children}
      <Toast toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
