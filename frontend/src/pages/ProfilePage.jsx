import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, LogOut, Bookmark, Mail, Loader2 } from 'lucide-react';
import { useUserAuth } from '../contexts/UserAuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const { user, logout, setUser } = useUserAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.put('/user/profile', formData);
      // Backend returns { success: true, data: { ...user } }
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error('Failed to upload profile image', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen md:min-h-[80vh] flex items-start md:items-center justify-center p-2 md:p-4 pt-10 md:pt-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3rem] border border-white/50 shadow-2xl overflow-hidden"
      >
        <div className="p-5 md:p-12 flex flex-col items-center text-center">
          {/* Profile Photo */}
          <div className="relative group cursor-pointer mb-4 md:mb-8" onClick={handleImageClick}>
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-50">
              {uploading ? (
                <div className="w-full h-full flex items-center justify-center bg-black/5 backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 text-black animate-spin" />
                </div>
              ) : (
                <img 
                  src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300">
               <Camera className="w-6 h-6 text-white" />
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {/* User Info */}
          <div className="space-y-0.5 mb-5 md:mb-10">
            <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter flex items-center justify-center gap-2">
              {user?.username}
            </h1>
            <div className="flex items-center justify-center gap-1.5 text-gray-400 font-medium text-[10px] md:text-sm">
              <Mail className="w-3 h-3" />
              {user?.email}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="w-full mb-6 md:mb-10">
            <div className="bg-gray-50/50 rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 bg-white rounded-lg md:rounded-xl shadow-sm">
                     <Bookmark className="w-3 md:w-4 h-3 md:h-4 text-blue-500" />
                  </div>
                  <span className="text-[10px] md:text-sm font-bold text-gray-700">Total Saves</span>
               </div>
               <span className="text-sm md:text-lg font-black text-gray-900">{(user?.savedPrompts || []).length}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2 md:space-y-3">
            <button 
              onClick={handleImageClick}
              className="w-full py-3 md:py-4 bg-gray-50 text-gray-900 rounded-xl md:rounded-2xl font-bold text-[11px] md:text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
               <Camera className="w-3.5 h-3.5" /> Edit Profile Photo
            </button>
            <button 
              onClick={logout}
              className="w-full py-3 md:py-4 bg-red-50 text-red-600 rounded-xl md:rounded-2xl font-bold text-[11px] md:text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
               <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
