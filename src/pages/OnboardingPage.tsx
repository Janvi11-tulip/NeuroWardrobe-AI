import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Check, Info, ArrowRight, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import CameraCapture from '../components/CameraCapture';
import FaceScanningOverlay from '../components/FaceScanningOverlay';

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [bodyImage, setBodyImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraType, setCameraType] = useState<'face' | 'body'>('face');
  
  // Personality Profile
  const [personality, setPersonality] = useState('Minimal');
  const [styleArchetype, setStyleArchetype] = useState('Classic');
  const [confidence, setConfidence] = useState(50);
  const [preference, setPreference] = useState<'Minimal' | 'Bold'>('Minimal');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user?.analysis_results) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'face' | 'body') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'face') setFaceImage(reader.result as string);
        else setBodyImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (base64: string) => {
    if (cameraType === 'face') setFaceImage(base64);
    else setBodyImage(base64);
  };

  const startAnalysis = async () => {
    if (!faceImage || !bodyImage) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const results = await geminiService.analyzeFaceAndBody(faceImage, bodyImage, {
        personality,
        styleArchetype,
        confidence,
        preference,
        gender: user?.gender
      });
      
      // Save to backend
      const res = await fetch('/api/user/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          analysisResults: results
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save analysis results to server.");
      }
      
      updateUser({ analysis_results: results });
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again with clearer photos.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass p-12 rounded-[3rem] text-center"
            >
              <div className="w-20 h-20 bg-matte-black text-white rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Sparkles size={40} />
              </div>
              <h1 className="text-4xl font-serif font-bold mb-4">Style Psychology</h1>
              <p className="text-gray-500 mb-10 max-w-md mx-auto">
                Before we analyze your biology, let's understand your style personality.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-left">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Personality Mood</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Soft', 'Bold', 'Minimal', 'Structured', 'Romantic', 'Strong'].map(p => (
                      <button
                        key={p}
                        onClick={() => setPersonality(p)}
                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                          personality === p ? 'bg-matte-black text-white' : 'bg-white/50 text-gray-400 border border-beige-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Style Archetype</label>
                  <select 
                    value={styleArchetype}
                    onChange={(e) => setStyleArchetype(e.target.value)}
                    className="w-full bg-white/50 border border-beige-200 rounded-xl py-3 px-4 text-sm focus:outline-none"
                  >
                    <option>Classic</option>
                    <option>Power Chic</option>
                    <option>Street Luxe</option>
                    <option>Avant-Garde</option>
                    <option>Bohemian</option>
                    <option>Pinterest Aesthetic</option>
                  </select>

                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mt-6">Confidence Level</label>
                  <input 
                    type="range" min="1" max="100" 
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className="w-full accent-matte-black"
                  />
                  <div className="flex justify-between text-[8px] uppercase tracking-widest font-bold text-gray-400">
                    <span>Introvert</span>
                    <span>Extrovert</span>
                  </div>

                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mt-6">Visual Preference</label>
                  <div className="flex gap-2">
                    {['Minimal', 'Bold'].map(p => (
                      <button
                        key={p}
                        onClick={() => setPreference(p as any)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                          preference === p ? 'bg-matte-black text-white' : 'bg-white/50 text-gray-400 border border-beige-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full bg-matte-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Continue to Biology <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass p-12 rounded-[3rem] text-center"
            >
              <div className="w-20 h-20 bg-matte-black text-white rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Camera size={40} />
              </div>
              <h1 className="text-4xl font-serif font-bold mb-4">Face Analysis</h1>
              <p className="text-gray-500 mb-10 max-w-md mx-auto">
                We need a clear front-facing photo to analyze your skin tone, undertone, and face shape.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white/50 p-6 rounded-2xl border border-dashed border-beige-200 text-left">
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-widest">
                    <Info size={16} /> Guidance
                  </h3>
                  <ul className="text-xs text-gray-500 space-y-3 list-none">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-matte-black mt-1" />
                      <span>Natural daylight is best for color accuracy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-matte-black mt-1" />
                      <span>Remove glasses and pull hair back</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-matte-black mt-1" />
                      <span>Maintain a neutral expression</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-matte-black mt-1" />
                      <span>Look directly at the camera lens</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col gap-4">
                  {faceImage ? (
                    <div className="relative aspect-square rounded-2xl overflow-hidden group">
                      <img src={faceImage} className="w-full h-full object-cover" alt="Face" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => setFaceImage(null)}
                          className="bg-white text-matte-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
                        >
                          Retake
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 flex-1">
                      <button 
                        onClick={() => {
                          setCameraType('face');
                          setIsCameraOpen(true);
                        }}
                        className="flex-1 border-2 border-dashed border-matte-black/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/50 transition-all"
                      >
                        <Camera size={24} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Capture Live</span>
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border-2 border-dashed border-beige-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/50 transition-all"
                      >
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Upload Photo</span>
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'face')}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 border border-matte-black py-5 rounded-2xl font-bold uppercase tracking-widest"
                >
                  Back
                </button>
                <button
                  disabled={!faceImage}
                  onClick={() => setStep(2)}
                  className="flex-[2] bg-matte-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30 transition-all"
                >
                  Next Step <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass p-12 rounded-[3rem] text-center"
            >
              <div className="w-20 h-20 bg-matte-black text-white rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Sparkles size={40} />
              </div>
              <h1 className="text-4xl font-serif font-bold mb-4">Body Analysis</h1>
              <p className="text-gray-500 mb-10 max-w-md mx-auto">
                Upload a full-body photo to determine your proportions and body type for perfect silhouette matching.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white/50 p-6 rounded-2xl border border-dashed border-beige-200">
                  <h3 className="font-bold mb-2">Instructions</h3>
                  <ul className="text-sm text-gray-500 space-y-2 text-left list-disc pl-4">
                    <li>Wear form-fitting clothing</li>
                    <li>Stand straight, feet shoulder-width</li>
                    <li>Arms slightly away from body</li>
                    <li>Full body must be visible</li>
                  </ul>
                </div>
                <div className="flex flex-col gap-4">
                  {bodyImage ? (
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group">
                      <img src={bodyImage} className="w-full h-full object-cover" alt="Body" />
                      <button 
                        onClick={() => setBodyImage(null)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold"
                      >
                        Retake
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 flex-1">
                      <button 
                        onClick={() => {
                          setCameraType('body');
                          setIsCameraOpen(true);
                        }}
                        className="flex-1 border-2 border-dashed border-matte-black/20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/50 transition-all"
                      >
                        <Camera size={24} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Capture Live</span>
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border-2 border-dashed border-beige-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/50 transition-all"
                      >
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Upload Photo</span>
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'body')}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 mb-4 text-sm font-medium">{error}</p>}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-matte-black py-5 rounded-2xl font-bold uppercase tracking-widest"
                >
                  Back
                </button>
                <button
                  disabled={!bodyImage || isAnalyzing}
                  onClick={startAnalysis}
                  className="flex-[2] bg-matte-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30 transition-all"
                >
                  {isAnalyzing ? 'Analyzing Intelligence...' : 'Complete Analysis'} <Check size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-12 rounded-[3rem] text-center"
            >
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
                <Check size={48} />
              </div>
              <h1 className="text-4xl font-serif font-bold mb-4">Intelligence Synced</h1>
              <p className="text-gray-500 mb-10 max-w-md mx-auto">
                Your biological profile has been successfully analyzed. We've unlocked your personalized style DNA.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-white/50 rounded-2xl">
                  <div className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Color</div>
                  <div className="font-serif italic capitalize">{user?.analysis_results?.face?.seasonalColor}</div>
                </div>
                <div className="p-4 bg-white/50 rounded-2xl">
                  <div className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Body</div>
                  <div className="font-serif italic capitalize">{user?.analysis_results?.body?.type}</div>
                </div>
                <div className="p-4 bg-white/50 rounded-2xl">
                  <div className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Tone</div>
                  <div className="font-serif italic capitalize">{user?.analysis_results?.face?.undertone}</div>
                </div>
              </div>

              {user?.analysis_results?.body?.explanation && (
                <div className="bg-white/50 p-6 rounded-2xl border border-beige-200 mb-10 text-left">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Body Shape Analysis</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-serif italic">
                    "{user.analysis_results.body.explanation}"
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-matte-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 magnetic-button"
              >
                Enter Dashboard <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCameraOpen && (
            <CameraCapture 
              title={cameraType === 'face' ? 'Face Analysis Capture' : 'Body Analysis Capture'}
              onCapture={handleCapture}
              onClose={() => setIsCameraOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAnalyzing && faceImage && (
            <FaceScanningOverlay image={faceImage} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;
