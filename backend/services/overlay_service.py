class OverlayService:
    def __init__(self, model):
        self.model = model

    # ---------- CRUD ----------
    def create_overlay(self, payload):
        data = {
            "name":    payload.get("name", "overlay"),
            "type":    payload.get("type", "text"),
            "content": payload.get("content", ""),
            "x":       int(payload.get("x", 0)),
            "y":       int(payload.get("y", 0)),
            "width":   int(payload.get("width", 200)),
            "height":  int(payload.get("height", 50)),
            "z":       int(payload.get("z", 1)),
            "meta":    payload.get("meta", {}),
        }
        return {"id": self.model.create(data)}

    def get_overlay(self, oid):
        return self.model.get(oid)
    
    def list_overlays(self):
        return self.model.list()

    def update_overlay(self, oid, payload):
        allowed = {"name","type","content","x","y","width","height","z","meta"}
        return self.model.update(oid, {k: v for k, v in payload.items() if k in allowed})

    def delete_overlay(self, oid):
        return self.model.delete(oid)
