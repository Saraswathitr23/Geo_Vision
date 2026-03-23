import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../services/api";
import { motion } from "framer-motion";
import { MapPin, Activity, Lightbulb } from "lucide-react";

// Fix leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

type LatLng = {
  lat: number;
  lng: number;
};

type AnalysisResult = {
  building_count: number;
  hospital_count: number;
  school_count: number;
  road_density: number;
  poverty_score: number;
  poverty_level: string;
};

const SUGGESTIONS = {
  High: {
    label: "Urgent interventions needed",
    dotColor: "bg-red-500",
    titleColor: "text-red-600 dark:text-red-400",
    textColor: "text-red-700 dark:text-red-300",
    cardClass:
      "border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20",
    items: [
      "Deploy mobile health units to address the critical hospital shortage",
      "Partner with NGOs for emergency food and nutrition distribution",
      "Establish community learning centers as stopgap for missing schools",
      "Advocate for targeted government infrastructure subsidies in this area",
      "Introduce microcredit programs to stimulate local economic activity",
    ],
  },
  Medium: {
    label: "Development opportunities",
    dotColor: "bg-yellow-500",
    titleColor: "text-yellow-600 dark:text-yellow-400",
    textColor: "text-yellow-700 dark:text-yellow-300",
    cardClass:
      "border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20",
    items: [
      "Improve road connectivity to increase access to economic centers",
      "Support local small business and entrepreneurship programs",
      "Invest in upgrading existing health and school facilities",
      "Introduce vocational training programs to boost employability",
      "Strengthen social safety nets for vulnerable households",
    ],
  },
  Low: {
    label: "Sustaining progress",
    dotColor: "bg-green-500",
    titleColor: "text-green-600 dark:text-green-400",
    textColor: "text-green-700 dark:text-green-300",
    cardClass:
      "border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20",
    items: [
      "Continue monitoring infrastructure quality and service accessibility",
      "Expand digital connectivity to drive further economic growth",
      "Invest in advanced education and skill development programs",
      "Encourage community-led development and civic participation",
      "Develop green spaces and public amenities to improve quality of life",
    ],
  },
};

const Atlas = () => {
  const [selected, setSelected] = useState<LatLng | null>(null);
  const [radius, setRadius] = useState<number>(2000);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState("");

  const MapClickHandler = () => {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        setSelected({ lat, lng });
        setAnalysis(null);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const name =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.state ||
            data.display_name;
          setLocationName(name);
        } catch (err) {
          console.error("Location fetch error", err);
        }
      },
    });
    return null;
  };

  const searchLocation = async () => {
    if (!locationInput) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${locationInput}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length === 0) {
        alert("Location not found");
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      setAnalysis(null);
      setSelected({ lat, lng });
      setLocationName(data[0].display_name);
      setLoading(true);
      const res2 = await API.post("/analyze", {
        lat,
        lon: lng,
        radius,
      });
      setAnalysis(res2.data);
    } catch (err) {
      console.error("Location search error", err);
    }
    setLoading(false);
  };

  const runAnalysis = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await API.post("/analyze", {
        lat: selected.lat,
        lon: selected.lng,
        radius,
      });
      setAnalysis(res.data);
    } catch (err) {
      console.error("Analysis error:", err);
    }
    setLoading(false);
  };

  const suggestion =
    analysis?.poverty_level &&
    SUGGESTIONS[analysis.poverty_level as keyof typeof SUGGESTIONS];

  return (
    <div className="h-screen flex bg-slate-100 dark:bg-slate-950">
      {/* SIDE PANEL */}
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-[380px] flex flex-col p-6 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-r border-slate-200 dark:border-slate-800 shadow-xl overflow-y-auto"
      >
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">
          Poverty Analysis
        </h2>

        {selected && (
          <div className="text-sm mb-4 space-y-1">
            <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <MapPin size={16} />
              {locationName || "Fetching location..."}
            </p>
            <p className="text-xs text-slate-400">
              {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
            </p>
          </div>
        )}

        {/* Location search */}
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Location
        </label>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Enter location (ex: Bangalore)"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchLocation()}
            className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <button
            onClick={searchLocation}
            className="px-4 rounded-xl bg-indigo-600 text-white"
          >
            Search
          </button>
        </div>

        {/* Radius */}
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-4">
          Radius (meters)
        </label>
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="mt-2 w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
        />

        {/* Run button */}
        <button
          onClick={runAnalysis}
          disabled={loading || !selected}
          className="mt-5 w-full py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition"
        >
          {loading ? "Analyzing..." : "Run Analysis"}
        </button>

        {/* Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 space-y-4"
          >
            <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Activity size={16} />
              Analysis Results
            </h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                Buildings
                <div className="text-lg font-bold">{analysis.building_count}</div>
              </div>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30">
                Hospitals
                <div className="text-lg font-bold">{analysis.hospital_count}</div>
              </div>
              <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/30">
                Schools
                <div className="text-lg font-bold">{analysis.school_count}</div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30">
                Road Density
                <div className="text-lg font-bold">{analysis.road_density}</div>
              </div>
            </div>

            {/* Poverty Score */}
            <div className="mt-4 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-400">
                Poverty Score
              </p>
              <p className="text-3xl font-black text-indigo-600">
                {analysis.poverty_score}
              </p>
              <p
                className={`mt-1 text-sm font-bold ${
                  analysis.poverty_level === "High"
                    ? "text-red-500"
                    : analysis.poverty_level === "Medium"
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {analysis.poverty_level} Poverty
              </p>
            </div>

            {/* Suggestions */}
            {suggestion && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-2"
              >
                <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-3">
                  <Lightbulb size={16} />
                  Recommendations
                </h3>

                <div className={`rounded-xl p-4 space-y-2 ${suggestion.cardClass}`}>
                  <p
                    className={`text-sm font-bold flex items-center gap-2 ${suggestion.titleColor}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full inline-block shrink-0 ${suggestion.dotColor}`}
                    />
                    {suggestion.label}
                  </p>
                  <ul className={`text-xs space-y-1.5 ${suggestion.textColor}`}>
                    {suggestion.items.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-0.5 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* MAP */}
      <div className="flex-1 relative">
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler />
          {selected && (
            <>
              <Marker position={selected} />
              <Circle center={selected} radius={radius} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Atlas;