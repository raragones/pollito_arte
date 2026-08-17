import { useEffect, useRef } from "react";
import type { Drawing } from "@natyarte/shared";
import { DrawingCard } from "../../components/DrawingCard";
import { LoadingState } from "../../components/States";

interface Props {
  open: boolean;
  variant?: "recommendations" | "thanks";
  drawings: Drawing[];
  loading: boolean;
  error: string;
  onClose: () => void;
}

export function RecommendationsModal({
  open,
  variant = "recommendations",
  drawings,
  loading,
  error,
  onClose,
}: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    dialog.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="recommendations-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recommendations-title"
        tabIndex={-1}
        ref={dialog}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar recomendaciones"
        >
          ×
        </button>
        <span className="modal-icon" aria-hidden="true">
          {variant === "thanks" ? "💖" : "✨"}
        </span>
        <h2 id="recommendations-title">
          {variant === "thanks"
            ? "¡Gracias por tu like!"
            : "Quizás te gusten estos dibujos"}
        </h2>
        <p>
          {variant === "thanks"
            ? "Tu cariño quedó guardado. ¿Quieres descubrir otro dibujo?"
            : "Elegimos obras reales de la galería, priorizando la misma colección."}
        </p>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : drawings.length ? (
          <div className="recommendations-grid">
            {drawings.map((drawing) => (
              <DrawingCard key={drawing.id} drawing={drawing} />
            ))}
          </div>
        ) : (
          <p>No hay más dibujos publicados por ahora.</p>
        )}
      </div>
    </div>
  );
}
