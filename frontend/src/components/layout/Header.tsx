import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../ui/ThemeToggle";

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const [dropdown, setDropdown] = useState(false);
  const [userName, setUserName] = useState("User");
  const [role, setRole] = useState("public");

  useEffect(() => {
    setUserName(localStorage.getItem("name") || "User");
    setRole(localStorage.getItem("role") || "public");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <header className="h-20 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40 transition-all duration-300">
      
      {/* LEFT SECTION */}
      <div className="flex items-center gap-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          onClick={onMenuClick}
        >
          ☰
        </motion.button>

        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            GeoVision
          </h1>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md w-fit uppercase tracking-wider mt-0.5 ${
            role === "admin" 
            ? "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" 
            : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          }`}>
            {role} Access
          </span>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">
        
       
        {role === "admin" && (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Link
              to="/notifications"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors block relative"
            >
              <span className="text-xl">🔔</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
            </Link>
          </motion.div>
        )}

        <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-800 mx-2 hidden md:block" />

        <ThemeToggle />

       
        <div className="relative">
          <motion.button
            whileHover={{ y: -1 }}
            onClick={() => setDropdown(!dropdown)}
            className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 hidden sm:block">
              {userName}
            </span>
            <span className={`text-[10px] transition-transform duration-300 ${dropdown ? 'rotate-180' : ''}`}>▼</span>
          </motion.button>

          <AnimatePresence>
            {dropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden"
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  👤 Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  🚪 Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add a notification bell with animation */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            🔔
          </motion.button>
          <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
        </div>

        {/* Enhance the search bar with animations */}
        <div className="relative w-1/3 hidden md:block">
          <motion.input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            whileFocus={{ scale: 1.02 }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;