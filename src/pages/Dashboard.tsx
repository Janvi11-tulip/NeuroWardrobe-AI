import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useWeather } from '../hooks/useWeather';
import { 
  CloudSun, 
  Thermometer, 
  Wind, 
  Droplets, 
  Sparkles, 
  ArrowRight,
  Plus,
  Shirt
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { weather, loading: weatherLoading } = useWeather(user);
  const [wardrobeCount, setWardrobeCount] = useState(0);

  useEffect(() => {
    const fetchWardrobe = async () => {
      if (!user) return;
      const res = await fetch(`/api/wardrobe/${user.id}`);
      const data = await res.json();
      setWardrobeCount(data.length);
    };
    fetchWardrobe();
  }, [user]);

  const analysis = user?.analysis_results;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 font-bold mb-2">Welcome back</p>
          <h1 className="text-5xl font-serif font-bold tracking-tighter">
            HELLO, <span className="italic">{user?.full_name.split(' ')[0]}</span>
          </h1>
        </div>
        
        {/* Weather Widget */}
        <div className="glass p-6 rounded-3xl flex items-center gap-8">
          {weatherLoading ? (
            <div className="animate-pulse flex gap-4">
              <div className="w-10 h-10 bg-beige-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="w-20 h-4 bg-beige-200 rounded"></div>
                <div className="w-12 h-3 bg-beige-200 rounded"></div>
              </div>
            </div>
          ) : weather ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-matte-black text-white rounded-2xl flex items-center justify-center">
                  <CloudSun size={24} />
                </div>
                <div>
                  <div className="text-2xl font-serif font-bold">{weather.temp}°C</div>
                  <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">{user?.city || 'Current'}</div>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-6 border-l border-beige-200 pl-8">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-sm font-bold"><Droplets size={14} /> {weather.humidity}%</div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400">Humidity</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-sm font-bold"><Wind size={14} /> {weather.wind}km/h</div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400">Wind</div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Style DNA Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass p-10 rounded-[3rem] relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-matte-black mb-6">
              <Sparkles size={20} />
              <span className="text-xs uppercase tracking-[0.2em] font-bold">Your Style DNA</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-4xl font-serif font-bold mb-6 leading-tight">
                  Optimized for <br />
                  <span className="italic text-gray-400">{analysis?.face?.seasonalColor} Palette</span>
                </h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  {analysis?.body?.bestSilhouettes?.slice(0, 3).map((s, i) => (
                    <span key={i} className="px-4 py-2 bg-white/50 rounded-full text-xs font-bold uppercase tracking-widest border border-beige-200">
                      {s}
                    </span>
                  ))}
                </div>
                <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:gap-4 transition-all">
                  View Full Analysis <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-white/40 rounded-3xl border border-white/20">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-3">Body Type</h4>
                  <p className="font-serif text-xl italic">{analysis?.body?.type}</p>
                </div>
                <div className="p-6 bg-white/40 rounded-3xl border border-white/20">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-3">Undertone</h4>
                  <p className="font-serif text-xl italic">{analysis?.face?.undertone}</p>
                </div>
                {analysis?.uiProfile && (
                  <div className="p-6 bg-white/40 rounded-3xl border border-white/20">
                    <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-3">UI Mood</h4>
                    <p className="font-serif text-xl italic capitalize">{analysis.uiProfile.themeType} Energy</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Abstract background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-lavender-100/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </motion.div>

        {/* Quick Stats */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-matte-black text-white p-10 rounded-[3rem] shadow-xl"
          >
            <div className="flex justify-between items-start mb-10">
              <Shirt size={32} />
              <div className="text-right">
                <div className="text-4xl font-serif font-bold">{wardrobeCount}</div>
                <div className="text-[10px] uppercase tracking-widest opacity-50">Items in Closet</div>
              </div>
            </div>
            <Link to="/wardrobe" className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-widest text-xs">
              Manage Closet <Plus size={16} />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-10 rounded-[3rem]"
          >
            <h3 className="text-xl font-serif font-bold mb-6">Today's Mood</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Minimal', 'Bold', 'Elegant', 'Comfy'].map((mood) => (
                <button key={mood} className="py-3 rounded-xl border border-beige-200 text-xs font-bold uppercase tracking-widest hover:bg-matte-black hover:text-white transition-all">
                  {mood}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold italic">Curated for You</h2>
          <Link to="/stylist" className="text-sm font-bold uppercase tracking-widest hover:underline">Generate New Outfit</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 relative">
                <img 
                  src={`https://picsum.photos/seed/outfit-${i}/800/1000`} 
                  alt="Outfit" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 px-4 py-2 glass rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {i === 1 ? 'Office' : i === 2 ? 'Evening' : 'Casual'}
                </div>
              </div>
              <h4 className="text-xl font-serif font-bold mb-1">The {i === 1 ? 'Structured' : i === 2 ? 'Velvet' : 'Linen'} Edit</h4>
              <p className="text-gray-400 text-sm">Optimized for {weather?.temp}°C and {analysis?.face?.seasonalColor} tones.</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
