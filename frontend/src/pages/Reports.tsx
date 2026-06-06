import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

export function Reports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const res = await api.get('/analytics/reports');
    if (res.data) setData(res.data);
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto animate-fadeIn print:p-0 print:max-w-none">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Vendor performance and spending summaries.</p>
          </div>
          <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 print:hidden">
            <TrendingUp className="h-4 w-4" /> Export Report
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#2563EB] rounded-full border-t-transparent"></div></div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Total Spend</h3>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign className="h-5 w-5" /></div>
                </div>
                <div className="text-4xl font-display font-bold text-indigo-600">₹{data?.summary?.total_spend?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <p className="text-xs text-slate-500 mt-2">Aggregated from all generated purchase orders</p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Total Purchase Orders</h3>
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><ShoppingCart className="h-5 w-5" /></div>
                </div>
                <div className="text-4xl font-display font-bold text-indigo-600">{data?.summary?.total_purchase_orders}</div>
                <p className="text-xs text-slate-500 mt-2">Number of completed POs in the system</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Vendor Performance</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total spend and PO distribution by vendor.</p>
              </div>
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Total Orders</th>
                    <th className="px-6 py-4">Total Spend</th>
                    <th className="px-6 py-4 w-1/3">Spend Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data?.vendor_performance?.map((v: any, i: number) => {
                    const percentage = (v.total_spend / data.summary.total_spend) * 100 || 0;
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{v.vendor}</td>
                        <td className="px-6 py-4">{v.po_count}</td>
                        <td className="px-6 py-4 font-bold text-indigo-600">₹{v.total_spend.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-xs font-semibold w-10 text-right">{percentage.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {(!data?.vendor_performance || data.vendor_performance.length === 0) && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center">No performance data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-6 mt-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Top 10 Products On Hand</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Products with highest current inventory.</p>
                </div>
                <div className="p-6 space-y-4">
                  {data?.top_products_on_hand?.map((p: any, i: number) => {
                    const maxQty = Math.max(...data.top_products_on_hand.map((x: any) => x.qty));
                    const percentage = (p.qty / maxQty) * 100 || 0;
                    return (
                      <div key={i} className="flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 -mx-1 rounded transition-colors">
                        <div className="w-6 text-center text-xs font-bold text-slate-400">{i + 1}</div>
                        <div className="w-1/3 truncate text-sm font-semibold text-slate-700 dark:text-slate-300">{p.name}</div>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <div className="w-12 text-right text-sm font-bold text-emerald-600">{p.qty}</div>
                      </div>
                    );
                  })}
                  {(!data?.top_products_on_hand || data.top_products_on_hand.length === 0) && (
                    <div className="text-center text-slate-500 text-sm py-4">No product data available.</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Most Purchased Products</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Products with highest total purchase quantities.</p>
                </div>
                <div className="p-6 space-y-4">
                  {data?.most_purchased_products?.map((p: any, i: number) => {
                    const maxQty = Math.max(...data.most_purchased_products.map((x: any) => x.qty));
                    const percentage = (p.qty / maxQty) * 100 || 0;
                    return (
                      <div key={i} className="flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 -mx-1 rounded transition-colors">
                        <div className="w-6 text-center text-xs font-bold text-slate-400">{i + 1}</div>
                        <div className="w-1/3 truncate text-sm font-semibold text-slate-700 dark:text-slate-300">{p.name}</div>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <div className="w-12 text-right text-sm font-bold text-blue-600">{p.qty}</div>
                      </div>
                    );
                  })}
                  {(!data?.most_purchased_products || data.most_purchased_products.length === 0) && (
                    <div className="text-center text-slate-500 text-sm py-4">No purchase data available.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
