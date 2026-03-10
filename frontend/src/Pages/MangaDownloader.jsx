import { useEffect, useState, useRef } from "react";
import ViewDownloadedManga from "../Components/Manga/Downloader/ViewDownloadedManga";

const MangaDownloader = () => {
  const [url, setUrl] = useState("");
  const [imagesData, setImagesData] = useState({});
  const [messages, setMessages] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [startLooking, setStartLooking] = useState(false);

  const messageEndRef = useRef(null);

  useEffect(() => {
    let apiUrl = import.meta.env.VITE_API_URL;
    apiUrl = apiUrl.replace(/^https?:\/\//, "");

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${apiUrl}`;

    console.log("Connecting to WebSocket:", wsUrl);

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message" || data.type === "finish") {
        setMessages((prev) => [...prev, data.text]);
      }
      if (data.type === "finish") {
        setStartLooking(false);
      }
    };
    return () => socket.close();
  }, []);

  // auto scroll like console
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStartLooking(true);
    setMessages([]);
    setImagesData({});

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/findImg`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    console.log("data: ", data);
    setImagesData(data.imagesData);
  };

  return (
    <div className="px-2 grid gap-4 mt-1 md:w-[90%] min-h-[calc(100vh-300px)] md:min-h-[calc(100vh-75px)] m-auto justify-center items-center">
      <form className="grid gap-4">
        <h1 className="font-semibold text-xl">Manga URL:</h1>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="p-2 rounded-lg border border-base-300 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {imagesData?.pages?.length > 0 && (
          <ViewDownloadedManga
            isPreview={isPreview}
            imagesData={imagesData}
            setImagesData={setImagesData}
          />
        )}

        {/* Responsive Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          <div className="flex flex-wrap gap-2 justify-center w-full sm:w-auto">
            <button
              disabled={startLooking}
              type="submit"
              onClick={handleSubmit}
              className={`btn btn-success w-40 sm:w-[140px] ${startLooking ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {startLooking ? "Looking..." : "Start Looking"}
            </button>

            <button
              disabled={startLooking}
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="btn btn-primary w-40 sm:w-[140px]"
            >
              {startLooking
                ? "Looking..."
                : isPreview
                  ? "Hide Preview"
                  : "Preview"}
            </button>
          </div>

          <div className="w-full flex justify-center mt-2 sm:mt-0">
            <button
              type="button"
              className="btn btn-outline btn-info w-40 sm:w-[140px]"
              // optionally disable Save during scraping
              disabled={startLooking}
            >
              {startLooking ? "Looking..." : " Save The Manga"}
            </button>
          </div>
        </div>
      </form>

      {/* Console Messages */}
      {messages.length > 0 && (
        <div className="p-2 glass font-semibold text-green-600 font-mono rounded max-h-64 overflow-y-auto z-0 mt-4 mb-10 ">
          {messages.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
          <div ref={messageEndRef} />
        </div>
      )}
    </div>
  );
};

export default MangaDownloader;
