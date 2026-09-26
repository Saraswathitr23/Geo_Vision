import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Database, Search, Download, MapPin, School, Hospital, Truck, Droplets, Users } from "lucide-react";
import API from "../services/api";

const RegionList = () => {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAllDetails();
  }, []);

  const fetchAllDetails = async () => {
    try {
      const res = await API.get("/all-data");
      setDataList(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic for search
  const filteredData = dataList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
      />
      <p className="mt-6 font-black text-indigo-900 dark:text-indigo-400 animate-pulse uppercase tracking-[0.3em] text-sm">
        Compiling Global Assets
      </p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto min-h-screen"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 text-indigo-600 dark:text-indigo-400">
            <Database size={24} />
            <span className="font-black uppercase tracking-[0.2em] text-xs">Infrastructure Hub</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            GEO-INVENTORY
          </h1>
        </div>

        {/* SEARCH & STATS */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search nodes..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-slate-900 dark:bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Nodes</span>
            <span className="text-2xl font-black">{filteredData.length}</span>
          </div>
        </div>
      </div>

      {/* DATA TABLE CONTAINER */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-[0.15em]">
                <th className="p-8">Location Identity</th>
                <th className="p-8 text-center"><div className="flex flex-col items-center gap-1"><School size={16}/> Education</div></th>
                <th className="p-8 text-center"><div className="flex flex-col items-center gap-1"><Hospital size={16}/> Health</div></th>
                <th className="p-8 text-center"><div className="flex flex-col items-center gap-1"><Truck size={16}/> Logistics</div></th>
                <th className="p-8 text-center"><div className="flex flex-col items-center gap-1"><Droplets size={16}/> Water</div></th>
                <th className="p-8 text-center"><div className="flex flex-col items-center gap-1"><Users size={16}/> Population</div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredData.map((item) => (
                <motion.tr 
                  key={item.id} 
                  whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.03)" }}
                  className="transition-all group"
                >
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 dark:text-slate-100 text-lg uppercase tracking-tight">{item.name}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <MapPin size={10} /> {item.district}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-8 text-center">
                    <span className="text-xl font-black text-slate-700 dark:text-slate-300">{item.schools || 0}</span>
                  </td>
                  
                  <td className="p-8 text-center">
                    <span className="text-xl font-black text-slate-700 dark:text-slate-300">{item.hospitals || 0}</span>
                  </td>
                  
                  <td className="p-8">
                    <div className="flex flex-col items-center min-w-[100px]">
                      <span className="text-xs font-black text-slate-500 mb-2">{item.road_coverage || 0}%</span>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.road_coverage || 0}%` }}
                          className="bg-indigo-600 h-full rounded-full" 
                        />
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-8">
                    <div className="flex flex-col items-center min-w-[100px]">
                      <span className="text-xs font-black text-cyan-600 mb-2">{item.water_access || 0}%</span>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.water_access || 0}%` }}
                          className="bg-cyan-500 h-full rounded-full" 
                        />
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-8 text-center">
                    <div className="bg-slate-50 dark:bg-slate-800/50 py-2 px-4 rounded-xl border border-slate-100 dark:border-slate-800 inline-block">
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                        {item.population?.toLocaleString() || 0}
                      </p>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default RegionList;