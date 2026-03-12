import axios from "axios";
import { HiMagnifyingGlass, HiEye, HiEyeSlash } from "react-icons/hi2";
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

  useEffect(() => {
    let apiUrl = import.meta.env.VITE_API_URL.replace(/^https?:\/\//, "");
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${apiUrl}`);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message" || data.type === "finish") {
          setMessages((prev) => [...prev, data.text].slice(-200));
        }
        if (data.type === "finish") setStartLooking(false);
      } catch (err) {
        console.error("Invalid WebSocket message:", event.data, err);
      }
    };

    socket.onerror = () =>
      setMessages((prev) => [...prev, "Error: WebSocket connection failed"]);
    socket.onclose = () => console.log("WebSocket closed");
    return () => socket.close();
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStartLooking(true);
    setSaving(false);
    setIsPreview(false);
    setMessages(["Starting Looking for the item"]);
    setImagesData({ pages: [] });

    try {
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
      setMessages((prev) => [
        ...prev,
        `Error: Failed – ${error.response?.data?.message || error.message}`,
      ]);
    } finally {
      setStartLooking(false);
    }
  };

  const handleSave = async (mergedData) => {
    if (!mergedData.pages?.length) return;
    setSaving(true);
    setIsPreview(false);
    try {
      setMessages((prev) => [...prev, "Saving manga..."]);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/browser/find/save-manga`,
        { imagesData: mergedData },
      );
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          `Saved ${mergedData.pages.length} pages successfully`,
        ]);
      } else {
        setMessages((prev) => [...prev, "Error: Failed to save manga"]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        `Error: Failed – ${error.response?.data?.message || error.message}`,
      ]);
    } finally {
      setSaving(false);
      setImagesData({ pages: [] });
    }
  };

  const hasPages = !!imagesData.pages?.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 min-h-[calc(100vh-100px)]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <h1 className="font-semibold text-xl">Manga URL:</h1>

        {/* URL + Search row — stacks on mobile */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-400 "
          />
          <button
            disabled={startLooking || saving}
            type="submit"
            className="btn btn-success gap-2 w-full sm:w-auto shrink-0"
          >
            <HiMagnifyingGlass size={18} />
            {startLooking ? "Looking..." : "Start Looking"}
          </button>
        </div>

        {/* Preview toggle — only visible when pages are loaded */}
        <AnimatePresence>
          {hasPages && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <button
                disabled={startLooking || saving}
                type="button"
                onClick={() => setIsPreview((p) => !p)}
                className="btn btn-primary gap-2 w-full sm:w-auto"
              >
                {isPreview ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
                {isPreview ? "Hide Preview" : "Preview"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Viewer */}
      <AnimatePresence>
        {hasPages && (
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
              onSaveConfirm={handleSave}
              saving={saving}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Console log */}
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 glass font-mono text-sm font-semibold rounded-lg max-h-52 overflow-y-auto mb-6"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.toLowerCase().includes("error")
                    ? "text-red-500"
                    : "text-green-500"
                }
              >
                {msg}
              </div>
            ))}
            <div ref={messageEndRef} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MangaDownloader;
