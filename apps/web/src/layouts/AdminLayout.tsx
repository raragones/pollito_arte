import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../services/api";
export function AdminLayout() {
  const navigate = useNavigate();
  return (
    <div className="admin-shell">
      <aside>
        <div className="admin-brand">
          NatyArte <span>pro</span>
        </div>
        <nav>
          <NavLink end to="/admin/dashboard">
            ⌂ Resumen
          </NavLink>
          <NavLink to="/admin/dibujos">▧ Dibujos</NavLink>
          <NavLink to="/admin/colecciones">◉ Colecciones</NavLink>
        </nav>
        <button
          onClick={async () => {
            await api.logout();
            navigate("/admin/login");
          }}
        >
          Cerrar sesión
        </button>
      </aside>
      <div className="admin-content">
        <header>
          <b>Panel de NatyArte</b>
          <span>Área privada</span>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
