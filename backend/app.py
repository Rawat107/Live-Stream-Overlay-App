from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from config import Config
from extensions import init_extensions
from routes import register_blueprints
from services.rtsp_service import start_ffmpeg_worker
import os
import base64
import uuid

def create_app():
    app = Flask(__name__, static_folder="static")
    app.config.from_object(Config)
    
    # Initialize CORS for all origins
    CORS(app, origins="*")
    
    init_extensions(app)
    register_blueprints(app)
    
    @app.route("/health")
    def health():
        return jsonify({"status": "ok"}), 200
    
    @app.route("/hls/<path:filename>")
    def hls_files(filename):
        hls_dir = os.path.join(app.root_path, app.config["HLS_DIR"])
        response = send_from_directory(hls_dir, filename)
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    
    @app.route("/api/upload-image", methods=["POST"])
    def upload_image():
        try:
            data = request.get_json()
            image_data = data.get('image')
            
            if not image_data:
                return jsonify({"error": "No image data"}), 400
            
            # Remove data:image/...;base64, prefix
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            
            # Save to static/uploads
            uploads_dir = os.path.join(app.root_path, "static", "uploads")
            os.makedirs(uploads_dir, exist_ok=True)
            
            filename = f"{uuid.uuid4()}.png"
            filepath = os.path.join(uploads_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            
            return jsonify({"url": f"/static/uploads/{filename}"}), 200
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route("/static/<path:filename>")
    def serve_static(filename):
        return send_from_directory(app.static_folder, filename)
    
    # Start RTSP conversion
    start_ffmpeg_worker(app.config["RTSP_URL"], app.config["HLS_DIR"])
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host=app.config["HOST"], port=app.config["PORT"], debug=app.config["DEBUG"])
