// Sidebar.jsx
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { RiMenu2Line } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "File Manager", to: "/" },
  { name: "Manga Selector", to: "/manga-selector" },
  { name: "Manga Reader", to: "/manga-reader", isHidden: true },
  { name: "Manga Downloader", to: "/manga-downloader" },
  { name: "Video Player", to: "/video-player" },
];

const routeColors = {
  "/":                  "#2563eb",
  "/manga-selector":    "#7c3aed",
  "/manga-reader":      "#dc2626",
  "/manga-downloader":  "#059669",
  "/video-player":      "#d97706",
};

const NAVBAR_HEIGHT = 57;

const Sidebar = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const location = useLocation();
  const accentColor = routeColors[location.pathname] ?? "#2563eb";

  const toggleMenu = () => setMenuIsOpen(!menuIsOpen);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setMenuIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const sidebarVariants = {
    hidden: { x: "-100%" },
    show: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 25,
        staggerChildren: 0.07,
        delayChildren: 0.05,
      },
    },
    exit: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const itemVariants = {
    hidden: { x: -30, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
  };

  return (
    <div className="flex-shrink-0">
      {/* Menu button */}
      <motion.div
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={toggleMenu}
        className="p-1 rounded-xl cursor-pointer transition-colors duration-150"
        style={{ color: accentColor }}
      >
        <RiMenu2Line size={25} />
      </motion.div>

      <AnimatePresence>
        {menuIsOpen && (
          <>
            {/* Overlay */}
            <motion.div
              onClick={() => setMenuIsOpen(false)}
              className="fixed inset-0"
              style={{
                zIndex: 80,
                top: NAVBAR_HEIGHT,
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                backgroundColor: `${accentColor}08`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />

            {/* Sidebar panel */}
            <motion.ul
              className="fixed left-0 w-64 py-3 px-2 text-lg font-semibold menu"
              style={{
                zIndex: 90,
                top: NAVBAR_HEIGHT,
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                backgroundColor: "rgba(233, 231, 231, 0.82)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                borderRight: `1px solid ${accentColor}44`,
                boxShadow: `4px 0 24px ${accentColor}22`,
              }}
              variants={sidebarVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {/* Accent top strip */}
              <motion.div
                className="w-full h-px mb-3 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${accentColor}, transparent)`,
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />

              {navLinks.map((item, i) => (
                <motion.li
                  variants={itemVariants}
                  key={item.name + i}
                  className={`${item?.isHidden ? "hidden" : ""}`}
                >
                  <NavLink
                    to={item.to}
                    onClick={() => setMenuIsOpen(false)}
                    className={({ isActive }) =>
                      `px-2 p-1 block w-full rounded-lg transition-colors duration-150 ${
                        isActive ? "menu-active" : ""
                      }`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? {
                            color: accentColor,
                            backgroundColor: `${accentColor}18`,
                          }
                        : { color: "#374151" }
                    }
                  >
                    {item.name}
                  </NavLink>
                </motion.li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;