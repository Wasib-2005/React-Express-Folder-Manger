import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { RiMenu2Line, RiCloseLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "File Manager", to: "/" },
  { name: "Manga Selector", to: "/manga-selector" },
  { name: "Manga Reader", to: "/manga-reader", isHidden: true },
  { name: "Manga Downloader", to: "/manga-downloader" },
  { name: "Video Player", to: "/video-player" },
];

const visibleLinks = navLinks.filter((l) => !l.isHidden);

// ── Variants ──────────────────────────────────────────────────────────────────
const sidebarVariants = {
  hidden: { x: "-100%", opacity: 0.8 },
  show: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 28,
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
  exit: {
    x: "-100%",
    opacity: 0.8,
    transition: {
      type: "spring",
      stiffness: 340,
      damping: 32,
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { x: -24, opacity: 0, filter: "blur(4px)" },
  show: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
  exit: {
    x: -12,
    opacity: 0,
    filter: "blur(3px)",
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const close = () => setMenuIsOpen(false);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div>
      {/* ── Toggle button — sits in normal flow, no z fighting ── */}
      <motion.button
        onClick={() => setMenuIsOpen((o) => !o)}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1 }}
        className="hover:bg-base-300 p-1.5 rounded-xl cursor-pointer"
        aria-label="Toggle menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          {menuIsOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.16 }}
              style={{ display: "block" }}
            >
              <RiCloseLine size={25} />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.16 }}
              style={{ display: "block" }}
            >
              <RiMenu2Line size={25} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/*
        AnimatePresence must wrap a SINGLE child to track enter/exit correctly.
        We use a single <motion.div> that covers the whole screen as the portal
        root — the overlay is its background, the sidebar is positioned inside it.
      */}
      <AnimatePresence>
        {menuIsOpen && (
          <motion.div
            key="menu-root"
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Foggy backdrop — fills the root div, click anywhere to close */}
            <div
              className="absolute inset-0 cursor-pointer"
              style={{
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(0,0,0,0.25)",
              }}
              onClick={close}
            />

            {/* Sidebar panel — positioned inside the root, stopPropagation so
                clicking the panel itself doesn't bubble up to the backdrop */}
            <motion.nav
              className="absolute top-0 left-0 h-full w-56 flex flex-col shadow-2xl border-r border-base-300/40"
              style={{
                backdropFilter: "blur(24px) saturate(1.4)",
                backgroundColor:
                  "color-mix(in srgb, var(--color-base-100) 70%, transparent)",
              }}
              variants={sidebarVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <motion.div
                variants={itemVariants}
                className="px-4 pt-5 pb-3 border-b border-base-300/70"
              >
                <p className="font-bold tracking-widest uppercase text-xs text-base-content/40">
                  Menu
                </p>
              </motion.div>

              {/* Links */}
              <ul className="flex-1 px-2 py-3 flex flex-col gap-0.5">
                {visibleLinks.map((item) => (
                  <motion.li key={item.name} variants={itemVariants}>
                    <NavLink
                      to={item.to}
                      onClick={close}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-primary/90 text-primary-content shadow"
                            : "hover:bg-base-300/50 text-base-content"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <motion.span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isActive ? "bg-primary-content" : "bg-base-content/20"
                            }`}
                            animate={{ scale: isActive ? 1.5 : 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 18 }}
                          />
                          {item.name}
                        </>
                      )}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              {/* Footer */}
              <motion.div
                variants={itemVariants}
                className="px-4 py-3 border-t border-base-300/40"
              >
                <p className="text-xs text-base-content/25">Esc to close</p>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;