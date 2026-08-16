import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { CollectionCard } from "../components/CollectionCard";
import { ErrorState, LoadingState } from "../components/States";
export function CollectionsPage() {
  const state = useAsync(api.collections, []);
  return (
    <section className="section page">
      <div className="page-heading">
        <span>🌈</span>
        <h1>Mis colecciones</h1>
        <p>Pequeños mundos donde organizo todas mis ideas.</p>
      </div>
      {state.loading ? (
        <LoadingState />
      ) : state.error ? (
        <ErrorState message={state.error} />
      ) : (
        <div className="collection-grid large">
          {state.data?.map((c, i) => (
            <CollectionCard collection={c} index={i} key={c.id} />
          ))}
        </div>
      )}
    </section>
  );
}
