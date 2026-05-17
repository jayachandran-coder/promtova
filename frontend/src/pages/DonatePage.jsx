import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Coffee, Copy, Check } from 'lucide-react';

const DonatePage = () => {
  const [copied, setCopied] = useState(false);

  const upiId = import.meta.env.VITE_UPI_ID || 'promptova@okaxis';
  const upiName = 'Promptova';
  const upiLink = `upi://pay?pa=${upiId}&pn=${upiName}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}&margin=10`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenUpi = (e) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      e.preventDefault();
      alert("UPI deep links only work on mobile devices. Please scan the QR code instead!");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center  md:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl md:max-h-[85vh] bg-gray-50/50 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row items-stretch my-4 md:my-0"
      >
        {/* Left Side: Information */}
        <div className="flex-1 p-6 md:p-12 flex flex-col justify-center text-center md:text-left relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-12 h-12 md:w-16 md:h-16 bg-white text-red-500 rounded-2xl flex items-center justify-center mb-4 md:mb-8 shadow-sm border border-orange-50 mx-auto md:mx-0"
            >
              <Heart className="w-6 h-6 md:w-8 md:h-8 fill-current" />
            </motion.div>
    
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 md:mb-4 tracking-tight leading-tight">
              Support <span className="text-red-500">Promptova.</span>
            </h1>
            
            <p className="text-gray-500 text-sm md:text-xl font-medium leading-relaxed max-w-md mx-auto md:mx-0">
              Help us maintain and expand the community with a small donation.
            </p>
    
            <div className="mt-10 hidden md:flex items-center gap-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
              <div className="w-12 h-[1px] bg-gray-200" />
              Scan QR to pay instantly
            </div>
          </div>
        </div>
    
        {/* Right Side: Action Card */}
        <div className="w-full md:w-[400px] bg-white p-6 md:p-10 flex flex-col items-center justify-center relative shadow-2xl">
          <div className="w-full max-w-sm">
            {/* QR Code Container */}
            <div className="bg-gray-50 rounded-[2rem] p-4 md:p-6 mb-6 md:mb-8 border border-gray-100 flex flex-col items-center group transition-all">
              <div className="bg-white p-3 md:p-4 rounded-3xl shadow-sm mb-4 transition-transform group-hover:scale-105 duration-500">
                <img 
                  src={qrCodeUrl} 
                  alt="Scan to Donate via UPI" 
                  className="w-32 h-32 md:w-52 md:h-52 object-contain"
                />
              </div>
              <div className="text-center">
                <p className="text-[9px] md:text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-2">Scan with any UPI App</p>
                <div className="flex items-center justify-center gap-2 bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-xs md:text-sm font-bold text-gray-800">{upiId}</span>
                  <button 
                    onClick={handleCopyUpi}
                    className="p-1 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
    
            {/* Buttons */}
            <div className="space-y-3 md:space-y-4">
              <a 
                href={upiLink}
                onClick={handleOpenUpi}
                className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-sm md:text-base hover:bg-black transition-all shadow-xl shadow-gray-900/10"
              >
                <Coffee className="w-5 h-5" />
                Pay with Mobile App
              </a>
              
              <button 
                onClick={handleCopyUpi}
                className="w-full py-2 text-gray-400 hover:text-gray-900 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-colors"
              >
                {copied ? 'UPI ID Copied' : 'Click to copy UPI ID'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DonatePage;
