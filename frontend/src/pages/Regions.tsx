import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Edit3, Trash2, Plus, X, Globe, Navigation } from "lucide-react";
import API from "../services/api";

interface Region {
  id: number;
  name: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
}

const Regions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    district: "",
    state: "",
    latitude: "",
    longitude: "",
  });

  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await API.get("/regions");
      setRegions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: "", district: "", state: "", latitude: "", longitude: "" });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };

      if (editingId) {
        await API.put(`/regions/${editingId}`, payload);
      } else {
        await API.post("/regions", payload);
      }

      fetchRegions();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (region: Region) => {
    setEditingId(region.id);
    setForm({
      name: region.name,
      district: region.district,
      state: region.state,
      latitude: region.latitude?.toString() || "",
      longitude: region.longitude?.toString() || "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this region?")) return;
    try {
      await API.delete(`/regions/${id}`);
      fetchRegions();
    } catch (err) {
      console.error(err);
    }
  };

  if (role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10 bg-red-50 dark:bg-red-500/10 rounded-3xl border border-red-100 dark:border-red-500/20">
          <p className="text-red-500 font-black text-xl">ACCESS RESTRICTED</p>
          <p className="text-slate-500 mt-2">Only administrators can manage geographical nodes.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-10 p-2"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
            Geographical Nodes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Configure and manage region deployment data.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 px-6 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Regions</span>
          <p className="text-2xl font-black text-blue-600">{regions.length}</p>
        </div>
      </header>

      {/* PREMIUM FORM SECTION */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Globe size={120} className="text-blue-600" />
        </div>

        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          {editingId ? <Edit3 size={20} className="text-amber-500" /> : <Plus size={20} className="text-blue-500" />}
          {editingId ? "Modify Existing Node" : "Register New Node"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[
            { name: "name", placeholder: "Region Identity", icon: <MapPin size={16}/> },
            { name: "district", placeholder: "District", icon: null },
            { name: "state", placeholder: "State", icon: null },
            { name: "latitude", placeholder: "Latitude", icon: <Navigation size={16}/> },
            { name: "longitude", placeholder: "Longitude", icon: <Navigation size={16}/> },
          ].map((field) => (
            <div key={field.name} className="space-y-1">
              <input
                name={field.name}
                value={(form as any)[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700 dark:text-slate-200"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg transition-all ${
              editingId 
              ? "bg-amber-500 text-white shadow-amber-500/20" 
              : "bg-blue-600 text-white shadow-blue-500/20"
            }`}
          >
            {editingId ? "Update Configuration" : "Deploy Region"}
          </motion.button>

          {editingId && (
            <button onClick={resetForm} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          )}
        </div>
      </section>

      {/* REGION CARDS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {regions.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              className="group bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <MapPin size={24} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(r)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{r.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-4">{r.district}, {r.state}</p>
              
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <span>LAT: {r.latitude?.toFixed(4)}</span>
                <span>LNG: {r.longitude?.toFixed(4)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>
    </motion.div>
  );
};

export default Regions;