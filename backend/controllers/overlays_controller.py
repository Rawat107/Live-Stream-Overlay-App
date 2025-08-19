from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
from models.overlay_model import serialize_overlay

overlay_bp = Blueprint("overlay_bp", __name__)
overlays_collection = None  # will be initialized from app.py

def init_overlay_routes(db):
    global overlays_collection
    overlays_collection = db["overlays"]
    return overlay_bp

@overlay_bp.route("/api/overlays", methods=["GET"])
def get_overlays():
    try:
        overlays = list(overlays_collection.find().sort("created_at", -1))
        return jsonify([serialize_overlay(o) for o in overlays])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@overlay_bp.route("/api/overlays", methods=["POST"])
def create_overlay():
    try:
        data = request.get_json()
        overlay = {
            "type": data.get("type", "text"),
            "content": data.get("content", ""),
            "x": int(data.get("x", 0)),
            "y": int(data.get("y", 0)),
            "width": int(data.get("width", 200)),
            "height": int(data.get("height", 50)),
            "fontSize": int(data.get("fontSize", 24)),
            "color": data.get("color", "#ffffff"),
            "rotation": int(data.get("rotation", 0)),
            "imageUrl": data.get("imageUrl", ""),
            "created_at": datetime.now(),
        }
        result = overlays_collection.insert_one(overlay)
        overlay["id"] = str(result.inserted_id)
        return jsonify(overlay), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@overlay_bp.route("/api/overlays/<overlay_id>", methods=["GET"])
def get_overlay(overlay_id):
    try:
        overlay = overlays_collection.find_one({"_id": ObjectId(overlay_id)})
        if not overlay:
            return jsonify({"error": "Overlay not found"}), 404
        return jsonify(serialize_overlay(overlay))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@overlay_bp.route("/api/overlays/<overlay_id>", methods=["PUT"])
def update_overlay(overlay_id):
    try:
        data = request.get_json()
        update_data = {}
        for key in ["type", "content", "x", "y", "width", "height", "fontSize", "color", "rotation", "imageUrl"]:
            if key in data:
                update_data[key] = int(data[key]) if key in ["x", "y", "width", "height", "fontSize", "rotation"] else data[key]

        update_data["updated_at"] = datetime.now()
        result = overlays_collection.update_one({"_id": ObjectId(overlay_id)}, {"$set": update_data})

        if result.matched_count == 0:
            return jsonify({"error": "Overlay not found"}), 404

        updated_overlay = overlays_collection.find_one({"_id": ObjectId(overlay_id)})
        return jsonify(serialize_overlay(updated_overlay))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@overlay_bp.route("/api/overlays/<overlay_id>", methods=["DELETE"])
def delete_overlay(overlay_id):
    try:
        result = overlays_collection.delete_one({"_id": ObjectId(overlay_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Overlay not found"}), 404
        return jsonify({"message": "Overlay deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
