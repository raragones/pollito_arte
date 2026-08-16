import { Link } from "react-router-dom";
import { useAsync } from "../../hooks/useAsync";
import { api } from "../../services/api";
export function DashboardPage() {
  const d = useAsync(api.adminDrawings, []);
  const c = useAsync(api.adminCollections, []);
  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <h1>Resumen</h1>
          <p>Todo tu mundo creativo, de un vistazo.</p>
        </div>
        <Link className="admin-button" to="/admin/dibujos/nuevo">
          + Nuevo dibujo
        </Link>
      </div>
      <div className="stats">
        <div>
          <span>🎨</span>
          <b>{d.data?.length ?? "—"}</b>
          <small>Dibujos</small>
        </div>
        <div>
          <span>✓</span>
          <b>{d.data?.filter((x) => x.published).length ?? "—"}</b>
          <small>Publicados</small>
        </div>
        <div>
          <span>♡</span>
          <b>{d.data?.filter((x) => x.favorite).length ?? "—"}</b>
          <small>Favoritos</small>
        </div>
        <div>
          <span>▧</span>
          <b>{c.data?.length ?? "—"}</b>
          <small>Colecciones</small>
        </div>
      </div>
    </div>
  );
}
