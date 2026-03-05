import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useWeather } from '../hooks/useWeather';
import { 
  Sparkles, 
  Wind, 
  Droplets, 
  Clock, 
  MapPin, 
  ArrowRight, 
  RefreshCw,
  Check,
  Info,
  ChevronRight,
  Sliders,
  Loader2
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { OutfitResponse, WardrobeItem } from '../types';

const StylistPage = () => {
  const { user } = useAuth();
  const { weather } = useWeather(user);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outfit, setOutfit] = useState<OutfitResponse | null>(null);
  
  const [occasion, setOccasion] = useState('Office');
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'evening' | 'night'>('day');
  const [mood, setMood] = useState('Minimal');
  const [confidence, setConfidence] = useState(50);
  const [formality, setFormality] = useState(5);

  const occasions = ['Office', 'Wedding', 'Date', 'Gym', 'Party', 'College', 'Casual'];
  const moods = ['Minimal', 'Bold', 'Elegant', 'Comfy', 'Experimental'];

  useEffect(() => {
    const fetchWardrobe = async () => {
      if (!user) return;
      const res = await fetch(`/api/wardrobe/${user.id}`);
      const data = await res.json();
      setWardrobe(data);
    };
    fetchWardrobe();
  }, [user]);

  const generateOutfit = async () => {
    if (!user?.analysis_results || !weather) return;
    
    setIsGenerating(true);
    try {
      const res = await geminiService.generateOutfit(
        {
          occasion,
          timeOfDay,
          weather,
          mood,
          prepTime: 15,
          confidence,
          isIndoor: true,
          formality
        },
        wardrobe,
        user.analysis_results,
        user
      );
      setOutfit(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-5xl font-serif font-bold tracking-tighter mb-2">AI <span className="italic">STYLIST</span></h1>
        <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">Psychology-Driven Outfit Intelligence</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass p-8 rounded-[2.5rem] space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Occasion</label>
              <div className="grid grid-cols-2 gap-2">
                {occasions.map(o => (
                  <button
                    key={o}
                    onClick={() => setOccasion(o)}
                    className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      occasion === o ? 'bg-matte-black text-white' : 'bg-beige-50 text-gray-400 border border-beige-200'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Time of Day</label>
              <div className="flex gap-2">
                {['day', 'evening', 'night'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTimeOfDay(t as any)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      timeOfDay === t ? 'bg-matte-black text-white' : 'bg-beige-50 text-gray-400 border border-beige-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Formality Scale</label>
                <span className="text-xs font-bold">{formality}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" 
                value={formality}
                onChange={(e) => setFormality(parseInt(e.target.value))}
                className="w-full accent-matte-black" 
              />
            </div>

            <button
              onClick={generateOutfit}
              disabled={isGenerating || !weather}
              className="w-full bg-matte-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 magnetic-button disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Outfit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {outfit ? (
              <motion.div
                key="outfit"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="glass p-10 rounded-[3rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Sparkles size={120} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-matte-black mb-6">
                      <Check size={18} className="text-green-500" />
                      <span className="text-xs uppercase tracking-[0.2em] font-bold">AI Recommendation</span>
                    </div>
                    
                    <h2 className="text-5xl font-serif font-bold tracking-tighter mb-8 leading-tight">
                      THE <span className="italic">{outfit.name}</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">The Logic</h4>
                          <p className="text-gray-600 leading-relaxed">{outfit.explanation}</p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Color Harmony</h4>
                          <p className="text-gray-600 text-sm italic">{outfit.colorHarmony}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Recommended Items</h4>
                        {outfit.items.map((item: any, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 bg-white/50 rounded-2xl border border-beige-200">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-beige-100 flex-shrink-0">
                              <img src={item.image_url} className="w-full h-full object-cover" alt="Item" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate">{item.subcategory || item.category}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest">{item.brand || 'Wardrobe Item'}</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300" />
                          </div>
                        ))}
                        {outfit.gapDetected && (
                          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                            <Info size={18} className="text-amber-500 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Wardrobe Gap Detected</p>
                              <p className="text-xs text-amber-600/80">{outfit.gapDetected}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Confidence Scores */}
                    <div className="mt-12 pt-8 border-t border-beige-200 grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-serif font-bold mb-1">{outfit.confidenceScores.overall}%</div>
                        <div className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Overall Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-serif font-bold mb-1">{outfit.confidenceScores.bodyCompatibility}%</div>
                        <div className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Body Match</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-serif font-bold mb-1">{outfit.confidenceScores.colorHarmony}%</div>
                        <div className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Color Harmony</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-serif font-bold mb-1">{outfit.confidenceScores.occasionSuitability}%</div>
                        <div className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Occasion Fit</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clone Visualization */}
                <div className="glass p-10 rounded-[3rem] overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="w-full md:w-1/2 aspect-[3/4] bg-beige-50 rounded-[2rem] overflow-hidden relative group">
                      {outfit.cloneVisualization.renderingUrl ? (
                        <img src={outfit.cloneVisualization.renderingUrl} className="w-full h-full object-cover" alt="Clone Preview" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                          <Loader2 size={32} className="animate-spin text-gray-300 mb-4" />
                          <p className="text-xs text-gray-400 uppercase tracking-widest">Generating Clone Preview...</p>
                        </div>
                      )}
                      <div className="absolute top-6 left-6 px-4 py-2 bg-matte-black/80 backdrop-blur text-white rounded-full text-[8px] font-bold uppercase tracking-[0.2em]">
                        AI Body-Type Clone
                      </div>
                      
                      <div className="absolute bottom-6 left-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={generateOutfit}
                          className="flex-1 bg-white/90 backdrop-blur py-3 rounded-xl text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={12} /> Regenerate
                        </button>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 space-y-8">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-3xl font-serif font-bold italic">Visual Preview</h3>
                          <div className="flex gap-2">
                            <button className="p-2 bg-beige-50 rounded-lg hover:bg-beige-100 transition-all">
                              <Sliders size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">{outfit.cloneVisualization.renderingDescription}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-beige-50 rounded-2xl relative group">
                          <label className="text-[8px] uppercase tracking-widest font-bold text-gray-400 block mb-1">Pose</label>
                          <p className="text-xs font-bold">{outfit.cloneVisualization.pose}</p>
                          <div className="absolute inset-0 bg-matte-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl cursor-pointer transition-all">
                            <span className="text-[8px] font-bold uppercase tracking-widest">Change Pose</span>
                          </div>
                        </div>
                        <div className="p-4 bg-beige-50 rounded-2xl relative group">
                          <label className="text-[8px] uppercase tracking-widest font-bold text-gray-400 block mb-1">Lighting</label>
                          <p className="text-xs font-bold capitalize">{outfit.cloneVisualization.lighting}</p>
                          <div className="absolute inset-0 bg-matte-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl cursor-pointer transition-all">
                            <span className="text-[8px] font-bold uppercase tracking-widest">Change Light</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-matte-black text-white rounded-[2rem] space-y-4">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold opacity-50">Clone Controls</h4>
                        <div className="flex gap-3">
                          <button className="flex-1 py-3 border border-white/20 rounded-xl text-[8px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Rotate 360°</button>
                          <button className="flex-1 py-3 border border-white/20 rounded-xl text-[8px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Zoom Detail</button>
                        </div>
                        <p className="text-[8px] text-white/40 text-center italic">Interactive 3D simulation powered by Gemini Vision Engine</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="glass p-8 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-4">
                      <Sliders size={20} />
                      <h4 className="font-serif font-bold italic">Body Proportion Logic</h4>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{outfit.bodyProportionLogic}</p>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles size={20} />
                      <h4 className="font-serif font-bold italic">Face Shape Logic</h4>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{outfit.faceShapeLogic}</p>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem]">
                    <div className="flex items-center gap-3 mb-4">
                      <Wind size={20} />
                      <h4 className="font-serif font-bold italic">Climate Reasoning</h4>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{outfit.climateReasoning}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[500px] border-2 border-dashed border-beige-200 rounded-[3rem] flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 bg-beige-50 rounded-full flex items-center justify-center mb-6">
                  <Sparkles size={40} className="text-beige-200" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2">Ready to Style?</h3>
                <p className="text-gray-400 max-w-xs">Adjust the parameters and let NeuroWardrobe AI curate your perfect look.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StylistPage;
