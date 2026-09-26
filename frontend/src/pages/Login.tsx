import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck } from "lucide-react";
import API from "../services/api";
import AuthLayout from "../components/layout/AuthLayout";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    login: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("role", res.data.role);

      navigate("/dashboard");
    } catch (err: any) {
      setError("Invalid credentials. Please verify your access key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden">
        
        {/* Background Decorative Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white dark:border-slate-800 relative z-10"
        >
          {/* Brand Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
              GeoVision
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-sm tracking-wide">
              Secure Terminal Access
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ x: -10 }} animate={{ x: 0 }}
              className="bg-red-50 dark:bg-red-500/10 text-red-500 p-4 rounded-2xl text-xs font-bold text-center mb-6 border border-red-100 dark:border-red-500/20 uppercase tracking-widest"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Login Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Email or Mobile"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                  onChange={(e) => setForm({ ...form, login: e.target.value })}
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-3 group"
            >
              {loading ? "Authenticating..." : "Establish Connection"}
              <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          <div className="text-center mt-10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              New to the platform?{" "}
              <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 group">
                Create Account
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
};

export default Login;