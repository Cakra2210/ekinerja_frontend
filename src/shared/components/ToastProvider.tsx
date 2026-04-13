import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);
const DEFAULT_DURATION = 3800;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const tone = input.tone ?? "info";

    setItems((current) => [
      ...current,
      {
        id,
        title: input.title,
        description: input.description,
        tone
      }
    ]);

    window.setTimeout(() => {
      removeToast(id);
    }, DEFAULT_DURATION);
  }, [removeToast]);

  const value = useMemo<ToastContextValue>(() => ({
    showToast,
    success: (title, description) => showToast({ title, description, tone: "success" }),
    error: (title, description) => showToast({ title, description, tone: "error" }),
    warning: (title, description) => showToast({ title, description, tone: "warning" }),
    info: (title, description) => showToast({ title, description, tone: "info" })
  }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {items.map((item) => (
          <div key={item.id} className={`toast toast-${item.tone}`} role="status">
            <div className="toast-content">
              <strong>{item.title}</strong>
              {item.description ? <span>{item.description}</span> : null}
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(item.id)}
              aria-label="Tutup notifikasi"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
};
