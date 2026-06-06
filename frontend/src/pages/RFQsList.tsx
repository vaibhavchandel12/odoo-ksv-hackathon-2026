import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { useTableFilterSort } from '../hooks/useTableFilterSort';

export function RFQsList() {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { searchTerm, setSearchTerm, sortConfig, requestSort, processedData } = useTableFilterSort(
    rfqs, 
    ['title', 'status']
  );

  useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    setLoading(true);
    const res = await api.get('/rfqs/');
    if (res.data) {
      setRfqs(res.data);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Requests for Quotation</h1>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Manage all your RFQs and vendor assignments.</p>
          </div>
          <button
            onClick={() => navigate('/rfqs/create')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Create RFQ
          </button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search RFQs by title or status..."
              className="w-full pl-10 pr-4 py-2 border border-white/50 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900/40 shadow-sm backdrop-blur-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 dark:bg-gray-800/50 transition-colors" onClick={() => requestSort('title')}>
                    <div className="flex items-center gap-1">Title {sortConfig?.key === 'title' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 dark:bg-gray-800/50 transition-colors" onClick={() => requestSort('status')}>
                    <div className="flex items-center gap-1">Status {sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 dark:bg-gray-800/50 transition-colors" onClick={() => requestSort('created_at')}>
                    <div className="flex items-center gap-1">Created At {sortConfig?.key === 'created_at' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 dark:text-gray-500 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">Loading RFQs...</td>
                  </tr>
                ) : processedData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">No RFQs found.</td>
                  </tr>
                ) : (
                  processedData.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-white dark:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{rfq.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rfq.status === 'Sent to Vendor' ? 'bg-green-100 text-green-800 border border-green-200' :
                          rfq.status === 'Draft' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700' :
                          'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {rfq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm">
                        {new Date(rfq.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="View RFQ"
                            onClick={() => navigate(`/rfqs/edit/${rfq.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1.5 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit RFQ"
                            onClick={() => navigate(`/rfqs/edit/${rfq.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
