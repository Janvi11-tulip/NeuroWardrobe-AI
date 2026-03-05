import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Camera, 
  Upload,
  X, 
  Loader2, 
  Trash2,
  Tag,
  Palette,
  Maximize2
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { WardrobeItem } from '../types';
import CameraCapture from '../components/CameraCapture';

const WardrobePage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['All', 'Top', 'Bottom', 'Dress', 'Footwear', 'Bag', 'Accessory', 'Jewelry'];

  useEffect(() => {
    fetchItems();
  }, [user]);

  const fetchItems = async () => {
    if (!user) return;
    const res = await fetch(`/api/wardrobe/${user.id}`);
    const data = await res.json();
    setItems(data);
  };

  const processImage = async (base64: string) => {
    if (!user) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await geminiService.analyzeClothingItem(base64);
      
      const newItem = {
        user_id: user.id,
        image_url: base64,
        ...analysis
      };

      const res = await fetch('/api/wardrobe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (res.ok) {
        fetchItems();
        setIsAdding(false);
      } else {
        throw new Error("Failed to save item to wardrobe.");
      }
    } catch (err: any) {
      console.error('Analysis failed', err);
      setError(err.message || "Failed to analyze item.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      await processImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = async (base64: string) => {
    await processImage(base64);
  };

  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  const filteredItems = items.filter(item => {
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const subcategory = item.subcategory || '';
    const brand = item.brand || '';
    const matchesSearch = item.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif font-bold tracking-tighter mb-2">MY <span className="italic">CLOSET</span></h1>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">{items.length} Intelligence-Tagged Items</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-matte-black text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-2 magnetic-button"
        >
          <Plus size={20} /> Add Item
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by tag, color, brand, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-beige-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-matte-black text-white shadow-lg' 
                  : 'bg-white text-gray-400 border border-beige-200 hover:border-matte-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence>
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedItem(item)}
              className="group relative aspect-[3/4] bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-beige-200 cursor-pointer"
            >
              <img 
                src={item.image_url} 
                alt={item.category} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all p-6 flex flex-col justify-end text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: item.primary_color }}></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{item.primary_color}</span>
                </div>
                <h4 className="text-lg font-serif italic">{item.subcategory || item.category}</h4>
                {item.brand && <p className="text-[10px] uppercase tracking-widest text-white/60 mb-2">{item.brand}</p>}
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(item.tags) ? item.tags : []).slice(0, 2).map((tag, j) => (
                    <span key={j} className="text-[8px] uppercase tracking-widest bg-white/20 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-matte-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-8 right-8 z-10 text-gray-400 hover:text-matte-black bg-white/80 backdrop-blur p-2 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto bg-beige-50">
                <img src={selectedItem.image_url} className="w-full h-full object-cover" alt="Detail" />
              </div>

              <div className="w-full md:w-1/2 p-10 overflow-y-auto max-h-[80vh] md:max-h-none">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-beige-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {selectedItem.category}
                    </span>
                    <span className="px-3 py-1 bg-matte-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {selectedItem.season}
                    </span>
                  </div>
                  <h2 className="text-4xl font-serif font-bold mb-1">{selectedItem.subcategory || selectedItem.category}</h2>
                  {selectedItem.brand && <p className="text-sm uppercase tracking-[0.2em] text-gray-400 font-bold">{selectedItem.brand}</p>}
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Fabric & Structure</label>
                    <p className="text-sm font-medium">{selectedItem.fabric_type} ({selectedItem.fabric_weight})</p>
                    <p className="text-[10px] text-gray-400">{selectedItem.structure_level} structure</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Fit & Pattern</label>
                    <p className="text-sm font-medium">{selectedItem.fit_type} Fit</p>
                    <p className="text-[10px] text-gray-400">{selectedItem.pattern_type} ({selectedItem.pattern_scale})</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Color Palette</label>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full border border-beige-200" style={{ backgroundColor: selectedItem.primary_color }}></div>
                      {selectedItem.secondary_colors?.map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-full border border-beige-200" style={{ backgroundColor: c }}></div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Performance</label>
                    <p className="text-sm font-medium">Breathability: {selectedItem.breathability_score}/10</p>
                    <p className="text-[10px] text-gray-400">Layering: {selectedItem.layer_compatibility}/10</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">AI Styling Metadata</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-beige-50 rounded-xl text-center">
                      <div className="text-[10px] font-bold mb-1">{selectedItem.metadata?.formality}/10</div>
                      <div className="text-[8px] uppercase tracking-widest text-gray-400">Formality</div>
                    </div>
                    <div className="p-3 bg-beige-50 rounded-xl text-center">
                      <div className="text-[10px] font-bold mb-1">{selectedItem.metadata?.boldness}/10</div>
                      <div className="text-[8px] uppercase tracking-widest text-gray-400">Boldness</div>
                    </div>
                    <div className="p-3 bg-beige-50 rounded-xl text-center">
                      <div className="text-[10px] font-bold mb-1">{selectedItem.metadata?.versatility}/10</div>
                      <div className="text-[8px] uppercase tracking-widest text-gray-400">Versatility</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Smart Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags?.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-beige-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isAnalyzing && setIsAdding(false)}
              className="absolute inset-0 bg-matte-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-8 right-8 text-gray-400 hover:text-matte-black"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-beige-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Camera size={32} />
                </div>
                <h2 className="text-3xl font-serif font-bold mb-2">Add New Intelligence</h2>
                <p className="text-gray-400 text-sm">Upload a clear photo of your item. AI will auto-tag color, fabric, and style.</p>
              </div>

              <div className="space-y-8">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-medium">
                    {error}
                  </div>
                )}
                <div className="flex gap-4">
                  <button 
                    onClick={() => !isAnalyzing && setIsCameraOpen(true)}
                    className={`flex-1 aspect-square rounded-[2rem] border-2 border-dashed border-matte-black/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-beige-50 transition-all ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Camera size={32} className="text-gray-400" />
                    <p className="font-bold uppercase tracking-widest text-[10px] text-gray-400">Capture Live</p>
                  </button>
                  <div 
                    onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                    className={`flex-1 aspect-square rounded-[2rem] border-2 border-dashed border-beige-200 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-beige-50 transition-all ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={32} className="animate-spin text-matte-black" />
                        <p className="font-bold uppercase tracking-widest text-[10px] animate-pulse">Analyzing...</p>
                      </>
                    ) : (
                      <>
                        <Upload size={32} className="text-gray-400" />
                        <p className="font-bold uppercase tracking-widest text-[10px] text-gray-400">Upload Photo</p>
                      </>
                    )}
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-beige-50 rounded-2xl flex items-center gap-3">
                    <Palette size={18} className="text-gray-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Auto Color Detection</span>
                  </div>
                  <div className="p-4 bg-beige-50 rounded-2xl flex items-center gap-3">
                    <Tag size={18} className="text-gray-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Smart Tagging</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCameraOpen && (
          <CameraCapture 
            title="Capture Clothing Item"
            onCapture={handleCapture}
            onClose={() => setIsCameraOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WardrobePage;
