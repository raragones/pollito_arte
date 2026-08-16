import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { DrawingCard } from "../components/DrawingCard";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
export function GalleryPage({ favorites = false }: { favorites?: boolean }) {
  const [params, setParams] = useSearchParams();
  const selected = params.get("coleccion") ?? "";
  const drawings = useAsync(
    () => api.drawings(selected || undefined),
    [selected],
  );
  const collections = useAsync(api.collections, []);
  const list = favorites
    ? drawings.data?.filter((d) => d.favorite)
    : drawings.data;
  return (
    <section className="section page">
      <div className="page-heading">
        <span>✏️ ☆ ♡</span>
        <h1>{favorites ? "Mis favoritos" : "Mis dibujos"}</h1>
        <p>
          {favorites
            ? "Una selección de dibujos que tienen un lugar especial."
            : "Todos mis personajes, historias e ideas reunidos aquí."}
        </p>
      </div>
      {!favorites && (
        <div className="filters">
          <button
            className={!selected ? "active" : ""}
            onClick={() => setParams({})}
          >
            Todos
          </button>
          {collections.data?.map((c) => (
            <button
              className={selected === c.slug ? "active" : ""}
              onClick={() => setParams({ coleccion: c.slug })}
              key={c.id}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      {drawings.loading ? (
        <LoadingState />
      ) : drawings.error ? (
        <ErrorState message={drawings.error} />
      ) : !list?.length ? (
        <EmptyState
          message={
            favorites
              ? "Aún no marqué favoritos."
              : "Esta colección espera su primer dibujo."
          }
        />
      ) : (
        <div className="drawing-grid">
          {list.map((d) => (
            <DrawingCard key={d.id} drawing={d} />
          ))}
        </div>
      )}
    </section>
  );
}
