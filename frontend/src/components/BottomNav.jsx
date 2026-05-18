import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Bookmark, MessageSquare, DollarSign, UserCircle } from 'lucide-react';
import { useUserAuth } from '../contexts/UserAuthContext';

const navItems = [
  { id: 'home', icon: Home, label: 'Home', path: '/' },
  { id: 'explore', icon: Compass, label: 'Explore', path: '/explore' },
  { id: 'saved', icon: Bookmark, label: 'Saved', path: '/saved' },
  { id: 'requests', icon: MessageSquare, label: 'Requests', path: '/requests' },
  { id: 'donate', icon: DollarSign, label: 'Donate', path: '/donate' },
  { id: 'profile', icon: UserCircle, label: 'Profile', path: '/profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useUserAuth();

  const displayName = user?.displayName || user?.username || user?.email?.split('@')[0] || 'User';
  const profilePhoto = user?.photoURL || user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-t border-white/20 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] glass">
      <nav className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className="relative p-2 transition-all duration-300"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActive"
                  className="absolute inset-0 bg-gray-50 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              {item.id === 'profile' && isAuthenticated ? (
                <div className={`w-6 h-6 rounded-full overflow-hidden border transition-all duration-300 ${isActive ? 'border-gray-900' : 'border-gray-200'}`}>
                   <img src={profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <item.icon 
                  className={`w-5 h-5 transition-colors duration-300 
                    ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`} 
                />
              )}
              
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-900 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
