import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, X, ChevronDown } from 'lucide-react';
import { useNav } from '../contexts/NavContext';

const categories = [
  "All", "Cinematic", "Anime", "Fantasy", "Portrait", "Product Photography", "Architecture", "Fashion"
];

const TopNavbar = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    isSearchOpen,
    setIsSearchOpen,
    activeCategory,
    setActiveCategory 
  } = useNav();
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4 md:px-6">
        <div className="flex items-center h-16 relative">
          
          {/* ── MOBILE SEARCH OVERLAY ── */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[120] bg-white flex items-center px-4 md:hidden"
              >
                <div className="flex-1 flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-100">
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full text-black placeholder-gray-400"
                  />
                  <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}>
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── LEFT: Logo ── */}
          <Link to="/" className="flex items-center gap-2 shrink-0 md:w-[80px] lg:w-[180px] xl:w-[220px]">
            {/* Custom Logo PNG */}
            <img 
              src="/logo.png" 
              alt="Promptova" 
              className="w-8 h-8 object-contain shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }} // Hide if no image yet
            />
            <span className="hidden lg:block text-xl font-black tracking-tighter text-red-500 uppercase truncate">
              Promptova
            </span>
          </Link>

          {/* ── CENTER: Categories ── */}
          <div className="flex-1 flex items-center justify-center min-w-0 h-full">
            
            {/* Mobile: Old Rounded Dropdown (Centered) */}
            <div className="md:hidden w-full max-w-[180px] flex justify-center">
              <div className="relative w-full">
                <button
                  onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[11px] font-bold text-gray-700"
                >
                  <span className="truncate">{activeCategory}</span>
                  <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-300 ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isMobileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-[130] overflow-hidden p-1.5"
                    >
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setActiveCategory(category);
                            setIsMobileDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors
                            ${activeCategory === category 
                              ? 'bg-gray-900 text-white font-bold' 
                              : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          {category}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop: Minimalist typography */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8 xl:gap-10 overflow-x-auto scrollbar-hide px-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`text-sm tracking-tight font-medium transition-colors relative whitespace-nowrap py-1
                    ${activeCategory === category 
                      ? 'text-black font-bold' 
                      : 'text-gray-400 hover:text-black'
                    }`}
                >
                  {category}
                  {activeCategory === category && (
                    <motion.div layoutId="desktopActive" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Search ── */}
          <div className="flex items-center justify-end shrink-0 md:w-[180px] lg:w-[300px] xl:w-[400px]">
            {/* Desktop: Fixed Rectangular */}
            <div className="hidden md:flex w-full items-center border border-gray-200 px-4 py-2.5 bg-white group focus-within:border-red-500 transition-all rounded-xl shadow-sm">
              <Search className="w-5 h-5 text-gray-300 mr-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[15px] w-full text-black placeholder-gray-400 font-medium"
              />
            </div>

            {/* Mobile: Simple Magnifier Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 text-gray-600"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
