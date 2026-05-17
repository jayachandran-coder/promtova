import React from 'react';

const CategoryCard = React.memo(({ category, onClick }) => {
  return (
    <div
      onClick={() => onClick(category.name)}
      className="relative flex-1 aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 transform-gpu"
    >
      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-100" />
      <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
        <h3 className="text-white text-[10px] md:text-xs font-black tracking-tight uppercase truncate">
          {category.name}
        </h3>
      </div>
    </div>
  );
});

export default CategoryCard;
