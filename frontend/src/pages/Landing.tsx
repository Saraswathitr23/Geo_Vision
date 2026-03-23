import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { 
  GlobeAsiaAustraliaIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  BeakerIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import AuthLayout from "../components/layout/AuthLayout";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  // Fixing the Easing issue and providing smooth entry
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.9] as any }
  };

  const services = [
    {
      icon: BeakerIcon,
      title: "R&D Intelligence",
      desc: "Advanced neural networks trained on petabytes of satellite imagery to identify socio-economic markers.",
      color: "blue"
    },
    {
      icon: PresentationChartLineIcon,
      title: "Strategic Insights",
      desc: "Real-time infrastructure gap analysis helping governments allocate resources where they are needed most.",
      color: "purple"
    },
    {
      icon: ShieldCheckIcon,
      title: "Data Verification",
      desc: "Multi-layered validation using OpenStreetMap and proprietary ground-truth datasets for 95% accuracy.",
      color: "emerald"
    }
  ];

  return (
    <AuthLayout>
      {/* Root container fixed for Dark/Light mode sync */}
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
        
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 px-6">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-blob" />
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.h1 
              {...fadeInUp}
              className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-8"
            >
              Intelligence Beyond <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">The Human Eye.</span>
            </motion.h1>

            <motion.p 
              {...fadeInUp}
              className="max-w-3xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-12 font-medium leading-relaxed"
            >
              GeoVision automates poverty mapping and infrastructure audits using high-resolution satellite imagery. We turn raw pixels into actionable regional development strategies.
            </motion.p>

            <motion.div {...fadeInUp} className="flex flex-col sm:flex-row justify-center gap-6">
              <button
                onClick={() => navigate("/signup")}
                className="px-10 py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                Launch Console <RocketLaunchIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/atlas")}
                className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
              >
                Explore Atlas <GlobeAsiaAustraliaIcon className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* HERO SECTION - Add a hero section with animations */}
        <section className="hero-section relative pt-32 pb-20 px-6 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-700 text-white">
          <div className="absolute inset-0 bg-[url('https://source.unsplash.com/random/1920x1080')] bg-cover bg-center opacity-10" />
          <div className="container mx-auto text-center relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-6xl font-extrabold mb-4"
            >
              Discover GeoVision
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-lg mb-8"
            >
              Transforming data into actionable insights for a better tomorrow.
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Learn More
            </motion.button>
          </div>
        </section>

        {/* SERVICES SECTION - Replaces Features for a cleaner look */}
        <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase italic tracking-tight">Our Core Services</h2>
              <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full" />
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
              {services.map((s, i) => (
                <motion.div 
                  key={i} {...fadeInUp}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center mb-6 text-${s.color}-600 dark:text-${s.color}-400 group-hover:scale-110 transition-transform`}>
                    <s.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight">{s.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 uppercase italic">Real-time Data <br />Synchronization.</h2>
              <div className="space-y-8 text-left">
                {[
                  { title: "Imagery Ingestion", desc: "Automated fetching of RAW spectral data from Sentinel-2 & Landsat constellations." },
                  { title: "AI Classification", desc: "Neural processing to identify road quality, building density, and water bodies." },
                  { title: "Dynamic Reporting", desc: "Immediate poverty index calculation and infrastructure gap scoring." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="bg-blue-600 w-2 h-2 rounded-full mt-2 shrink-0" />
                    <div>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-white">{s.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div {...fadeInUp} className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800">
              <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-[500px] w-full grayscale dark:invert-[0.9] dark:hue-rotate-180" scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </MapContainer>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </section>

        {/* CTA SECTION - Final Interaction */}
        <section className="py-32 px-6 text-center bg-gradient-to-t from-blue-600/20 to-transparent">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter">
              Start Your Analysis <br />Today.
            </h2>
            <button
              onClick={() => navigate("/signup")}
              className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all"
            >
              Create Account
            </button>
          </motion.div>
        </section>

      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </AuthLayout>
  );
};

export default Landing;