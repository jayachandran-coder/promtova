import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

const categories = [
  "All", "Girls", "Boys", "Kutties", "Cinematic", "Fashion", "Anime", "Fantasy"
];

const CategoryNavbar = ({ activeCategory, setActiveCategory, searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen }) => {
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <nav className="hidden md:block sticky top-16 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 py-3">
      <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between gap-8">
        
        {/* Categories List */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap
                  ${activeCategory === category 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
              >
                {activeCategory === category && (
                  <motion.div
                    layoutId="desktopActiveCategory"
                    className="absolute inset-0 bg-gray-900 rounded-full z-[-1]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Search (Beside categories) */}
        <div className="relative flex items-center shrink-0">
          <AnimatePresence mode="wait">
            {isSearchOpen ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex items-center bg-gray-100/80 border border-gray-200 rounded-full px-4 py-2"
              >
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full font-medium"
                />
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      </div>
    </nav>
  );
};

export default CategoryNavbar;
