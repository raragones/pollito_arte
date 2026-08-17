import type {
  ApiError,
  AboutMe,
  AboutMeInput,
  Collection,
  CollectionInput,
  Drawing,
  DrawingInput,
} from "@natyarte/shared";
const base = import.meta.env.VITE_API_URL ?? "http://localhost:8787";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(
      body?.error.message ?? "No pudimos completar la solicitud.",
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
const absoluteImage = (item: Drawing): Drawing => ({
  ...item,
  imageUrl: item.imageUrl.startsWith("http")
    ? item.imageUrl
    : `${base}${item.imageUrl}`,
});
const absoluteAboutImage = (item: AboutMe): AboutMe => ({
  ...item,
  imageUrl:
    item.imageUrl && !item.imageUrl.startsWith("http")
      ? `${base}${item.imageUrl}?v=${encodeURIComponent(item.updatedAt)}`
      : item.imageUrl,
});
const one = (path: string) => request<Drawing>(path).then(absoluteImage);
const many = (path: string) =>
  request<Drawing[]>(path).then((items) => items.map(absoluteImage));
function drawingBody(input: DrawingInput, image?: File) {
  const form = new FormData();
  form.append("metadata", JSON.stringify(input));
  if (image) form.append("image", image);
  return form;
}
export const api = {
  drawings: (collection?: string) =>
    many(
      `/api/drawings${collection ? `?collection=${encodeURIComponent(collection)}` : ""}`,
    ),
  drawing: (slug: string) => one(`/api/drawings/${slug}`),
  featured: () => one("/api/drawings/featured"),
  likeDrawing: (id: string) =>
    request<{ likesCount: number }>(`/api/drawings/${id}/like`, {
      method: "POST",
    }),
  recommendations: (id: string) => many(`/api/drawings/${id}/recommendations`),
  aboutMe: () => request<AboutMe>("/api/about-me").then(absoluteAboutImage),
  collections: () => request<Collection[]>("/api/collections"),
  me: () => request<{ authenticated: boolean }>("/api/auth/me"),
  login: (credential: string) =>
    request<{ email: string }>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  adminDrawings: () => many("/api/admin/drawings"),
  adminAboutMe: () =>
    request<AboutMe>("/api/admin/about-me").then(absoluteAboutImage),
  saveAboutMe: (input: AboutMeInput) =>
    request<AboutMe>("/api/admin/about-me", {
      method: "PUT",
      body: JSON.stringify(input),
    }).then(absoluteAboutImage),
  saveAboutMeImage: (image: File) => {
    const body = new FormData();
    body.append("image", image);
    return request<void>("/api/admin/about-me/image", { method: "PUT", body });
  },
  deleteAboutMeImage: () =>
    request<void>("/api/admin/about-me/image", { method: "DELETE" }),
  saveDrawing: (input: DrawingInput, image: File | undefined, id?: string) =>
    request<{ id: string; imageUrl: string }>(
      `/api/admin/drawings${id ? `/${id}` : ""}`,
      { method: id ? "PUT" : "POST", body: drawingBody(input, image) },
    ),
  deleteDrawing: (id: string) =>
    request<void>(`/api/admin/drawings/${id}`, { method: "DELETE" }),
  adminCollections: () => request<Collection[]>("/api/admin/collections"),
  saveCollection: (input: CollectionInput, id?: string) =>
    request<Collection>(`/api/admin/collections${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(input),
    }),
  deleteCollection: (id: string) =>
    request<void>(`/api/admin/collections/${id}`, { method: "DELETE" }),
};
