import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Filter, Calendar, BarChart, ShieldCheck } from "lucide-react";
import API from "../services/api";

interface Analysis {
  id: number;
  poverty_level: string;
  poverty_score: number;
  confidence: number;
  created_at: string;
}

const Reports = () => {
  const [reports, setReports] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadCount, setDownloadCount] = useState(1);
  const role = localStorage.getItem("role") || "public";

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Backend-la unga reports endpoint call panrom
      const res = await API.get("/reports"); 
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await API.get("/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      
      // UNIQUE FILENAME LOGIC (1, 2, 3...)
      const fileName = `Poverty_Report_${downloadCount}.csv`;
      link.setAttribute("download", fileName);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Increment count for next download
      setDownloadCount(prev => prev + 1);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-xs">Generating Document Store...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 space-y-10"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <FileText size={20} />
            <span className="font-black uppercase tracking-[0.3em] text-[10px]">Registry Module</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">
            ANALYTICS REPORTS
          </h1>
        </div>
        
        {role === "admin" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="flex items-center gap-3 bg-slate-900 dark:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/20"
          >
            <Download size={18} />
            Export CSV ({downloadCount})
          </motion.button>
        )}
      </header>

      {/* FILTER SECTION */}
      <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <Filter size={20} className="text-slate-400" />
          <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Intelligence Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <select className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-600 dark:text-slate-300 transition-all appearance-none cursor-pointer">
            <option>All Poverty Levels</option>
            <option>High Priority</option>
            <option>Medium Risk</option>
            <option>Stable (Low)</option>
          </select>

          <div className="relative">
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input
              type="date"
              className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-600 dark:text-slate-300 transition-all"
            />
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-500/5 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/10 flex items-center gap-4">
             <BarChart className="text-indigo-600" size={24} />
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Archived Entries</p>
                <p className="text-xl font-black text-indigo-600">{reports.length}</p>
             </div>
          </div>
        </div>
      </section>

      {/* REPORTS TABLE */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="p-8">Reference ID</th>
                <th className="p-8">Classification</th>
                <th className="p-8 text-center">Confidence</th>
                <th className="p-8 text-center">Timestamp</th>
                <th className="p-8 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence>
                {reports.map((r) => (
                  <motion.tr 
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all"
                  >
                    <td className="p-8 font-black text-slate-400 text-xs">#PX-{r.id.toString().padStart(4, '0')}</td>
                    <td className="p-8">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        r.poverty_level === 'High' 
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' 
                        : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      }`}>
                        {r.poverty_level}
                      </span>
                    </td>
                    <td className="p-8 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-black text-slate-700 dark:text-slate-300">{r.confidence.toFixed(1)}%</span>
                        <div className="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <div className="bg-indigo-500 h-full" style={{ width: `${r.confidence}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-center text-xs font-bold text-slate-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-8 text-center">
                      <ShieldCheck className="inline-block text-emerald-500" size={20} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
};

export default Reports;