import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee, Copy, Check } from 'lucide-react';
import { useDonate } from '../contexts/DonateContext';

const DonateModal = () => {
  const { isModalOpen, closeDonateModal } = useDonate();
  const [copied, setCopied] = useState(false);

  // Read UPI ID from environment variables, fallback to a default if not set
  const upiId = import.meta.env.VITE_UPI_ID || 'promptova@okaxis';
  const upiName = 'Promptova';
  const upiLink = `upi://pay?pa=${upiId}&pn=${upiName}&cu=INR`;
  
  // Using a highly reliable, free QR code generation API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}&margin=10`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenUpi = (e) => {
    // Basic check if user is on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      e.preventDefault();
      alert("UPI deep links only work on mobile devices. Please scan the QR code instead!");
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDonateModal}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative border border-white/20"
            >
              {/* Close Button */}
              <button
                onClick={closeDonateModal}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Support Promptova</h2>
                <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
                  If these prompts help you, support the community with a small coffee donation.
                </p>
              </div>

              {/* QR Code Section */}
              <div className="bg-gray-50 rounded-3xl p-6 mb-6 flex flex-col items-center justify-center border border-gray-100 shadow-inner">
                <img 
                  src={qrCodeUrl} 
                  alt="UPI QR Code" 
                  className="w-48 h-48 rounded-xl shadow-sm mb-4 bg-white p-2"
                />
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Scan to Pay via UPI</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a 
                  href={upiLink}
                  onClick={handleOpenUpi}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
                >
                  <Coffee className="w-5 h-5" />
                  Buy Me a Coffee
                </a>

                <button 
                  onClick={handleCopyUpi}
                  className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-100 py-3.5 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 text-gray-400" />
                      Copy UPI ID
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DonateModal;
