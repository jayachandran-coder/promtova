import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../contexts/UserAuthContext';
import api, { toggleLike, toggleSave } from '../services/api';
import { useDonate } from '../contexts/DonateContext';

const GalleryCard = React.memo(({ item, onClick }) => {
  const { user, isAuthenticated, openAuthModal } = useUserAuth();
  const navigate = useNavigate();
  const { openDonateWithCooldown } = useDonate();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLiked(item.likedBy?.includes(user._id) || user.likedPrompts?.includes(item._id));
      setIsSaved(user.savedPrompts?.includes(item._id));
    }
  }, [user, item]);

  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    if (!isAuthenticated) return openAuthModal();
    navigator.clipboard.writeText(item.prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    openDonateWithCooldown();

    // Track copy in backend
    api.post(`/prompts/${item._id}/track`, { action: 'copy' })
      .catch(() => {});
  }, [isAuthenticated, item.prompt, item._id, openAuthModal, openDonateWithCooldown]);

  const handleLike = useCallback(async (e) => {
    e.stopPropagation();
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
  }, [isAuthenticated, isLiked, item._id, openAuthModal]);

  const handleSave = useCallback(async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return openAuthModal();
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);
    try {
      const res = await toggleSave(item._id);
      setIsSaved(res.data.saved);
    } catch (err) {
      setIsSaved(prevSaved);
    }
  }, [isAuthenticated, isSaved, item._id, openAuthModal]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="masonry-item relative group rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-500 transform-gpu bg-gray-50"
      onClick={() => onClick(item)}
    >
      <div className="relative w-full h-full flex">
        {item.imageUrl && (
          <img 
            src={item.imageUrl} 
            className="w-full h-full object-cover block" 
            alt={`${item.title} – ${item.category} AI image prompt`}
            loading="lazy"
            decoding="async"
            width="400"
            height="600"
          />
        )}
        
        {/* Persistent Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none md:hidden" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 pointer-events-none" />

        {/* Top Category Badge - Hidden on mobile */}
        <div className="hidden md:block absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-sm border border-white/20">
            {item.category}
          </span>
        </div>

        {/* Action Buttons - Hover Based (Desktop only) */}
        <div className="hidden md:flex absolute top-3 right-3 flex-row gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleSave}
            className={`p-2 rounded-xl backdrop-blur-md border border-white/40 shadow-lg transition-transform hover:scale-110 active:scale-95 duration-300
              ${isSaved ? 'bg-white text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/40 shadow-lg text-white hover:bg-black/60 transition-transform hover:scale-110 active:scale-95 duration-300"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Bottom Title & Likes */}
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 z-10">
          <div className="flex items-end justify-end md:justify-between gap-3">
            <h3 className="hidden md:block text-white font-normal text-sm tracking-tight line-clamp-2 flex-1 drop-shadow-md">
              {item.title}
            </h3>
            
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 md:gap-1.5 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-md md:rounded-lg backdrop-blur-md border transition-all hover:scale-105 active:scale-95 duration-300 shrink-0
                ${isLiked ? 'bg-red-500 text-white border-red-400' : 'bg-black/40 text-white border-white/20 hover:bg-black/60'}`}
            >
              <Heart className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-[10px] md:text-[11px] font-black">{likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default GalleryCard;

