import React from 'react';
import { motion } from 'motion/react';

const FaceScanningOverlay: React.FC<{ image: string }> = ({ image }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-matte-black/90 flex items-center justify-center p-6 backdrop-blur-xl">
      <div className="max-w-md w-full glass p-8 rounded-[3rem] text-center relative overflow-hidden">
        <div className="relative aspect-square rounded-3xl overflow-hidden mb-8">
          <img src={image} className="w-full h-full object-cover opacity-50" alt="Scanning" />
          
          {/* Scanning Line */}
          <motion.div 
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent z-10 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
          />

          {/* Facial Landmark Mesh Simulation */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 100 100">
            <motion.path
              d="M30,40 Q50,35 70,40 M35,60 Q50,65 65,60 M50,30 L50,70 M30,40 L35,60 M70,40 L65,60"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <circle cx="30" cy="40" r="1" fill="white" />
            <circle cx="70" cy="40" r="1" fill="white" />
            <circle cx="50" cy="50" r="1" fill="white" />
            <circle cx="35" cy="60" r="1" fill="white" />
            <circle cx="65" cy="60" r="1" fill="white" />
          </svg>
        </div>

        <h2 className="text-2xl font-serif font-bold text-white mb-2 italic">Analyzing Facial Geometry...</h2>
        <p className="text-white/50 text-xs uppercase tracking-[0.2em] animate-pulse">
          Mapping landmarks & measuring proportions
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaceScanningOverlay;
