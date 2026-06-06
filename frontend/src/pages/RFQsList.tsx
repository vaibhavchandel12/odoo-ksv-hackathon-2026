import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit } from 'lucide-react';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';

export function RFQsList() {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
            <h1 className="text-3xl font-bold text-gray-800">Requests for Quotation</h1>
            <p className="text-gray-500 mt-1">Manage all your RFQs and vendor assignments.</p>
          </div>
          <button
            onClick={() => navigate('/rfqs/create')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Create RFQ
          </button>
        </div>

        <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading RFQs...</td>
                  </tr>
                ) : rfqs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No RFQs found. Create one to get started.</td>
                  </tr>
                ) : (
                  rfqs.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-white/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{rfq.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rfq.status === 'Sent to Vendor' ? 'bg-green-100 text-green-800 border border-green-200' :
                          rfq.status === 'Draft' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                          'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {rfq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
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
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
