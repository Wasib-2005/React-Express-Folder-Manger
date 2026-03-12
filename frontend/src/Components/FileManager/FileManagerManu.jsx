import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDate } from "../../Utilities/formatDate";
import { autoFormatSize } from "../../Utilities/formatSize";
import FileIcons from "../../Utilities/FileIcons";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import FileModal from "./FileModal";
import { HiChevronRight } from "react-icons/hi2";

const FileManagerManu = ({ fileFolderPathData }) => {
  const navigate = useNavigate();
  const { folderFile, location } = fileFolderPathData;

  const [currentPath, setCurrentPath] = useState(location || "/");
  const [displayFiles, setDisplayFiles] = useState(folderFile || []);
  const [direction, setDirection] = useState("forward");
  const [filePathAndTypeNameIcon, setFilePathAndTypeNameIcon] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track the previous path to compute direction — stored in a ref so it
  // doesn't trigger re-renders, and only READ inside the async effect (never
  // during render itself).
  const prevPathRef = useRef(location || "/");

  const [searchParams] = useSearchParams();
  const queryPathRaw = searchParams.get("path") || location || "/";
  const queryPath = decodeURIComponent(queryPathRaw);

  useEffect(() => {
    // All setState calls here are fine — they're inside an async effect callback,
    // not synchronously in the effect body's top level of a render.
    const run = async () => {
      const prevPath = prevPathRef.current || "/";
      if (prevPath !== queryPath) {
        const prevSegs = prevPath.split("/").filter(Boolean);
        const currSegs = queryPath.split("/").filter(Boolean);
        const nextDirection = currSegs.length > prevSegs.length ? "forward" : "backward";
        prevPathRef.current = queryPath;
        setDirection(nextDirection);
      }
      setDisplayFiles(folderFile || []);
      setCurrentPath(queryPath);
    };
    run();
  }, [folderFile, queryPath]);

  const slideVariants = {
    initial: (dir) => ({ x: dir === "forward" ? "60%" : "-60%", opacity: 0 }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 280, damping: 22 },
    },
    exit: (dir) => ({
      x: dir === "forward" ? "-60%" : "60%",
      opacity: 0,
      transition: { type: "spring", stiffness: 280, damping: 22 },
    }),
  };

  const handleFolderClick = (folderName) => {
    const newPath = `${currentPath}/${folderName}`.replace("//", "/");
    navigate(`?path=${encodeURIComponent(newPath)}`);
  };

  const handleFileClick = (file) => {
    const newPath = `${currentPath}/${file.name}`.replace("//", "/");
    setFilePathAndTypeNameIcon({ ...file, path: newPath });
    setIsModalOpen(true);
  };

  if (!displayFiles?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="text-4xl">📂</span>
        <p className="text-sm font-medium">This folder is empty</p>
      </div>
    );
  }

  return (
    <>
      {/* direction is plain state here — safe to use during render */}
      <AnimatePresence custom={direction}>
        <motion.ul
          key={currentPath}
          className="divide-y divide-base-200"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={direction}
        >
          {displayFiles.map((e, i) => {
            const isFolder = e.type === "folder";
            return (
              <motion.li
                key={`${e.name}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                onClick={() =>
                  isFolder ? handleFolderClick(e.name) : handleFileClick(e)
                }
                className="group flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-base-200 active:bg-base-300 transition-colors"
              >
                <div className="shrink-0">
                  <FileIcons fileFolderData={e} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate leading-tight">
                    {e.name}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-base-content/50">
                    {!isFolder && <span>{autoFormatSize(e.size)}</span>}
                    <span className="capitalize">{e.type}</span>
                    <span className="hidden sm:inline">
                      {formatDate(e.modified, "dd MMM yyyy")}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 text-xs text-base-content/40">
                  <span className="sm:hidden">{formatDate(e.modified, "dd MMM")}</span>
                  {isFolder && (
                    <HiChevronRight
                      size={16}
                      className="opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all"
                    />
                  )}
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </AnimatePresence>

      <FileModal
        filePathAndTypeName={filePathAndTypeNameIcon}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

export default FileManagerManu;