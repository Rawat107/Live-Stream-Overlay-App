class OverlayService:
    def __init__(self, model: object):
        self.model = model

    def create_overlay(self, payload):
        data = {
            "name":   payload.get("name", "overlay"),
            "type":   payload.get("type", "text"),
            "content": payload.get("content", ""),
            "x":      int(payload.get("x", 0)),
            "y":      int(payload.get("y", 0)),
            "width":  int(payload.get("width", 200)),
            "height": int(payload.get("height", 50)),
            "z":      int(payload.get("z", 1)),
            "meta":   payload.get("meta", {}),
        }
        oid = self.model.create(data)
        return {"id": oid}

    def get_overlay(self, oid):
        return self.model.get(oid)

    def list_overlays(self):
        return self.model.list()

    def update_overlay(self, oid, payload):
        # only allow known keys (and fix key spelling to 'content')
        allowed = {"name", "type", "content", "x", "y", "width", "height", "z", "meta"}
        up = {k: payload[k] for k in allowed if k in payload}
        return self.model.update(oid, up)

    def delete_overlay(self, oid):
        return self.model.delete(oid)
