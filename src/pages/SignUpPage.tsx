import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, MapPin, Calendar, ArrowRight, Ruler, Palette, DollarSign } from 'lucide-react';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    gender: '',
    age: '',
    height: '',
    style_preference: 'Classic',
    budget_preference: 'Mid-range',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    city: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocoding to get city name
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.state || '';
          
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            city,
            location: city // Default location text to city name
          }));
          setLocationStatus('success');
        } catch (err) {
          setFormData(prev => ({ ...prev, latitude, longitude }));
          setLocationStatus('success');
        }
      },
      (err) => {
        console.error('Location error:', err);
        setLocationStatus('error');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          height: parseFloat(formData.height)
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Auto login after signup
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const loginData = await loginRes.json();
        login(loginData.user);
        navigate('/onboarding');
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-beige-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-serif font-bold tracking-tighter mb-4 inline-block">
            NEURO<span className="italic">WARDROBE</span>
          </Link>
          <h1 className="text-2xl font-serif italic text-gray-500">Begin your transformation</h1>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-beige-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full bg-beige-50 border border-beige-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5 transition-all"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-beige-50 border border-beige-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5 transition-all"
                    placeholder="jane@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-beige-50 border border-beige-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Age</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full bg-beige-50 border border-beige-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5 transition-all"
                    placeholder="25"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Height (cm)</label>
                <div className="relative">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="w-full bg-beige-50 border border-beige-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5 transition-all"
                    placeholder="170"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full bg-beige-50 border border-beige-200 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5 transition-all appearance-none"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Style Preference</label>
                <div className="relative">
                  <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={formData.style_preference}
                    onChange={(e) => setFormData({...formData, style_preference: e.target.value})}
                    className="w-full bg-beige-50 border border-beige-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5 transition-all appearance-none"
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
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Budget Preference</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={formData.budget_preference}
                    onChange={(e) => setFormData({...formData, budget_preference: e.target.value})}
                    className="w-full bg-beige-50 border border-beige-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5 transition-all appearance-none"
                    required
                  >
                    <option value="Budget">Budget Friendly</option>
                    <option value="Mid-range">Mid-range</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400 flex justify-between">
                  Location 
                  <span className={`text-[10px] ${locationStatus === 'success' ? 'text-green-500' : locationStatus === 'error' ? 'text-red-400' : 'text-gray-400'}`}>
                    {locationStatus === 'detecting' ? 'Detecting...' : locationStatus === 'success' ? 'Detected' : locationStatus === 'error' ? 'Detection Failed' : ''}
                  </span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-beige-50 border border-beige-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5 transition-all"
                    placeholder="City, Country"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-matte-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-4"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-beige-100 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-matte-black font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
