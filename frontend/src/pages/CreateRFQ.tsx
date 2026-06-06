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

  const handleSubmit = async (e: React.FormEvent, status: string) => {
    e.preventDefault();
    const payload = {
      ...formData,
      status,
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{isEditMode ? 'Edit RFQ' : 'Create RFQ'}</h1>
            <p className="text-gray-500">{isEditMode ? 'Update existing Request for Quotation' : 'New Request for Quotation'}</p>
          </div>
          {isEditMode && (
            <button
              type="button"
              onClick={() => navigate(`/quotations?rfq_id=${id}`)}
              className="bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-indigo-600 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
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
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-white flex items-center justify-center text-indigo-600 font-bold shadow-md shadow-indigo-200">
                1
              </div>
              <span className="text-sm font-semibold text-indigo-600">Draft</span>
            </div>
            
            <div className="flex-1" />
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center text-gray-400 font-bold">
                2
              </div>
              <span className="text-sm font-medium text-gray-500">Sent to Vendor</span>
            </div>

            <div className="flex-1" />
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center text-gray-400 font-bold">
                3
              </div>
              <span className="text-sm font-medium text-gray-500">Reviewed Quotations</span>
            </div>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RFQ Title*</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white/50"
                  placeholder="Office Furniture procurement Q2"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white/50"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">GST Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white/50"
                  value={formData.gst_percentage}
                  onChange={e => setFormData({...formData, gst_percentage: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline*</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white/50"
                  value={formData.deadline ? formData.deadline.split('T')[0] : ''}
                  onChange={e => setFormData({...formData, deadline: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white/50 h-32 resize-none"
                  placeholder="Ergonomic chairs and standing desks..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Line Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Line Items (Products)</label>
                <div className="space-y-3 mb-3">
                  {lines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white/60 p-2 rounded-lg border border-gray-200">
                      <select
                        className="flex-1 bg-transparent border-none text-sm focus:ring-0 outline-none"
                        value={line.product_id}
                        onChange={e => handleLineChange(idx, 'product_id', e.target.value)}
                      >
                        <option value="">Select Product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        className="w-20 bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:ring-indigo-500 outline-none" 
                        min="1"
                        placeholder="Qty"
                        value={line.quantity}
                        onChange={e => handleLineChange(idx, 'quantity', parseInt(e.target.value))}
                      />
                      <input 
                        type="text" 
                        className="w-16 bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:ring-indigo-500 outline-none" 
                        placeholder="Unit"
                        value={line.unit}
                        onChange={e => handleLineChange(idx, 'unit', e.target.value)}
                      />
                      <button onClick={() => handleRemoveLine(idx)} className="text-red-500 hover:text-red-700 p-1">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  type="button"
                  onClick={handleAddLine}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  <Plus size={16} className="mr-1" /> Add Product Line
                </button>
              </div>

              {/* Assign Vendors */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">Assign Vendors</label>
                  <button 
                    type="button" 
                    onClick={handleSelectAllVendors}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded"
                  >
                    Select All
                  </button>
                </div>
                
                <div className="bg-white/60 border border-gray-200 rounded-lg p-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedVendors.map(vendor => (
                      <div key={vendor.id} className="flex items-center gap-1 bg-white border border-gray-300 shadow-sm px-2 py-1 rounded-md text-sm">
                        <span className="font-medium text-gray-700">{vendor.first_name} {vendor.last_name}</span>
                        <button type="button" onClick={() => handleRemoveVendor(vendor.id)} className="text-gray-400 hover:text-red-500">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {selectedVendors.length === 0 && (
                      <span className="text-sm text-gray-400 italic">No vendors selected</span>
                    )}
                  </div>
                  
                  <select 
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    onChange={handleAddVendor}
                    value=""
                  >
                    <option value="" disabled>+ Add Vendor</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.first_name} {v.last_name} ({v.email})</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-end">
            <button 
              type="button"
              onClick={(e) => handleSubmit(e, 'Draft')}
              className="px-6 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
