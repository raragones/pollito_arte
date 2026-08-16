import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { DrawingInput } from "@natyarte/shared";
import { api } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const blank: DrawingInput = {
  title: "",
  slug: "",
  description: "",
  collectionId: null,
  status: "draft",
  materials: "",
  story: "",
  favoritePart: "",
  favorite: false,
  featured: false,
  published: false,
  drawingDate: null,
};
const slugify = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
export function DrawingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const drawings = useAsync(api.adminDrawings, []);
  const collections = useAsync(api.adminCollections, []);
  const existing = drawings.data?.find((d) => d.id === id);
  const [form, setForm] = useState<DrawingInput>();
  const [image, setImage] = useState<File>();
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const value =
    form ??
    (existing
      ? {
          title: existing.title,
          slug: existing.slug,
          description: existing.description ?? "",
          collectionId: existing.collectionId ?? null,
          status: existing.status,
          materials: existing.materials ?? "",
          story: existing.story ?? "",
          favoritePart: existing.favoritePart ?? "",
          favorite: existing.favorite,
          featured: existing.featured,
          published: existing.published,
          drawingDate: existing.drawingDate ?? null,
        }
      : blank);
  const set = <K extends keyof DrawingInput>(key: K, val: DrawingInput[K]) =>
    setForm({ ...value, [key]: val });
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  function chooseImage(file?: File) {
    setError("");
    if (!file) return;
    if (!acceptedTypes.has(file.type)) {
      setError("Solo se permiten imágenes JPEG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("La imagen debe pesar como máximo 5 MB.");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!id && !image) {
      setError("Debes seleccionar una imagen.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.saveDrawing(value, image, id);
      navigate("/admin/dibujos");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }
  async function remove() {
    if (
      id &&
      confirm("¿Eliminar este dibujo? Esta acción no se puede deshacer.")
    ) {
      await api.deleteDrawing(id);
      navigate("/admin/dibujos");
    }
  }
  return (
    <div className="admin-page">
      <div className="admin-title">
        <div>
          <h1>{id ? "Editar dibujo" : "Nuevo dibujo"}</h1>
          <p>JPEG, PNG o WebP · máximo 5 MB.</p>
        </div>
      </div>
      <form className="admin-form" onSubmit={submit}>
        <div className="form-main">
          <label>
            Título *
            <input
              required
              value={value.title}
              onChange={(e) =>
                setForm({
                  ...value,
                  title: e.target.value,
                  ...(!id ? { slug: slugify(e.target.value) } : {}),
                })
              }
            />
          </label>
          <label>
            Slug *
            <input
              required
              value={value.slug}
              onChange={(e) => set("slug", e.target.value)}
            />
          </label>
          <label className="full">
            Descripción
            <textarea
              value={value.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>
          <label>
            Imagen {id ? "" : "*"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => chooseImage(e.target.files?.[0])}
            />
            {(preview || existing?.imageUrl) && (
              <img
                className="upload-preview"
                src={preview || existing?.imageUrl}
                alt={
                  preview
                    ? "Vista previa de la imagen nueva"
                    : `Imagen actual de ${existing?.title ?? "dibujo"}`
                }
              />
            )}{" "}
            {id && (
              <small>Déjala sin cambios para conservar la imagen actual.</small>
            )}
          </label>
          <label>
            Colección
            <select
              value={value.collectionId ?? ""}
              onChange={(e) => set("collectionId", e.target.value || null)}
            >
              <option value="">Sin colección</option>
              {collections.data?.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Estado
            <select
              value={value.status}
              onChange={(e) =>
                set("status", e.target.value as DrawingInput["status"])
              }
            >
              <option value="draft">Boceto</option>
              <option value="in_progress">En progreso</option>
              <option value="finished">Terminado</option>
            </select>
          </label>
          <label>
            Fecha
            <input
              type="date"
              value={value.drawingDate ?? ""}
              onChange={(e) => set("drawingDate", e.target.value || null)}
            />
          </label>
          <label className="full">
            Materiales
            <input
              value={value.materials ?? ""}
              onChange={(e) => set("materials", e.target.value)}
            />
          </label>
          <label className="full">
            Lo que más me gustó
            <textarea
              value={value.favoritePart ?? ""}
              onChange={(e) => set("favoritePart", e.target.value)}
            />
          </label>
          <label className="full">
            Historia del dibujo
            <textarea
              rows={5}
              value={value.story ?? ""}
              onChange={(e) => set("story", e.target.value)}
            />
          </label>
        </div>
        <aside className="form-side">
          <h3>Publicación</h3>
          {(["favorite", "featured", "published"] as const).map((k) => (
            <label className="check" key={k}>
              <input
                type="checkbox"
                checked={value[k]}
                onChange={(e) => set(k, e.target.checked)}
              />
              {k === "favorite"
                ? "Favorito"
                : k === "featured"
                  ? "Destacado"
                  : "Publicado"}
            </label>
          ))}
          {error && <p className="form-error">{error}</p>}
          <button className="admin-button" disabled={saving || (!id && !image)}>
            {saving ? "Guardando…" : "Guardar dibujo"}
          </button>
          {id && (
            <button type="button" className="danger" onClick={remove}>
              Eliminar dibujo
            </button>
          )}
        </aside>
      </form>
    </div>
  );
}
