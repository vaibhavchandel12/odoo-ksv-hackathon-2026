import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';

export function ProductCreate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    category_id: '',
    cost: 0,
    on_hand_qty: 0,
  });

  useEffect(() => {
    api.get('/categories/').then(res => {
      if (res.data) setCategories(res.data);
    });

    if (id) {
      api.get(`/products/${id}`).then(res => {
        if (res.data) {
          const p = res.data;
          setFormData({
            name: p.name || '',
            image_url: p.image_url || '',
            category_id: p.category_id || '',
            cost: p.cost || 0,
            on_hand_qty: p.on_hand_qty || 0,
          });
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;
    if (isEditMode) {
      res = await api.put(`/products/${id}`, formData);
    } else {
      res = await api.post('/products/', formData);
    }
    
    if (!res.error) {
      navigate('/products');
    } else {
      alert(res.error);
    }
  };

  return (
    <AppLayout showBack={true}>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/40 backdrop-blur-lg p-8 rounded-2xl shadow-xl space-y-6 border border-white/50">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white dark:bg-slate-900/50"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
            <input
              type="url"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white dark:bg-slate-900/50 mb-3"
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
              placeholder="https://example.com/image.jpg"
            />
            {formData.image_url && (
              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900/50 flex justify-center p-2">
                <img 
                  src={formData.image_url} 
                  alt="Product preview" 
                  className="max-h-48 object-contain rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white dark:bg-slate-900/50"
                value={formData.cost}
                onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
              <input
                type="number"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white dark:bg-slate-900/50"
                value={formData.on_hand_qty}
                onChange={e => setFormData({...formData, on_hand_qty: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white dark:bg-slate-900"
              value={formData.category_id}
              onChange={e => setFormData({...formData, category_id: e.target.value})}
            >
              <option value="">Select a category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] cursor-pointer"
          >
            {isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
