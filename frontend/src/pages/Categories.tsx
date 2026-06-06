import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CategoryCard } from '../components/CategoryCard';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { Search, ArrowUpDown } from 'lucide-react';
import { useTableFilterSort } from '../hooks/useTableFilterSort';

export function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { searchTerm, setSearchTerm, sortConfig, setSortConfig, processedData } = useTableFilterSort(
    categories, 
    ['name']
  );

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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Categories</h1>
          <Link
            to="/categories/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Add Category
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search categories by name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <select
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900"
              value={sortConfig ? `${String(sortConfig.key)}-${sortConfig.direction}` : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setSortConfig(null);
                } else {
                  const [k, d] = val.split('-');
                  setSortConfig({ key: k, direction: d as 'asc'|'desc' });
                }
              }}
            >
              <option value="">Sort by...</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {processedData.map(c => (
              <CategoryCard 
                key={c.id} 
                category={c} 
                parentName={c.parent_id ? getParentName(c.parent_id) : undefined}
                onEdit={(id) => navigate(`/categories/edit/${id}`)}
                onDelete={handleDelete}
              />
            ))}
            {processedData.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 col-span-full text-center py-10">No categories found.</p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
