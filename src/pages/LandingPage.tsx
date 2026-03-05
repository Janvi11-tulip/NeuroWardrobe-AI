import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Shirt, Palette, CloudSun, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-beige-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-beige-100/80 backdrop-blur-md">
        <div className="text-2xl font-serif font-bold tracking-tighter">
          NEURO<span className="italic">WARDROBE</span>
        </div>
        <div className="space-x-8 hidden md:flex font-medium text-sm uppercase tracking-widest">
          <a href="#features" className="hover:opacity-50 transition-opacity">Features</a>
          <a href="#science" className="hover:opacity-50 transition-opacity">Science</a>
          <a href="#about" className="hover:opacity-50 transition-opacity">About</a>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-sm font-medium uppercase tracking-widest hover:opacity-50 transition-opacity">Login</Link>
          <Link to="/signup" className="bg-matte-black text-white px-6 py-2 rounded-full text-sm font-medium uppercase tracking-widest magnetic-button">Join Now</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter leading-[0.9] mb-8">
              THE FUTURE OF <br />
              <span className="italic text-gray-400">PERSONAL STYLE</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10">
              NeuroWardrobe AI uses advanced psychology, color theory, and computer vision to curate your perfect wardrobe based on your unique biology and lifestyle.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full md:w-auto bg-matte-black text-white px-10 py-4 rounded-full text-lg font-medium flex items-center justify-center gap-2 magnetic-button">
                Start Your Analysis <ArrowRight size={20} />
              </Link>
              <button className="w-full md:w-auto border border-matte-black px-10 py-4 rounded-full text-lg font-medium hover:bg-matte-black hover:text-white transition-all">
                View Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="px-6 mb-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="max-w-6xl mx-auto aspect-[16/9] rounded-[2rem] overflow-hidden shadow-2xl relative"
        >
          <img 
            src="https://picsum.photos/seed/fashion-hero/1920/1080" 
            alt="Fashion AI" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
            <div className="text-white">
              <p className="text-sm uppercase tracking-[0.3em] mb-2">AI Intelligence</p>
              <h2 className="text-4xl font-serif italic">Precision Styling for the Modern Individual</h2>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: Sparkles, title: "Face & Body Analysis", desc: "Advanced metrics for skin tone, seasonal color, and body proportions." },
              { icon: Palette, title: "Color Theory Engine", desc: "Psychology-driven color harmonies tailored to your unique undertone." },
              { icon: CloudSun, title: "Weather Intelligence", desc: "Live climate-adaptive outfit suggestions based on your location." },
              { icon: Shirt, title: "Smart Wardrobe", desc: "AI-powered inventory management with background removal and tagging." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 bg-beige-100 rounded-2xl flex items-center justify-center text-matte-black">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-serif font-bold">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center glass p-20 rounded-[3rem]">
          <h2 className="text-5xl font-serif font-bold mb-8 italic">Ready to redefine your style?</h2>
          <p className="text-xl text-gray-600 mb-10">Join 10,000+ individuals who have transformed their relationship with fashion through AI intelligence.</p>
          <Link to="/signup" className="inline-block bg-matte-black text-white px-12 py-5 rounded-full text-xl font-medium magnetic-button">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-beige-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-2xl font-serif font-bold tracking-tighter">
            NEURO<span className="italic">WARDROBE</span>
          </div>
          <div className="flex gap-8 text-sm uppercase tracking-widest font-medium">
            <a href="#" className="hover:opacity-50">Terms</a>
            <a href="#" className="hover:opacity-50">Privacy</a>
            <a href="#" className="hover:opacity-50">Contact</a>
          </div>
          <div className="text-gray-400 text-sm">
            © 2026 NeuroWardrobe AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
