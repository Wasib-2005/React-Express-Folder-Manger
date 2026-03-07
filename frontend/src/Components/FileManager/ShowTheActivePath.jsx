import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit } from "react-icons/fa";
import { AiOutlineEnter } from "react-icons/ai";
import { useState, useRef, useEffect } from "react";

const ShowTheActivePath = ({ currentLocation }) => {
  const folderLocation = currentLocation?.split("/").filter(Boolean);
  const navigate = useNavigate();

  const [isEdit, setIsEdit] = useState(false);
  const inputRef = useRef(null);

  const urlMaker = (index) => {
    return "/" + folderLocation.slice(0, index + 1).join("/");
  };

  // Auto-focus input when isEdit becomes true
  useEffect(() => {
    if (isEdit && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEdit]);

  const handleSave = () => {
    if (inputRef.current) {
      navigate(`?path=${inputRef.current.value}`);
    }
    setIsEdit(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
  };

  // Framer Motion variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  const inputVariants = {
    hidden: { opacity: 0, width: 0 },
    show: { opacity: 1, width: "100%" },
  };

  return (
    <div className="flex gap-2 items-center justify-between w-full min-h-4 mt-2 z-0 p-2">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {isEdit ? (
            <motion.input
              key="input"
              ref={inputRef}
              className=" p-2 rounded-lg border border-base-300 w-full"
              defaultValue={currentLocation}
              onKeyDown={handleKeyDown}
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={inputVariants}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.h1
              key="breadcrumb"
              className="w-full flex flex-wrap gap-1"
              variants={container}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <motion.span variants={item}>
                <Link to={"?path=%2F"} className="hover:underline">
                  / &gt;
                </Link>
              </motion.span>

              {folderLocation?.map((e, i) => (
                <motion.span variants={item} key={`${e}${i}`}>
                  <Link to={`?path=${encodeURIComponent(urlMaker(i))}`}>
                    <span className="hover:underline font-semibold">{e}</span>
                    <span>{" > "}</span>
                  </Link>
                </motion.span>
              ))}
            </motion.h1>
          )}
        </AnimatePresence>
      </div>
      <div>
        <motion.div
          className="btn btn-ghost"
          onClick={() => {
            if (isEdit) handleSave();
            else setIsEdit(true);
          }}
          // whileHover={{ scale: 1.2, rotate: 10 }}
          // whileTap={{ scale: 0.9 }}
        >
          {isEdit ? <AiOutlineEnter size={24} /> : <FaEdit size={24} />}
        </motion.div>
      </div>
    </div>
  );
};

export default ShowTheActivePath;
