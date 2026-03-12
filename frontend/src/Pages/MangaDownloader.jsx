import axios from "axios";
import { HiMagnifyingGlass, HiEye, HiEyeSlash, HiStop } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import ViewDownloadedManga from "../Components/Manga/Downloader/ViewDownloadedManga";

// ── Parse WS message text into structured progress ────────────────────────────
const parseProgress = (text, prev) => {
  const next = { ...prev };

  // "Title found: Some Title (Chapter 12)"  or  "Title found: Some Title (Ep 5)"
  const titleMatch = text.match(/Title found:\s*(.+?)(?:\s*\((?:Chapter|Ep)\s*[\d.]+\))?$/i);
  if (titleMatch) next.title = titleMatch[1].trim();

  // "Total pages: 76"
  const totalMatch = text.match(/Total pages:\s*(\d+)/i);
  if (totalMatch) next.total = parseInt(totalMatch[1]);

  // "Found 3.jpg (3/76)"  /  "Downloaded 3.jpg (3/76)"  /  "Saved page 3/76"
  const pageMatch = text.match(/\((\d+)\/(\d+)\)/) || text.match(/page\s+(\d+)\/(\d+)/i);
  if (pageMatch) {
    next.current = parseInt(pageMatch[1]);
    next.total   = parseInt(pageMatch[2]);
  }

  // Source hints
  if (text.includes("MangaDex"))   next.source = "MangaDex";
  if (text.includes("nhentai"))    next.source = "nhentai";
  if (text.includes("Namicomi"))   next.source = "NamiComi";
  if (text.includes("sequential")) next.source = "Sequential";

  // Phase: saving vs downloading
  if (/saving|saved page/i.test(text)) next.phase = "saving";
  else if (/found|downloaded/i.test(text)) next.phase = "downloading";

  return next;
};

const EMPTY_PROGRESS = { title: null, total: 0, current: 0, source: null, phase: "downloading" };

// ── Progress Panel ────────────────────────────────────────────────────────────
const ProgressPanel = ({ progress, isRunning }) => {
  const { title, total, current, source, phase } = progress;
  if (!total && !title) return null;

  const pct    = total > 0 ? Math.round((current / total) * 100) : 0;
  const isDone = !isRunning && current > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="rounded-xl border border-base-300 bg-base-200 p-4 flex flex-col gap-3"
    >
      {/* Title row */}
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        {source && <span className="badge badge-outline badge-sm shrink-0">{source}</span>}
        {title  && <span className="font-semibold text-sm truncate">{title}</span>}
        {isDone && <span className="badge badge-success badge-sm ml-auto shrink-0">Done</span>}
        {isRunning && (
          <span className="ml-auto shrink-0">
            <span className="loading loading-spinner loading-xs opacity-60" />
          </span>
        )}
      </div>

      {/* Bar */}
      {total > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-mono opacity-60">
            <span>{phase === "saving" ? "Saving" : "Downloading"}</span>
            <span>{current} / {total} ({pct}%)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-base-300 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${phase === "saving" ? "bg-info" : "bg-success"}`}
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ ease: "easeOut", duration: 0.25 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const MangaDownloader = () => {
  const [url, setUrl]               = useState("");
  const [imagesData, setImagesData] = useState({ pages: [] });
  const [messages, setMessages]     = useState([]);
  const [isPreview, setIsPreview]   = useState(false);
  const [startLooking, setStartLooking] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [progress, setProgress]     = useState(EMPTY_PROGRESS);

  const messageEndRef = useRef(null);
  const wsRef         = useRef(null);
  const abortRef      = useRef(null);

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
          setProgress((prev) => parseProgress(data.text, prev));
        }
        if (data.type === "finish") {
          setStartLooking(false);
          setSaving(false);
        }
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

  const handleCancel = async () => {
    abortRef.current?.abort();
    setStartLooking(false);
    setMessages((prev) => [...prev, "⚠ Scan cancelled"]);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/browser/find/cancel`);
    } catch { /* best-effort */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setStartLooking(true);
    setSaving(false);
    setIsPreview(false);
    setMessages(["Starting Looking for the item"]);
    setImagesData({ pages: [] });
    setProgress(EMPTY_PROGRESS);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/browser/find/manga`,
        { url },
        {
          signal: controller.signal,
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache", Expires: "0" },
        },
      );
      const data = res.data;
      if (data.cancelled) return;
      if (data.success && data.imagesData) {
        setImagesData(data.imagesData);
        setMessages((prev) => [...prev, `Found ${data.imagesData.pages.length} pages`]);
      } else {
        setMessages((prev) => [...prev, "Error: No images found"]);
      }
    } catch (error) {
      if (axios.isCancel(error) || error.code === "ERR_CANCELED") return;
      setMessages((prev) => [...prev, `Error: Failed – ${error.response?.data?.message || error.message}`]);
    } finally {
      setStartLooking(false);
    }
  };

  const handleSave = async (mergedData) => {
    if (!mergedData.pages?.length) return;
    setSaving(true);
    setIsPreview(false);
    setProgress((prev) => ({ ...prev, current: 0, total: mergedData.pages.filter(p => !p.includes("@")).length, phase: "saving" }));

    try {
      setMessages((prev) => [...prev, "Saving manga..."]);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/browser/find/save-manga`,
        { imagesData: mergedData },
      );
      if (res.data.success) {
        setMessages((prev) => [...prev, `Saved ${mergedData.pages.length} pages successfully`]);
      } else {
        setMessages((prev) => [...prev, "Error: Failed to save manga"]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, `Error: Failed – ${error.response?.data?.message || error.message}`]);
    } finally {
      setSaving(false);
      setImagesData({ pages: [] });
    }
  };

  const hasPages  = !!imagesData.pages?.length;
  const isRunning = startLooking || saving;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 min-h-[calc(100vh-100px)]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <h1 className="font-semibold text-xl">Manga URL:</h1>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            disabled={isRunning}
            type="submit"
            className="btn btn-success gap-2 w-full sm:w-auto shrink-0"
          >
            <HiMagnifyingGlass size={18} />
            {startLooking ? "Looking..." : "Start Looking"}
          </button>
          <motion.button
            type="button"
            onClick={handleCancel}
            animate={{ opacity: startLooking ? 1 : 0.35 }}
            transition={{ duration: 0.2 }}
            className={`btn btn-error gap-2 w-full sm:w-auto shrink-0 ${!startLooking ? "cursor-not-allowed" : ""}`}
          >
            <HiStop size={18} />
            Cancel
          </motion.button>
        </div>

        {/* Preview toggle */}
        <AnimatePresence>
          {hasPages && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <button
                disabled={isRunning}
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

      {/* ── Progress panel ── */}
      <AnimatePresence>
        {(isRunning || (progress.total > 0)) && (
          <ProgressPanel progress={progress} isRunning={isRunning} />
        )}
      </AnimatePresence>

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

      {/* Console */}
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
                    : msg.startsWith("⚠")
                    ? "text-yellow-400"
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