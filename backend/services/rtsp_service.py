"""
Continuously converts an RTSP feed to HLS (index.m3u8 + .ts segments)
so the browser can play it with HLS.js.
"""
import subprocess, threading, time, os, signal

FFMPEG_BIN = "ffmpeg"      # Make sure ffmpeg is on PATH

def _build_cmd(rtsp_url: str, out_dir: str) -> list[str]:
    os.makedirs(out_dir, exist_ok=True)
    return [
        FFMPEG_BIN,
        "-rtsp_transport", "tcp",
        "-i", rtsp_url,
        "-c:v", "copy",           # ultra-low-CPU; use -c:v libx264 for re-encode
        "-c:a", "aac",
        "-hls_time", "2",
        "-hls_list_size", "6",
        "-hls_flags", "delete_segments",
        "-f", "hls",
        os.path.join(out_dir, "index.m3u8"),
    ]

def start_ffmpeg_worker(rtsp_url: str, out_dir: str) -> None:
    def _worker():
        while True:
            cmd = _build_cmd(rtsp_url, out_dir)
            proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
            proc.wait()            # restarts if the stream drops
            time.sleep(1)
    threading.Thread(target=_worker, daemon=True).start()
