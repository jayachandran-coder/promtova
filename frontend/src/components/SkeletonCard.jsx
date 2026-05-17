import React from 'react';

const SkeletonCard = ({ height = 'h-64' }) => {
  return (
    <div className={`masonry-item ${height} bg-gray-200 rounded-2xl overflow-hidden relative shadow-sm`}>
      <div className="absolute inset-0 shimmer" />
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <div className="h-4 bg-gray-300 rounded-full w-3/4 shimmer" />
        <div className="h-3 bg-gray-300 rounded-full w-1/2 shimmer" />
      </div>
    </div>
  );
};

export default SkeletonCard;
