import subprocess
import threading
import time
import os

FFMPEG_BIN = "ffmpeg"

def _build_cmd(rtsp_url: str, out_dir: str) -> list:
    os.makedirs(out_dir, exist_ok=True)
    return [
        FFMPEG_BIN,
        "-fflags", "nobuffer",
        "-rtsp_transport", "tcp", 
        "-i", rtsp_url,
        "-c:v", "libx264",
        "-preset", "ultrafast", 
        "-tune", "zerolatency",
        "-c:a", "aac",
        "-ac", "2",
        "-b:a", "128k",
        "-hls_time", "1",
        "-hls_list_size", "3",
        "-hls_flags", "delete_segments+independent_segments",
        "-hls_segment_type", "mpegts",
        "-f", "hls",
        os.path.join(out_dir, "index.m3u8"),
    ]

def start_ffmpeg_worker(rtsp_url: str, out_dir: str) -> None:
    def _worker():
        while True:
            try:
                cmd = _build_cmd(rtsp_url, out_dir)
                print(f"Starting FFmpeg with command: {' '.join(cmd)}")
                proc = subprocess.Popen(
                    cmd, 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE,
                    universal_newlines=True
                )
                
                # Monitor the process
                while proc.poll() is None:
                    time.sleep(1)
                
                stdout, stderr = proc.communicate()
                print(f"FFmpeg exited with code {proc.returncode}")
                if stderr:
                    print(f"FFmpeg stderr: {stderr}")
                    
                time.sleep(2)
            except Exception as e:
                print(f"FFmpeg error: {e}")
                time.sleep(5)
    
    thread = threading.Thread(target=_worker, daemon=True)
    thread.start()
    print(f"RTSP→HLS worker started for {rtsp_url} -> {out_dir}")
