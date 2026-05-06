import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Shield, X } from "lucide-react";
import { COLORS } from "../../design-system/constants";

/**
 * Minimal global toast container used by the Live Pulse pipeline to surface
 * incoming attack events without dragging in a third-party toast library.
 *
 * The component listens for ``window`` ``sdn:toast`` events. Anywhere in the
 * tree can dispatch:
 *
 *     window.dispatchEvent(new CustomEvent('sdn:toast', { detail: { ... } }));
 *
 * Each toast auto-dismisses after ``timeoutMs`` (default 6s).
 */
export default function ToastContainer({ timeoutMs = 6000 }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const onToast = (evt) => {
      const detail = evt.detail || {};
      const id =
        detail.id ||
        `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const toast = {
        id,
        title: detail.title || "Attack detected",
        message: detail.message || "",
        severity: detail.severity || "high",
      };
      setToasts((prev) => [...prev.slice(-4), toast]);
      window.setTimeout(() => dismiss(id), timeoutMs);
    };
    window.addEventListener("sdn:toast", onToast);
    return () => window.removeEventListener("sdn:toast", onToast);
  }, [dismiss, timeoutMs]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[90vw]"
      aria-live="polite"
      role="status"
    >
      {toasts.map((t) => {
        const palette = severityPalette(t.severity);
        const Icon = t.severity === "high" ? AlertTriangle : Shield;
        return (
          <div
            key={t.id}
            className="rounded-lg shadow-lg p-4 flex items-start gap-3 animate-fade-in border"
            style={{
              backgroundColor: palette.bg,
              borderColor: palette.border,
            }}
          >
            <Icon
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: palette.icon }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: palette.text }}
              >
                {t.title}
              </p>
              {t.message && (
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {t.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-white transition"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function severityPalette(severity) {
  const danger = COLORS?.status?.danger || "#ef4444";
  const warning = COLORS?.status?.warning || "#f59e0b";
  const info = COLORS?.accent?.cyan || "#06b6d4";
  switch ((severity || "").toLowerCase()) {
    case "high":
    case "critical":
      return { bg: danger + "20", border: danger + "60", icon: danger, text: "#fff" };
    case "medium":
      return { bg: warning + "20", border: warning + "60", icon: warning, text: "#fff" };
    default:
      return { bg: info + "20", border: info + "60", icon: info, text: "#fff" };
  }
}
