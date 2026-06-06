import React from 'react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    image_url?: string;
    cost: number;
    on_hand_qty: number;
    category_id?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover rounded-xl mb-4" />
      ) : (
        <div className="w-full h-40 bg-gray-200/20 rounded-xl mb-4 flex items-center justify-center">
          <span className="text-gray-400">No Image</span>
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span className="font-medium text-emerald-600">${product.cost.toFixed(2)}</span>
        <span>Qty: {product.on_hand_qty}</span>
      </div>
    </div>
  );
}
