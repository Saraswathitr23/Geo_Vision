import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Search, CheckCircle, AlertCircle, Image as ImageIcon, Cpu } from "lucide-react";
import API from "../services/api";

const Analyze = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    poverty_level: string;
    confidence: number;
  } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      const res = await API.post("/upload", formData);
      setResult(res.data);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Analysis engine failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-4 space-y-10"
    >
      {/* HEADER */}
      <header className="text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-2 text-blue-600">
          <Cpu size={20} />
          <span className="font-black uppercase tracking-[0.3em] text-[10px]">Neural Engine Active</span>
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Satellite Intelligence
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Upload satellite imagery for automated socio-economic classification.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        
        {/* LEFT: UPLOAD SECTION */}
        <section className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
            <label className="group block cursor-pointer">
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 rounded-[2rem] text-center group-hover:border-blue-500 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-500/5 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={28} />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-bold text-lg">
                  Drop imagery here
                </p>
                <p className="text-sm text-slate-400 mt-1 font-medium">
                  RAW, PNG or JPEG (Max 10MB)
                </p>
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {preview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 relative rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl aspect-square"
              >
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                {loading && (
                  <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-white">
                      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="font-black uppercase text-[10px] tracking-widest">Scanning...</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpload}
              disabled={loading || !image}
              className="w-full mt-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 disabled:opacity-30 disabled:grayscale transition-all"
            >
              {loading ? "Processing..." : "Initiate Analysis"}
            </motion.button>
          </div>
        </section>

        {/* RIGHT: RESULT SECTION */}
        <section>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-900 dark:bg-blue-600 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                  <Search size={150} />
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-emerald-400" size={32} />
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Analysis Complete</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-1">Poverty Classification</p>
                      <p className={`text-5xl font-black ${result.poverty_level === 'High' ? 'text-rose-300' : 'text-emerald-300'}`}>
                        {result.poverty_level}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-2">Model Confidence</p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                          />
                        </div>
                        <span className="text-xl font-black">{result.confidence.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10 flex items-center gap-4 text-xs font-bold text-white/60">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Verified by AI  Model
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10 text-slate-400">
                <ImageIcon size={60} strokeWidth={1} className="mb-4 opacity-20" />
                <h3 className="text-xl font-black uppercase tracking-tight">Intelligence Pending</h3>
                <p className="max-w-[250px] mx-auto mt-2 font-medium">Please upload a valid satellite snapshot to generate an intelligence report.</p>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </motion.div>
  );
};

export default Analyze;