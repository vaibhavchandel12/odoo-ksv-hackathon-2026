import React from 'react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    image_url?: string;
    cost: number;
    on_hand_qty: number;
    category_id?: string;
    category_id?: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const [imgError, setImgError] = React.useState(false);
  return (
    <div className="bg-white dark:bg-slate-900/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {product.image_url && !imgError ? (
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-40 object-cover rounded-xl mb-4" 
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-40 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl mb-4 flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500 font-medium">No Image</span>
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{product.name}</h3>
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
        <span className="font-medium text-emerald-600">₹{product.cost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        <span>Qty: {product.on_hand_qty}</span>
      </div>
      {(onEdit || onDelete) && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
          {onEdit && (
            <button 
              onClick={() => onEdit(product.id)}
              className="flex-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(product.id)}
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
