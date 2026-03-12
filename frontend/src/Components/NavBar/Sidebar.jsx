import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { RiMenu2Line } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
const navLinks = [
  { name: "File Manager", to: "/" },
  { name: "Manga Reader", to: "/manga-reader" },
  { name: "Manga Downloader", to: "/manga-downloader" },
  { name: "Video Player", to: "/video-player" },
];
const Sidebar = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const toggleMenu = () => setMenuIsOpen(!menuIsOpen);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setMenuIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Sidebar container animation
  const sidebarVariants = {
    hidden: { x: "-100%" },
    show: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 25,
        staggerChildren: 0.1, // stagger menu items
      },
    },
    exit: { x: "-100%", transition: { duration: 0.2 } },
  };

  // Menu item animation
  const itemVariants = {
    hidden: { x: -50, opacity: 0 },
    show: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div>
      {/* Menu button */}
      <motion.div
        whileTap={{ scale: 0.9 }}
        onClick={toggleMenu}
        className="hover:bg-base-300 p-1 rounded-xl cursor-pointer z-50"
      >
        <RiMenu2Line size={25} />
      </motion.div>

      <AnimatePresence>
        {menuIsOpen && (
          <>
            {/* Overlay */}
            <motion.div
              onClick={() => setMenuIsOpen(false)}
              className="fixed top-0 left-0 h-screen w-screen bg-white/75 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Sidebar */}
            <motion.ul
              className="fixed top-0 left-0 h-screen w-64 pt-12 py-5 px-2 text-lg font-semibold menu glass"
              variants={sidebarVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {navLinks.map((item, i) => (
                <motion.li variants={itemVariants} key={item.name + i}>
                  <NavLink
                    to={item.to}
                    onClick={() => setMenuIsOpen(false)}
                    className={({ isActive }) =>
                      `px-2 p-1 block w-full rounded-lg ${
                        isActive ? "menu-active" : ""
                      }`
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
