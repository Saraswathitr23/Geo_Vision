import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const AuthHeader = () => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="
        h-20
        bg-white/70 dark:bg-slate-950/80
        backdrop-blur-xl
        border-b border-slate-200 dark:border-slate-800
        flex items-center justify-between px-8
        sticky top-0 z-50
        transition-all duration-300
      "
    >
      {/* BRAND LOGO */}
      <Link to="/" className="group flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
          <ShieldCheck className="text-white" size={24} />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            GeoVision
          </span>
          <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 dark:text-blue-400 uppercase leading-none">
            Intelligence
          </span>
        </div>
      </Link>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
             Interface Mode
           </p>
        </div>
        <ThemeToggle />
      </div>
    </motion.header>
  );
};

export default AuthHeader;