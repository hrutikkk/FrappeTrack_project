import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { MdArtTrack } from "react-icons/md";
import fav from "../assets/favicon.webp";
import { useAuthStore } from "../store/authStore";

const SideBar = ({ children }) => {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);

  // Helper: closes sidebar only on mobile
  const handleLinkClick = () => {
    if (window.innerWidth < 640) { // sm breakpoint
      setOpen(false);
    }
  };

  return (
    <>
      {/* Hamburger button (mobile only) */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-200 shadow"
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 sm:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-gradient-to-br from-blue-300 via-indigo-200 to-purple-200 overflow-y-auto transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
      >
        <div className="p-4">
          {/* Profile */}
          <div className="flex flex-col items-center mt-10 mb-6">
            <img
              src={user?.employee?.image || fav}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-lg object-cover"
            />
            <span className="mt-2 font-semibold">{user?.name}</span>
          </div>

          {/* Links */}
          <ul className="space-y-2">
            <li>
              <Link
                to="/user-profile"
                onClick={handleLinkClick} // close on click
                className="flex items-center px-2 py-2 rounded hover:bg-gray-100"
              >
                <FaUser className="w-5 h-5" />
                <span className="ml-3">Profile</span>
              </Link>
            </li>
            <li>
              <Link
                to="/time-tracker"
                onClick={handleLinkClick} // close on click
                className="flex items-center px-2 py-2 rounded hover:bg-gray-100"
              >
                <MdArtTrack className="w-5 h-5" />
                <span className="ml-3">Tracker</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      {/* Page Content */}
      <div className="transition-all duration-300 ml-0 sm:ml-64">
        {children}
      </div>
    </>
  );
};

export default SideBar;
