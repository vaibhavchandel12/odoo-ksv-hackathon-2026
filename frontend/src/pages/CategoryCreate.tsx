import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';

export function CategoryCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
  });

  useEffect(() => {
    api.get('/categories').then(res => {
      if (res.data) setCategories(res.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      parent_id: formData.parent_id || null
    };
    const res = await api.post('/categories', data);
    if (!res.error) {
      navigate('/categories');
    } else {
      alert(res.error);
    }
  };

  return (
    <AppLayout showBack={true}>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Add New Category</h1>
        <form onSubmit={handleSubmit} className="bg-white/40 backdrop-blur-lg p-8 rounded-2xl shadow-xl space-y-6 border border-white/50">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/50"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category (Optional)</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
              value={formData.parent_id}
              onChange={e => setFormData({...formData, parent_id: e.target.value})}
            >
              <option value="">None (Top Level)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] cursor-pointer"
          >
            Create Category
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
