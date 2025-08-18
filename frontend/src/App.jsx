import { useEffect, useState } from "react";
import { listOverlays } from "./utils/api.js";
import VideoPlayer from "./components/VideoPlayer";
import OverlayEditor from "./components/OverlayEditor";
import RtspInput from "./components/RtspInput";

const DEFAULT_STREAM = "http://localhost:5000/hls/index.m3u8";

function App() {
  const [overlays, setOverlays] = useState([]);
  const [streamUrl, setStreamUrl] = useState(DEFAULT_STREAM);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function fetchOverlays() {
      try {
        const data = await listOverlays();
        if (mounted) {
          setOverlays(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch overlays:", error);
        if (mounted) setLoading(false);
      }
    }
    
    fetchOverlays();
    return () => { mounted = false; };
  }, []);

  const refresh = async () => {
    try {
      const data = await listOverlays();
      setOverlays(data);
    } catch (error) {
      console.error("Failed to refresh overlays:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎥 RTSP Live Stream Overlay
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stream RTSP video feeds with custom text and image overlays. 
            Add logos, watermarks, and real-time information to your live streams.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Video Player */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <VideoPlayer url={streamUrl} overlays={overlays} />
          </div>

          {/* Controls Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <RtspInput onChange={setStreamUrl} />
            <OverlayEditor onCreate={refresh} />
          </div>

          {/* Overlay List */}
          {overlays.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Active Overlays ({overlays.length})
              </h3>
              <div className="grid gap-4">
                {overlays.map(overlay => (
                  <div key={overlay.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                          {overlay.type}
                        </span>
                        <p className="font-medium">
                          {overlay.type === 'text' ? overlay.content : 'Image Overlay'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Position: ({overlay.x}, {overlay.y})
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await fetch(`http://localhost:5000/api/overlays/${overlay.id}`, {
                              method: 'DELETE'
                            });
                            refresh();
                          } catch (error) {
                            console.error('Failed to delete overlay:', error);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
