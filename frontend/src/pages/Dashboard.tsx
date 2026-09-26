import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Globe, AlertTriangle,  CheckCircle, BarChart3, PieChart as PieIcon } from "lucide-react";

const COLORS = ["#f43f5e", "#fbbf24", "#10b981"]; // Modern Red, Yellow, Green

const Dashboard = () => {
  const [data, setData] = useState({ total_regions: 0, high: 0, medium: 0, low: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-indigo-600 font-black text-xl tracking-widest uppercase"
      >
        Syncing Intelligence...
      </motion.div>
    </div>
  );

  const chartData = [
    { name: "High", value: data.high },
    { name: "Medium", value: data.medium },
    { name: "Low", value: data.low },
  ];

  const stats = [
    { label: "Total Regions", value: data.total_regions, icon: <Globe />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "High Risk", value: data.high, icon: <AlertTriangle />, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Medium Risk", value: data.medium, icon: <BarChart3 />, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Low Risk", value: data.low, icon: <CheckCircle />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 p-2"
    >
      <header>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time poverty intelligence and regional insights.</p>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PIE CHART */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <PieIcon className="text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Poverty Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
            
<Pie
  data={chartData}
  dataKey="value"
  innerRadius={70}
  outerRadius={100}
  paddingAngle={8}
  cornerRadius={10}
  
  label={({ name, percent }) => 
    percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : ""
  }
>
  {chartData.map((_, index) => (
    <Cell key={index} fill={COLORS[index]} className="outline-none" />
  ))}
</Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* BAR CHART */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Risk Comparison</h2>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '16px' }} />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;