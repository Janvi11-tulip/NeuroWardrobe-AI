import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, MapPin, Calendar, Palette, Sparkles, Shield, Bell, LogOut, ArrowRight, X, Ruler, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: user?.full_name || '',
    gender: user?.gender || '',
    age: user?.age?.toString() || '',
    height: user?.height?.toString() || '',
    style_preference: user?.style_preference || 'Classic',
    budget_preference: user?.budget_preference || 'Mid-range',
    location: user?.location || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const analysis = user?.analysis_results;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...editFormData,
          age: parseInt(editFormData.age),
          height: parseFloat(editFormData.height)
        }),
      });
      const data = await response.json();
      if (data.success) {
        updateUser(data.user);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-serif font-bold tracking-tighter mb-2">MY <span className="italic">PROFILE</span></h1>
          <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">Personal Style DNA & Account Settings</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-matte-black text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-all"
          >
            Edit Profile
          </button>
          <button 
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="border border-red-200 text-red-500 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* User Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass p-10 rounded-[3rem] text-center">
            <div className="w-32 h-32 bg-matte-black text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-serif font-bold">
              {user?.full_name.charAt(0)}
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">{user?.full_name}</h2>
            <p className="text-gray-400 text-sm mb-8">{user?.email}</p>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-beige-200">
                <MapPin size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{user?.location || 'Not set'}</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-beige-200">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{user?.age} years old</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-beige-200">
                <Ruler size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{user?.height} cm</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-beige-200">
                <Palette size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{user?.style_preference}</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-beige-200">
                <DollarSign size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{user?.budget_preference}</span>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4 px-2">Settings</h3>
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/50 rounded-2xl transition-all">
              <div className="flex items-center gap-3">
                <Bell size={18} />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              <div className="w-10 h-5 bg-green-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/50 rounded-2xl transition-all">
              <div className="flex items-center gap-3">
                <Shield size={18} />
                <span className="text-sm font-medium">Privacy & Security</span>
              </div>
              <ArrowRight size={16} className="text-gray-300" />
            </button>
          </div>

          <div className="glass p-8 rounded-[2.5rem] space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4 px-2">Data & Privacy</h3>
            <div className="p-4 bg-white/50 rounded-2xl border border-beige-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Auto-delete Analysis Photos</p>
                  <p className="text-[10px] text-gray-400">Remove raw images after processing</p>
                </div>
                <div className="w-10 h-5 bg-matte-black rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <button 
                onClick={async () => {
                  if (confirm('Are you sure you want to delete all facial geometry and body metric data? This cannot be undone.')) {
                    try {
                      const res = await fetch('/api/user/analysis/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user?.id }),
                      });
                      if (res.ok) {
                        alert('Face and body data deleted successfully.');
                        window.location.reload();
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }
                }}
                className="w-full py-3 border border-red-100 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
              >
                Delete My Face Data
              </button>
            </div>
          </div>
        </div>

        {/* Intelligence Data */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-10 rounded-[3rem]">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles size={24} />
              <h2 className="text-3xl font-serif font-bold italic">Style Intelligence Report</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Facial Geometry</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-beige-50 rounded-2xl">
                      <span className="text-sm font-medium">Face Shape</span>
                      <span className="font-serif italic capitalize">{analysis?.face?.details?.shape}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-beige-50 rounded-2xl">
                      <span className="text-sm font-medium">Symmetry Level</span>
                      <span className="font-serif italic capitalize">{(analysis?.face?.details?.symmetryLevel || 0) * 100}%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-beige-50 rounded-2xl">
                      <span className="text-sm font-medium">L/W Ratio</span>
                      <span className="font-serif italic capitalize">{analysis?.face?.details?.lengthToWidthRatio}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Color Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-beige-50 rounded-2xl">
                      <span className="text-sm font-medium">Seasonal Color</span>
                      <span className="font-serif italic capitalize">{analysis?.face?.seasonalColor}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-beige-50 rounded-2xl">
                      <span className="text-sm font-medium">Undertone</span>
                      <span className="font-serif italic capitalize">{analysis?.face?.undertone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Body Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-beige-50 rounded-2xl">
                      <span className="text-sm font-medium">Body Type</span>
                      <span className="font-serif italic capitalize">{analysis?.body?.type}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-beige-50 rounded-2xl">
                      <span className="text-sm font-medium">Est. Height/Weight</span>
                      <span className="font-serif italic capitalize">{analysis?.body?.heightEstimation} / {analysis?.body?.weightEstimation || 'N/A'}</span>
                    </div>
                    {analysis?.body?.explanation && (
                      <div className="p-4 bg-white/50 rounded-2xl border border-beige-200">
                        <p className="text-[10px] text-gray-500 leading-relaxed font-serif italic">
                          "{analysis.body.explanation}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Styling Guide</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/50 rounded-2xl border border-beige-200">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest mb-2">Hairstyles</h5>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {analysis?.stylingGuide?.hairstyles?.best?.map((h, i) => (
                          <span key={i} className="text-[8px] bg-matte-black text-white px-2 py-0.5 rounded-full">{h}</span>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 italic">Volume: {analysis?.stylingGuide?.hairstyles?.volumePlacement}</p>
                    </div>

                    <div className="p-4 bg-white/50 rounded-2xl border border-beige-200">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest mb-2">Necklines</h5>
                      <div className="space-y-2">
                        {analysis?.stylingGuide?.necklines?.recommendations?.map((n, i) => (
                          <div key={i}>
                            <p className="text-[10px] font-bold">{n.type}</p>
                            <p className="text-[9px] text-gray-400">{n.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-white/50 rounded-2xl border border-beige-200">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest mb-2">Accessories & Makeup</h5>
                      <p className="text-[10px] text-gray-500 mb-1"><span className="font-bold">Eyewear:</span> {analysis?.stylingGuide?.eyewear?.suggestions?.join(', ')}</p>
                      <p className="text-[10px] text-gray-500 mb-1"><span className="font-bold">Earrings:</span> {analysis?.stylingGuide?.earrings?.styles?.join(', ')}</p>
                      <p className="text-[10px] text-gray-500"><span className="font-bold">Makeup:</span> {analysis?.stylingGuide?.makeup?.highlight} highlight, {analysis?.stylingGuide?.makeup?.contour} contour</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/50 rounded-3xl border border-beige-200">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">UI Mood Profile</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-beige-50 rounded-2xl">
                      <span className="text-sm font-medium">Theme Energy</span>
                      <span className="font-serif italic capitalize">{analysis?.uiProfile?.themeType}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-beige-50 rounded-2xl">
                      <span className="text-sm font-medium">Visual Intensity</span>
                      <span className="font-serif italic capitalize">{(analysis?.uiProfile?.visualIntensity || 0) * 100}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-matte-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-serif font-bold italic">Edit Profile</h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-beige-100 rounded-full transition-all">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Full Name</label>
                      <input
                        type="text"
                        value={editFormData.full_name}
                        onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                        className="w-full bg-beige-50 border border-beige-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Age</label>
                      <input
                        type="number"
                        value={editFormData.age}
                        onChange={(e) => setEditFormData({...editFormData, age: e.target.value})}
                        className="w-full bg-beige-50 border border-beige-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Height (cm)</label>
                      <input
                        type="number"
                        value={editFormData.height}
                        onChange={(e) => setEditFormData({...editFormData, height: e.target.value})}
                        className="w-full bg-beige-50 border border-beige-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Gender</label>
                      <select
                        value={editFormData.gender}
                        onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                        className="w-full bg-beige-50 border border-beige-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5"
                        required
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Style Preference</label>
                      <select
                        value={editFormData.style_preference}
                        onChange={(e) => setEditFormData({...editFormData, style_preference: e.target.value})}
                        className="w-full bg-beige-50 border border-beige-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5"
                        required
                      >
                        <option value="Classic">Classic</option>
                        <option value="Minimalist">Minimalist</option>
                        <option value="Streetwear">Streetwear</option>
                        <option value="Bohemian">Bohemian</option>
                        <option value="Avant-Garde">Avant-Garde</option>
                        <option value="Vintage">Vintage</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Budget Preference</label>
                      <select
                        value={editFormData.budget_preference}
                        onChange={(e) => setEditFormData({...editFormData, budget_preference: e.target.value})}
                        className="w-full bg-beige-50 border border-beige-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5"
                        required
                      >
                        <option value="Budget">Budget Friendly</option>
                        <option value="Mid-range">Mid-range</option>
                        <option value="Premium">Premium</option>
                        <option value="Luxury">Luxury</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Location</label>
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                        className="w-full bg-beige-50 border border-beige-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-4 border border-beige-200 rounded-2xl font-bold uppercase tracking-widest hover:bg-beige-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-[2] py-4 bg-matte-black text-white rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                      {isSaving ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
