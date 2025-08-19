from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from config import Config

# Import blueprints
from controllers.overlays_controller import init_overlay_routes
from controllers.upload_controller import upload_bp
from controllers.stream_controller import stream_bp

app = Flask(__name__)
app.config.from_object(Config)
Config.init_app(app)
CORS(app, origins="*")

# MongoDB
mongo_client = MongoClient(app.config["MONGO_URI"])
db = mongo_client[app.config["DB_NAME"]]

# Register blueprints
app.register_blueprint(init_overlay_routes(db))
app.register_blueprint(upload_bp)
app.register_blueprint(stream_bp)

if __name__ == "__main__":
    print(" Starting RTSP Overlay API Server...")
    print(" Video Stream: https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8")
    print(" API Health: http://localhost:5000/health")
    app.run(host="0.0.0.0", port=5000, debug=True)
