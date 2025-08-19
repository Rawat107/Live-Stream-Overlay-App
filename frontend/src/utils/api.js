const BASE = "http://localhost:5000/api/overlays";

export const listOverlays = () => fetch(BASE).then(r => r.json());

export const createOverlay = d => fetch(BASE, {
  method:"POST", body:JSON.stringify(d),
  headers:{'Content-Type':'application/json'}
}).then(r=>r.json());

export const updateOverlay = (id,d) => fetch(`${BASE}/${id}`, {
  method:"PUT", body:JSON.stringify(d),
  headers:{'Content-Type':'application/json'}
}).then(r=>r.json());

export const deleteOverlay = id => fetch(`${BASE}/${id}`, {method:"DELETE"});

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const r = await fetch("http://localhost:5000/api/upload-image", {method:"POST", body:formData});
  if (!r.ok) throw new Error((await r.json()).error || "Upload failed");
  return r.json();
};
