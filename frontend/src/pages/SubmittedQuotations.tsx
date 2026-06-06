import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Filter, X, Search, ArrowUpDown, ArrowUp, ArrowDown, ClipboardCheck } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTableFilterSort } from '../hooks/useTableFilterSort';

export function SubmittedQuotations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterRfqId = searchParams.get('rfq_id');

  const [allQuotations, setAllQuotations] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const navigate = useNavigate();

  const { searchTerm, setSearchTerm, sortConfig, requestSort, processedData } = useTableFilterSort(
    quotations, 
    ['rfq_title', 'vendor_name', 'status']
  );

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
      case 'L1 Approved':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100"><CheckCircle className="h-3 w-3" /> L1 Approved</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-100"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-100"><Clock className="h-3 w-3" /> Pending</span>;
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
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
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Submitted Quotations</h1>
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
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and manage quotations from vendors.</p>
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

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search quotations by RFQ title, vendor, or status..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#2563EB] rounded-full border-t-transparent"></div></div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 w-12"></th>
                  <th className="px-6 py-4 w-8"></th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('rfq_title')}>
                    <div className="flex items-center gap-1">RFQ Title {sortConfig?.key === 'rfq_title' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('vendor_name')}>
                    <div className="flex items-center gap-1">Vendor {sortConfig?.key === 'vendor_name' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total Value</th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('status')}>
                    <div className="flex items-center gap-1">Status {sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4 text-center">Approvers</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedData.map(q => {
                  const totalValue = q.lines.reduce((sum: number, line: any) => sum + (line.price * line.quantity), 0);
                  const isExpanded = expandedIds.has(q.id);

                  return (
                    <React.Fragment key={q.id}>
                      <tr className={`hover:bg-slate-50/50 dark:bg-slate-800/50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50 dark:bg-slate-800' : ''}`} onClick={() => toggleExpand(q.id)}>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(q.id)} 
                            onChange={() => toggleSelect(q.id)}
                            className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                        </td>
                        <td className="px-6 py-4">
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{q.rfq_title}</td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{q.vendor_name}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{q.lines.length} items</td>
                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">₹{totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="px-6 py-4">{getStatusBadge(q.status)}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col gap-1 items-center justify-center">
                            {q.manager_name ? <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">M: {q.manager_name.split(' ')[0]}</span> : null}
                            {q.financer_name ? <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">F: {q.financer_name.split(' ')[0]}</span> : null}
                            {!q.manager_name && !q.financer_name && <span className="text-xs text-slate-400">—</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {/* View Approval link always visible */}
                            <button
                              onClick={() => navigate(`/approvals/${q.id}`)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1.5 text-xs font-semibold transition-colors"
                            >
                              <ClipboardCheck className="h-3 w-3" />
                              {q.status === 'Pending' ? 'View Approval' : 'Approval Detail'}
                            </button>
                            {/* Only show Create PO if fully approved by both */}
                            {q.status === 'Approved' && !q.has_po && (
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
                                Create PO
                              </button>
                            )}
                            {q.status === 'Approved' && q.has_po && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                                PO Created
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={9} className="px-0 py-0 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <div className="px-14 py-4">
                              <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-3">Line Items</h4>
                              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                  <thead className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400">
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
                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{line.product_name}</td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{line.vendor_code}</td>
                                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{line.quantity}</td>
                                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹{line.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">₹{(line.price * line.quantity).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{line.lead_time_days ? `${line.lead_time_days} days` : '-'}</td>
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
                {processedData.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No quotations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Comparison Modal */}
        {showComparison && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-fadeIn max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800 shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white font-display">Quotation Comparison</h3>
                <button onClick={() => setShowComparison(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 text-xl leading-none">&times;</button>
              </div>
              <div className="overflow-x-auto overflow-y-auto flex-1 p-6">
                <div className="flex gap-6 min-w-max">
                  {quotations.filter(q => selectedIds.has(q.id)).map(q => {
                    const totalValue = q.lines.reduce((sum: number, line: any) => sum + (line.price * line.quantity), 0);
                    return (
                      <div key={q.id} className="w-80 border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-900 shadow-sm flex flex-col">
                        <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{q.vendor_name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">RFQ: {q.rfq_title}</p>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Total Value</span>
                            <span className="text-xl font-display font-bold text-indigo-600">₹{totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                          </div>
                          
                          <div>
                            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Line Items</span>
                            <div className="space-y-2">
                              {q.lines.map((line: any) => (
                                <div key={line.id} className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-2 rounded text-sm">
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">{line.product_name}</div>
                                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    <span>{line.quantity} units @ ₹{line.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    <span className="font-medium">₹{(line.quantity * line.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                  </div>
                                  {line.lead_time_days && (
                                    <div className="text-xs text-emerald-600 mt-1">Lead time: {line.lead_time_days} days</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                          <button
                            onClick={() => {
                              setShowComparison(false);
                              navigate(`/approvals/${q.id}`);
                            }}
                            className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            View Approval
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
