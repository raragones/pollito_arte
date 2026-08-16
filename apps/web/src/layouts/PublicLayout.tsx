import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
export function PublicLayout() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">
          <span>♥</span>
          <b>
            Naty<span>Arte</span>
          </b>
          <small>mi mundo creativo</small>
        </Link>
        <button
          className="menu"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <nav className={open ? "open" : ""} onClick={() => setOpen(false)}>
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/dibujos">Mis dibujos</NavLink>
          <NavLink to="/colecciones">Colecciones</NavLink>
          <NavLink to="/favoritos">Mis favoritos</NavLink>
          <NavLink to="/evolucion">Mi evolución</NavLink>
          <NavLink to="/sobre-mi">Sobre mí</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <div>
          <b>NatyArte ✨</b>
          <p>Un rincón para crear, imaginar y compartir colores.</p>
        </div>
        <div>
          <b>Explora</b>
          <Link to="/dibujos">Mis dibujos</Link>
          <Link to="/colecciones">Colecciones</Link>
        </div>
        <div className="footer-art">🌈 ☁️ ⭐</div>
        <small>Hecho con ♥ para Naty</small>
      </footer>
    </>
  );
}
