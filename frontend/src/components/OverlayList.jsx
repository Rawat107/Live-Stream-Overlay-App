import { FaImage, FaRegFileAlt, FaRegPlayCircle, FaTrashAlt } from "react-icons/fa";
import { updateOverlay, deleteOverlay } from "../utils/api";
import { BiReset } from "react-icons/bi";

function OverlayList({
  overlays,
  selectedOverlay,
  onSelect,
  onUpdate,
  onDelete,
  videoSize = { width: 800, height: 450 }, // NEW: real size from parent
}) {
  const handleDelete = async (overlay) => {
    const confirmMessage = `Delete "${
      overlay.type === "text" ? overlay.content || "Empty text" : "Image overlay"
    }"?`;
    if (window.confirm(confirmMessage)) {
      try {
        await deleteOverlay(overlay.id);
        onDelete(overlay.id);
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete overlay: " + error.message);
      }
    }
  };

  const handleUpdate = async (overlay, field, value) => {
    try {
      await updateOverlay(overlay.id, { [field]: value });
      onUpdate(overlay.id, { [field]: value });
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update overlay: " + error.message);
    }
  };

  const handleQuickPosition = (overlay, position) => {
    const videoWidth = Math.max(0, Math.round(videoSize.width || 800));
    const videoHeight = Math.max(0, Math.round(videoSize.height || 450));

    // Ensure overlay has size
    const ow = overlay.width || 200;
    const oh = overlay.height || 50;

    let x = overlay.x || 0;
    let y = overlay.y || 0;
    const pad = 10;

    switch (position) {
      case "top-left":
        x = pad;
        y = pad;
        break;
      case "top-right":
        x = Math.max(pad, videoWidth - ow - pad);
        y = pad;
        break;
      case "bottom-left":
        x = pad;
        y = Math.max(pad, videoHeight - oh - pad);
        break;
      case "bottom-right":
        x = Math.max(pad, videoWidth - ow - pad);
        y = Math.max(pad, videoHeight - oh - pad);
        break;
      case "center":
        x = Math.max(0, Math.round((videoWidth - ow) / 2));
        y = Math.max(0, Math.round((videoHeight - oh) / 2));
        break;
      default:
        return;
    }

    handleUpdate(overlay, "x", x);
    handleUpdate(overlay, "y", y);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Active Overlays ({overlays.length})
        </h3>
        {overlays.length > 0 && (
          <div className="text-xs text-gray-400">
            Click to select • Edit properties below
          </div>
        )}
      </div>

      {overlays.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center items-center text-center text-6xl mb-4"><FaRegPlayCircle /></div>
          <p className="text-gray-400 mb-2">No overlays created yet</p>
          <p className="text-sm text-gray-500">
            Use the form above to add text or image overlays to your video
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {overlays.map((overlay, index) => (
            <div
              key={overlay.id}
              className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                selectedOverlay?.id === overlay.id
                  ? "bg-blue-600/20 border-blue-500 ring-2 ring-blue-400/50 shadow-lg"
                  : "bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
              }`}
              onClick={() => onSelect(overlay)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`text-lg px-3 py-1 rounded-lg font-medium text-xs ${
                        overlay.type === "text"
                          ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                          : "bg-purple-600/30 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {overlay.type === "text" ? (
                        <span className="flex items-center gap-1">
                          <FaRegFileAlt /> TEXT
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <FaImage /> IMAGE
                        </span>
                      )}                    </span>
                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                  </div>

                  {/* Content preview */}
                  <div className="text-white font-medium mb-2 truncate">
                    {overlay.type === "text"
                      ? overlay.content || "Empty text overlay"
                      : "Image overlay"}
                  </div>

                  {/* Info */}
                  <div className=" text-xs text-gray-400 mb-3 font-mono ">
                    Position: ({overlay.x}, {overlay.y}) • Size: {overlay.width}×
                    {overlay.height}
                    {overlay.rotation !== 0 && ` • Rotation: ${overlay.rotation}°`}
                  </div>

                  {/* Expanded controls for selected */}
                  {selectedOverlay?.id === overlay.id && (
                    <div className="flex flex-wrap mt-4 space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                      {overlay.type === "text" && (
                        <>
                          <div className="w-full mb-3">
                            <label className="block text-xs font-medium text-gray-400 mb-2">
                              Text Content
                            </label>
                            <input
                              type="text"
                              value={overlay.content || ""}
                              onChange={(e) =>
                                handleUpdate(overlay, "content", e.target.value)
                              }
                              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter overlay text"
                              maxLength="200"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-wrap">
                              <label className="block text-xs font-medium text-gray-400 mb-2">
                                Text Color
                              </label>
                              <div className="flex flex-wrap gap-2">
                                <input
                                  type="color"
                                  value={overlay.color || "#ffffff"}
                                  onChange={(e) =>
                                    handleUpdate(overlay, "color", e.target.value)
                                  }
                                  className="w-8 h-8 rounded border border-gray-600 bg-gray-700"
                                />
                                <input
                                  type="text"
                                  value={overlay.color || "#ffffff"}
                                  onChange={(e) =>
                                    handleUpdate(overlay, "color", e.target.value)
                                  }
                                  className="flex-1 p-2 w-12 sm:w-16 rounded bg-gray-700 border border-gray-600 text-white text-xs font-mono"
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap">
                              <label className="block text-xs font-medium text-gray-400 mb-2">
                                Font Size: {overlay.fontSize || 24}px
                              </label>
                              <input
                                type="range"
                                min="12"
                                max="72"
                                value={overlay.fontSize || 24}
                                onChange={(e) =>
                                  handleUpdate(
                                    overlay,
                                    "fontSize",
                                    parseInt(e.target.value, 10)
                                  )
                                }
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Position & Size */}
                      <div className="grid grid-cols-2 gap-3 w-full">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">
                            Width
                          </label>
                          <input
                            type="number"
                            min="50"
                            max={videoSize.width || 1600}
                            value={overlay.width || 200}
                            onChange={(e) =>
                              handleUpdate(
                                overlay,
                                "width",
                                parseInt(e.target.value, 10)
                              )
                            }
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">
                            Height
                          </label>
                          <input
                            type="number"
                            min="30"
                            max={videoSize.height || 900}
                            value={overlay.height || 50}
                            onChange={(e) =>
                              handleUpdate(
                                overlay,
                                "height",
                                parseInt(e.target.value, 10)
                              )
                            }
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                          />
                        </div>
                      </div>

                      {/* Quick Position */}
                      <div className="w-full">
                        <label className="block text-xs font-medium text-gray-400 mb-2">
                          Quick Position
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Top Left", value: "top-left" },
                            { label: "Top Right", value: "top-right" }, // NEW
                            { label: "Center", value: "center" },
                            { label: "Bottom Left", value: "bottom-left" },
                            { label: "Bottom Right", value: "bottom-right" },
                          ].map((pos) => (
                            <button
                              key={pos.value}
                              onClick={() => handleQuickPosition(overlay, pos.value)}
                              className="px-3 py-2 text-xs bg-gray-600 hover:bg-gray-500 text-gray-200 rounded transition-colors"
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Rotation */}
                      <div className="w-full">
                        <label className="block text-xs font-medium text-gray-400 mb-2">
                          Rotation: {overlay.rotation || 0}°
                        </label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={overlay.rotation || 0}
                          onChange={(e) =>
                            handleUpdate(
                              overlay,
                              "rotation",
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>-180°</span>
                          <button
                            onClick={() => handleUpdate(overlay, "rotation", 0)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <BiReset className="inline mr-1" />
                            Reset
                          </button>
                          <span>180°</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete / Edit */}
                <div className="flex  gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(overlay);
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 group-hover:scale-110"
                    title="Delete overlay"
                  >
                    <FaTrashAlt className="inline" />
                  </button>

                  {selectedOverlay?.id !== overlay.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(overlay);
                      }}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                      title="Edit overlay"
                    >
                      <FaRegFileAlt className="inline" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {overlays.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => overlays.forEach((overlay) => onDelete(overlay.id))}
              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded text-sm transition-colors"
              disabled={overlays.length === 0}
            >
              <FaTrashAlt className="inline"/> Clear All
            </button>
            <span className="text-xs text-gray-500 self-center">
              {overlays.length} overlay{overlays.length !== 1 ? "s" : ""} active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default OverlayList;
