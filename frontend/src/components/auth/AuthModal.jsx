import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Compass } from 'lucide-react';
import { useUserAuth } from '../../contexts/UserAuthContext';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle } = useUserAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  if (!isAuthModalOpen) return null;

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    const res = await loginWithGoogle();
    
    if (res.success) {
      showToast('Welcome to Promptova!');
      setTimeout(() => {
        closeAuthModal();
      }, 1000);
    } else {
      setError(res.message || 'Authentication failed');
      showToast('Login failed');
    }
    setIsGoogleLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-hidden">
        {/* Glassmorphic Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Premium Glassmorphism Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="relative w-full max-w-[420px] bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_32px_80px_rgba(0,0,0,0.12)] overflow-hidden z-10"
        >
          {/* Subtle top ambient glow gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-purple-200/40 to-transparent blur-3xl pointer-events-none rounded-full" />
          
          {/* Close button */}
          <button 
            onClick={closeAuthModal}
            className="absolute right-6 top-6 p-2.5 bg-gray-50/50 hover:bg-gray-100/80 rounded-full border border-gray-200/30 transition-all z-20 group hover:scale-105 active:scale-95"
          >
            <X className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
          </button>

          {/* Core Content */}
          <div className="p-6 pt-10 sm:p-10 sm:pt-14 text-center">
            {/* Logo/Icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] sm:rounded-[1.75rem] bg-black text-white mb-5 sm:mb-6 shadow-xl shadow-black/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className="w-6.5 h-6.5 sm:w-8 sm:h-8 relative z-10 animate-pulse text-white" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2 sm:mb-2.5">
              Start Creating
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto mb-6 sm:mb-8">
              Join the Promptova creative community to like, save, and copy high-fidelity prompts
            </p>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 p-3.5 bg-red-50/80 border border-red-100 rounded-2xl text-red-600 text-xs font-semibold text-center leading-relaxed"
              >
                {error}
              </motion.div>
            )}

            {/* Google Authentication Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl font-bold flex items-center justify-center gap-2.5 sm:gap-3 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm hover:shadow-md cursor-pointer duration-300"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              ) : (
                <div className="flex items-center justify-center gap-2 sm:gap-2.5 text-xs sm:text-sm md:text-base font-bold whitespace-nowrap">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </div>
              )}
            </button>

            {/* Footer decoration */}
            <div className="mt-10 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none">
              <Compass className="w-3.5 h-3.5" />
              <span>Secure Single Sign-On</span>
            </div>
          </div>
        </motion.div>

        {/* Global Modal Level Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-8 bg-gray-950/90 backdrop-blur-sm text-white px-6 py-4.5 rounded-[1.5rem] shadow-[0_24px_50px_rgba(0,0,0,0.16)] text-sm font-bold flex items-center gap-3.5 z-[1100]"
            >
              <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
