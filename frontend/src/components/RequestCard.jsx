import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../contexts/UserAuthContext';
import { likeRequest } from '../services/api';

const statusColors = {
  'Open': 'bg-gray-100 text-gray-700 border-gray-200',
  'In Progress': 'bg-orange-100 text-orange-700 border-orange-200',
  'Completed': 'bg-green-100 text-green-700 border-green-200'
};

const RequestCard = ({ request }) => {
  const { user, isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(request.likes?.length || 0);

  useEffect(() => {
    if (user && request.likes) {
      setIsLiked(request.likes.includes(user._id));
    }
  }, [user, request]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikesCount(prev => prevLiked ? prev - 1 : prev + 1);
    
    try {
      const res = await likeRequest(request._id);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prev => prevLiked ? prev + 1 : prev - 1);
    }
  };

  const handleCardClick = () => {
    navigate(`/requests/${request._id}`);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={handleCardClick}
      className="masonry-item relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-white border border-gray-100 cursor-pointer flex flex-col"
    >
      {/* Optional Reference Image */}
      {request.imageUrl && (
        <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
          <img 
            src={request.imageUrl} 
            alt={request.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Content Area */}
      <div className="p-4 md:p-5 flex flex-col flex-grow relative z-10 bg-white">
        
        {/* Badges Row */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColors[request.status]}`}>
            {request.status}
          </span>
          <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-[9px] font-black uppercase tracking-wider text-gray-500">
            {request.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-gray-900 font-bold text-lg leading-tight mb-2 line-clamp-2">
          {request.title}
        </h3>

        {/* Description Snippet */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {request.description}
        </p>

        {/* Footer (User & Stats) */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.createdBy?.username || 'user'}`} alt="avatar" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-900 truncate max-w-[80px]">
                {request.createdBy?.username || 'Anonymous'}
              </span>
              <span className="text-[9px] text-gray-400 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> {timeAgo(request.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleLike}
              className="flex items-center gap-1 group/btn"
            >
              <Heart className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover/btn:text-red-400'}`} />
              <span className={`text-xs font-bold ${isLiked ? 'text-red-500' : 'text-gray-400 group-hover/btn:text-red-400'}`}>{likesCount}</span>
            </button>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-bold text-gray-400">{request.comments?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RequestCard;
