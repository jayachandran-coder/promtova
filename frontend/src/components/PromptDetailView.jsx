import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, Copy, Share2, ArrowLeft, MoreHorizontal, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Gallery from './Gallery';
import { useUserAuth } from '../contexts/UserAuthContext';
import api from '../services/api';
import { toggleLike, toggleSave } from '../services/api';
import { useDonate } from '../contexts/DonateContext';

const PromptDetailView = ({ item, onBack, onRelatedItemClick }) => {
  const { user, isAuthenticated, token, openAuthModal } = useUserAuth();
  const navigate = useNavigate();
  const { openDonateWithCooldown } = useDonate();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (user && item) {
      setIsLiked(item.likedBy?.includes(user._id) || user.likedPrompts?.includes(item._id));
      setIsSaved(user.savedPrompts?.includes(item._id));
      setLikesCount(item.likes || 0);
    }
    
    // Track view on mount if opened directly
    const trackView = async () => {
      if (item) {
        try {
          await api.post(`/prompts/${item._id}/track`, { action: 'view' });
        } catch (err) {}
      }
    };
    trackView();
  }, [item, user, token]);

  const handleCopy = () => {
    if (!isAuthenticated) return openAuthModal();
    navigator.clipboard.writeText(item.prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    openDonateWithCooldown();
    
    // Track copy
    api.post(`/prompts/${item._id}/track`, { action: 'copy' })
      .catch(() => {});
  };

  const handleLike = async () => {
    if (!isAuthenticated) return openAuthModal();
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikesCount(prev => prevLiked ? prev - 1 : prev + 1);
    try {
      const res = await toggleLike(item._id);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prev => prevLiked ? prev + 1 : prev - 1);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) return openAuthModal();
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);
    try {
      const res = await toggleSave(item._id);
      setIsSaved(res.data.saved);
    } catch (err) {
      setIsSaved(prevSaved);
    }
  };

  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen bg-white"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-6 md:pt-12">
        
        {/* CENTERED MAIN CONTENT: Prompt Focus */}
        <div className="max-w-4xl mx-auto mb-16 md:mb-24">
          <div className="relative w-full min-h-[50vh] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group bg-[#0a0a0a] flex items-center justify-center">
            {/* Image */}
            {item.imageUrl ? (
              <img src={item.imageUrl} className="w-full h-auto max-h-[85vh] object-contain" alt={item.title} />
            ) : (
              <div className="w-full h-64 md:h-[50vh] flex items-center justify-center bg-gray-900">
                 <span className="text-white/20 font-black text-4xl uppercase tracking-tighter">{item.category}</span>
              </div>
            )}

            {/* Overlays (Desktop Only) */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="md:hidden absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Top Navigation */}
            <div className="absolute top-4 md:top-8 left-4 md:left-8 z-10">
               <button 
                 onClick={onBack}
                 className="p-2 md:p-3 bg-black/50 backdrop-blur-md rounded-xl md:rounded-2xl text-white hover:bg-black/70 transition-all border border-white/10 shadow-lg"
               >
                 <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
               </button>
            </div>

            {/* RIGHT SIDE ACTIONS: Vertical Stack */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 md:top-8 md:right-8 md:gap-3">
               <button 
                 onClick={handleSave}
                 className={`p-2 md:p-4 backdrop-blur-md rounded-xl md:rounded-2xl transition-all border shadow-lg
                   ${isSaved ? 'bg-white text-black border-white' : 'bg-black/50 text-white border-white/10 hover:bg-black/70'}`}
               >
                 <Bookmark className={`w-5 h-5 md:w-6 md:h-6 ${isSaved ? 'fill-current' : ''}`} />
               </button>
               <button 
                 onClick={handleCopy}
                 className="p-2 md:p-4 bg-black/50 backdrop-blur-md rounded-xl md:rounded-2xl text-white hover:bg-black/70 transition-all border border-white/10 shadow-lg"
               >
                 {isCopied ? <Check className="w-5 h-5 md:w-6 md:h-6 text-green-400" /> : <Copy className="w-5 h-5 md:w-6 md:h-6" />}
               </button>
               <button 
                 onClick={handleLike}
                 className={`p-2 md:p-4 backdrop-blur-md border rounded-xl md:rounded-2xl transition-all flex flex-col items-center gap-1 shadow-lg
                   ${isLiked ? 'bg-red-500 text-white border-red-400' : 'bg-black/50 text-white border-white/10 hover:bg-black/70'}`}
               >
                 <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isLiked ? 'fill-current' : ''}`} />
                 <span className="text-[9px] md:text-[10px] font-black leading-none">{likesCount}</span>
               </button>
            </div>

            {/* MOBILE ONLY: Category Badge Bottom Left */}
            <div className="md:hidden absolute bottom-4 left-4 z-10">
               <div className="inline-flex px-3 py-1 bg-black/50 backdrop-blur-md text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-lg">
                  {item.category}
               </div>
            </div>

            {/* Bottom Content Overlaid on Image (Desktop Only) */}
            <div className="hidden md:block absolute bottom-8 md:bottom-12 left-8 md:left-12 right-24 md:right-32 z-10">
               <div className="inline-flex px-3 py-1 bg-black/50 backdrop-blur-md text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/10 mb-4 md:mb-6 shadow-lg">
                 {item.category}
               </div>

               <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1] mb-4 md:mb-6 drop-shadow-lg">
                 {item.title}
               </h1>

               <div className="max-w-2xl">
               </div>
            </div>
          </div>

          {/* MOBILE ONLY: Content below image */}
          <div className="md:hidden mt-6 px-1">
             <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                {item.title}
             </h1>
          </div>
        </div>

        {/* RELATED GALLERY: Full Width Below */}
        <div className="w-full pb-20">
          <div className="mb-10 md:mb-16 text-center">
            <h3 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter mb-3">More from this style</h3>
            <div className="w-20 h-1.5 bg-black mx-auto rounded-full mb-6"></div>
          </div>

          <Gallery
            onItemClick={onRelatedItemClick}
            excludeId={item._id}
            relatedToId={item._id}
            columns="columns-2 md:columns-3 lg:columns-4 xl:columns-5"
          />
        </div>

      </div>
    </motion.div>
  );
};

export default PromptDetailView;
