import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

interface SidebarProps {
  open: boolean;
}

const Sidebar = ({ open }: SidebarProps) => {
  const role = localStorage.getItem("role") || "public";

  
  const menuItems = [
    { to: "/dashboard", label: "Dashboard", icon: "📊", color: "blue" },
    { to: "/regions", label: "Manage Regions", icon: "⚙️", color: "purple", adminOnly: true },
    { to: "/infrastructure", label: "Infrastructure", icon: "🧰", color: "purple", adminOnly: true },
    { to: "/atlas", label: "Geo Atlas", icon: "🗺️", color: "emerald" },
    { to: "/analyze", label: "AI Analyze", icon: "🛰️", color: "amber" },
    { to: "/reports", label: "Reports", icon: "📄", color: "purple", adminOnly: true },
    
  ];

  return (
    <aside
      className={`
        fixed md:static z-50 w-72 min-h-screen p-6
        bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl
        border-r border-slate-200 dark:border-slate-800
        transition-all duration-500 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      {/* Brand Logo Section */}
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white font-black text-xl">G</span>
        </div>
        <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
         GeoVision
        </h1>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          // Admin check
          if (item.adminOnly && role !== "admin") return null;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                relative group flex items-center gap-4 p-3.5 rounded-2xl font-semibold transition-all duration-300
                ${
                  isActive
                    ? "bg-gradient-to-r from-slate-900 to-slate-800 dark:from-blue-600 dark:to-blue-500 text-white shadow-xl shadow-blue-500/20"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Icon with Hover Animation */}
                  <motion.span 
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className={`text-xl ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}
                  >
                    {item.icon}
                  </motion.span>

                  <span className="tracking-wide text-sm">{item.label}</span>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      
      <div className="absolute bottom-10 left-6 right-6">
        <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{role} Access</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;