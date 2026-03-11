import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./Components/NavBar/NavBar";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [showButton, setShowButton] = useState(null); // "up" | "down" | null
  const lastScrollY = useRef(0);
  const hideTimer = useRef(null);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const scrollTopPos = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    const delta = scrollTopPos - lastScrollY.current;
    lastScrollY.current = scrollTopPos;

    // Top
    if (scrollTopPos <= 50) setShowButton("down");

    // Bottom
    else if (scrollTopPos + clientHeight >= scrollHeight - 50)
      setShowButton("up");

    // Direction
    else if (delta > 0) setShowButton("down");
    else if (delta < 0) setShowButton("up");

    // Auto hide
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setShowButton(null);
    }, 1500);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    requestAnimationFrame(handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <>
      <NavBar />

      <div className="min-h-[calc(100vh-70px)] pt-18">
        <Outlet />
      </div>

      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.9, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25 }}
            className="fixed right-4 bottom-20 z-50"
          >
            {showButton === "up" && (
              <button
                onClick={scrollTop}
                className="btn btn-circle btn-info w-12 h-12"
              >
                ↑
              </button>
            )}

            {showButton === "down" && (
              <button
                onClick={scrollBottom}
                className="btn btn-circle btn-info w-12 h-12"
              >
                ↓
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;