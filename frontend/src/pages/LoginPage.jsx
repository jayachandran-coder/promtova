import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Compass, ArrowLeft } from 'lucide-react';
import { useUserAuth } from '../contexts/UserAuthContext';

const LoginPage = () => {
  const { loginWithGoogle } = useUserAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    const res = await loginWithGoogle();
    
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Authentication failed');
    }
    setIsGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* High-end ambient mesh glow backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] bg-purple-100 rounded-full blur-[140px] opacity-70 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[55%] bg-blue-100 rounded-full blur-[140px] opacity-70 animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Floating Home Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate('/')}
        className="absolute left-6 top-6 md:left-10 md:top-10 flex items-center gap-2 px-4.5 py-2.5 bg-white/60 hover:bg-white/90 border border-white/60 hover:border-gray-200 text-sm font-bold text-gray-600 hover:text-black rounded-full shadow-sm hover:shadow-md transition-all group active:scale-95 z-20 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </motion.button>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 180 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Glassmorphic Auth Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-12 shadow-[0_32px_80px_rgba(0,0,0,0.06)] relative overflow-hidden">
          
          {/* Top ambient highlight glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-purple-200/30 to-transparent blur-3xl pointer-events-none rounded-full" />

          {/* Header Block */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] sm:rounded-[1.75rem] bg-black text-white mb-5 sm:mb-6 shadow-xl shadow-black/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className="w-6.5 h-6.5 sm:w-8 sm:h-8 relative z-10 animate-pulse text-white" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2.5 sm:mb-3">Welcome to Promptova</h1>
            <p className="text-gray-500 font-medium text-xs sm:text-sm leading-relaxed max-w-[290px] mx-auto">
              Unlock copying, saving, and liking premium AI creative prompts instantly
            </p>
          </div>

          {/* Action Area */}
          <div className="space-y-5 sm:space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3.5 sm:p-4 bg-red-50/80 border border-red-100 rounded-2xl text-red-600 text-xs font-semibold text-center leading-relaxed"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

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
          </div>

          {/* Footer details */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none">
            <Compass className="w-3.5 h-3.5" />
            <span>Secure Single Sign-On</span>
          </div>

        </div>

        {/* Outer Brand Label */}
        <p className="text-center text-gray-300 text-[10px] font-black uppercase tracking-[0.25em] mt-8">
          Secure Authentication · Promptova
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
