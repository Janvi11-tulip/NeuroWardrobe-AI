import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-beige-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-serif font-bold tracking-tighter mb-4 inline-block">
            NEURO<span className="italic">WARDROBE</span>
          </Link>
          <h1 className="text-2xl font-serif italic text-gray-500">Reset your access</h1>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-beige-200">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-gray-500 text-sm text-center mb-6">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-gray-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-beige-50 border border-beige-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-matte-black/5 transition-all"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-matte-black text-white py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Send Instructions <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <Mail size={32} />
              </div>
              <h2 className="text-xl font-serif font-bold">Check your inbox</h2>
              <p className="text-gray-500 text-sm">
                We've sent password reset instructions to <strong>{email}</strong>.
              </p>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-matte-black hover:gap-4 transition-all"
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          )}

          {!isSubmitted && (
            <div className="mt-8 pt-8 border-t border-beige-100 text-center">
              <Link to="/login" className="text-gray-500 text-sm hover:text-matte-black flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
