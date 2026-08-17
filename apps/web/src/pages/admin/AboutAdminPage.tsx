import { FormEvent, useEffect, useState } from "react";
import type { AboutMeInput } from "@natyarte/shared";
import { api } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { ErrorState, LoadingState } from "../../components/States";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function AboutAdminPage() {
  const about = useAsync(api.adminAboutMe, []);
  const [form, setForm] = useState<AboutMeInput>();
  const [image, setImage] = useState<File>();
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  if (about.loading) return <LoadingState />;
  if (about.error || !about.data) return <ErrorState message={about.error} />;

  const value = form ?? {
    shortTitle: about.data.shortTitle,
    shortDescription: about.data.shortDescription,
    fullTitle: about.data.fullTitle,
    subtitle: about.data.subtitle ?? "",
    content: about.data.content,
  };
  const set = <K extends keyof AboutMeInput>(key: K, next: AboutMeInput[K]) =>
    setForm({ ...value, [key]: next });

  function chooseImage(file?: File) {
    setError("");
    if (!file) return;
    if (!acceptedTypes.has(file.type)) {
      setError("Solo se permiten imágenes JPEG, PNG o WebP.");
      return;
    }
    if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("La imagen debe pesar como máximo 5 MB.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.saveAboutMe(value);
      if (image) await api.saveAboutMeImage(image);
      setImage(undefined);
      setMessage("Los cambios se guardaron correctamente.");
      about.reload();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No se pudo guardar.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeImage() {
    if (!confirm("¿Quitar la imagen de la sección Sobre mí?")) return;
    setSaving(true);
    setError("");
    try {
      await api.deleteAboutMeImage();
      setImage(undefined);
      setPreview("");
      setMessage("La imagen fue eliminada.");
      about.reload();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No se pudo eliminar.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <h1>Sobre mí</h1>
          <p>
            Edita el contenido que aparece en la portada y en la página
            completa.
          </p>
        </div>
      </div>
      <div className="privacy-warning" role="note">
        <b>Privacidad:</b> evita publicar apellidos, edad, colegio, dirección,
        rutinas u otros datos personales. Usa una imagen apropiada y segura.
      </div>
      <form className="admin-form about-admin-form" onSubmit={submit}>
        <div className="form-main">
          <label>
            Título breve *
            <input
              required
              maxLength={120}
              value={value.shortTitle}
              onChange={(event) => set("shortTitle", event.target.value)}
            />
          </label>
          <label className="full">
            Descripción breve *
            <textarea
              required
              maxLength={500}
              value={value.shortDescription}
              onChange={(event) => set("shortDescription", event.target.value)}
            />
          </label>
          <label>
            Título completo *
            <input
              required
              maxLength={160}
              value={value.fullTitle}
              onChange={(event) => set("fullTitle", event.target.value)}
            />
          </label>
          <label>
            Subtítulo opcional
            <input
              maxLength={240}
              value={value.subtitle ?? ""}
              onChange={(event) => set("subtitle", event.target.value || null)}
            />
          </label>
          <label className="full">
            Contenido *
            <textarea
              required
              rows={12}
              maxLength={8000}
              value={value.content}
              onChange={(event) => set("content", event.target.value)}
            />
            <small>
              Los saltos de línea se conservarán en la página pública.
            </small>
          </label>
        </div>
        <aside className="form-side">
          <h3>Imagen</h3>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => chooseImage(event.target.files?.[0])}
          />
          {preview || about.data.imageUrl ? (
            <img
              className="about-admin-preview"
              src={preview || about.data.imageUrl || ""}
              alt="Vista previa de Sobre mí"
            />
          ) : (
            <div className="avatar big" aria-hidden="true">
              N
            </div>
          )}
          <small>JPEG, PNG o WebP · máximo 5 MB.</small>
          {about.data.imageUrl && !image && (
            <button
              type="button"
              className="danger"
              onClick={removeImage}
              disabled={saving}
            >
              Quitar imagen
            </button>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="form-success" role="status">
              {message}
            </p>
          )}
          <button className="admin-button" disabled={saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </aside>
      </form>
    </div>
  );
}
