import React, { createContext, useContext, useState, useEffect } from 'react';

const NavContext = createContext();

export const useNav = () => {
  const context = useContext(NavContext);
  if (!context) throw new Error('useNav must be used within a NavProvider');
  return context;
};

export const NavProvider = ({ children }) => {
  const [activeItem, setActiveItem] = useState(localStorage.getItem('activeItem') || 'explore');
  const [activeCategory, setActiveCategory] = useState(localStorage.getItem('activeCategory') || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('activeCategory', activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    localStorage.setItem('activeItem', activeItem);
  }, [activeItem]);

  // Debounce search — wait 300ms after user stops typing before triggering fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const value = {
    activeItem,
    setActiveItem,
    activeCategory,
    setActiveCategory,
    searchQuery,        // raw — bound to input for instant UI feel
    setSearchQuery,
    debouncedSearchQuery, // debounced — used for API calls
    isSearchOpen,
    setIsSearchOpen
  };

  return (
    <NavContext.Provider value={value}>
      {children}
    </NavContext.Provider>
  );
};
