import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { DrawingCard } from "../components/DrawingCard";
import { CollectionCard } from "../components/CollectionCard";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { GestureConsent } from "../features/gestures/GestureConsent";
export function HomePage() {
  const drawings = useAsync(api.drawings, []);
  const collections = useAsync(api.collections, []);
  const featured = useAsync(api.featured, []);
  const about = useAsync(api.aboutMe, []);
  return (
    <>
      <GestureConsent />
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Hola, soy Naty 🎨</span>
          <h1>
            Un lugar mágico
            <br />
            para compartir
            <br />
            <em>mis dibujos</em>
          </h1>
          <p>
            Aquí guardo mis dibujos, personajes favoritos e ideas llenas de
            color. ¡Bienvenida a mi pequeño mundo creativo!
          </p>
          <Link className="button" to="/dibujos">
            ♡ Ver mis dibujos
          </Link>
        </div>
        <div className="hero-collage">
          <div className="paper p1">🌈</div>
          <div className="paper p2">🐱</div>
          <div className="paper p3">🦄</div>
          <div className="big-paper">
            <span>✏️</span>
            <b>
              Imagina
              <br />
              dibuja
              <br />
              sonríe
            </b>
          </div>
          <i className="doodle d1">☆</i>
          <i className="doodle d2">♡</i>
        </div>
      </section>
      <section className="section">
        <div className="section-title">
          <h2>
            Últimos dibujos <span>♡</span>
          </h2>
          <Link to="/dibujos">Ver todos →</Link>
        </div>
        {drawings.loading ? (
          <LoadingState />
        ) : drawings.error ? (
          <ErrorState message={drawings.error} />
        ) : !drawings.data?.length ? (
          <EmptyState />
        ) : (
          <div className="drawing-grid">
            {drawings.data.slice(0, 6).map((d) => (
              <DrawingCard key={d.id} drawing={d} />
            ))}
          </div>
        )}
      </section>
      <section className="section collections-section">
        <div className="section-title">
          <h2>
            Mis colecciones <span>☆</span>
          </h2>
          <Link to="/colecciones">Explorar →</Link>
        </div>
        {collections.loading ? (
          <LoadingState />
        ) : collections.error ? (
          <ErrorState message={collections.error} />
        ) : (
          <div className="collection-grid">
            {collections.data?.slice(0, 8).map((c, i) => (
              <CollectionCard key={c.id} collection={c} index={i} />
            ))}
          </div>
        )}
      </section>
      <section className="section feature-panel">
        <div className="about-mini">
          <span>Sobre mí</span>
          {about.loading ? (
            <LoadingState />
          ) : about.error || !about.data ? (
            <ErrorState message={about.error} />
          ) : (
            <>
              {about.data.imageUrl ? (
                <img
                  className="avatar"
                  src={about.data.imageUrl}
                  alt="Retrato de Naty"
                />
              ) : (
                <div className="avatar" aria-hidden="true">
                  N
                </div>
              )}
              <h3>{about.data.shortTitle}</h3>
              <p>{about.data.shortDescription}</p>
              <Link className="text-button" to="/sobre-mi">
                Conoce más de mí →
              </Link>
            </>
          )}
        </div>
        <div className="featured">
          <span>Dibujo destacado ✨</span>
          {featured.loading ? (
            <LoadingState />
          ) : featured.error ? (
            <EmptyState message="Muy pronto elegiré un dibujo especial." />
          ) : (
            <>
              <img src={featured.data?.imageUrl} alt={featured.data?.title} />
              <div>
                <h3>{featured.data?.title}</h3>
                <p>{featured.data?.description}</p>
                <Link
                  className="button small"
                  to={`/dibujos/${featured.data?.slug}`}
                >
                  Ver dibujo →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
