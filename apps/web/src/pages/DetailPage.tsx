import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { drawingStatusLabels, type Drawing } from "@natyarte/shared";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { ErrorState, LoadingState } from "../components/States";
import { useGestureConsent } from "../features/gestures/useGestureConsent";
import { GestureCamera } from "../features/gestures/GestureCamera";
import { RecommendationsModal } from "../features/gestures/RecommendationsModal";
import { useDrawingLike } from "../features/likes/useDrawingLike";
import type { SupportedGesture } from "../features/gestures/gesture-state-machine";

export function DetailPage() {
  const { slug = "" } = useParams();
  const { data, loading, error } = useAsync(() => api.drawing(slug), [slug]);
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error} />;
  return <DrawingDetail key={data.id} drawing={data} />;
}

function DrawingDetail({ drawing: data }: { drawing: Drawing }) {
  const consent = useGestureConsent();
  const likeState = useDrawingLike(data.id, data.likesCount);
  const [recommendations, setRecommendations] = useState<Drawing[]>([]);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<
    "recommendations" | "thanks"
  >("recommendations");
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState("");

  const showRecommendations = useCallback(async () => {
    setRecommendationsOpen(true);
    setRecommendationsLoading(true);
    setRecommendationsError("");
    try {
      setRecommendations(await api.recommendations(data.id));
    } catch (caught) {
      setRecommendationsError(
        caught instanceof Error
          ? caught.message
          : "No se pudieron cargar las recomendaciones.",
      );
    } finally {
      setRecommendationsLoading(false);
    }
  }, [data.id]);

  const handleGesture = useCallback(
    (gesture: SupportedGesture) => {
      if (likeState.liked) return;
      if (gesture === "Thumb_Up") {
        void likeState.like().then((saved) => {
          if (!saved) return;
          setModalVariant("thanks");
          void showRecommendations();
        });
      } else {
        setModalVariant("recommendations");
        void showRecommendations();
      }
    },
    [likeState, showRecommendations],
  );

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
          <div className="drawing-reactions">
            <button
              className={likeState.liked ? "like-button liked" : "like-button"}
              onClick={() => void likeState.like()}
              disabled={likeState.liked || likeState.liking}
              aria-pressed={likeState.liked}
            >
              {likeState.liked ? "♥ Te gusta" : "♡ Me gusta"}
              <span>{likeState.likesCount}</span>
            </button>
            {consent.consent !== "accepted" && (
              <button
                className="gesture-activate-button"
                onClick={consent.activate}
                disabled={consent.requesting}
              >
                📷 {consent.requesting ? "Activando…" : "Activar gestos"}
              </button>
            )}
          </div>
          {likeState.error && (
            <p className="form-error" role="alert">
              {likeState.error}
            </p>
          )}
          {consent.error && (
            <p className="form-error" role="alert">
              {consent.error}
            </p>
          )}
          <GestureCamera
            enabled={consent.consent === "accepted" && !likeState.liked}
            onGesture={handleGesture}
          />
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
      <RecommendationsModal
        open={recommendationsOpen}
        variant={modalVariant}
        drawings={recommendations}
        loading={recommendationsLoading}
        error={recommendationsError}
        onClose={() => setRecommendationsOpen(false)}
      />
    </article>
  );
}
