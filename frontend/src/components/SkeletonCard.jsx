import React from 'react';

const SkeletonCard = ({ height = 'h-64' }) => {
  return (
    <div className={`${height} premium-skeleton rounded-2xl relative shadow-sm`}>
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <div className="h-4 bg-gray-300/60 rounded-full w-3/4" />
        <div className="h-3 bg-gray-300/40 rounded-full w-1/2" />
      </div>
    </div>
  );
};

export default SkeletonCard;
