import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";

const NavBar = () => {
  const location = useLocation();

  const title =
    location.pathname === "/"
      ? "File Manager"
      : location.pathname
          .slice(1)
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

  return (
    <div className="p-4 fixed glass w-screen flex items-center gap-3">
      <Sidebar />

      <h1 className="font-bold text-2xl flex">
        <AnimatePresence mode="wait">
          {title.split("").map((char, i) => (
            <motion.span
              key={char + i + title}
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={{
                delay: i * 0.04,
                duration: 0.3,
              }}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </AnimatePresence>
      </h1>
    </div>
  );
};

export default NavBar;