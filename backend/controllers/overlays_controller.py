from flask import request, jsonify, Blueprint
from ..models.overlay_model import OverlayModel
from ..services.overlay_service import OverlayService
from ..extensions import db

bp =  Blueprint("overlays", __name__, url_prefix="/api/overlays")

#instantiate model/service using global db
model = OverlayModel(db)
service = OverlayService(model)

@bp.route("", methods=["GET"])
def list_overlays():
    data = service.list_overlays()
    return jsonify(data), 200


@bp.route("", methods=["POST"])
def create_overlay():
    payload = request.get_json() or {}
    res = service.create_overlay(payload)
    return jsonify(res), 201

@bp.route("/<oid>", methods=["GET"])
def get_overlay(oid):
    doc = service.get_overlay(oid)
    if not doc:
        return jsonify({"message": "Not Found"}), 404
    
    return jsonify(doc), 200


@bp.route("/<oid>", methods=["PUT"])
def update_overlay(oid):
    payload = request.get_json() or {}
    doc = service.update_overlay(oid, payload)
    if not doc:
        return jsonify({"message":"Not found"}), 404
    return jsonify(doc), 200

@bp.route("/<oid>", methods=["DELETE"])
def delete_overlay(oid):
    deleted = service.delete_overlay(oid)
    if deleted == 0:
        return jsonify({"message":"Not found"}), 404
    return jsonify({"deleted": True}), 200