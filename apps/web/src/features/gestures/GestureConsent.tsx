import { useEffect, useRef } from "react";
import { useGestureConsent } from "./useGestureConsent";

export function GestureConsent() {
  const { consent, activate, decline, requesting, error } = useGestureConsent();
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consent === "unknown") dialog.current?.focus();
  }, [consent]);

  if (consent === "declined") {
    return (
      <button
        className="gesture-reenable"
        onClick={activate}
        disabled={requesting}
      >
        📷 Activar gestos
      </button>
    );
  }
  if (consent !== "unknown") return null;

  return (
    <div className="modal-backdrop">
      <div
        className="consent-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gesture-consent-title"
        tabIndex={-1}
        ref={dialog}
      >
        <span className="modal-icon" aria-hidden="true">
          👋
        </span>
        <h2 id="gesture-consent-title">¿Quieres explorar con gestos?</h2>
        <p>
          En el detalle de cada dibujo podrás mantener el pulgar arriba para dar
          cariño o el pulgar abajo para descubrir otras obras.
        </p>
        <div className="privacy-note">
          🔒 La cámara solo se usa en tu dispositivo. El video nunca se graba ni
          se envía al servidor.
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button className="button" onClick={activate} disabled={requesting}>
            {requesting ? "Solicitando permiso…" : "Activar gestos"}
          </button>
          <button
            className="secondary-button"
            onClick={decline}
            disabled={requesting}
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
