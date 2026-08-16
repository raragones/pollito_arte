import type { Drawing } from "@natyarte/shared";
import { Link } from "react-router-dom";
export function DrawingCard({ drawing }: { drawing: Drawing }) {
  return (
    <Link className="drawing-card" to={`/dibujos/${drawing.slug}`}>
      <div className="drawing-image">
        <img src={drawing.imageUrl} alt={drawing.title} loading="lazy" />
        {drawing.favorite && (
          <span className="heart" aria-label="Favorito">
            ♥
          </span>
        )}
      </div>
      <div className="card-copy">
        <strong>{drawing.title}</strong>
        <span>{drawing.collection?.name ?? "Mi imaginación"}</span>
        <small>
          {drawing.drawingDate
            ? new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(
                new Date(`${drawing.drawingDate}T12:00:00`),
              )
            : "Sin fecha"}
        </small>
      </div>
    </Link>
  );
}
