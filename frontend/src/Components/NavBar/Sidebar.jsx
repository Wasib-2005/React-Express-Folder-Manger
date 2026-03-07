import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { RiMenu2Line } from "react-icons/ri";

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

  return (
    <div>
      <div onClick={toggleMenu} className="hover:bg-base-300 p-1 rounded-xl">
        <RiMenu2Line size={25} />
      </div>

      {/* Overlay */}
      <div
        onClick={() => setMenuIsOpen(false)}
        className={`fixed top-0 left-0 h-screen w-screen bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          menuIsOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Sidebar */}
      <ul
        className={`fixed top-0 left-0 h-screen w-64 pt-12 py-5 px-2 text-lg font-semibold menu glass transform transition-transform duration-300 ${
          menuIsOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <li>
          <NavLink
            to="/"
            onClick={() => setMenuIsOpen(false)}
            className={({ isActive }) =>
              `px-2 p-1 block w-full rounded-lg ${
                isActive ? "menu-active" : ""
              }`
            }
          >
            File Manager
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/anime"
            onClick={() => setMenuIsOpen(false)}
            className={({ isActive }) =>
              `px-2 p-1 block w-full rounded-lg ${
                isActive ? "menu-active" : ""
              }`
            }
          >
            Anime
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/video-player"
            onClick={() => setMenuIsOpen(false)}
            className={({ isActive }) =>
              `px-2 p-1 block w-full rounded-lg ${
                isActive ? "menu-active" : ""
              }`
            }
          >
            Video Player
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;