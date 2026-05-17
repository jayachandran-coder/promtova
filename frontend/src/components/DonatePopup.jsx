import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Coffee, Check } from 'lucide-react';
import { useDonate } from '../contexts/DonateContext';

const DonatePopup = () => {
  const { isDonatePopupOpen, closeDonatePopup } = useDonate();
  const [isCopied, setIsCopied] = useState(false);

  const upiId = import.meta.env.VITE_UPI_ID || 'promptova@okaxis';
  const upiLink = `upi://pay?pa=${upiId}&pn=Promptova&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 4000);
    } catch (err) {
      console.error('Failed to copy UPI ID:', err);
    }
  };

  const handleOpenUPI = () => {
    window.location.href = upiLink;
  };

  return (
    <AnimatePresence>
      {isDonatePopupOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDonatePopup}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl pointer-events-auto relative border border-white/40"
            >
              {/* Close Button */}
              <button
                onClick={closeDonatePopup}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-8 mt-2">
                <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                  Support Promptova
                </h2>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  If these prompts help you, support the community with a small coffee donation.
                </p>
              </div>

              {/* QR Code Section */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100 flex flex-col items-center">
                <div className="bg-white p-3 rounded-xl shadow-sm mb-4">
                  <img src={qrCodeUrl} alt="UPI QR Code" className="w-32 h-32 object-contain" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Scan to Pay</p>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 w-full">
                  <span className="text-sm font-semibold text-gray-700 flex-1 truncate">{upiId}</span>
                  <button 
                    onClick={handleCopyUPI}
                    className="p-1.5 hover:bg-gray-50 rounded-md transition-colors text-gray-400 hover:text-gray-900"
                    title="Copy UPI ID"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleOpenUPI}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <Coffee className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Buy Me a Coffee
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DonatePopup;
