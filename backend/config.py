import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    # Mongo
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME   = os.getenv("DB_NAME",   "rtsp_overlays")

    # Streaming
    RTSP_URL  = os.getenv("RTSP_URL",  "rtsp://rtspstream:UfAy432VJtvZAAPi6iDEJ@zephyr.rtsp.stream/traffic")
    HLS_DIR   = os.getenv("HLS_DIR",   "static/hls")

    # Flask
    HOST      = os.getenv("HOST", '0.0.0.0')
    PORT      = int(os.getenv("PORT", 5000))
    DEBUG     = os.getenv("DEBUG", "1") == "1"
