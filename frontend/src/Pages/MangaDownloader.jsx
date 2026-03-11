import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import ViewDownloadedManga from "../Components/Manga/Downloader/ViewDownloadedManga";

const MangaDownloader = () => {
  const [url, setUrl] = useState("");
  const [imagesData, setImagesData] = useState({ pages: [] });
  const [messages, setMessages] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [startLooking, setStartLooking] = useState(false);
  const [saving, setSaving] = useState(false);

  const messageEndRef = useRef(null);
  const wsRef = useRef(null);

  // WebSocket setup
  useEffect(() => {
    let apiUrl = import.meta.env.VITE_API_URL.replace(/^https?:\/\//, "");
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${apiUrl}`;

    console.log("Connecting to WebSocket:", wsUrl);
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "message" || data.type === "finish") {
          setMessages((prev) => {
            const newMessages = [...prev, data.text];
            // limit to last 200 messages
            return newMessages.slice(-200);
          });
        }

        if (data.type === "finish") {
          setStartLooking(false);
        }
      } catch (err) {
        console.error("Invalid WebSocket message:", event.data, err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setMessages((prev) => [...prev, "Error: WebSocket connection failed"]);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      socket.close();
    };
  }, []);

  // auto scroll like console (instant scroll for performance)
  useEffect(() => {
    messageEndRef.current?.scrollIntoView();
  }, [messages]);

  // Handle manga fetch
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setStartLooking(true);
      setMessages(["Starting Looking for the item"]);
      setImagesData({ pages: [] });

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/browser/find/manga`,
        { url },
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );

      const data = res.data;

      if (data.success && data.imagesData) {
        setImagesData(data.imagesData);
        setMessages((prev) => [
          ...prev,
          `Found ${data.imagesData.pages.length} pages`,
        ]);
      } else {
        setMessages((prev) => [...prev, "Error: No images found"]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        `Error: Failed – ${error.response?.data?.message || error.message}`,
      ]);
    } finally {
      // rely on backend to finish the looking process via WebSocket
    }
  };

  // Handle manga save
  const handleSave = async () => {
    if (!imagesData.pages?.length) return;

    try {
      setSaving(true);
      setMessages((prev) => [...prev, "Saving manga..."]);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/browser/find/save-manga`,
        { imagesData },
      );

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          `Saved ${imagesData.pages.length} pages successfully`,
        ]);
      } else {
        setMessages((prev) => [...prev, "Error: Failed to save manga"]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        `Error: Failed – ${error.response?.data?.message || error.message}`,
      ]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="px-2 grid gap-4 mt-1 md:w-[90%] min-h-[calc(100vh-300px)] md:min-h-[calc(100vh-75px)] m-auto justify-center items-center"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <h1 className="font-semibold text-xl">Manga URL:</h1>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="p-2 rounded-lg border border-base-300 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <AnimatePresence>
          {imagesData.pages?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ViewDownloadedManga
                isPreview={isPreview}
                imagesData={imagesData}
                setImagesData={setImagesData}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap justify-center gap-2 mt-2">
          <div className="flex flex-wrap gap-2 justify-center w-full sm:w-auto">
            <button
              disabled={startLooking || saving}
              type="submit"
              className={`btn btn-success w-40 sm:w-[140px] ${
                startLooking ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {startLooking ? "Looking..." : "Start Looking"}
            </button>

            <button
              disabled={startLooking || saving || !imagesData.pages?.length}
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
              onClick={handleSave}
              disabled={startLooking || saving || !imagesData.pages?.length}
            >
              {saving ? "Saving..." : "Save The Manga"}
            </button>
          </div>
        </div>
      </form>

      {/* Console Messages */}
      {messages.length > 0 && (
        <div className="p-2 glass font-semibold font-mono rounded max-h-64 overflow-y-auto z-0 mt-4 mb-10">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.toLowerCase().includes("error")
                  ? "text-red-600"
                  : "text-green-600"
              }
            >
              {msg}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
      )}
    </motion.div>
  );
};

export default MangaDownloader;
