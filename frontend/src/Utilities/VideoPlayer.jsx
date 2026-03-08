// VideoPlayer.jsx
import { useRef, useState } from "react";

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full max-h-[60vh] rounded-lg shadow-md"
      />
      {/* Optional: custom play/pause button overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center text-white text-3xl bg-black/30 rounded-lg"
        >
          ▶
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;