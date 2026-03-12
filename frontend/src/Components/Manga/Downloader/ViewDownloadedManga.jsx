import { useMemo, useState } from "react";
import VerticalView from "./VerticalView";
import HorizontalView from "./HorizontalView";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiViewColumns,
  HiQueueList,
  HiXMark,
  HiCheck,
  HiBookOpen,
  HiOutlineArchiveBoxArrowDown,
} from "react-icons/hi2";

// ─── Save Modal ───────────────────────────────────────────────────────────────
const SaveModal = ({ imagesData, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: imagesData?.name || "",
    ep: imagesData?.ep || "",
    source: imagesData?.source || "",
    titlePage: imagesData?.titlePage || "",
  });

  const fields = [
    { key: "name", label: "Name", placeholder: "e.g. One Piece" },
    { key: "ep", label: "Chapter", placeholder: "e.g. 1057" },
    { key: "source", label: "Source", placeholder: "e.g. MangaDex" },
    { key: "titlePage", label: "Title Page", placeholder: "e.g. cover.jpg" },
  ];

  const isValid = fields.every(({ key }) => !!form[key]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        /* On mobile: full-width bottom sheet. On sm+: centered card */
        className="bg-base-100 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-base-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-base-300 bg-base-200">
          <div className="flex items-center gap-2">
            <HiBookOpen size={20} className="text-info" />
            <h2 className="font-bold text-base sm:text-lg">Save Manga</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <HiXMark size={18} />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-sm font-semibold opacity-70">
                {label}
                <span className="text-error ml-1">*</span>
              </label>
              <input
                type="text"
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                className="input input-bordered input-sm sm:input-md w-full focus:outline-none focus:ring-2 focus:ring-info/50"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost w-full sm:w-auto">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="btn btn-info gap-2 w-full sm:w-auto"
            disabled={!isValid}
          >
            <HiCheck size={18} />
            Confirm Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Shared Save Button ───────────────────────────────────────────────────────
const SaveButton = ({ onClick, saving, hasPages, className = "" }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    disabled={saving || !hasPages}
    className={`btn btn-info gap-2 ${className}`}
  >
    <HiOutlineArchiveBoxArrowDown size={18} />
    {saving ? "Saving..." : "Save"}
  </motion.button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ViewDownloadedManga = ({
  isPreview,
  imagesData,
  setImagesData,
  onSaveConfirm,
  saving = false,
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const isHorizontal = imagesData?.isHorizontal ?? false;
  const hasPages = !!imagesData?.pages?.length;

  const sortedPages = useMemo(() => {
    const pages = imagesData?.pages ?? [];
    return [...pages].sort((a, b) => parseInt(a) - parseInt(b));
  }, [imagesData?.pages]);

  const toggleHorizontal = () =>
    setImagesData((prev) => ({ ...prev, isHorizontal: !prev.isHorizontal }));

  const addRemoveImg = (img) => {
    const cleanImg = img.replace(/^@+/, "");
    setImagesData((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => {
        const base = p.replace(/^@+/, "");
        if (base === cleanImg) return p.startsWith("@") ? cleanImg : "@" + cleanImg;
        return p;
      }),
    }));
  };

  const handleSaveConfirm = (formData) => {
    const merged = { ...imagesData, ...formData };
    setImagesData(merged);
    setShowSaveModal(false);
    if (onSaveConfirm) onSaveConfirm(merged);
  };

  if (!hasPages) return null;

  return (
    <>
      <AnimatePresence>
        {showSaveModal && (
          <SaveModal
            imagesData={imagesData}
            onSave={handleSaveConfirm}
            onClose={() => setShowSaveModal(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 w-full"
      >
        {/* ── Top toolbar ── */}
        <div className="flex flex-col gap-2">
          {/* Row 1: badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-outline badge-md font-mono shrink-0">
              {sortedPages.length} pages
            </span>
            {imagesData.name && (
              <span className="badge badge-ghost truncate max-w-[140px] sm:max-w-none">
                {imagesData.name}
              </span>
            )}
            {imagesData.ep && (
              <span className="badge badge-ghost shrink-0">Ch. {imagesData.ep}</span>
            )}
            {imagesData.source && (
              <span className="badge badge-ghost hidden sm:inline-flex">{imagesData.source}</span>
            )}
          </div>

          {/* Row 2: action buttons — stack vertically on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Layout toggle */}
            <motion.button
              type="button"
              onClick={toggleHorizontal}
              whileTap={{ scale: 0.92 }}
              title={isHorizontal ? "Switch to Vertical" : "Switch to Horizontal"}
              className={`btn btn-sm gap-2 w-full sm:w-auto ${isHorizontal ? "btn-primary" : "btn-outline"}`}
            >
              {isHorizontal ? <HiViewColumns size={15} /> : <HiQueueList size={15} />}
              {isHorizontal ? "Horizontal" : "Vertical"}
            </motion.button>

            {/* Edit info */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowSaveModal(true)}
              className="btn btn-sm btn-outline gap-2 w-full sm:w-auto"
            >
              <HiBookOpen size={15} />
              Edit Info
            </motion.button>

            {/* Top Save */}
            <SaveButton
              onClick={() => setShowSaveModal(true)}
              saving={saving}
              hasPages={hasPages}
              className="btn-sm w-full sm:w-auto"
            />
          </div>
        </div>

        {/* ── Reader ── */}
        {!isHorizontal ? (
          <VerticalView
            key="vertical"
            isPreview={isPreview}
            sortedPages={sortedPages}
            addRemoveImg={addRemoveImg}
            baseUrl={imagesData.baseUrl}
          />
        ) : (
          <HorizontalView
            key="horizontal"
            isPreview={isPreview}
            sortedPages={sortedPages}
            addRemoveImg={addRemoveImg}
            baseUrl={imagesData.baseUrl}
          />
        )}

        {/* ── Bottom Save ── */}
        <div className="flex justify-center py-4">
          <SaveButton
            onClick={() => setShowSaveModal(true)}
            saving={saving}
            hasPages={hasPages}
            className="w-full sm:w-48"
          />
        </div>
      </motion.div>
    </>
  );
};

export default ViewDownloadedManga;