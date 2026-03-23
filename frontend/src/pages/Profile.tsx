import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  organization: string;
  role: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/profile");
        setProfile(res.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) return <div className="p-10 text-center">Unable to load profile.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <header className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
          Account Settings
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your personal information and organization access</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Role Card */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-500/30">
                {profile.name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{profile.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{profile.email}</p>
            
            <span className={`inline-block px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
              profile.role === 'admin' 
              ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' 
              : 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
            }`}>
              {profile.role}
            </span>
          </div>
        </div>

        {/* Right Column: Detailed Info Form-style */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Full Identity</label>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  {profile.name}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Official Email</label>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  {profile.email}
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Organization / Institution</label>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="text-2xl">🏢</span>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {profile.organization || "Independent Researcher"}
                  </p>
                </div>
              </div>

            </div>

          
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Profile;