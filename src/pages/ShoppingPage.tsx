import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Plus,
  Target,
  Palette,
  RefreshCw,
  Star,
  ExternalLink,
  Info,
  X,
  Scale,
  Search
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ShoppingRecommendation, WardrobeItem, MarketplaceProduct } from '../types';

const ShoppingPage = () => {
  const { user } = useAuth();
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [recommendations, setRecommendations] = useState<ShoppingRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [compareList, setCompareList] = useState<MarketplaceProduct[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const analysis = user?.analysis_results;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Fetch wardrobe
        const wardrobeRes = await fetch(`/api/wardrobe/${user.id}`);
        const wardrobeData = await wardrobeRes.json();
        setWardrobe(wardrobeData);

        // Get shopping strategy from Gemini
        if (user.analysis_results) {
          const strategy = await geminiService.getShoppingStrategy(wardrobeData, user.analysis_results, user);
          setRecommendations(strategy);
        }
      } catch (err) {
        console.error("Failed to fetch shopping data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const toggleCompare = (product: MarketplaceProduct) => {
    if (compareList.find(p => p.id === product.id)) {
      setCompareList(compareList.filter(p => p.id !== product.id));
    } else {
      if (compareList.length < 2) {
        setCompareList([...compareList, product]);
      } else {
        // Replace the second one
        setCompareList([compareList[0], product]);
      }
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-serif font-bold tracking-tighter mb-2">SMART <span className="italic">SHOPPING</span></h1>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">Wardrobe Gap Analysis & Strategic Buying</p>
        </div>
        {compareList.length > 0 && (
          <button 
            onClick={() => setIsCompareModalOpen(true)}
            className="flex items-center gap-2 bg-matte-black text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] animate-bounce"
          >
            <Scale size={16} /> Compare ({compareList.length})
          </button>
        )}
      </header>

      {isLoading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
          <RefreshCw size={48} className="animate-spin text-beige-300" />
          <p className="text-gray-400 font-serif italic">Analyzing wardrobe gaps and searching marketplace...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Strategy Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 glass p-10 rounded-[3rem] relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8">
                  <Target size={20} />
                  <span className="text-xs uppercase tracking-widest font-bold">Buying Strategy</span>
                </div>
                
                <h2 className="text-4xl font-serif font-bold mb-8 italic">Strategic Gap Analysis</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <p className="text-gray-500 leading-relaxed">
                      Based on your current inventory of {wardrobe.length} items, NeuroWardrobe AI has identified specific gaps that prevent you from achieving maximum versatility.
                    </p>
                    <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-beige-200">
                      <Palette size={20} className="text-gray-400" />
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Target Palette</div>
                        <div className="font-serif italic capitalize">{analysis?.face?.seasonalColor} Essentials</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Priority Gaps</h4>
                    {recommendations.map((rec, i) => (
                      <div key={i} className="p-4 bg-matte-black text-white rounded-2xl flex justify-between items-center group cursor-pointer hover:scale-[1.02] transition-all">
                        <div>
                          <div className="text-[8px] uppercase tracking-widest opacity-50 mb-1">{rec.priority} Priority</div>
                          <div className="font-bold text-sm">{rec.category}</div>
                        </div>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Analytics Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-10 rounded-[3rem] border border-beige-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-8">
                <TrendingUp size={20} />
                <span className="text-xs uppercase tracking-widest font-bold">Closet Analytics</span>
              </div>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
                    <span>Wardrobe Balance</span>
                    <span>{Math.min(100, wardrobe.length * 5)}%</span>
                  </div>
                  <div className="h-2 w-full bg-beige-100 rounded-full overflow-hidden">
                    <div className="h-full bg-matte-black transition-all duration-1000" style={{ width: `${Math.min(100, wardrobe.length * 5)}%` }}></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-green-500 mt-1" />
                    <p className="text-sm text-gray-500">Good variety in {wardrobe.filter(i => i.category === 'Top').length > 0 ? 'tops' : 'basics'}.</p>
                  </div>
                  {recommendations.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Plus size={18} className="text-amber-500 mt-1" />
                      <p className="text-sm text-gray-500">Missing: {recommendations[0].category}.</p>
                    </div>
                  )}
                </div>

                <button className="w-full border border-matte-black py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-matte-black hover:text-white transition-all">
                  Full Inventory Audit
                </button>
              </div>
            </motion.div>
          </div>

          {/* Recommendations Sections */}
          {recommendations.map((rec, idx) => (
            <section key={idx} className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-serif font-bold italic">{rec.category}</h2>
                  <p className="text-sm text-gray-400">{rec.reason}</p>
                </div>
                {rec.similarWardrobeItem && (
                  <div className="flex items-center gap-3 p-3 bg-beige-50 rounded-2xl border border-beige-200">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                      <img 
                        src={rec.similarWardrobeItem.image_url} 
                        className="w-full h-full object-cover" 
                        alt="Similar" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-widest font-bold text-gray-400">Scan Similar Found</p>
                      <p className="text-[10px] font-bold">Style your existing {rec.similarWardrobeItem.subcategory} instead?</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rec.suggestedProducts.map((product) => (
                  <motion.div 
                    key={product.id}
                    whileHover={{ y: -10 }}
                    className="group bg-white rounded-[2.5rem] border border-beige-200 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="aspect-[4/5] relative overflow-hidden bg-beige-50">
                      <img 
                        src={`https://source.unsplash.com/600x800/?${encodeURIComponent(product.name.toLowerCase())},fashion,clothing`}
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          // Fallback to a more stable Unsplash URL if source.unsplash.com fails
                          img.src = `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&h=800&q=80`;
                        }}
                      />
                      <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <div className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[8px] font-bold uppercase tracking-widest flex items-center gap-1">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          {product.rating}
                        </div>
                        <div className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[8px] font-bold uppercase tracking-widest">
                          Budget Friendly
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleCompare(product)}
                        className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          compareList.find(p => p.id === product.id) ? 'bg-matte-black text-white' : 'bg-white/90 backdrop-blur text-matte-black'
                        }`}
                      >
                        <Scale size={18} />
                      </button>
                    </div>

                    <div className="p-8 space-y-6">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-xl font-serif font-bold">{product.name}</h4>
                          <span className="text-sm font-bold text-matte-black whitespace-nowrap ml-2">{product.price}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                          <span className="font-bold text-emerald-600">Budget Tip:</span> {product.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <a 
                          href={product.amazonLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3 bg-[#FF9900] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                        >
                          Amazon <ExternalLink size={12} />
                        </a>
                        <a 
                          href={product.flipkartLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3 bg-[#2874F0] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                        >
                          Flipkart <ExternalLink size={12} />
                        </a>
                      </div>

                      <div className="pt-6 border-t border-beige-100 space-y-3">
                        <div className="flex items-start gap-2">
                          <Info size={14} className="text-gray-400 mt-0.5" />
                          <p className="text-[9px] text-gray-500 leading-relaxed">
                            <span className="font-bold text-matte-black">Why it works:</span> {product.suitability.bodyType} & {product.suitability.colorPalette}.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {/* Comparison Modal */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute inset-0 bg-matte-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 border-b border-beige-100 flex justify-between items-center">
                <h2 className="text-3xl font-serif font-bold italic">Product Comparison</h2>
                <button onClick={() => setIsCompareModalOpen(false)} className="p-2 hover:bg-beige-50 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 grid grid-cols-2 gap-10">
                {compareList.map((product, i) => (
                  <div key={i} className="space-y-8">
                    <div className="aspect-video rounded-3xl overflow-hidden bg-beige-50">
                      <img src={product.image} className="w-full h-full object-cover" alt="Compare" />
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-2xl font-serif font-bold">{product.name}</h4>
                        <p className="text-lg font-bold text-matte-black">{product.price}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 bg-beige-50 rounded-2xl">
                          <p className="text-[8px] uppercase tracking-widest font-bold text-gray-400 mb-1">Fabric</p>
                          <p className="text-sm font-medium">{product.fabric}</p>
                        </div>
                        <div className="p-4 bg-beige-50 rounded-2xl">
                          <p className="text-[8px] uppercase tracking-widest font-bold text-gray-400 mb-1">Fit Type</p>
                          <p className="text-sm font-medium">{product.fit}</p>
                        </div>
                        <div className="p-4 bg-beige-50 rounded-2xl">
                          <p className="text-[8px] uppercase tracking-widest font-bold text-gray-400 mb-1">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">{product.rating} / 5.0</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <a href={product.amazonLink} target="_blank" rel="noopener noreferrer" className="flex-1 py-4 bg-matte-black text-white rounded-2xl text-center font-bold uppercase tracking-widest text-[10px]">Buy Now</a>
                      </div>
                    </div>
                  </div>
                ))}
                {compareList.length < 2 && (
                  <div className="border-2 border-dashed border-beige-200 rounded-[2rem] flex flex-col items-center justify-center text-center p-10">
                    <Search size={40} className="text-beige-200 mb-4" />
                    <p className="text-gray-400 font-serif italic">Select another product to compare side-by-side</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShoppingPage;
