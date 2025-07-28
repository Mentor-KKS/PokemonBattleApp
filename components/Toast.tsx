import { useState, useEffect } from "react";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: number) => void;
}

export function Toast({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getToastStyles = () => {
    const baseStyles =
      "pixel-font text-sm border-4 border-black p-4 shadow-lg transform transition-all duration-300 ease-in-out";

    switch (toast.type) {
      case "success":
        return `${baseStyles} bg-green-400 text-green-900`;
      case "error":
        return `${baseStyles} bg-red-400 text-red-900`;
      case "warning":
        return `${baseStyles} bg-yellow-400 text-yellow-900`;
      case "info":
        return `${baseStyles} bg-blue-400 text-blue-900`;
      default:
        return `${baseStyles} bg-gray-400 text-gray-900`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📝";
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon()}</span>
        <span>{toast.message}</span>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-auto text-lg hover:scale-110 transition-transform"
        >
          ×
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
