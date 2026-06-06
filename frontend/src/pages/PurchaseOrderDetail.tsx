import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { Download, Printer, Mail, CheckCircle, Clock } from 'lucide-react';

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

  const markAsPaid = async () => {
    const res = await api.patch(`/purchase-orders/${id}/pay`, {});
    if (!res.error) {
      setPo(res.data);
    } else {
      alert("Failed to mark as paid: " + res.error);
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
        <div className="p-8 text-center text-slate-500">Purchase Order not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Purchase Order & Invoice</h1>
            <p className="text-sm text-slate-500 mt-1">{po.po_number} - auto-generated after approval</p>
          </div>
          
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors">
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors">
              <Mail className="h-4 w-4" /> Email invoice
            </button>
          </div>
        </div>

        {/* Invoice Document Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border-none">
          
          {/* Bill To & Vendor Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Bill to:</h3>
              <div className="text-slate-800 font-semibold mb-1">Your Organization Name</div>
              <div className="text-slate-500 text-sm leading-relaxed">
                123 business park, ahmedabad<br />
                GSTIN: 253834384FB
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Vendor:</h3>
              <div className="text-slate-800 font-semibold mb-1">{po.vendor_name || 'Vendor Name'}</div>
              <div className="text-slate-500 text-sm leading-relaxed">
                {po.vendor_email}<br />
                {/* Normally address goes here, we show email for now */}
              </div>
            </div>
          </div>

          {/* PO Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">PO Number</h4>
              <div className="font-semibold text-slate-900">{po.po_number}</div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">PO date</h4>
              <div className="font-medium text-slate-700">{new Date(po.po_date).toLocaleDateString()}</div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Invoice date</h4>
              <div className="font-medium text-slate-700">{new Date(po.po_date).toLocaleDateString()}</div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Due date</h4>
              <div className="font-medium text-slate-700">{new Date(po.due_date).toLocaleDateString()}</div>
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
                  <td className="px-8 py-5 font-medium text-slate-800">{line.product_name}</td>
                  <td className="px-8 py-5 text-center text-slate-600">{line.quantity}</td>
                  <td className="px-8 py-5 text-right text-slate-600">${line.unit_price.toFixed(2)}</td>
                  <td className="px-8 py-5 text-right font-semibold text-slate-800">${line.total_price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="p-8 border-t border-slate-200 bg-slate-50/50 flex justify-end">
            <div className="w-full max-w-sm">
              <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-200">
                <span>Subtotal</span>
                <span className="font-semibold">${po.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-200">
                <span>CGST (9%)</span>
                <span>${po.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-slate-600 border-b border-slate-200">
                <span>SGST (9%)</span>
                <span>${po.sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-4 text-lg font-bold text-slate-900">
                <span>Grand total</span>
                <span>${po.grand_total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="p-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-600">Status:</span>
              {po.status === 'Paid' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                  <CheckCircle className="h-4 w-4" /> Paid
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
                  <Clock className="h-4 w-4" /> Pending Payment
                </span>
              )}
            </div>
            
            {po.status === 'Pending Payment' && (
              <button 
                onClick={markAsPaid}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Mark as Paid
              </button>
            )}
          </div>
          
        </div>
      </div>
    </AppLayout>
  );
}
