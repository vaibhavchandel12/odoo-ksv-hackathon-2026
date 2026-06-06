import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { Plus, Clock, CheckCircle, XCircle, Trash2, ChevronDown, ChevronUp, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTableFilterSort } from '../hooks/useTableFilterSort';

export function VendorQuotations() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const { searchTerm, setSearchTerm, sortConfig, requestSort, processedData } = useTableFilterSort(
    quotations, 
    ['rfq_title', 'status']
  );
  
  const [showModal, setShowModal] = useState(false);
  const [formRfqId, setFormRfqId] = useState('');
  const [formLines, setFormLines] = useState([{
    product_id: '',
    vendor_code: '',
    price: '',
    quantity: '1',
    lead_time_days: ''
  }]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [quotesRes, prodsRes, rfqsRes] = await Promise.all([
      api.get('/quotations'),
      api.get('/products'),
      api.get('/rfqs')
    ]);
    if (quotesRes.data) setQuotations(quotesRes.data);
    if (prodsRes.data) setProducts(prodsRes.data);
    if (rfqsRes.data) setRfqs(rfqsRes.data);
    setLoading(false);
  };

  const handleAddLine = () => {
    setFormLines([...formLines, { product_id: '', vendor_code: '', price: '', quantity: '1', lead_time_days: '' }]);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = [...formLines];
    newLines.splice(index, 1);
    setFormLines(newLines);
  };

  const handleLineChange = (index: number, field: string, value: string) => {
    const newLines = [...formLines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormLines(newLines);
  };

  const handleRfqSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRfqId = e.target.value;
    setFormRfqId(selectedRfqId);
    
    if (selectedRfqId) {
      const selectedRfq = rfqs.find(r => r.id === selectedRfqId);
      if (selectedRfq && selectedRfq.lines && selectedRfq.lines.length > 0) {
        const newLines = selectedRfq.lines.map((line: any) => ({
          product_id: line.product_id,
          vendor_code: '',
          price: '',
          quantity: line.quantity.toString(),
          lead_time_days: ''
        }));
        setFormLines(newLines);
      } else {
        setFormLines([{ product_id: '', vendor_code: '', price: '', quantity: '1', lead_time_days: '' }]);
      }
    } else {
      setFormLines([{ product_id: '', vendor_code: '', price: '', quantity: '1', lead_time_days: '' }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRfqId) {
      alert("Please select an RFQ");
      return;
    }
    if (formLines.length === 0) {
      alert("Please add at least one product");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      rfq_id: formRfqId,
      lines: formLines.map(line => ({
        product_id: line.product_id,
        vendor_code: line.vendor_code,
        price: parseFloat(line.price),
        quantity: parseInt(line.quantity),
        lead_time_days: line.lead_time_days ? parseInt(line.lead_time_days) : null
      }))
    };

    const res = await api.post('/quotations', payload);
    if (!res.error) {
      setShowModal(false);
      setFormRfqId('');
      setFormLines([{ product_id: '', vendor_code: '', price: '', quantity: '1', lead_time_days: '' }]);
      fetchData();
    } else {
      alert("Failed to submit quotation: " + res.error);
    }
    setIsSubmitting(false);
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

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">My Quotations</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit quotations for Active RFQs.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Submit New Quotation
          </button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search quotations by RFQ title or status..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#2563EB] outline-none bg-white dark:bg-slate-900 shadow-sm"
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
                  <th className="px-6 py-4 w-8"></th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('rfq_title')}>
                    <div className="flex items-center gap-1">RFQ Title {sortConfig?.key === 'rfq_title' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4">Total Items</th>
                  <th className="px-6 py-4">Total Value</th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('status')}>
                    <div className="flex items-center gap-1">Status {sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('created_at')}>
                    <div className="flex items-center gap-1">Submitted On {sortConfig?.key === 'created_at' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedData.map(q => {
                  const totalValue = q.lines.reduce((sum: number, line: any) => sum + (line.price * line.quantity), 0);
                  const isExpanded = expandedId === q.id;

                  return (
                    <React.Fragment key={q.id}>
                      <tr className={`hover:bg-slate-50/50 dark:bg-slate-800/50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50 dark:bg-slate-800' : ''}`} onClick={() => toggleExpand(q.id)}>
                        <td className="px-6 py-4">
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{q.rfq_title}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{q.lines.length} items</td>
                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">₹{totalValue.toFixed(2)}</td>
                        <td className="px-6 py-4">{getStatusBadge(q.status)}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(q.created_at).toLocaleDateString()}</td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="px-0 py-0 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <div className="px-14 py-4">
                              <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-3">Quotation Details</h4>
                              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                  <thead className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <tr>
                                      <th className="px-4 py-2">Product</th>
                                      <th className="px-4 py-2">Vendor Code</th>
                                      <th className="px-4 py-2">Qty</th>
                                      <th className="px-4 py-2">Price</th>
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
                                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹{line.price.toFixed(2)}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">₹{(line.price * line.quantity).toFixed(2)}</td>
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
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No quotations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-fadeIn max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white font-display">Submit Quotation</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 text-xl leading-none">&times;</button>
              </div>
              
              <div className="overflow-y-auto p-6 flex-1">
                <form id="quotation-form" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Select RFQ</label>
                    <select 
                      value={formRfqId}
                      onChange={handleRfqSelect}
                      className="w-full max-w-md px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm bg-white dark:bg-slate-900"
                      required
                    >
                      <option value="">Select an Active RFQ...</option>
                      {rfqs.map(r => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Products Offered</label>
                      <button 
                        type="button" 
                        onClick={handleAddLine}
                        className="text-sm font-medium text-[#2563EB] hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" /> Add Product
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {formLines.map((line, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Product</label>
                              <select 
                                value={line.product_id}
                                onChange={(e) => handleLineChange(index, 'product_id', e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm bg-white dark:bg-slate-900"
                                required
                              >
                                <option value="">Select...</option>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Vendor Code</label>
                              <input 
                                type="text"
                                value={line.vendor_code}
                                onChange={(e) => handleLineChange(index, 'vendor_code', e.target.value)}
                                required
                                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
                                placeholder="e.g. V-123"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Qty</label>
                              <input 
                                type="number"
                                min="1"
                                value={line.quantity}
                                onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                                required
                                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Price (₹)</label>
                                <input 
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={line.price}
                                  onChange={(e) => handleLineChange(index, 'price', e.target.value)}
                                  required
                                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="w-16 hidden md:block">
                                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Lead Time</label>
                                <input 
                                  type="number"
                                  min="0"
                                  value={line.lead_time_days}
                                  onChange={(e) => handleLineChange(index, 'lead_time_days', e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
                                  placeholder="Days"
                                />
                              </div>
                            </div>
                          </div>
                          {formLines.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveLine(index)}
                              className="mt-6 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="quotation-form"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg bg-[#2563EB] text-sm font-semibold text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quotation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
