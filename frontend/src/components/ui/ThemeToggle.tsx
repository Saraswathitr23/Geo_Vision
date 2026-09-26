import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-center">
      <motion.button
        whileTap={{ scale: 0.9, rotate: 15 }}
        whileHover={{ scale: 1.1 }}
        onClick={toggleTheme}
        className="relative w-14 h-14 flex items-center justify-center rounded-2xl 
                   bg-slate-100 dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700 
                   shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === "dark" ? (
            <motion.span
              key="moon"
              initial={{ y: 20, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-2xl"
            >
              🌙
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ y: 20, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-2xl text-amber-500"
            >
              ☀️
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-blue-500/10 dark:to-yellow-500/5 opacity-0 hover:opacity-100 transition-opacity" />
      </motion.button>
    </div>
  );
};

export default ThemeToggle;