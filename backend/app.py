from flask import Flask, send_from_directory, jsonify
from config import Config
from extensions import init_extensions, db
from routes import register_blueprints
from services.rtsp_service import start_ffmpeg_worker
import os

def create_app() -> Flask:
    app = Flask(__name__, static_folder="static")
    app.config.from_object(Config)

    # Initialise CORS & Mongo
    init_extensions(app)
    register_blueprints(app)

    # Health-check
    @app.route("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    # HLS segment delivery
    @app.route("/hls/<path:filename>")
    def hls_files(filename):
        hls_dir = os.path.join(app.root_path, app.config["HLS_DIR"])
        return send_from_directory(hls_dir, filename)

    # Kick off the RTSP→HLS worker
    start_ffmpeg_worker(app.config["RTSP_URL"], app.config["HLS_DIR"])

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host=app.config["HOST"],
            port=app.config["PORT"],
            debug=app.config["DEBUG"])
