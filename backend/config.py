import os 
from dotenv import load_dotenv
load_dotenv()

class config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME = os.getenv("DB_NAME", "rtsp_overlays")
    HLS_DIR = os.getenv("HLS_DIR", "static/hls")
    HOST = os.getenv("HOST", '0.0.0.0')
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("DEBUG", "1") == "1"