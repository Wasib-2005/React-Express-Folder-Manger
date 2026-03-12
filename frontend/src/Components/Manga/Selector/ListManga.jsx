import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiMagnifyingGlass,
  HiSquares2X2,
  HiQueueList,
  HiBookOpen,
  HiXMark,
  HiChevronRight,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

// ── Helpers ───────────────────────────────────────────────────────────────────
const getEpCover = (ep) => {
  if (!ep?.pages?.length || !ep?.baseUrl) return null;
  const page = ep.pages.find((p) => !p.startsWith("@")) || ep.pages[0];
  return `${apiUrl}/api/file${ep.baseUrl}/${page}`;
};

const getGroupCover = (group) => {
  const sorted = [...group.episodes].sort(
    (a, b) => Number(a.ep) - Number(b.ep),
  );
  return getEpCover(sorted[0]);
};

const normalize = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/);

function groupManga(mangaList, matchWords) {
  const groups = [];
  for (const item of mangaList) {
    const words = normalize(item.name);
    const found = groups.find(
      (g) =>
        words.filter((w) => normalize(g.name).includes(w)).length >= matchWords,
    );
    if (found) found.episodes.push(item);
    else groups.push({ name: item.name, episodes: [item] });
  }
  return groups;
}

// ── Episode row inside the modal ──────────────────────────────────────────────
const EpisodeRow = ({ ep, onSelect }) => {
  const cover = getEpCover(ep);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => onSelect(ep)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-base-200 active:bg-base-300 cursor-pointer transition-colors group"
    >
      {/* Thumb */}
      <div className="w-10 h-14 rounded-md overflow-hidden bg-base-300 shrink-0">
        {cover ? (
          <img
            src={cover}
            alt={`ep${ep.ep}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/20">
            <HiBookOpen size={16} />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Episode {ep.ep}</p>
        <p className="text-xs text-base-content/50">
          {ep.pages?.length ?? 0} pages · {ep.source}
        </p>
      </div>
      <HiChevronRight
        size={16}
        className="text-base-content/30 group-hover:text-base-content/70 transition-colors shrink-0"
      />
    </motion.div>
  );
};

// ── Episodes modal (shown when group has >1 episode) ─────────────────────────
const EpisodesModal = ({ group, onClose, onSelect }) => {
  const sorted = useMemo(
    () => [...group.episodes].sort((a, b) => Number(a.ep) - Number(b.ep)),
    [group.episodes],
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Sheet */}
      <motion.div
        className="relative bg-base-100 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl z-10 overflow-hidden"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-base-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
          <div>
            <p className="font-bold text-base leading-tight line-clamp-1">
              {group.name}
            </p>
            <p className="text-xs text-base-content/50 mt-0.5">
              {sorted.length} episodes
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <HiXMark size={18} />
          </button>
        </div>

        {/* Episode list */}
        <div className="overflow-y-auto max-h-[60vh] px-2 py-2">
          {sorted.map((ep, i) => (
            <EpisodeRow
              key={`${ep.name}-${ep.ep}-${i}`}
              ep={ep}
              onSelect={onSelect}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Manga card ────────────────────────────────────────────────────────────────
const MangaCard = ({ group, onCardClick }) => {
  const cover = getGroupCover(group);
  const epCount = group.episodes.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onClick={() => onCardClick(group)}
      className="bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer flex flex-col"
    >
      {/* Cover image */}
      <div className="relative h-56 bg-base-200 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={group.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/20">
            <HiBookOpen size={48} />
          </div>
        )}

        {/* Episode count badge */}
        <div className="absolute top-2 right-2">
          <span className="badge badge-primary badge-sm font-bold shadow">
            {epCount} ep
          </span>
        </div>

        {/* Source badge */}
        {group.episodes[0]?.source && (
          <div className="absolute top-2 left-2">
            <span className="badge badge-ghost badge-sm capitalize opacity-90 shadow">
              {group.episodes[0].source}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <HiBookOpen size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-1">
        <h2
          className="font-bold text-sm leading-snug line-clamp-2"
          title={group.name}
        >
          {group.name}
        </h2>
        <p className="text-xs text-base-content/40">
          {epCount === 1
            ? `Episode ${group.episodes[0].ep} · ${group.episodes[0].pages?.length ?? 0} pages`
            : `${epCount} episodes`}
        </p>
      </div>
    </motion.div>
  );
};

// ── Main ListManga ────────────────────────────────────────────────────────────
const ListManga = ({ manga }) => {
  const navigate = useNavigate();
  const [matchWords, setMatchWords] = useState(3);
  const [groupEnabled, setGroupEnabled] = useState(true);
  const [search, setSearch] = useState("");
  const [gridView, setGridView] = useState(true);
  const [activeGroup, setActiveGroup] = useState(null); // group shown in modal

  const groupedManga = useMemo(() => {
    const base = groupEnabled
      ? groupManga(manga || [], matchWords)
      : (manga || []).map((m) => ({ name: m.name, episodes: [m] }));

    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter((g) => g.name.toLowerCase().includes(q));
  }, [manga, matchWords, groupEnabled, search]);

  const handleEpisodeSelect = (ep) => {
    // Navigate to MangaReader and pass ep as state
    navigate("/manga-reader", { state: { ep } });
  };

  const handleCardClick = (group) => {
    if (group.episodes.length === 1) {
      // Single episode — log for now
      handleEpisodeSelect(group.episodes[0]);
    } else {
      // Multiple episodes — open modal
      setActiveGroup(group);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 bg-base-200 p-3 rounded-xl border border-base-300">
        {/* Search */}
        <div className="relative flex-1 min-w-45">
          <HiMagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
          />
          <input
            type="text"
            placeholder="Search manga..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered input-sm w-full pl-8"
          />
        </div>

        {/* Grouping toggle */}
        <button
          className={`btn btn-sm ${groupEnabled ? "btn-primary" : "btn-outline"}`}
          onClick={() => setGroupEnabled((p) => !p)}
        >
          {groupEnabled ? "Grouped" : "Ungrouped"}
        </button>

        {/* Match words — only when grouping on */}
        {groupEnabled && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-base-content/60 whitespace-nowrap">
              Match words
            </span>
            <input
              type="range"
              min="1"
              max="5"
              value={matchWords}
              onChange={(e) => setMatchWords(Number(e.target.value))}
              className="range range-primary range-xs w-24"
            />
            <span className="badge badge-primary badge-sm">{matchWords}</span>
          </div>
        )}

        {/* Grid / List toggle */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            className={`btn btn-sm btn-circle ${gridView ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setGridView(true)}
            title="Grid view"
          >
            <HiSquares2X2 size={15} />
          </button>
          <button
            className={`btn btn-sm btn-circle ${!gridView ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setGridView(false)}
            title="List view"
          >
            <HiQueueList size={15} />
          </button>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-base-content/40 -mt-2 px-1">
        {groupedManga.length} title{groupedManga.length !== 1 ? "s" : ""}
        {search && ` matching "${search}"`}
      </p>

      {/* Grid */}
      {gridView ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {groupedManga.map((group, i) => (
            <MangaCard
              key={`${i}-${group.name}`}
              group={group}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      ) : (
        /* List */
        <div className="flex flex-col divide-y divide-base-200 border border-base-300 rounded-xl overflow-hidden">
          {groupedManga.map((group, i) => {
            const cover = getGroupCover(group);
            const sorted = [...group.episodes].sort(
              (a, b) => Number(a.ep) - Number(b.ep),
            );
            return (
              <motion.div
                key={`${i}-${group.name}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => handleCardClick(group)}
                className="flex items-center gap-3 px-3 py-3 hover:bg-base-200 active:bg-base-300 transition-colors cursor-pointer"
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-base-300 shrink-0">
                  {cover ? (
                    <img
                      src={cover}
                      alt={group.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base-content/20">
                      <HiBookOpen size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{group.name}</p>
                  <p className="text-xs text-base-content/50 mt-0.5">
                    {sorted.length} episode{sorted.length !== 1 ? "s" : ""} ·{" "}
                    {sorted[0]?.source}
                  </p>
                </div>
                <span className="badge badge-outline badge-sm shrink-0">
                  {sorted.length === 1
                    ? `Ep ${sorted[0].ep}`
                    : `${sorted.length} eps`}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {groupedManga.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-base-content/30 gap-2">
          <span className="text-4xl">🔍</span>
          <p className="text-sm font-medium">No results for "{search}"</p>
        </div>
      )}

      {/* Episodes modal */}
      <AnimatePresence>
        {activeGroup && (
          <EpisodesModal
            group={activeGroup}
            onClose={() => setActiveGroup(null)}
            onSelect={handleEpisodeSelect}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListManga;
