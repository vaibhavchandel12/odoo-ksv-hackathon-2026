import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Plus, FileText } from 'lucide-react';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';

export function CreateRFQ() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [quotationCount, setQuotationCount] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    deadline: '',
    description: '',
    status: 'Draft',
    gst_percentage: 0
  });

  const [lines, setLines] = useState([{ product_id: '', quantity: 1, unit: 'NOS' }]);
  const [selectedVendors, setSelectedVendors] = useState<any[]>([]);

  useEffect(() => {
    api.get('/categories/').then(res => {
      if (res.data) setCategories(res.data);
    });
    api.get('/products/').then(res => {
      if (res.data) setProducts(res.data);
    });
    api.get('/users/').then(res => {
      if (res.data) {
        const allUsers: any[] = res.data;
        const vendorUsers = allUsers.filter(u => u.role_name === 'Vendor');
        setVendors(vendorUsers);
        
        // If edit mode, fetch the RFQ AFTER we have the vendors so we can populate selected vendors
        if (id) {
          api.get('/rfqs/' + id).then(rfqRes => {
            if (rfqRes.data) {
              const rfq = rfqRes.data;
              setFormData({
                title: rfq.title,
                category_id: rfq.category_id || '',
                deadline: rfq.deadline || '',
                description: rfq.description || '',
                status: rfq.status,
                gst_percentage: rfq.gst_percentage || 0
              });
              if (rfq.lines && rfq.lines.length > 0) {
                setLines(rfq.lines.map((l: any) => ({
                  product_id: l.product_id,
                  quantity: l.quantity,
                  unit: l.unit
                })));
              }
              if (rfq.vendors && rfq.vendors.length > 0) {
                const preSelected = rfq.vendors.map((rv: any) => 
                  vendorUsers.find(vu => vu.id === rv.id) || rv
                );
                setSelectedVendors(preSelected);
              }
            }
          });
          
          api.get('/quotations/').then(qRes => {
            if (qRes.data) {
              const count = qRes.data.filter((q: any) => q.rfq_id === id).length;
              setQuotationCount(count);
            }
          });
        }
      }
    });
  }, [id]);

  const handleAddLine = () => {
    setLines([...lines, { product_id: '', quantity: 1, unit: 'NOS' }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const handleAddVendor = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vendorId = e.target.value;
    if (!vendorId) return;
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor && !selectedVendors.find(v => v.id === vendorId)) {
      setSelectedVendors([...selectedVendors, vendor]);
    }
    e.target.value = ''; 
  };

  const handleRemoveVendor = (vendorId: string) => {
    setSelectedVendors(selectedVendors.filter(v => v.id !== vendorId));
  };

  const handleSelectAllVendors = () => {
    setSelectedVendors([...vendors]);
  };

  const effectiveStatus = (): string => {
    // If quotations have been received and status is Sent to Vendor or beyond, show Reviewed Quotations
    if (quotationCount > 0 && ['Sent to Vendor', 'Reviewed Quotations'].includes(formData.status)) {
      return 'Reviewed Quotations';
    }
    return formData.status;
  };

  const handleSubmit = async (e: React.FormEvent, status: string) => {
    e.preventDefault();
    // Auto-advance to Reviewed Quotations if quotations exist
    let finalStatus = status;
    if (quotationCount > 0 && status === 'Sent to Vendor') {
      finalStatus = 'Reviewed Quotations';
    }
    const payload = {
      ...formData,
      status: finalStatus,
      lines: lines.filter(l => l.product_id.trim() !== ''),
      vendor_ids: selectedVendors.map(v => v.id)
    };

    let res;
    if (isEditMode) {
      res = await api.put(`/rfqs/${id}`, payload);
    } else {
      res = await api.post('/rfqs/', payload);
    }
    
    if (!res.error) {
      navigate('/rfqs');
    } else {
      alert(res.error);
    }
  };

  return (
    <AppLayout showBack={true}>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">{isEditMode ? 'Edit RFQ' : 'Create RFQ'}</h1>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">{isEditMode ? 'Update existing Request for Quotation' : 'New Request for Quotation'}</p>
          </div>
          {isEditMode && (
            <button
              type="button"
              onClick={() => navigate(`/submitted-quotations?rfq_id=${id}`)}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 text-indigo-600 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span>{quotationCount} Quotations</span>
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center relative w-full px-8">
            <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gray-200 -z-10" />
            
            {['Draft', 'Sent to Vendor', 'Reviewed Quotations'].map((step, index) => {
              const steps = ['Draft', 'Sent to Vendor', 'Reviewed Quotations', 'PO Created'];
              const currentIdx = steps.indexOf(effectiveStatus()) === -1 ? 0 : steps.indexOf(effectiveStatus());
              const isCompleted = index < currentIdx;
              const isActive = index === currentIdx;
              
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${isActive ? 'border-indigo-600 bg-white dark:bg-slate-900 text-indigo-600 shadow-md shadow-indigo-200' : isCompleted ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-gray-400 dark:text-gray-500'}`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span className={`text-sm ${isActive ? 'font-semibold text-indigo-600' : isCompleted ? 'font-medium text-indigo-600' : 'font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>{step}</span>
                  </div>
                  {index < 2 && <div className="flex-1" />}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Status Badge when Reviewed */}
        {effectiveStatus() === 'Reviewed Quotations' && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-900/30 px-5 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Quotations Received</p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-500">{quotationCount} vendor quotation{quotationCount !== 1 ? 's' : ''} submitted — RFQ moved to Reviewed Quotations</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/submitted-quotations?rfq_id=${id}`)}
              className="ml-auto text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              View Quotations →
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">RFQ Title*</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white dark:bg-slate-900/50"
                placeholder="Office Furniture procurement Q2"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white dark:bg-slate-900/50"
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GST Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white dark:bg-slate-900/50"
                value={formData.gst_percentage}
                onChange={e => setFormData({...formData, gst_percentage: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deadline*</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white dark:bg-slate-900/50"
                value={formData.deadline ? formData.deadline.split('T')[0] : ''}
                onChange={e => setFormData({...formData, deadline: e.target.value ? new Date(e.target.value).toISOString() : ''})}
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white dark:bg-slate-900/50 h-24 resize-none"
              placeholder="Ergonomic chairs and standing desks..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Line Items */}
          <div className="mb-8 p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Line Items (Products)</label>
              <button 
                type="button"
                onClick={handleAddLine}
                className="flex items-center text-sm font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={16} className="mr-1" /> Add Product
              </button>
            </div>
            
            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex-1 w-full">
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={line.product_id}
                      onChange={e => handleLineChange(idx, 'product_id', e.target.value)}
                    >
                      <option value="">Select Product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input 
                      type="number" 
                      className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                      min="1"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={e => handleLineChange(idx, 'quantity', parseInt(e.target.value))}
                    />
                    <input 
                      type="text" 
                      className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="Unit"
                      value={line.unit}
                      onChange={e => handleLineChange(idx, 'unit', e.target.value)}
                    />
                    <button onClick={() => handleRemoveLine(idx)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-md transition-colors ml-auto sm:ml-0">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {lines.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                  No products added yet. Click "Add Product" to start.
                </div>
              )}
            </div>
          </div>

          {/* Assign Vendors */}
          <div className="mb-4 p-6 bg-indigo-50/30 rounded-xl border border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Assign Vendors</label>
              <button 
                type="button" 
                onClick={handleSelectAllVendors}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Select All Vendors
              </button>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg p-4">
              <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                {selectedVendors.map(vendor => (
                  <div key={vendor.id} className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-md text-sm group transition-all hover:border-slate-300 dark:border-slate-600">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{vendor.first_name} {vendor.last_name}</span>
                    <button type="button" onClick={() => handleRemoveVendor(vendor.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {selectedVendors.length === 0 && (
                  <div className="flex items-center justify-center w-full py-2 text-sm text-slate-400 italic">
                    No vendors selected for this RFQ
                  </div>
                )}
              </div>
              
              <select 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                onChange={handleAddVendor}
                value=""
              >
                <option value="" disabled>+ Click to add a vendor...</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.first_name} {v.last_name} ({v.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-end">
            {formData.status === 'Draft' ? (
              <>
                <button 
                  type="button"
                  onClick={(e) => handleSubmit(e, 'Draft')}
                  className="px-6 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                >
                  Save as Draft
                </button>
                <button 
                  type="button"
                  onClick={(e) => handleSubmit(e, 'Sent to Vendor')}
                  className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
                >
                  Save & Send to Vendors
                </button>
              </>
            ) : (
              <button 
                type="button"
                onClick={(e) => handleSubmit(e, formData.status)}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
