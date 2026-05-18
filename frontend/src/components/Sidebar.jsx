import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Compass,
  Bookmark, 
  MessageSquare, 
  Heart, 
  UserCircle,
  DollarSign
} from 'lucide-react';
import { useUserAuth } from '../contexts/UserAuthContext';

const menuItems = [
  { id: 'home', icon: Home, label: 'Home', path: '/' },
  { id: 'explore', icon: Compass, label: 'Explore', path: '/explore' },
  { id: 'saved', icon: Bookmark, label: 'Saved', path: '/saved' },
  { id: 'requests', icon: MessageSquare, label: 'Requests', path: '/requests' },
  { id: 'donate', icon: DollarSign, label: 'Donate', path: '/donate' },
  { id: 'profile', icon: UserCircle, label: 'Profile', path: '/profile' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout, openAuthModal } = useUserAuth();

  const displayName = user?.displayName || user?.username || user?.email?.split('@')[0] || 'User';
  const profilePhoto = user?.photoURL || user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

  return (
    <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-64px)] transition-all duration-300 z-50 border-r border-white/20 bg-white/70 backdrop-blur-xl glass overflow-hidden">
      <div className="flex flex-col h-full w-20 lg:w-60 xl:w-64 transition-all duration-300">
        <div className={`flex flex-col h-full bg-white glass p-4 lg:p-6 w-full`}>
          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1 lg:gap-2 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`group flex items-center gap-4 px-4 py-3 lg:py-3.5 rounded-2xl transition-all duration-300 relative
                    ${isActive ? 'text-gray-900 bg-gray-50/50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <Icon 
                    className={`w-5 h-5 shrink-0 transition-all duration-300 ${isActive ? 'text-gray-900' : 'group-hover:text-gray-900'}`} 
                  />
                  <span className={`font-semibold text-sm whitespace-nowrap transition-opacity duration-300 ${isActive ? 'text-gray-900' : 'text-gray-500'} hidden lg:block`}>
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-6 bg-gray-900 rounded-r-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="mt-auto pt-6 border-t border-gray-100">
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-1 lg:px-2">
                <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                      <img src={profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div className={`flex flex-col hidden lg:block`}>
                    <span className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{displayName}</span>
                  </div>
                </Link>
              </div>
            ) : (
              <button 
                onClick={openAuthModal}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                <UserCircle className="w-5 h-5 shrink-0" />
                <span className={`font-semibold text-sm hidden lg:block`}>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
