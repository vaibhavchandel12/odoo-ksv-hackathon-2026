import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { Download, Printer, Mail, CheckCircle, Clock } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPO();
  }, [id]);

  const fetchPO = async () => {
    setLoading(true);
    const res = await api.get(`/purchase-orders/${id}`);
    if (res.data) setPo(res.data);
    setLoading(false);
  };

  const createBill = async () => {
    const res = await api.patch(`/purchase-orders/${id}/create-bill`, {});
    if (!res.error) {
      setPo(res.data);
    } else {
      alert("Failed to create bill: " + res.error);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  if (!po) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">Purchase Order not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Purchase Order</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{po.po_number}</p>
          </div>
        </div>

        {/* PO Document Box */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          
          {/* Bill To & Vendor Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Bill to:</h3>
              <div className="text-slate-800 dark:text-slate-200 font-semibold mb-1">VendorBridge</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Ganesh Golry 11<br />
                GSTIN: 253834384FB
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Vendor:</h3>
              <div className="text-slate-800 dark:text-slate-200 font-semibold mb-1">{po.vendor_name || 'Vendor Name'}</div>
              <div className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {po.vendor_email}<br />
              </div>
            </div>
          </div>

          {/* PO Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">PO Number</h4>
              <div className="font-semibold text-slate-900 dark:text-white">{po.po_number}</div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">PO date</h4>
              <div className="font-medium text-slate-700 dark:text-slate-300">{new Date(po.po_date).toLocaleDateString()}</div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Due date</h4>
              <div className="font-medium text-slate-700 dark:text-slate-300">{new Date(po.due_date).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left">
            <thead className="bg-slate-800 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-8 py-4 font-semibold">Item</th>
                <th className="px-8 py-4 font-semibold text-center">Qty</th>
                <th className="px-8 py-4 font-semibold text-right">Unit price</th>
                <th className="px-8 py-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {po.lines.map((line: any) => (
                <tr key={line.id} className="text-sm">
                  <td className="px-8 py-5 font-medium text-slate-800 dark:text-slate-200">{line.product_name}</td>
                  <td className="px-8 py-5 text-center text-slate-600 dark:text-slate-400">{line.quantity}</td>
                  <td className="px-8 py-5 text-right text-slate-600 dark:text-slate-400">₹{line.unit_price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td className="px-8 py-5 text-right font-semibold text-slate-800 dark:text-slate-200">₹{line.total_price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="p-8 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
            <div className="w-full max-w-sm">
              <div className="flex justify-between py-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <span>Subtotal</span>
                <span className="font-semibold">₹{po.subtotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <span>CGST (9%)</span>
                <span>₹{po.cgst.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <span>SGST (9%)</span>
                <span>₹{po.sgst.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between py-4 text-lg font-bold text-slate-900 dark:text-white">
                <span>Grand total</span>
                <span>₹{po.grand_total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="p-6 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Status:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {po.status === 'Pending Bill' ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  {po.status}
              </span>
            </div>
            
            {po.status === 'Pending Bill' && (
              <button 
                onClick={createBill}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
              >
                Create Bill
              </button>
            )}
            
            {(po.status === 'Billed' || po.status === 'Paid') && (
              <Link 
                to={`/bills/${po.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm font-bold rounded-lg shadow-sm transition-colors"
              >
                View Bill
              </Link>
            )}
          </div>
          
        </div>
      </div>
    </AppLayout>
  );
}
