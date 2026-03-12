// NavBar.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";

const routeColors = {
  "/":                  "#2563eb", // bold blue   — File Manager
  "/manga-selector":    "#7c3aed", // deep purple — Manga Selector
  "/manga-reader":      "#dc2626", // strong red  — Manga Reader
  "/manga-downloader":  "#059669", // forest green — Manga Downloader
  "/video-player":      "#d97706", // amber        — Video Player
};

const NavBar = () => {
  const location = useLocation();

  const segments =
    location.pathname === "/"
      ? ["File Manager"]
      : location.pathname
          .slice(1)
          .split("/")
          .map((seg) =>
            seg.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
          );
  const title = segments[segments.length - 1];
  const titleColor = routeColors[location.pathname] ?? "#2563eb";

  return (
    <nav
      className="fixed top-0 left-0 w-screen"
      style={{
        zIndex: 100,
        backgroundColor: "rgba(233, 231, 231, 0.75)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${titleColor}33`,
        boxShadow: `0 4px 24px ${titleColor}18`,
        transition: "border-color 0.4s ease, box-shadow 0.4s ease",
      }}
    >
      <div className="flex items-center h-14 px-3 gap-3">
        <Sidebar />

        {/* Divider */}
        <div
          className="h-6 w-px flex-shrink-0"
          style={{ background: `${titleColor}44` }}
        />

        {/* Animated title */}
        <h1
          className="font-bold text-xl flex items-center overflow-hidden"
          style={{ color: titleColor }}
        >
          <AnimatePresence mode="wait">
            {title.split("").map((char, i) => (
              <motion.span
                key={char + i + title}
                initial={{ rotateX: -90, opacity: 0, y: 6 }}
                animate={{ rotateX: 0, opacity: 1, y: 0 }}
                exit={{ rotateX: 90, opacity: 0, y: -6 }}
                transition={{ delay: i * 0.035, duration: 0.28, ease: "easeOut" }}
                className="inline-block"
                style={{ transformOrigin: "50% 50%" }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </AnimatePresence>
        </h1>

        <div className="flex-1" />

        {/* Route pill */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${titleColor}14`,
              border: `1px solid ${titleColor}44`,
              color: titleColor,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: titleColor,
                boxShadow: `0 0 6px ${titleColor}`,
              }}
            />
            {title}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom shimmer line */}
      <motion.div
        key={location.pathname}
        className="h-px w-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${titleColor}44 30%, ${titleColor} 55%, ${titleColor}44 80%, transparent 100%)`,
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </nav>
  );
};

export default NavBar;