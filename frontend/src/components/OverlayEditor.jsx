import { useState, useRef } from "react";
import { createOverlay } from "../utils/api";

function OverlayEditor({ onCreate }) {
  const [overlayType, setOverlayType] = useState("text");
  const [text, setText] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(24);
  const [x, setX] = useState(100);
  const [y, setY] = useState(50);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: reader.result }),
          });
          const data = await response.json();
          resolve(data.url);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAdd = async () => {
    try {
      let overlayData = {
        type: overlayType,
        x: parseInt(x),
        y: parseInt(y),
      };

      if (overlayType === "text") {
        overlayData = {
          ...overlayData,
          content: text,
          color,
          fontSize: parseInt(fontSize),
        };
      } else if (overlayType === "image" && image) {
        const imageUrl = await uploadImage(image);
        overlayData = {
          ...overlayData,
          imageUrl,
          width: 100,
          height: 100,
        };
      }

      await createOverlay(overlayData);
      
      // Reset form
      setText("");
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      onCreate();
    } catch (error) {
      console.error("Failed to create overlay:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Add Overlay</h3>
      
      {/* Overlay Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overlay Type
        </label>
        <div className="flex space-x-4">
          <button
            onClick={() => setOverlayType("text")}
            className={`px-4 py-2 rounded-md ${
              overlayType === "text"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setOverlayType("image")}
            className={`px-4 py-2 rounded-md ${
              overlayType === "image"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Image/Logo
          </button>
        </div>
      </div>

      {/* Position Controls */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            X Position
          </label>
          <input
            type="number"
            value={x}
            onChange={(e) => setX(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Y Position
          </label>
          <input
            type="number"
            value={y}
            onChange={(e) => setY(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min="0"
          />
        </div>
      </div>

      {/* Text Overlay Controls */}
      {overlayType === "text" && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Content
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter overlay text"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Size
              </label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="12"
                max="72"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </>
      )}

      {/* Image Overlay Controls */}
      {overlayType === "image" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image/Logo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-contain border rounded"
              />
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={
          (overlayType === "text" && !text.trim()) ||
          (overlayType === "image" && !image)
        }
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        Add Overlay
      </button>
    </div>
  );
}

export default OverlayEditor;
