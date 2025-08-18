from flask import request, jsonify, Blueprint
from ..models.overlay_model   import OverlayModel
from ..services.overlay_service import OverlayService
from ..extensions             import db

bp = Blueprint("overlays", __name__, url_prefix="/api/overlays")

model   = OverlayModel(db)
service = OverlayService(model)


@bp.get("")
def list_overlays():
    return jsonify(service.list_overlays()), 200


@bp.post("")
def create_overlay():
    return jsonify(service.create_overlay(request.get_json() or {})), 201


@bp.get("/<oid>")
def get_overlay(oid):
    doc = service.get_overlay(oid)
    return (jsonify(doc), 200) if doc else (jsonify({"msg": "Not found"}), 404)


@bp.put("/<oid>")
def update_overlay(oid):
    doc = service.update_overlay(oid, request.get_json() or {})
    return (jsonify(doc), 200) if doc else (jsonify({"msg": "Not found"}), 404)


@bp.delete("/<oid>")
def delete_overlay(oid):
    deleted = service.delete_overlay(oid)
    return (jsonify({"deleted": True}), 200) if deleted else (jsonify({"msg": "Not found"}), 404)
