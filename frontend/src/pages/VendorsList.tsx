import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTableFilterSort } from '../hooks/useTableFilterSort';

export function VendorsList() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { searchTerm, setSearchTerm, sortConfig, requestSort, processedData } = useTableFilterSort(
    vendors, 
    ['first_name', 'last_name', 'email', 'company_name', 'gst_details']
  );

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    const res = await api.get('/users/');
    if (res.data) {
      // Filter only users with role_name == 'Vendor'
      const vendorUsers = res.data.filter((u: any) => u.role_name === 'Vendor');
      setVendors(vendorUsers);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Vendors Directory</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View all registered vendors and their GST details.</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendors by name, email, or GST..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none bg-white dark:bg-slate-900 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-[#2563EB] rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('first_name')}>
                    <div className="flex items-center gap-1">Name {sortConfig?.key === 'first_name' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('email')}>
                    <div className="flex items-center gap-1">Email {sortConfig?.key === 'email' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('gst_details')}>
                    <div className="flex items-center gap-1">GST Details {sortConfig?.key === 'gst_details' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedData.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{vendor.first_name} {vendor.last_name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{vendor.email}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{vendor.phone || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{vendor.gst_details || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {vendor.is_active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-100">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {processedData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No vendors found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
