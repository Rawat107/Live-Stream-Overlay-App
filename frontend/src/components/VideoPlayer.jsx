import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import ErrorBoundary from "./ErrorBoundary";

// Updated working video URLs
const VIDEO_URLS = [
  "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
  "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
  "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
];

// Helper for safe coords
const safeNum = (val, fallback = 0) =>
  Number.isFinite(Number(val)) ? Number(val) : fallback;

export default function VideoPlayer({
  overlays = [],
  onOverlayUpdateLive,
  onOverlayCommit,
  onOverlayDelete,
  onOverlaySelect,
  selectedOverlay,
  onSizeChange,
}) {
  const videoRef = useRef();
  const overlayContainerRef = useRef();
  const [size, setSize] = useState({ width: 800, height: 400 });
  const [draggingId, setDraggingId] = useState(null);
  const [resizingId, setResizingId] = useState(null);
  const [rotatingId, setRotatingId] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialState, setInitialState] = useState(null);

  const animationFrameRef = useRef();

  useEffect(() => {
    const video = videoRef.current;
    let hls;

    const measure = () => {
      if (!video) return;
      const rect = video.getBoundingClientRect();
      const next = { width: Math.round(rect.width), height: Math.round(rect.height) };
      setSize(next);
      onSizeChange?.(next);
    };

    const loadVideo = (urlIndex = 0) => {
      if (urlIndex >= VIDEO_URLS.length) {
        console.error("All video URLs failed to load");
        return;
      }
      if (!video) return;

      if (Hls.isSupported()) {
        if (hls) hls.destroy();
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(VIDEO_URLS[urlIndex]);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error("HLS fatal error, trying next URL:", data);
            loadVideo(urlIndex + 1);
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // ensure controls render and are clickable
          video.controls = true;
          measure();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = VIDEO_URLS[urlIndex];
        video.addEventListener("loadedmetadata", measure, { once: true });
        video.addEventListener("error", () => {
          console.error("Video error, trying next URL");
          loadVideo(urlIndex + 1);
        });
      }
    };

    loadVideo();
    measure();
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
      if (hls) hls.destroy();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [onSizeChange]);

  // Get position from mouse or touch event
  const getPointerPos = useCallback((e) => {
    const rect = overlayContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const constrainToVideo = useCallback(
    (x, y, width, height) => ({
      x: Math.max(0, Math.min(x, size.width - width)),
      y: Math.max(0, Math.min(y, size.height - height)),
      width: Math.max(50, Math.min(width, size.width - x)),
      height: Math.max(30, Math.min(height, size.height - y)),
    }),
    [size]
  );

  // Unified pointer down handler for both mouse and touch
  const handlePointerDown = (e, overlay, action) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getPointerPos(e);
    setDragStart(pos);
    setInitialState({
      x: overlay.x,
      y: overlay.y,
      width: overlay.width,
      height: overlay.height,
      rotation: overlay.rotation || 0,
    });
    onOverlaySelect?.(overlay);
    if (action === "drag") setDraggingId(overlay.id);
    else if (action === "resize") setResizingId(overlay.id);
    else if (action === "rotate") setRotatingId(overlay.id);
  };

  // PERF: local-only updates during interaction (no API)
  const handlePointerMove = useCallback(
    (e) => {
      if (!draggingId && !resizingId && !rotatingId) return;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

      animationFrameRef.current = requestAnimationFrame(() => {
        const pos = getPointerPos(e);
        const deltaX = pos.x - dragStart.x;
        const deltaY = pos.y - dragStart.y;

        const overlay = overlays.find(
          (ov) => ov.id === draggingId || ov.id === resizingId || ov.id === rotatingId
        );
        if (!overlay || !initialState) return;

        if (draggingId) {
          const newX = initialState.x + deltaX;
          const newY = initialState.y + deltaY;
          const constrained = constrainToVideo(newX, newY, overlay.width, overlay.height);
          onOverlayUpdateLive?.(overlay.id, { x: constrained.x, y: constrained.y });
        } else if (resizingId) {
          const newWidth = Math.max(50, initialState.width + deltaX);
          const newHeight = Math.max(30, initialState.height + deltaY);
          const constrained = constrainToVideo(overlay.x, overlay.y, newWidth, newHeight);
          onOverlayUpdateLive?.(overlay.id, {
            width: constrained.width,
            height: constrained.height,
          });
        } else if (rotatingId) {
          const centerX = overlay.x + overlay.width / 2;
          const centerY = overlay.y + overlay.height / 2;
          const angle = Math.atan2(pos.y - centerY, pos.x - centerX);
          const rotation = Math.round((angle * 180) / Math.PI);
          onOverlayUpdateLive?.(overlay.id, { rotation });
        }
      });
    },
    [
      draggingId,
      resizingId,
      rotatingId,
      dragStart,
      initialState,
      overlays,
      getPointerPos,
      constrainToVideo,
      onOverlayUpdateLive,
    ]
  );

  const handlePointerUp = useCallback(
    (e) => {
      if (draggingId) {
        // Delete if dropped outside
        const pos = getPointerPos(e);
        if (pos.x < 0 || pos.x > size.width || pos.y < 0 || pos.y > size.height) {
          onOverlayDelete(draggingId);
        } else {
          // Commit to server after drag finishes
          const final = overlays.find((o) => o.id === draggingId);
          if (final) onOverlayCommit?.(final.id, final);
        }
      }
      if (resizingId) {
        const final = overlays.find((o) => o.id === resizingId);
        if (final) onOverlayCommit?.(final.id, final);
      }
      if (rotatingId) {
        const final = overlays.find((o) => o.id === rotatingId);
        if (final) onOverlayCommit?.(final.id, final);
      }

      setDraggingId(null);
      setResizingId(null);
      setRotatingId(null);
      setInitialState(null);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    },
    [draggingId, resizingId, rotatingId, overlays, getPointerPos, size, onOverlayDelete, onOverlayCommit]
  );

  // Deselect when clicking outside overlays (i.e., on the video area)
  const handleOuterClick = useCallback(
    (e) => {
      // If click is on an overlay (has data-overlay), keep selection
      const target = e.target;
      if (target?.dataset?.overlay === "true") return;
      onOverlaySelect?.(null);
    },
    [onOverlaySelect]
  );

  // Add event listeners for both mouse and touch
  useEffect(() => {
    if (draggingId || resizingId || rotatingId) {
      // Mouse events
      document.addEventListener("mousemove", handlePointerMove);
      document.addEventListener("mouseup", handlePointerUp);
      
      // Touch events
      document.addEventListener("touchmove", handlePointerMove, { passive: false });
      document.addEventListener("touchend", handlePointerUp);
      
      return () => {
        document.removeEventListener("mousemove", handlePointerMove);
        document.removeEventListener("mouseup", handlePointerUp);
        document.removeEventListener("touchmove", handlePointerMove);
        document.removeEventListener("touchend", handlePointerUp);
      };
    }
  }, [draggingId, resizingId, rotatingId, handlePointerMove, handlePointerUp]);

  return (
    <div
      className="relative mx-auto rounded bg-black shadow-2xl"
      style={{ maxWidth: "90vw" }}
      onClick={handleOuterClick}
    >
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full rounded-t"
          style={{
            maxHeight: "70vh",
            minHeight: 280,
            background: "#222",
            aspectRatio: "16/9",
          }}
          controls
          autoPlay
          muted
          playsInline
        >
          Your browser does not support HLS video playback.
        </video>

        {/* Overlay Container: pointer-events-none so video controls remain clickable */}
        <ErrorBoundary>
          <div
            ref={overlayContainerRef}
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
          >
            {overlays.map((overlay) => (
              <div
                key={overlay.id}
                data-overlay="true"
                className={`absolute select-none cursor-move transition-all duration-200 pointer-events-auto ${
                  selectedOverlay?.id === overlay.id
                    ? "ring-2 ring-blue-500 shadow-lg"
                    : "hover:ring-1 hover:ring-white/50"
                }`}
                style={{
                  left: safeNum(overlay.x),
                  top: safeNum(overlay.y),
                  width: safeNum(overlay.width, 200),
                  height: safeNum(overlay.height, 50),
                  transform: `rotate(${overlay.rotation || 0}deg)`,
                  zIndex: selectedOverlay?.id === overlay.id ? 30 : 20,
                  background:
                    overlay.type === "image" ? "transparent" : "rgba(0,0,0,0.1)",
                  borderRadius: "4px",
                  touchAction: "none", // Prevent default touch behaviors
                }}
                // Mouse events
                onMouseDown={(e) => handlePointerDown(e, overlay, "drag")}
                // Touch events
                onTouchStart={(e) => handlePointerDown(e, overlay, "drag")}
                onClick={(e) => {
                  e.stopPropagation();
                  onOverlaySelect?.(overlay);
                }}
              >
                {/* Content */}
                {overlay.type === "text" ? (
                  <div
                    className="flex items-center justify-center w-full h-full font-bold pointer-events-none"
                    style={{
                      color: overlay.color || "#ffffff",
                      fontSize: `${overlay.fontSize || 24}px`,
                      wordBreak: "break-word",
                      textAlign: "center",
                      lineHeight: "1.2",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                    }}
                  >
                    {overlay.content || "Text"}
                  </div>
                ) : (
                  <img
                    src={
                      overlay.imageUrl?.startsWith('http')
                        ? overlay.imageUrl
                        : `http://localhost:5000${overlay.imageUrl}`
                    }
                    alt="overlay"
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                )}

                {/* Controls (only when selected) */}
                {selectedOverlay?.id === overlay.id && (
                  <>
                    <button
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white text-lg font-bold hover:bg-red-600 transition-colors shadow-md flex items-center justify-center pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOverlayDelete(overlay.id);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        onOverlayDelete(overlay.id);
                      }}
                      title="Delete overlay"
                    >
                      ×
                    </button>

                    <div
                      className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded cursor-se-resize hover:bg-blue-600 transition-colors shadow-md pointer-events-auto"
                      onMouseDown={(e) => handlePointerDown(e, overlay, "resize")}
                      onTouchStart={(e) => handlePointerDown(e, overlay, "resize")}
                      title="Resize overlay"
                    />

                    <div
                      className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full cursor-grab hover:bg-green-600 transition-colors shadow-md pointer-events-auto"
                      onMouseDown={(e) => handlePointerDown(e, overlay, "rotate")}
                      onTouchStart={(e) => handlePointerDown(e, overlay, "rotate")}
                      title="Rotate overlay"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </ErrorBoundary>

        {/* Delete Zone Indicator */}
        {draggingId && (
          <div className="absolute inset-x-0 -bottom-16 z-50">
            <div className="mx-auto bg-red-600 text-white text-sm rounded-lg px-4 py-2 w-48 text-center shadow-lg animate-pulse">
              🗑️ Drop outside to delete
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden bg-gray-800 text-gray-300 text-xs p-2 rounded-b text-center">
        Tap to select • Touch & drag to move • Use handles to resize/rotate
      </div>
    </div>
  );
}