import { useState, useRef } from "react";
import { createOverlay, uploadImage } from "../utils/api";
import { FaImage, FaRedo, FaRegFileAlt, FaTrashAlt } from "react-icons/fa";

function OverlayEditor({ onAdd }) {
  const [type, setType] = useState("text");
  const [text, setText] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(24);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInput = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File must be less than 5MB");
      fileInput.current.value = "";
      return;
    }
    
    if (file) {
      setImageFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setImageFile(null);
      setPreviewUrl("");
    }
  };

  const handleAdd = async () => {
    if (type === "text") {
      if (!text.trim()) {
        alert("Please enter some text for the overlay");
        return;
      }
      
      const overlayData = {
        type: "text",
        content: text.trim(),
        fontSize: parseInt(fontSize),
        color,
        width: Math.max(100, text.length * fontSize * 0.6),
        height: Math.max(30, fontSize * 1.5),
        x: 50,
        y: 50,
        rotation: 0
      };
      
      await onAdd(overlayData);
      setText("");
    } else if (type === "image" && imageFile) {
      setUploading(true);
      try {
        const { url } = await uploadImage(imageFile);
        
        const overlayData = {
          type: "image",
          imageUrl: url,
          width: 150,
          height: 150,
          x: 100,
          y: 100,
          rotation: 0
        };
        
        await onAdd(overlayData);
        setImageFile(null);
        setPreviewUrl("");
        fileInput.current.value = "";
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const resetForm = () => {
    setText("");
    setColor("#ffffff");
    setFontSize(24);
    setImageFile(null);
    setPreviewUrl("");
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
      <div className="space-y-6">
        {/* Type Selector */}
        <div className="flex gap-3">
          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              type === "text"
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setType("text")}
          >
            <FaRegFileAlt className="inline"/> Text Overlay
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              type === "image"
                ? "bg-purple-600 text-white shadow-lg scale-105"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setType("image")}
          >
            <FaImage className="inline"/> Image Overlay
          </button>
        </div>

        {/* Text Overlay Controls */}
        {type === "text" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Text Content
              </label>
              <textarea
                placeholder="Enter your overlay text..."
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={200}
              />
              <div className="text-xs text-gray-400 mt-1">
                {text.length}/200 characters
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Font Size
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-gray-300 font-mono text-sm w-8">
                    {fontSize}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Text Color
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-gray-600 bg-gray-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm font-mono w-1/3"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
            </div>

            {/* Text Preview */}
            {text.trim() && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="text-sm text-gray-400 mb-2">Preview:</div>
                <div
                  style={{
                    color,
                    fontSize: `${fontSize}px`,
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                  }}
                >
                  {text}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Overlay Controls */}
        {type === "image" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image File
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="flex-1 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                />
                {imageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewUrl("");
                      fileInput.current.value = "";
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                    title="Remove image"
                  >
                    <FaTrashAlt className="inline" />
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Max 5MB • Supports PNG, JPG, WEBP, GIF
              </div>
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="text-sm text-gray-400 mb-2">Preview:</div>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-32 object-contain rounded border border-gray-600"
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={handleAdd}
            disabled={
              (type === "text" && !text.trim()) ||
              (type === "image" && (!imageFile || uploading))
            }
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              type === "text"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </div>
            ) : (
              `Add ${type === "text" ? "Text" : "Image"} Overlay`
            )}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg font-medium transition-colors cursor-pointer"
            title="Clear form"
          >
            <FaRedo className="inline "/> Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default OverlayEditor;