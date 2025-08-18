import { useState } from "react";

function RtspInput({ onChange }) {
  const [value, setValue] = useState("");

  const apply = () => {
    if (value.trim()) {
      // Convert RTSP to HLS endpoint
      const hls_url = `http://localhost:5000/hls/index.m3u8`;
      onChange(hls_url);
    }
    setValue("");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Add Custom RTSP Stream
      </h3>
      <div className="flex gap-3">
        <input
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="rtsp://example.com/live"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <button 
          onClick={apply}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Switch Stream
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Note: The stream will be converted to HLS format for web playback
      </p>
    </div>
  );
}

export default RtspInput;
