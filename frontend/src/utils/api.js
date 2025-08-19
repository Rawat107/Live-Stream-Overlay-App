// api.js
const BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000"; // fallback for local dev

export const listOverlays = () => fetch(`${BASE}/api/overlays`).then(r => r.json());

export const createOverlay = d =>
  fetch(`${BASE}/api/overlays`, {
    method: "POST",
    body: JSON.stringify(d),
    headers: { "Content-Type": "application/json" }
  }).then(r => r.json());

export const updateOverlay = (id, d) =>
  fetch(`${BASE}/api/overlays/${id}`, {
    method: "PUT",
    body: JSON.stringify(d),
    headers: { "Content-Type": "application/json" }
  }).then(r => r.json());

export const deleteOverlay = id =>
  fetch(`${BASE}/api/overlays/${id}`, { method: "DELETE" });

export const uploadImage = async file => {
  const formData = new FormData();
  formData.append("file", file);
  const r = await fetch(`${BASE}/api/upload-image`, {
    method: "POST",
    body: formData
  });
  if (!r.ok) throw new Error((await r.json()).error || "Upload failed");
  return r.json();
};
