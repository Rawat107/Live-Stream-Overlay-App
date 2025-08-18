from bson.objectid import ObjectId

class OverlayModel:
    def __init__(self, db):
        self.col = db["overlays"]

    def create(self, data):
        res = self.col.insert_one(data)
        return str(res.inserted_id)
    
    def get(self, oid):
        doc = self.col.find_one({"_id": ObjectId(oid)})
        if not doc:
            return None

        doc["id"] = str(doc["_id"])
        del doc["_id"]
        return doc

    def list(self):
        docs = []
        for d in self.col.find().sort("_id", -1):
            d["id"] = str(d["_id"])
            del d["_id"]
            docs.append(d)
        
        return docs
    
    def update(self, oid, data):
        self.old.update_one({"_id": ObjectId(oid)})
        return self.get(oid)

    def delete(self, oid):
        res = self.col.delete_one({"_id": ObjectId(oid)})
        return res.deleted_count