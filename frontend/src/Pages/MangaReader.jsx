import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiArrowLeft,
  HiViewColumns,
  HiQueueList,
  HiXMark,
  HiBookOpen,
  HiPhoto,
  HiGlobeAlt,
  HiHashtag,
  HiRectangleStack,
  HiFolderOpen,
  HiChevronRight,
} from "react-icons/hi2";

const API = import.meta.env.VITE_API_URL;


// ─── PANEL DESIGN TOKENS — solid colors that pop on any bg ───────────────────
const P = {
  bg:        "#2a2a2e",   // panel background
  card:      "#36363b",   // card row background
  border:    "#48484f",   // borders
  label:     "#a0a0aa",   // label text
  value:     "#f0f0f2",   // value text
  muted:     "#888890",   // muted / mono text
  track:     "#48484f",   // progress track
};

const InfoPanel = ({ ep, isHorizontal, currentPage, totalPages, layout, onClose }) => {
  const rows = [
    { icon: <HiBookOpen size={14} />,       label: "Name",    value: ep.name },
    { icon: <HiHashtag size={14} />,        label: "Episode", value: ep.ep },
    { icon: <HiGlobeAlt size={14} />,       label: "Source",  value: ep.source },
    { icon: <HiPhoto size={14} />,          label: "Pages",   value: totalPages },
    { icon: <HiRectangleStack size={14} />, label: "Mode",    value: isHorizontal ? "Horizontal" : "Vertical" },
    { icon: <HiFolderOpen size={14} />,     label: "Path",    value: ep.baseUrl, mono: true },
  ];

  const inner = (
    <div className="flex flex-col h-full" style={{ color: P.value }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0"
        style={{ borderBottom: `1px solid ${P.border}` }}
      >
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: P.label }}>
          Info
        </p>
        <button
          onClick={onClose}
          className="rounded-lg p-1 transition-colors"
          style={{ color: P.label, backgroundColor: P.card }}
          onMouseEnter={(e) => e.currentTarget.style.color = P.value}
          onMouseLeave={(e) => e.currentTarget.style.color = P.label}
        >
          <HiXMark size={16} />
        </button>
      </div>

      {/* Cover */}
      <div className="px-4 pt-4 shrink-0">
        <div className="w-full aspect-[2/3] rounded-xl overflow-hidden mb-4" style={{ backgroundColor: P.card }}>
          <img
            src={`${API}/api/file${ep.baseUrl}/${ep.pages?.[0]}`}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Meta rows */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-2">
        {rows.map(({ icon, label, value, mono }) => (
          <div
            key={label}
            className="rounded-xl px-3 py-2.5"
            style={{ backgroundColor: P.card, border: `1px solid ${P.border}` }}
          >
            <div className="flex items-center gap-1.5 mb-1" style={{ color: P.label }}>
              {icon}
              <p className="text-xs font-medium">{label}</p>
            </div>
            <p
              className={`break-all ${mono ? "text-xs font-mono" : "text-sm font-semibold"}`}
              style={{ color: mono ? P.muted : P.value }}
            >
              {value}
            </p>
          </div>
        ))}

        {/* Progress */}
        <div
          className="rounded-xl px-3 py-2.5"
          style={{ backgroundColor: P.card, border: `1px solid ${P.border}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium" style={{ color: P.label }}>Progress</p>
            <p className="text-xs font-bold tabular-nums" style={{ color: P.value }}>
              {currentPage + 1} / {totalPages}
            </p>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: P.track }}>
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (layout === "side") {
    return (
      <motion.aside
        initial={{ x: 280, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 280, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="w-64 shrink-0 h-full overflow-hidden"
        style={{
          backgroundColor: P.bg,
          borderLeft: `2px solid ${P.border}`,
          boxShadow: "-6px 0 24px rgba(0,0,0,0.5)",
        }}
      >
        {inner}
      </motion.aside>
    );
  }

  // bottom sheet (mobile)
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-lg rounded-t-2xl z-10 overflow-hidden"
        style={{ backgroundColor: P.bg, maxHeight: "80vh", border: `1px solid ${P.border}` }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: P.border }} />
        </div>
        <div style={{ maxHeight: "calc(80vh - 1rem)", overflowY: "auto" }}>
          {inner}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const MangaReader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ep = location.state?.ep;

  const [isHorizontal, setIsHorizontal] = useState(ep?.isHorizontal ?? false);
  const [showInfo, setShowInfo] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const hScrollRef = useRef(null);

  const [isWide, setIsWide] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handler = () => setIsWide(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (!ep) navigate("/manga-selector", { replace: true });
  }, [ep, navigate]);

  useEffect(() => {
    const el = hScrollRef.current;
    if (!el || !isHorizontal) return;
    el.children[currentPage]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [currentPage, isHorizontal]);

  if (!ep) return null;

  const pages = (ep.pages ?? []).filter((p) => !p.startsWith("@"));
  const imgSrc = (page) => `${API}/api/file${ep.baseUrl}/${page}`;

  return (
    <div className="fixed inset-0 flex flex-col select-none" style={{ backgroundColor: "#111" }}>

      {/* ── Toolbar ── */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 py-2"
        style={{
          backgroundColor: "#1c1c1c",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl p-1.5 hover:bg-white/10 transition-colors shrink-0"
          style={{ color: "#fff" }}
        >
          <HiArrowLeft size={20} />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate leading-tight" style={{ color: "#fff" }}>
            {ep.name}
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            Ep {ep.ep} &nbsp;·&nbsp; {currentPage + 1} / {pages.length} &nbsp;·&nbsp; {ep.source}
          </p>
        </div>

        {/* View toggle */}
        <div
          className="flex items-center gap-0.5 rounded-lg p-0.5 shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <button
            onClick={() => { setIsHorizontal(false); setCurrentPage(0); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all"
            style={
              !isHorizontal
                ? { backgroundColor: "#fff", color: "#111" }
                : { color: "rgba(255,255,255,0.6)" }
            }
          >
            <HiQueueList size={14} />
            <span className="hidden sm:inline">Vertical</span>
          </button>
          <button
            onClick={() => { setIsHorizontal(true); setCurrentPage(0); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all"
            style={
              isHorizontal
                ? { backgroundColor: "#fff", color: "#111" }
                : { color: "rgba(255,255,255,0.6)" }
            }
          >
            <HiViewColumns size={14} />
            <span className="hidden sm:inline">Horizontal</span>
          </button>
        </div>

        {/* Info toggle */}
        <button
          onClick={() => setShowInfo((s) => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0"
          style={
            showInfo
              ? { backgroundColor: "#fff", color: "#111" }
              : { backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }
          }
        >
          <HiChevronRight
            size={14}
            style={{ transform: showInfo ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          />
          <span className="hidden sm:inline">Info</span>
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Reader */}
        <AnimatePresence mode="wait">
          {!isHorizontal ? (
            <motion.div
              key="vertical"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto overflow-x-hidden"
              onScroll={(e) => {
                const imgs = e.currentTarget.querySelectorAll("img");
                let closest = 0, minDist = Infinity;
                imgs.forEach((img, i) => {
                  const d = Math.abs(img.getBoundingClientRect().top);
                  if (d < minDist) { minDist = d; closest = i; }
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              ref={hScrollRef}
              className="flex-1 flex overflow-x-auto snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}
              onScroll={(e) => {
                setCurrentPage(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth));
              }}
            >
              {pages.map((page, i) => (
                <div key={page} className="snap-center shrink-0 w-full h-full flex items-center justify-center">
                  <img
                    src={imgSrc(page)}
                    alt={`Page ${i + 1}`}
                    loading={i < 3 ? "eager" : "lazy"}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side info panel — desktop */}
        <AnimatePresence>
          {showInfo && isWide && (
            <InfoPanel
              key="side"
              ep={ep}
              isHorizontal={isHorizontal}
              currentPage={currentPage}
              totalPages={pages.length}
              layout="side"
              onClose={() => setShowInfo(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Page pill — horizontal */}
      <AnimatePresence>
        {isHorizontal && (
          <motion.div
            key="pill"
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
            <div
              className="px-4 py-1.5 rounded-full text-sm font-bold tabular-nums"
              style={{ backgroundColor: "rgba(0,0,0,0.75)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {currentPage + 1} / {pages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom info sheet — mobile */}
      <AnimatePresence>
        {showInfo && !isWide && (
          <InfoPanel
            key="bottom"
            ep={ep}
            isHorizontal={isHorizontal}
            currentPage={currentPage}
            totalPages={pages.length}
            layout="bottom"
            onClose={() => setShowInfo(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MangaReader;