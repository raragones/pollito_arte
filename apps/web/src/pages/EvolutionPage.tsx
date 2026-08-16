import type { Drawing } from "@natyarte/shared";
import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { DrawingCard } from "../components/DrawingCard";
import { LoadingState } from "../components/States";
export function EvolutionPage() {
  const state = useAsync(api.drawings, []);
  if (state.loading) return <LoadingState />;
  const groups = (state.data ?? []).reduce<Record<string, Drawing[]>>(
    (all, drawing) => {
      const year = (drawing.drawingDate ?? drawing.createdAt).slice(0, 4);
      (all[year] ??= []).push(drawing);
      return all;
    },
    {},
  );
  return (
    <section className="section page">
      <div className="page-heading">
        <span>🌱 → 🌸</span>
        <h1>Mi evolución</h1>
        <p>
          Un viaje por mis dibujos para ver cómo cambian mis trazos e ideas.
        </p>
      </div>
      <div className="timeline">
        {Object.entries(groups)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([year, items]) => (
            <section key={year}>
              <h2>{year}</h2>
              <div className="drawing-grid">
                {items.map((d) => (
                  <DrawingCard key={d.id} drawing={d} />
                ))}
              </div>
            </section>
          ))}
      </div>
    </section>
  );
}
