import os

class Config:
    MONGO_URI = "mongodb://localhost:27017/"
    DB_NAME = "rtsp_overlays"
    UPLOAD_FOLDER = "static/uploads"
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

    @staticmethod
    def init_app(app):
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
