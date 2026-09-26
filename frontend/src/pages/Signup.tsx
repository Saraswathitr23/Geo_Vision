import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Building, Shield, Lock, ArrowRight } from "lucide-react";
import API from "../services/api";
import AuthLayout from "../components/layout/AuthLayout";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    organization: "",
    role: "public"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/register", form);
      navigate("/login");
    } catch {
      setError("Email or Mobile already exists in our registry.");
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: "name", placeholder: "Full Identity", icon: <User size={18} />, type: "text" },
    { name: "email", placeholder: "Official Email", icon: <Mail size={18} />, type: "email" },
    { name: "mobile", placeholder: "Contact Number", icon: <Phone size={18} />, type: "text" },
    { name: "organization", placeholder: "Organization Name", icon: <Building size={18} />, type: "text" },
    { name: "password", placeholder: "Access Password", icon: <Lock size={18} />, type: "password" },
  ];

  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 dark:bg-slate-950 p-6">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white dark:border-slate-800 transition-all relative z-10"
        >
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
              <Shield className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create Identity</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-sm">Join the global poverty intelligence network.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ x: -10 }} animate={{ x: 0 }}
              className="bg-red-50 dark:bg-red-500/10 text-red-500 p-4 rounded-2xl text-xs font-bold text-center mb-6 border border-red-100 dark:border-red-500/20 uppercase tracking-widest"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inputFields.map((field) => (
                <div key={field.name} className={`${field.name === 'password' ? 'sm:col-span-2' : ''} relative group`}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    {field.icon}
                  </div>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700 dark:text-slate-200"
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  />
                </div>
              ))}

              <div className="sm:col-span-2 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Shield size={18} />
                </div>
                <select
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="public">Public Viewer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? "Registering..." : "Initialize Registry"}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          <p className="text-center mt-10 text-xs font-bold uppercase tracking-widest text-slate-400">
            Already registered?{" "}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline">
              Enter Session
            </Link>
          </p>
        </motion.div>
      </div>
    </AuthLayout>
  );
};

export default Signup;