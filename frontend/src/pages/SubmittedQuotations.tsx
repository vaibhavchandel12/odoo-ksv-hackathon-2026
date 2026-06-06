import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export function SubmittedQuotations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterRfqId = searchParams.get('rfq_id');

  const [allQuotations, setAllQuotations] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (filterRfqId) {
      setQuotations(allQuotations.filter(q => q.rfq_id === filterRfqId));
    } else {
      setQuotations(allQuotations);
    }
  }, [filterRfqId, allQuotations]);

  const fetchData = async () => {
    setLoading(true);
    const res = await api.get('/quotations');
    if (res.data) setAllQuotations(res.data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await api.patch(`/quotations/${id}`, { status });
    if (!res.error) {
      fetchData();
    } else {
      alert("Failed to update status: " + res.error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100"><CheckCircle className="h-3 w-3" /> Approved</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-100"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-100"><Clock className="h-3 w-3" /> Pending</span>;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleCompareClick = () => {
    if (selectedIds.size > 1) {
      setShowComparison(true);
    } else {
      alert("Please select at least two quotations to compare.");
    }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold text-slate-900">Submitted Quotations</h1>
              {filterRfqId && (
                <button 
                  onClick={() => setSearchParams({})}
                  className="flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                >
                  <Filter className="h-3 w-3" />
                  Filtered by RFQ
                  <X className="h-3 w-3 ml-1" />
                </button>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">Review and manage quotations from vendors.</p>
          </div>
          {selectedIds.size > 0 && (
            <button 
              onClick={handleCompareClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              Compare Selected ({selectedIds.size})
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#2563EB] rounded-full border-t-transparent"></div></div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 w-12"></th>
                  <th className="px-6 py-4 w-8"></th>
                  <th className="px-6 py-4">RFQ Title</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total Value</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map(q => {
                  const totalValue = q.lines.reduce((sum: number, line: any) => sum + (line.price * line.quantity), 0);
                  const isExpanded = expandedId === q.id;

                  return (
                    <React.Fragment key={q.id}>
                      <tr className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`} onClick={() => toggleExpand(q.id)}>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(q.id)} 
                            onChange={() => toggleSelect(q.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                        </td>
                        <td className="px-6 py-4">
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">{q.rfq_title}</td>
                        <td className="px-6 py-4 text-slate-700">{q.vendor_name}</td>
                        <td className="px-6 py-4 text-slate-500">{q.lines.length} items</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">${totalValue.toFixed(2)}</td>
                        <td className="px-6 py-4">{getStatusBadge(q.status)}</td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {q.status === 'Pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => updateStatus(q.id, 'Approved')}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 text-xs font-semibold transition-colors"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => updateStatus(q.id, 'Rejected')}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 text-xs font-semibold transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {q.status === 'Approved' && (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => updateStatus(q.id, 'Rejected')}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold transition-colors"
                              >
                                Reject
                              </button>
                              <button 
                                onClick={async () => {
                                  const res = await api.post('/purchase-orders/', { quotation_id: q.id });
                                  if (!res.error) {
                                    window.location.href = `/purchase-orders/${res.data.id}`;
                                  } else {
                                    alert(res.error);
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
                              >
                                Create Purchase Order
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="px-0 py-0 bg-slate-50/50 border-b border-slate-100">
                            <div className="px-14 py-4">
                              <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Line Items</h4>
                              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                <table className="w-full text-left text-sm text-slate-600">
                                  <thead className="bg-slate-100/50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                                    <tr>
                                      <th className="px-4 py-2">Product</th>
                                      <th className="px-4 py-2">Vendor Code</th>
                                      <th className="px-4 py-2">Qty</th>
                                      <th className="px-4 py-2">Unit Price</th>
                                      <th className="px-4 py-2">Subtotal</th>
                                      <th className="px-4 py-2">Lead Time</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {q.lines.map((line: any) => (
                                      <tr key={line.id}>
                                        <td className="px-4 py-3 font-medium text-slate-900">{line.product_name}</td>
                                        <td className="px-4 py-3 text-slate-500">{line.vendor_code}</td>
                                        <td className="px-4 py-3 text-slate-700">{line.quantity}</td>
                                        <td className="px-4 py-3 text-slate-700">${line.price.toFixed(2)}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-700">${(line.price * line.quantity).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-slate-500">{line.lead_time_days ? `${line.lead_time_days} days` : '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {quotations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">No quotations have been submitted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Comparison Modal */}
        {showComparison && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden border border-slate-200 animate-fadeIn max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="font-bold text-slate-900 font-display">Quotation Comparison</h3>
                <button onClick={() => setShowComparison(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
              </div>
              <div className="overflow-x-auto overflow-y-auto flex-1 p-6">
                <div className="flex gap-6 min-w-max">
                  {quotations.filter(q => selectedIds.has(q.id)).map(q => {
                    const totalValue = q.lines.reduce((sum: number, line: any) => sum + (line.price * line.quantity), 0);
                    return (
                      <div key={q.id} className="w-80 border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col">
                        <div className="mb-4 pb-4 border-b border-slate-100">
                          <h4 className="font-bold text-lg text-slate-900 mb-1">{q.vendor_name}</h4>
                          <p className="text-xs text-slate-500">RFQ: {q.rfq_title}</p>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Value</span>
                            <span className="text-xl font-display font-bold text-indigo-600">${totalValue.toFixed(2)}</span>
                          </div>
                          
                          <div>
                            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Line Items</span>
                            <div className="space-y-2">
                              {q.lines.map((line: any) => (
                                <div key={line.id} className="bg-slate-50 border border-slate-100 p-2 rounded text-sm">
                                  <div className="font-semibold text-slate-800">{line.product_name}</div>
                                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>{line.quantity} units @ ${line.price.toFixed(2)}</span>
                                    <span className="font-medium">${(line.quantity * line.price).toFixed(2)}</span>
                                  </div>
                                  {line.lead_time_days && (
                                    <div className="text-xs text-emerald-600 mt-1">Lead time: {line.lead_time_days} days</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                          <button 
                            onClick={() => {
                              updateStatus(q.id, 'Approved');
                              setShowComparison(false);
                            }}
                            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                          >
                            Approve Winner
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
