import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CategoryCard } from '../components/CategoryCard';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';

export function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await api.get('/categories/');
      if (response.data) {
        setCategories(response.data);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const getParentName = (parentId: string) => {
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : parentId;
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const res = await api.delete(`/categories/${id}`);
      if (!res.error) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        alert(res.error);
      }
    }
  };

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          <Link
            to="/categories/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Add Category
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map(c => (
              <CategoryCard 
                key={c.id} 
                category={c} 
                parentName={c.parent_id ? getParentName(c.parent_id) : undefined}
                onEdit={(id) => navigate(`/categories/edit/${id}`)}
                onDelete={handleDelete}
              />
            ))}
            {categories.length === 0 && (
              <p className="text-gray-500 col-span-full text-center py-10">No categories found.</p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
