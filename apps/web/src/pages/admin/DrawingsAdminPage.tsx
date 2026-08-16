import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { LoadingState } from "../../components/States";
export function DrawingsAdminPage() {
  const state = useAsync(api.adminDrawings, []);
  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <h1>Dibujos</h1>
          <p>Crea, publica y organiza tus obras.</p>
        </div>
        <Link className="admin-button" to="/admin/dibujos/nuevo">
          + Nuevo dibujo
        </Link>
      </div>
      {state.loading ? (
        <LoadingState />
      ) : (
        <div className="admin-table">
          <div className="table-row table-head">
            <span>Dibujo</span>
            <span>Colección</span>
            <span>Estado</span>
            <span>Visibilidad</span>
            <span />
          </div>
          {state.data?.map((d) => (
            <div className="table-row" key={d.id}>
              <span className="drawing-cell">
                <img src={d.imageUrl} alt="" />
                <b>{d.title}</b>
              </span>
              <span>{d.collection?.name ?? "—"}</span>
              <span>
                {d.status === "finished"
                  ? "Terminado"
                  : d.status === "in_progress"
                    ? "En progreso"
                    : "Boceto"}
              </span>
              <span className={d.published ? "published" : ""}>
                {d.published ? "Publicado" : "Privado"}
              </span>
              <span>
                <Link to={`/admin/dibujos/${d.id}`}>Editar</Link>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
