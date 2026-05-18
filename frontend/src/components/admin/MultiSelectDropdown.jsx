import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Check } from 'lucide-react';

const MultiSelectDropdown = ({ 
  options = [], 
  selectedOptions = [], 
  onChange, 
  placeholder = "Select categories..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    let updated;
    if (selectedOptions.includes(option)) {
      updated = selectedOptions.filter(item => item !== option);
    } else {
      updated = [...selectedOptions, option];
    }
    onChange(updated);
  };

  const removeOption = (e, option) => {
    e.stopPropagation();
    const updated = selectedOptions.filter(item => item !== option);
    onChange(updated);
  };

  return (
    <div ref={containerRef} className="relative w-full text-left">
      {/* Trigger Area */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[50px] px-4 py-2 bg-gray-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-300 outline-none select-none
          ${isOpen 
            ? 'border-gray-900 bg-white ring-2 ring-gray-900/5' 
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100/50'
          }`}
      >
        <div className="flex flex-wrap gap-1.5 py-1">
          {selectedOptions.length === 0 ? (
            <span className="text-gray-400 text-xs md:text-sm font-medium">{placeholder}</span>
          ) : (
            <AnimatePresence>
              {selectedOptions.map((option) => (
                <motion.span
                  key={option}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold leading-none shadow-sm"
                >
                  {option}
                  <button
                    type="button"
                    onClick={(e) => removeOption(e, option)}
                    className="p-0.5 hover:bg-white/20 rounded-full transition-colors leading-none"
                    aria-label={`Remove ${option}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 ml-2 transition-transform duration-300 shrink-0
            ${isOpen ? 'transform rotate-180 text-gray-900' : ''}`} 
        />
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto"
          >
            <div className="p-2 space-y-1">
              {options.map((option) => {
                const isSelected = selectedOptions.includes(option);
                return (
                  <div
                    key={option}
                    onClick={() => toggleOption(option)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs md:text-sm font-bold cursor-pointer transition-all select-none
                      ${isSelected 
                        ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                      }`}
                  >
                    <span>{option}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiSelectDropdown;
