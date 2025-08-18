from pymongo import MongoClient
from flask_cors import CORS

mongo_client = None
db = None

def init_extensions(app):
    global mongo_client, db
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    cfg = app.config
    mongo_client = MongoClient(cfg["MONGO_URI"])
    db = mongo_client[cfg["DB_NAME"]]
