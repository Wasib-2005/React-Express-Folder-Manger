import { useNavigate } from "react-router-dom";
import { formatDate } from "../../Utilities/formatDate";
import { autoFormatSize } from "../../Utilities/formatSize";
import FileIcons from "../../Utilities/FileIcons";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import FileModal from "./FileModal";

const FileManagerManu = ({ fileFolderPathData }) => {
  const navigate = useNavigate();
  const { folderFile, location } = fileFolderPathData;

  const [currentPath, setCurrentPath] = useState(location);
  const [displayFiles, setDisplayFiles] = useState(folderFile || []);

  const [filePathAndTypeNameIcon, setFilePathAndTypeNameIcon] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    setDisplayFiles(folderFile || []);
    setCurrentPath(location);
  }, [folderFile, location]);

  // Animation variants for sliding folders
  const slideVariants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { x: "-100%", opacity: 0, transition: { duration: 0 } },
  };

  const handleFolderClick = (folderName) => {
    const newPath = `${currentPath}/${folderName}`;
    setDisplayFiles([]); // trigger exit animation
    setTimeout(() => {
      navigate(`?path=${newPath}`);
    }, 300); // match exit duration
  };

  const handleFileClick = (file, type) => {
    const newPath = `${currentPath}/${file.name}`;
    setFilePathAndTypeNameIcon({ newPath, type, ...file});
    setIsModalOpen(true);

    // window.open(
    //   `${import.meta.env.VITE_API_URL}/api/file/${encodeURIComponent(newPath)}`,
    //   "_blank",
    // );
  };

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.ul
          key={currentPath} // key ensures AnimatePresence treats it as new content
          className="grid gap-1"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
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
