import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { FileText, Eye, CheckCircle, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTableFilterSort } from '../hooks/useTableFilterSort';

export function BillsList() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { searchTerm, setSearchTerm, sortConfig, requestSort, processedData } = useTableFilterSort(
    bills, 
    ['po_number', 'vendor_name', 'status']
  );

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    const res = await api.get('/purchase-orders/');
    if (res.data) {
      // Filter only POs that have reached the Bill stage
      const filteredBills = res.data.filter((po: any) => po.status === 'Billed' || po.status === 'Paid');
      setBills(filteredBills);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Vendor Bills</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Review all vendor bills and their payment status</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Bills by number, vendor, or status..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center bg-white dark:bg-slate-900 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Bills Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">No bills have been created yet.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('po_number')}>
                      <div className="flex items-center gap-1">PO Number {sortConfig?.key === 'po_number' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('vendor_name')}>
                      <div className="flex items-center gap-1">Vendor {sortConfig?.key === 'vendor_name' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('po_date')}>
                      <div className="flex items-center gap-1">Date {sortConfig?.key === 'po_date' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('grand_total')}>
                      <div className="flex items-center gap-1">Grand Total {sortConfig?.key === 'grand_total' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('status')}>
                      <div className="flex items-center gap-1">Status {sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedData.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{po.po_number}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{po.vendor_name}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(po.po_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">₹{po.grand_total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="px-6 py-4">
                        {po.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            <CheckCircle className="h-3 w-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                            <FileText className="h-3 w-3" /> Billed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/bills/${po.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" /> View Bill
                        </button>
                      </td>
                    </tr>
                  ))}
                  {processedData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No bills found matching your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
