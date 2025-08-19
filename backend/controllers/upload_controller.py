from flask import Blueprint, request, jsonify, send_from_directory, current_app
from werkzeug.utils import secure_filename
import os, uuid
from utils.helpers import allowed_file

upload_bp = Blueprint("upload_bp", __name__)

@upload_bp.route("/api/upload-image", methods=["POST"])
def upload_image():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(file.filename, current_app.config["ALLOWED_EXTENSIONS"]):
            return jsonify({"error": "File type not allowed"}), 400

        filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
        filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        return jsonify({"url": f"/static/uploads/{filename}", "filename": filename}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@upload_bp.route("/static/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)
