import React from 'react';
import { motion } from 'framer-motion';
import GalleryCard from './GalleryCard';
import SkeletonCard from './SkeletonCard';

const ExploreSection = ({ 
  title, 
  items, 
  loading, 
  onPromptClick, 
  onViewAll, 
  children,
  icon: Icon,
  description
}) => {
  return (
    <section className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-gray-50 rounded-xl text-gray-900 border border-gray-100">
              <Icon size={20} strokeWidth={2.5} />
            </div>
          )}
          <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
            {title}
          </h2>
        </div>
        
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-900 transition-all active:scale-95"
          >
            View All
          </button>
        )}
      </div>

      {/* Horizontal List of Items */}
      <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar scroll-smooth">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[120px] aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            {children ? (
              <div className="flex gap-3">
                {React.Children.map(children, child => (
                   <div className="flex-shrink-0 w-[120px] md:w-[140px]">
                     {child}
                   </div>
                ))}
              </div>
            ) : (
              items?.map((item) => (
                <div 
                  key={item._id} 
                  className="flex-shrink-0 w-[120px] md:w-[140px] aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group relative"
                  onClick={() => onPromptClick(item)}
                >
                  <img 
                    src={item.imageUrl} 
                    alt="" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed mt-auto">
          {description}
        </p>
      )}
    </section>
  );
};

export default ExploreSection;
