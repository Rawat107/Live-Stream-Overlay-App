from bson.objectid import ObjectId

class OverlayModel:
    def __init__(self, db):
        self.col = db["overlays"]

    # CRUD helpers
    def create(self, data):                  # → inserted id
        return str(self.col.insert_one(data).inserted_id)

    def get(self, oid):
        doc = self.col.find_one({"_id": ObjectId(oid)})
        if not doc:
            return None
        doc["id"] = str(doc.pop("_id"))
        return doc

    def list(self):
        docs = []
        for d in self.col.find().sort("_id", -1):
            d["id"] = str(d.pop("_id"))
            docs.append(d)
        return docs

    def update(self, oid, data):
        self.col.update_one({"_id": ObjectId(oid)}, {"$set": data})
        return self.get(oid)

    def delete(self, oid):
        return self.col.delete_one({"_id": ObjectId(oid)}).deleted_count
