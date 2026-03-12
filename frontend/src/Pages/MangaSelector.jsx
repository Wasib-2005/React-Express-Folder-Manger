import { useEffect, useState } from "react";
import axios from "axios";
import ListManga from "../Components/Manga/Reader/ListManga";
import { motion, AnimatePresence } from "framer-motion";
import { HiBookOpen } from "react-icons/hi2";

const MangaSelector = () => {
  const [listOfMangaData, setListOfMangaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getManga = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/manga/list`);
        setListOfMangaData(res.data.manga);
      } catch (err) {
        console.error("Failed to fetch manga:", err);
        setError("Failed to load manga library.");
      } finally {
        setLoading(false);
      }
    };
    getManga();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <HiBookOpen size={26} className="text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Manga Library</h1>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-base-300">
                <div className="h-56 bg-base-200 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                <div className="p-4 flex flex-col gap-2">
                  <div className="h-4 bg-base-200 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-base-200 animate-pulse rounded w-1/2" />
                  <div className="h-8 bg-base-200 animate-pulse rounded mt-1" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-3 text-error"
          >
            <span className="text-5xl">⚠️</span>
            <p className="font-semibold">{error}</p>
          </motion.div>
        ) : listOfMangaData.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-3 text-base-content/40"
          >
            <span className="text-5xl">📚</span>
            <p className="font-semibold">No manga in your library yet</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ListManga manga={listOfMangaData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MangaSelector;