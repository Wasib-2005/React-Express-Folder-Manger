import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ShowTheActivePath from "./ShowTheActivePath";
import axios from "axios";
import FileManagerManu from "./FileManagerManu";
import { motion, AnimatePresence } from "framer-motion";
import { HiFolderOpen } from "react-icons/hi2";

const FileManager = () => {
  const [query] = useSearchParams();
  const [fileFolderPathData, setFileFolderPathData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const path = query.get("path");

  // Use a ref to batch the three state updates into one async callback
  // so we never call setState synchronously inside the effect body
  const abortRef = useRef(null);

  useEffect(() => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Start a microtask so the setState calls happen asynchronously
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/paths${path ? `?path=${path}` : ""}`,
          { signal: controller.signal }
        );
        setFileFolderPathData(res.data);
      } catch (err) {
        if (!axios.isCancel(err)) setError("Failed to load directory.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [path]);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-5 py-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <HiFolderOpen size={22} className="text-warning shrink-0" />
        <h1 className="font-bold text-lg tracking-tight">File Manager</h1>
      </div>

      <ShowTheActivePath currentLocation={fileFolderPathData.location} />

      <div className="border border-base-300 rounded-xl overflow-hidden">
        <AnimatePresence >
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2 p-4"
            >
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-base-200 animate-pulse"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-error font-semibold"
            >
              {error}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FileManagerManu fileFolderPathData={fileFolderPathData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FileManager;