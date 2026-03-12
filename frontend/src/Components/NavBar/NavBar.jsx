import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";

const getTitle = (pathname) => {
  if (pathname === "/") return "File Manager";
  return pathname
    .slice(1)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// Animate the whole title as a unit (slide up + fade) keyed by route
// instead of per-character — avoids the "duplicate key" warning when
// two routes share letters, and feels snappier
const titleVariants = {
  initial: { y: 14, opacity: 0, filter: "blur(6px)" },
  animate: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 340, damping: 26 },
  },
  exit: {
    y: -10,
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

const NavBar = () => {
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 border-b border-base-300/40"
      style={{
        backdropFilter: "blur(20px) saturate(1.5)",
        backgroundColor: "color-mix(in srgb, var(--color-base-100) 75%, transparent)",
      }}
    >
      <Sidebar />

      {/* Divider */}
      <span className="w-px h-5 bg-base-300/60 shrink-0" />

      {/* Animated title */}
      <div className="overflow-hidden flex-1 py-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.h1
            key={location.pathname}
            className="font-bold text-xl tracking-tight"
            variants={titleVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {title}
          </motion.h1>
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default NavBar;