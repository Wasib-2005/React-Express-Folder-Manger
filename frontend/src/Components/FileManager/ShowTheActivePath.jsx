import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiPencilSquare, HiCheck, HiXMark, HiHome } from "react-icons/hi2";
import { useState, useRef, useEffect } from "react";

const ShowTheActivePath = ({ currentLocation }) => {
  const folderLocation = currentLocation?.split("/").filter(Boolean) || [];
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);
  const inputRef = useRef(null);

  // Focus & select when entering edit mode
  useEffect(() => {
    if (isEdit && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEdit]);

  const handleSave = () => {
    const val = inputRef.current?.value?.trim();
    if (val) navigate(`?path=${encodeURIComponent(val)}`);
    setIsEdit(false);
  };

  const handleCancel = () => setIsEdit(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  const urlMaker = (index) =>
    "/" + folderLocation.slice(0, index + 1).join("/");

  const crumbVariants = {
    hidden: { opacity: 0, x: -10 },
    show: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 },
    }),
  };

  return (
    <div className="flex items-center gap-2 w-full bg-base-200 rounded-xl px-3 py-2 border border-base-300 min-h-11">
      <AnimatePresence >
        {isEdit ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 w-full"
          >
            <input
              ref={inputRef}
              // Use defaultValue so the input is uncontrolled — avoids the
              // "sync setState in effect" pattern entirely
              defaultValue={currentLocation || "/"}
              onKeyDown={handleKeyDown}
              className="input input-sm input-bordered flex-1 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-info/50"
              placeholder="/path/to/folder"
            />
            <button
              onClick={handleSave}
              className="btn btn-sm btn-success btn-circle"
              title="Go"
            >
              <HiCheck size={15} />
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-sm btn-ghost btn-circle"
              title="Cancel"
            >
              <HiXMark size={15} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center flex-wrap gap-0.5 flex-1 min-w-0"
          >
            <motion.span
              custom={0}
              variants={crumbVariants}
              initial="hidden"
              animate="show"
              className="flex items-center"
            >
              <Link
                to="?path=%2F"
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-sm font-medium hover:bg-base-300 transition-colors"
              >
                <HiHome size={14} />
                <span className="hidden sm:inline">root</span>
              </Link>
            </motion.span>

            {folderLocation.map((seg, i) => (
              <motion.span
                key={`${seg}-${i}`}
                custom={i + 1}
                variants={crumbVariants}
                initial="hidden"
                animate="show"
                className="flex items-center"
              >
                <span className="text-base-content/30 text-sm select-none mx-0.5">/</span>
                <Link
                  to={`?path=${encodeURIComponent(urlMaker(i))}`}
                  className={`px-1.5 py-0.5 rounded-md text-sm transition-colors hover:bg-base-300 ${
                    i === folderLocation.length - 1
                      ? "font-bold text-base-content"
                      : "font-medium text-base-content/70"
                  }`}
                >
                  {seg}
                </Link>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!isEdit && (
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setIsEdit(true)}
          className="btn btn-ghost btn-sm btn-circle shrink-0 ml-auto"
          title="Edit path"
        >
          <HiPencilSquare size={16} />
        </motion.button>
      )}
    </div>
  );
};

export default ShowTheActivePath;