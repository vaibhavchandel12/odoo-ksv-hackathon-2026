import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await api.get('/products');
      if (response.data) {
        setProducts(response.data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <Link
            to="/products/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Add Product
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
            {products.length === 0 && (
              <p className="text-gray-500 col-span-full text-center py-10">No products found.</p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
