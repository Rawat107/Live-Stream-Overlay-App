import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

function VideoPlayer({ url, overlays }) {
  const videoRef = useRef();
  const [videoSize, setVideoSize] = useState({ width: 800, height: 450 });

  useEffect(() => {
    if (!url || !videoRef.current) return;

    let hls = null;

    const initializeVideo = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          debug: false,
          enableWorker: false,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        });
        
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed, ready to play");
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            switch(data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log("Network error, trying to recover...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Media error, trying to recover...");
                hls.recoverMediaError();
                break;
              default:
                console.log("Fatal error, destroying HLS...");
                hls.destroy();
                break;
            }
          }
        });
        
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = url;
      }
    };

    // Add a small delay to ensure the video element is ready
    const timer = setTimeout(initializeVideo, 100);

    return () => {
      clearTimeout(timer);
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

  useEffect(() => {
    const updateVideoSize = () => {
      if (videoRef.current) {
        const rect = videoRef.current.getBoundingClientRect();
        setVideoSize({ width: rect.width, height: rect.height });
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', updateVideoSize);
      video.addEventListener('resize', updateVideoSize);
      window.addEventListener('resize', updateVideoSize);

      return () => {
        video.removeEventListener('loadedmetadata', updateVideoSize);
        video.removeEventListener('resize', updateVideoSize);
        window.removeEventListener('resize', updateVideoSize);
      };
    }
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden shadow-2xl">
      <video 
        ref={videoRef} 
        className="w-full h-auto"
        controls 
        muted
        playsInline
        autoPlay
        style={{ maxHeight: '500px' }}
      />
      
      {/* Overlays */}
      <div 
        className="absolute top-0 left-0 pointer-events-none"
        style={{ width: videoSize.width, height: videoSize.height }}
      >
        {overlays.map(overlay => (
          <div
            key={overlay.id}
            className="absolute"
            style={{
              left: `${overlay.x}px`,
              top: `${overlay.y}px`,
              transform: 'translate(0, 0)',
            }}
          >
            {overlay.type === 'text' ? (
              <div
                className="text-white font-bold drop-shadow-lg"
                style={{
                  fontSize: `${overlay.fontSize || 24}px`,
                  color: overlay.color || 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                {overlay.content}
              </div>
            ) : overlay.type === 'image' ? (
              <img
                src={`http://localhost:5000${overlay.imageUrl}`}
                alt="overlay"
                style={{
                  width: `${overlay.width || 100}px`,
                  height: `${overlay.height || 100}px`,
                  objectFit: 'contain',
                }}
                className="drop-shadow-lg"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoPlayer;
