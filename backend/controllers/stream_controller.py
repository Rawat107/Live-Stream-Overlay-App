from flask import Blueprint, jsonify
from datetime import datetime

stream_bp = Blueprint("stream_bp", __name__)

@stream_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

@stream_bp.route("/api/stream-config", methods=["GET"])
def get_stream_config():
    # Updated with working HLS URLs
    return jsonify({
        "hls_url": "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
        "backup_urls": [
            "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
            "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8"
        ],
        "type": "application/x-mpegURL",
        "description": "Tears of Steel - Blender Open Movie (HLS)"
    })