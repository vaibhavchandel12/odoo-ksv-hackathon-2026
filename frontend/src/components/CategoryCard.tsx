import React from 'react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    parent_id?: string;
  };
  parentName?: string;
}

export function CategoryCard({ category, parentName }: CategoryCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-md hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
      {category.parent_id && (
        <span className="text-sm text-gray-500 mt-2 block">
          Parent: {parentName || category.parent_id}
        </span>
      )}
    </div>
  );
}
