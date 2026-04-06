"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import { CheckCircle, AlertTriangle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

const icons = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
};

const colors = {
  success:
    "border-shelvitas-green/30 bg-shelvitas-green/10 text-shelvitas-green",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  info: "border-shelvitas-blue/30 bg-shelvitas-blue/10 text-shelvitas-blue",
};

const ToastItem = ({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) => {
  const Icon = icons[t.type];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(t.id), 3000);
    return () => clearTimeout(timer);
  }, [t.id, onDismiss]);

  return (
    <div
      className={`flex items-center gap-2 rounded-sm border px-4 py-2.5 text-sm shadow-lg backdrop-blur animate-in slide-in-from-right-full ${colors[t.type]}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{t.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(t.id)}
        className="shrink-0 opacity-60 hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue = useMemo(() => ({ toast: addToast }), [addToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-20 right-4 z-[200] flex flex-col gap-2 md:bottom-4">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
