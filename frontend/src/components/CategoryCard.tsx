import React from 'react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    parent_id?: string;
  };
  parentName?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CategoryCard({ category, parentName, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-md hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
      {category.parent_id && (
        <span className="text-sm text-gray-500 mt-2 block">
          Parent: {parentName || category.parent_id}
        </span>
      )}
      {(onEdit || onDelete) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          {onEdit && (
            <button 
              onClick={() => onEdit(category.id)}
              className="flex-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(category.id)}
              className="flex-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
