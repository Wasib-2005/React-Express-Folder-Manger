import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiArrowLeft,
  HiViewColumns,
  HiQueueList,
  HiChevronRight,
} from "react-icons/hi2";

const API = import.meta.env.VITE_API_URL;

const MangaReader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ep = location.state?.ep;

  const [isHorizontal, setIsHorizontal] = useState(ep?.isHorizontal);
  const [showInfo, setShowInfo] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const [isWide, setIsWide] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handler = () => setIsWide(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (!ep) navigate("/manga-selector", { replace: true });
  }, [ep, navigate]);

  if (!ep) return null;

  const pages = (ep.pages ?? []).filter((p) => !p.startsWith("@"));
  const imgSrc = (page) => `${API}/api/file${ep.baseUrl}/${page}`;

  const nextPage = () =>
    setCurrentPage((p) => Math.min(p + 1, pages.length - 1));

  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 0));

  return (
    <div
      className="fixed inset-0 flex flex-col select-none pt-15"
      style={{ backgroundColor: "#111" }}
    >
      {/* Toolbar */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 py-2"
        style={{
          backgroundColor: "#1c1c1c",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl p-1.5 hover:bg-white/10 transition-colors shrink-0"
          style={{ color: "#fff" }}
        >
          <HiArrowLeft size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <p
            className="font-bold text-sm truncate leading-tight"
            style={{ color: "#fff" }}
          >
            {ep.name}
          </p>

          <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            Ep {ep.ep} · {currentPage + 1} / {pages.length} · {ep.source}
          </p>
        </div>

        {/* View toggle */}
        <div
          className="flex items-center gap-0.5 rounded-lg p-0.5 shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <button
            onClick={() => {
              setIsHorizontal(false);
              setCurrentPage(0);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold"
            style={
              !isHorizontal
                ? { backgroundColor: "#fff", color: "#111" }
                : { color: "rgba(255,255,255,0.6)" }
            }
          >
            <HiQueueList size={14} />
            Vertical
          </button>

          <button
            onClick={() => {
              setIsHorizontal(true);
              setCurrentPage(0);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold"
            style={
              isHorizontal
                ? { backgroundColor: "#fff", color: "#111" }
                : { color: "rgba(255,255,255,0.6)" }
            }
          >
            <HiViewColumns size={14} />
            Horizontal
          </button>
        </div>

        {/* Info */}
        <button
          onClick={() => setShowInfo((s) => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={
            showInfo
              ? { backgroundColor: "#fff", color: "#111" }
              : {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)",
                }
          }
        >
          <HiChevronRight
            size={14}
            style={{
              transform: showInfo ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
          Info
        </button>
      </div>

      {/* Reader */}
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {!isHorizontal ? (
            <motion.div
              key="vertical"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto overflow-x-hidden"
              onScroll={(e) => {
                const imgs = e.currentTarget.querySelectorAll("img");
                let closest = 0,
                  minDist = Infinity;

                imgs.forEach((img, i) => {
                  const d = Math.abs(img.getBoundingClientRect().top);
                  if (d < minDist) {
                    minDist = d;
                    closest = i;
                  }
                });

                setCurrentPage(closest);
              }}
            >
              <div className="flex flex-col items-center w-full">
                {pages.map((page, i) => (
                  <img
                    key={page}
                    src={imgSrc(page)}
                    alt={`Page ${i + 1}`}
                    loading="lazy"
                    className="w-full max-w-2xl object-contain"
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="horizontal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;

                if (x < rect.width / 2) prevPage();
                else nextPage();
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={pages[currentPage]}
                  src={imgSrc(pages[currentPage])}
                  alt={`Page ${currentPage + 1}`}
                  className="max-w-full max-h-full object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Page indicator */}
      <AnimatePresence>
        {isHorizontal && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className="absolute bottom-5 left-1/2 -translate-x-1/2"
          >
            <div
              className="px-4 py-1.5 rounded-full text-sm font-bold"
              style={{
                backgroundColor: "rgba(0,0,0,0.75)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {currentPage + 1} / {pages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MangaReader;