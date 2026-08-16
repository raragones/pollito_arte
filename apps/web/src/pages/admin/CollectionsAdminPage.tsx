import { FormEvent, useState } from "react";
import type { Collection } from "@natyarte/shared";
import { api } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
const slugify = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
export function CollectionsAdminPage() {
  const [version, setVersion] = useState(0);
  const state = useAsync(api.adminCollections, [version]);
  const [editing, setEditing] = useState<Collection>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  const select = (c?: Collection) => {
    setEditing(c);
    setName(c?.name ?? "");
    setDescription(c?.description ?? "");
    setOrder(c?.order ?? 0);
    setActive(c?.active ?? true);
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await api.saveCollection(
        {
          name,
          slug: editing?.slug ?? slugify(name),
          description,
          coverImageUrl: editing?.coverImageUrl ?? null,
          order,
          active,
        },
        editing?.id,
      );
      select();
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    }
  }
  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <h1>Colecciones</h1>
          <p>Organiza tus dibujos en mundos diferentes.</p>
        </div>
        <button className="admin-button" onClick={() => select()}>
          + Nueva colección
        </button>
      </div>
      <div className="collections-admin">
        <div className="admin-table">
          {state.data?.map((c) => (
            <div className="table-row collection-row" key={c.id}>
              <span>
                <b>{c.name}</b>
                <small>
                  {c.drawingCount} dibujos · orden {c.order}
                </small>
              </span>
              <span className={c.active ? "published" : ""}>
                {c.active ? "Activa" : "Inactiva"}
              </span>
              <button onClick={() => select(c)}>Editar</button>
              <button
                className="danger-link"
                onClick={async () => {
                  if (confirm(`¿Eliminar ${c.name}?`)) {
                    try {
                      await api.deleteCollection(c.id);
                      setVersion((v) => v + 1);
                    } catch (e) {
                      alert(
                        e instanceof Error ? e.message : "No se pudo eliminar",
                      );
                    }
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
        <form className="collection-form" onSubmit={submit}>
          <h2>{editing ? "Editar colección" : "Nueva colección"}</h2>
          <label>
            Nombre
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Descripción
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label>
            Orden
            <input
              type="number"
              min="0"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Colección activa
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="admin-button">Guardar</button>
        </form>
      </div>
    </div>
  );
}
