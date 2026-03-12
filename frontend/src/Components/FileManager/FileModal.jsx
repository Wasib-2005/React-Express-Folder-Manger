import { CiSaveDown2 } from "react-icons/ci";
import FileIcons from "../../Utilities/FileIcons";
import { autoFormatSize } from "../../Utilities/formatSize";
import { formatDate } from "../../Utilities/formatDate";
import { Link } from "react-router-dom";
import VideoPlayer from "../../Utilities/VideoPlayer";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark } from "react-icons/hi2";

// ── ModalWrapper is declared at module level — never inside a render function ──
const ModalWrapper = ({ children, wide = false, onClose }) => (
  <AnimatePresence>
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

      {/* Sheet — bottom sheet on mobile, centered card on sm+ */}
      <motion.div
        className={`relative bg-base-100 w-full sm:rounded-2xl rounded-t-2xl shadow-2xl z-10 overflow-hidden
          ${wide ? "sm:max-w-lg" : "sm:max-w-md"} sm:mx-4`}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-base-300" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 btn btn-ghost btn-sm btn-circle z-20"
        >
          <HiXMark size={18} />
        </button>

        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ── Main component ────────────────────────────────────────────────────────────
const FileModal = ({ filePathAndTypeName, isModalOpen, setIsModalOpen }) => {
  if (!isModalOpen || !filePathAndTypeName?.type) return null;

  const baseURL = import.meta.env.VITE_API_URL;
  const close = () => setIsModalOpen(false);
  const src = `${baseURL}/api/file${filePathAndTypeName.path}`;

  // ── Photo ────────────────────────────────────────────────────────────────
  if (filePathAndTypeName.type === "photo") {
    return (
      <ModalWrapper onClose={close}>
        <div className="p-4 pt-5 flex flex-col gap-4">
          <img
            src={src}
            alt={filePathAndTypeName.name}
            className="w-full max-h-[55vh] object-contain rounded-xl"
          />
          <div>
            <p className="font-bold text-base truncate">{filePathAndTypeName.name}</p>
            <p className="text-xs text-base-content/50 mt-0.5">
              {autoFormatSize(filePathAndTypeName.size)} · Modified{" "}
              {formatDate(filePathAndTypeName.modified, "dd MMM yyyy")}
            </p>
          </div>
          <div className="flex gap-2 pb-2">
            <a href={src} rel="noreferrer" className="btn btn-success btn-sm gap-2 flex-1">
              <CiSaveDown2 size={16} /> Download
            </a>
            <Link className="btn btn-info btn-sm flex-1">Edit</Link>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  // ── Video ────────────────────────────────────────────────────────────────
  if (filePathAndTypeName.type === "video") {
    return (
      <ModalWrapper wide onClose={close}>
        <div className="p-4 pt-5 flex flex-col gap-4">
          <div className="rounded-xl overflow-hidden bg-black">
            <VideoPlayer src={src} />
          </div>
          <div>
            <p className="font-bold text-base truncate">{filePathAndTypeName.name}</p>
            <p className="text-xs text-base-content/50 mt-0.5">
              {autoFormatSize(filePathAndTypeName.size)} · Modified{" "}
              {formatDate(filePathAndTypeName.modified, "dd MMM yyyy")}
            </p>
          </div>
          <div className="pb-2">
            <a href={src} className="btn btn-success btn-sm gap-2 w-full">
              <CiSaveDown2 size={16} /> Download Video
            </a>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  // ── Generic file ─────────────────────────────────────────────────────────
  return (
    <ModalWrapper onClose={close}>
      <div className="p-4 pt-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <FileIcons fileFolderData={filePathAndTypeName} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate leading-tight">
              {filePathAndTypeName.name}
            </p>
            <p className="text-xs text-base-content/50 mt-0.5 capitalize">
              {filePathAndTypeName.type}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-base-200 rounded-xl p-3 text-sm">
          <div>
            <p className="text-xs text-base-content/40 mb-0.5">Size</p>
            <p className="font-semibold">{autoFormatSize(filePathAndTypeName.size)}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/40 mb-0.5">Type</p>
            <p className="font-semibold capitalize">{filePathAndTypeName.type}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/40 mb-0.5">Created</p>
            <p className="font-semibold">
              {formatDate(filePathAndTypeName.created, "dd MMM yyyy")}
            </p>
          </div>
          <div>
            <p className="text-xs text-base-content/40 mb-0.5">Modified</p>
            <p className="font-semibold">
              {formatDate(filePathAndTypeName.modified, "dd MMM yyyy")}
            </p>
          </div>
        </div>

        <p className="text-xs text-base-content/40 font-mono break-all bg-base-200 rounded-lg px-3 py-2">
          {filePathAndTypeName.path}
        </p>

        <div className="pb-2">
          <a href={src} rel="noreferrer" className="btn btn-success btn-sm gap-2 w-full">
            <CiSaveDown2 size={16} /> Download
          </a>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default FileModal;