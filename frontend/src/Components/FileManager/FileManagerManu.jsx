import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDate } from "../../Utilities/formatDate";
import { autoFormatSize } from "../../Utilities/formatSize";
import FileIcons from "../../Utilities/FileIcons";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import FileModal from "./FileModal";

const FileManagerManu = ({ fileFolderPathData }) => {
  const navigate = useNavigate();
  const { folderFile, location } = fileFolderPathData;

  const [currentPath, setCurrentPath] = useState(location || "/");
  const [displayFiles, setDisplayFiles] = useState(folderFile || []);
  const [filePathAndTypeNameIcon, setFilePathAndTypeNameIcon] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(true);

  const [direction, setDirection] = useState("forward"); // forward = right to left
  const prevPathRef = useRef(location || "/"); // always start with a string

  const [searchParams] = useSearchParams();
  const queryPathRaw = searchParams.get("path") || location || "/";
  const queryPath = decodeURIComponent(queryPathRaw); // decode %2F to /

  useEffect(() => {
    const prevPath = prevPathRef.current || "/"; // fallback if undefined

    if (prevPath !== queryPath) {
      const prevSegments = prevPath.split("/").filter(Boolean);
      const currSegments = queryPath.split("/").filter(Boolean);

      setDirection(
        currSegments.length > prevSegments.length ? "forward" : "backward",
      );
      prevPathRef.current = queryPath; // update ref
    }

    setDisplayFiles(folderFile || []);
    setCurrentPath(queryPath);
  }, [folderFile, queryPath]);

  const slideVariants = {
    initial: (dir) => ({
      x: dir === "forward" ? "100%" : "-120%",
      opacity: 1,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 250, // higher = faster spring
        damping: 15, // higher = less bouncy
      },
    },
    exit: (dir) => ({
      x: dir === "forward" ? "-120%" : "100%",
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 15,
      },
    }),
  };

  const handleFolderClick = (folderName) => {
    const newPath = `${currentPath}/${folderName}`;
    navigate(`?path=${encodeURIComponent(newPath)}`); // encode for URL
  };

  const handleFileClick = (file, type) => {
    const newPath = `${currentPath}/${file.name}`;
    setFilePathAndTypeNameIcon({ newPath, type, ...file });
    setIsModalOpen(true);
  };

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.ul
          key={currentPath}
          className="grid gap-1"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          custom={direction}
        >
          <hr />
          {displayFiles?.map((e, i) => (
            <li
              key={`${e.name}-${i}`}
              className="grid px-2"
              onClick={() =>
                e.type === "folder"
                  ? handleFolderClick(e.name)
                  : handleFileClick(e, e.type)
              }
            >
              <span className="gap-2">
                <span className="px-1 py-2 btn btn-ghost h-auto w-full text-left flex">
                  <FileIcons fileFolderData={e} />
                  <span className="w-full">
                    <span className="font-bold text-xl text-wrap">
                      {e.name}
                    </span>
                    <span className="flex justify-between">
                      <span className="font-normal">
                        Size: {autoFormatSize(e.size)}
                      </span>
                      <span className="font-normal">
                        Created: {formatDate(e.created, "dd MMM yyyy")}
                      </span>
                    </span>
                    <span className="flex justify-between">
                      <span className="font-normal">Type: {e.type}</span>
                      <span className="font-normal">
                        Modified: {formatDate(e.modified, "dd MMM yyyy")}
                      </span>
                    </span>
                  </span>
                </span>
              </span>
              <hr className="mt-1" />
            </li>
          ))}
        </motion.ul>
        <FileModal
          filePathAndTypeName={filePathAndTypeNameIcon}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      </AnimatePresence>
    </div>
  );
};

export default FileManagerManu;
