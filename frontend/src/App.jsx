import { useEffect, useState, useRef } from "react";
import { AiOutlineStar, AiOutlineVideoCamera, AiOutlineWarning } from "react-icons/ai";
import { FaBullseye, FaMobileAlt, FaMousePointer } from "react-icons/fa";
import { BsCircleFill } from "react-icons/bs";
import { BiSolidJoystick } from "react-icons/bi";
import { listOverlays, createOverlay, updateOverlay, deleteOverlay } from "./utils/api";
import VideoPlayer from "./components/VideoPlayer";
import OverlayEditor from "./components/OverlayEditor";
import OverlayList from "./components/OverlayList";

function App() {
  const [overlays, setOverlays] = useState([]);
  const [selectedOverlay, setSelectedOverlay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoSize, setVideoSize] = useState({ width: 800, height: 450 });

  // Keep a ref to suppress selection flicker during live updates
  const liveUpdatingRef = useRef(false);

  const fetchOverlays = async () => {
    try {
      setIsLoading(true);
      const data = await listOverlays();
      setOverlays(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch overlays:", err);
      setError("Failed to load overlays. Please refresh the page.");
      setOverlays([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverlays();
  }, []);

  const handleAdd = async (data) => {
    try {
      await createOverlay(data);
      fetchOverlays();
    } catch (err) {
      console.error("Failed to create overlay:", err);
      alert("Failed to create overlay. Please try again.");
    }
  };

  // Server update (used by forms/controls)
  const handleUpdate = async (id, update) => {
    try {
      await updateOverlay(id, update);
      setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...update } : o)));
      if (selectedOverlay?.id === id) setSelectedOverlay((p) => ({ ...p, ...update }));
    } catch (err) {
      console.error("Failed to update overlay:", err);
      fetchOverlays();
    }
  };

  // Local-only live updates (smooth drag/resize/rotate)
  const handleUpdateLive = (id, patch) => {
    liveUpdatingRef.current = true;
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    if (selectedOverlay?.id === id) setSelectedOverlay((p) => ({ ...p, ...patch }));
  };

  // Commit final state to server after interaction ends
  const handleCommit = async (id, finalOverlay) => {
    try {
      await updateOverlay(id, {
        x: finalOverlay.x,
        y: finalOverlay.y,
        width: finalOverlay.width,
        height: finalOverlay.height,
        rotation: finalOverlay.rotation || 0,
      });
    } catch (err) {
      console.error("Commit failed:", err);
      // Optional: refetch to reconcile
      fetchOverlays();
    } finally {
      liveUpdatingRef.current = false;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOverlay(id);
      setOverlays((prev) => prev.filter((o) => o.id !== id));
      if (selectedOverlay?.id === id) setSelectedOverlay(null);
    } catch (err) {
      console.error("Failed to delete overlay:", err);
      alert("Failed to delete overlay. Please try again.");
      fetchOverlays();
    }
  };

  const handleOverlaySelect = (overlay) => {
    // If we’re mid drag we still allow selection, but this keeps UX crisp
    setSelectedOverlay(overlay);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              <AiOutlineVideoCamera className="inline mr-2" />
                Enhanced Video Overlay System 
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
               Drag •  Resize •  Rotate •  Delete •  Responsive Design
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            <p className="font-medium"> <AiOutlineWarning className="inline mr-2" /> Error</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchOverlays}
              className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Video Player */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Video Player</h2>
            <div className="text-sm text-gray-400">
              <BsCircleFill className="inline mr-2 text-green-500"/> Live Stream • {overlays.length} overlays active
            </div>
          </div>

          {isLoading ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="animate-pulse text-gray-400">
                Loading video and overlays...
              </div>
            </div>
          ) : (
            <VideoPlayer
              overlays={overlays}
              selectedOverlay={selectedOverlay}
              onOverlaySelect={handleOverlaySelect}
              onOverlayUpdateLive={handleUpdateLive}  // smooth updates
              onOverlayCommit={handleCommit}          // final server sync
              onOverlayDelete={handleDelete}
              onSizeChange={setVideoSize}              // real size for Quick Position
            />
          )}
        </section>

        {/* Controls */}
        <section className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Add New Overlay</h2>
            <OverlayEditor onAdd={handleAdd} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Manage Overlays</h2>
            <OverlayList
              overlays={overlays}
              selectedOverlay={selectedOverlay}
              onSelect={handleOverlaySelect}
              onUpdate={handleUpdate}  
              onDelete={handleDelete}
              videoSize={videoSize}     
            />
          </div>
        </section>

        {/* Instructions (unchanged visuals) */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4"><BiSolidJoystick className="inline mr-2"/> How to Use</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-300">
            <div className="space-y-2">
              <div className="font-medium text-blue-400"><FaMousePointer className="inline mr-2" /> Desktop Controls</div>
              <ul className="space-y-1">
                <li>• Click overlay to select</li>
                <li>• Drag to move position</li>
                <li>• Use handles to resize/rotate</li>
                <li>• Drag outside to delete</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-green-400"><FaMobileAlt className="inline mr-2" /> Mobile Controls</div>
              <ul className="space-y-1">
                <li>• Tap overlay to select</li>
                <li>• Touch & drag to move</li>
                <li>• Use control handles</li>
                <li>• Tap X button to delete</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-purple-400"><AiOutlineStar className="inline mr-2" /> Features</div>
              <ul className="space-y-1">
                <li>• Text & image overlays</li>
                <li>• Color customization</li>
                <li>• Font size adjustment</li>
                <li>• Boundary constraints</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-orange-400"><FaBullseye className="inline mr-2"/> Tips</div>
              <ul className="space-y-1">
                <li>• Overlays stay in video bounds</li>
                <li>• Selected overlay shows handles</li>
                <li>• Works on all screen sizes</li>
                <li>• Real-time positioning</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-16 bg-black/30 border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <p>Enhanced Video Overlay System with HLS Streaming Support</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
