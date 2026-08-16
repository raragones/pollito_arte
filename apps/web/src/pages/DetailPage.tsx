import { Link, useParams } from "react-router-dom";
import { drawingStatusLabels } from "@natyarte/shared";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { ErrorState, LoadingState } from "../components/States";
export function DetailPage() {
  const { slug = "" } = useParams();
  const { data, loading, error } = useAsync(() => api.drawing(slug), [slug]);
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error} />;
  return (
    <article className="detail section">
      <Link to="/dibujos">← Volver a mis dibujos</Link>
      <div className="detail-grid">
        <div className="detail-image">
          <img src={data.imageUrl} alt={data.title} />
        </div>
        <div className="detail-copy">
          <span className="pill">{drawingStatusLabels[data.status]}</span>
          {data.favorite && <span className="favorite-label">♥ Favorito</span>}
          <h1>{data.title}</h1>
          <p className="lead">{data.description}</p>
          <dl>
            <dt>Colección</dt>
            <dd>{data.collection?.name ?? "Sin colección"}</dd>
            <dt>Fecha</dt>
            <dd>{data.drawingDate ?? "Sin fecha"}</dd>
            {data.materials && (
              <>
                <dt>Materiales</dt>
                <dd>{data.materials}</dd>
              </>
            )}
          </dl>
          {data.favoritePart && (
            <div className="story">
              <h2>Lo que más me gustó ♡</h2>
              <p>{data.favoritePart}</p>
            </div>
          )}
          {data.story && (
            <div className="story">
              <h2>La historia de este dibujo ✨</h2>
              <p>{data.story}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
