import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(o: {
            client_id: string;
            callback(r: { credential: string }): void;
          }): void;
          renderButton(e: HTMLElement, o: object): void;
        };
      };
    };
  }
}
export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            await api.login(credential);
            navigate("/admin/dashboard");
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "No se pudo iniciar sesión",
            );
          }
        },
      });
      const target = document.getElementById("google-button");
      if (target)
        window.google?.accounts.id.renderButton(target, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          locale: "es",
        });
    };
    document.head.appendChild(script);
    return () => script.remove();
  }, [navigate]);
  return (
    <main className="login-page">
      <div className="login-card">
        <div className="admin-brand">
          NatyArte <span>pro</span>
        </div>
        <h1>Hola de nuevo 🎨</h1>
        <p>Ingresa con una cuenta administradora para cuidar la galería.</p>
        <div id="google-button" />
        {error && <p className="form-error">{error}</p>}
      </div>
    </main>
  );
}
