import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Clock, ShoppingCart, UserCog, Save } from 'lucide-react';

const STEPS = ['Submitted', 'L1 Review', 'L2 Approval', 'Generate PO'];

function StepIcon({ status, step }: { status: string; step: number }) {
  const active = status === 'current';
  const done = status === 'done';
  return (
    <div className="flex flex-col items-center">
      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm transition-all
        ${done ? 'bg-indigo-600 border-indigo-600 text-white'
          : active ? 'bg-indigo-100 border-indigo-600 text-indigo-700'
          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'}`}>
        {done ? <CheckCircle className="h-5 w-5" /> : step}
      </div>
      <div className={`mt-2 text-xs font-semibold ${active ? 'text-indigo-600' : done ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'}`}>
        {STEPS[step - 1]}
      </div>
    </div>
  );
}

export function ApprovalWorkflow() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Assignee state
  const [managers, setManagers] = useState<any[]>([]);
  const [financers, setFinancers] = useState<any[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [selectedFinancerId, setSelectedFinancerId] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);

  useEffect(() => {
    fetchQuotation();
    fetchAssignableUsers();
  }, [id]);

  const fetchAssignableUsers = async () => {
    const res = await api.get('/users');
    if (res.data) {
      setManagers(res.data.filter((u: any) => u.role_name === 'Manager'));
      setFinancers(res.data.filter((u: any) => u.role_name === 'Financer'));
    }
  };

  const fetchQuotation = async () => {
    setLoading(true);
    const res = await api.get('/quotations');
    if (res.data) {
      const q = res.data.find((q: any) => q.id === id);
      setQuotation(q || null);
    }
    setLoading(false);
  };

  const handleAssign = async () => {
    if (!quotation) return;
    setAssignSaving(true);
    const payload: any = {};
    if (selectedManagerId) payload.assigned_manager_id = selectedManagerId;
    if (selectedFinancerId) payload.assigned_financer_id = selectedFinancerId;
    const res = await api.patch(`/quotations/${quotation.id}`, payload);
    if (!res.error) {
      await fetchQuotation();
      setSelectedManagerId('');
      setSelectedFinancerId('');
    } else {
      alert('Failed to assign: ' + res.error);
    }
    setAssignSaving(false);
  };

  const handleApprove = async () => {
    if (!quotation) return;
    setSubmitting(true);
    const role = user?.role?.name;
    const payload: any = {};
    if (role === 'Manager') {
      payload.manager_status = 'Approved';
      payload.manager_remarks = remarks;
    } else if (role === 'Financer') {
      payload.financer_status = 'Approved';
      payload.financer_remarks = remarks;
    } else if (role === 'Procurement Officer' || role === 'Admin') {
      payload.status = 'L1 Approved';
    }
    const res = await api.patch(`/quotations/${quotation.id}`, payload);
    if (!res.error) { await fetchQuotation(); setRemarks(''); }
    else alert('Failed: ' + res.error);
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (!quotation) return;
    setSubmitting(true);
    const role = user?.role?.name;
    const payload: any = {};
    if (role === 'Manager') {
      payload.manager_status = 'Rejected';
      payload.manager_remarks = remarks;
    } else if (role === 'Financer') {
      payload.financer_status = 'Rejected';
      payload.financer_remarks = remarks;
    } else if (role === 'Procurement Officer' || role === 'Admin') {
      payload.status = 'Rejected';
    }
    const res = await api.patch(`/quotations/${quotation.id}`, payload);
    if (!res.error) { await fetchQuotation(); setRemarks(''); }
    else alert('Failed: ' + res.error);
    setSubmitting(false);
  };

  const handleCreatePO = async () => {
    if (!quotation) return;
    setSubmitting(true);
    const res = await api.post('/purchase-orders/', { quotation_id: quotation.id });
    if (!res.error) navigate(`/purchase-orders/${res.data.id}`);
    else alert('Failed to create PO: ' + res.error);
    setSubmitting(false);
  };

  const getCurrentStep = (q: any) => {
    if (q.status === 'Approved') return 4;
    if (q.status === 'L1 Approved') return 3;
    if (q.status === 'Pending' || q.status === 'Submitted') return 2;
    return 1;
  };

  const getStepStatus = (q: any, step: number) => {
    const current = getCurrentStep(q);
    if (step < current) return 'done';
    if (step === current) return 'current';
    return 'upcoming';
  };

  const canAct = () => {
    if (!quotation || !user) return false;
    const role = user.role?.name;
    if (role === 'Manager') return quotation.manager_status === 'Awaiting' && quotation.status === 'L1 Approved';
    if (role === 'Financer') return quotation.financer_status === 'Awaiting' && quotation.status === 'L1 Approved';
    if (role === 'Procurement Officer' || role === 'Admin') return quotation.status === 'Pending' || quotation.status === 'Submitted';
    return false;
  };

  const canAssign = () => ['Admin', 'Procurement Officer'].includes(user?.role?.name || '');

  if (loading) return (
    <AppLayout showBack>
      <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#2563EB] rounded-full border-t-transparent"></div></div>
    </AppLayout>
  );

  if (!quotation) return (
    <AppLayout showBack>
      <div className="p-8 text-center text-slate-500">Quotation not found.</div>
    </AppLayout>
  );

  const totalValue = quotation.lines?.reduce((s: number, l: any) => s + l.price * l.quantity, 0) || 0;
  const currentStep = getCurrentStep(quotation);
  const role = user?.role?.name;

  return (
    <AppLayout showBack>
      <div className="p-8 max-w-6xl mx-auto animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Approval Workflow</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            RFQ: <span className="font-semibold text-indigo-600">{quotation.rfq_title}</span> — Vendor: <span className="font-semibold">{quotation.vendor_name}</span> — ₹{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Stepper */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>
            <div className="absolute top-5 left-5 h-0.5 bg-indigo-600 z-0 transition-all"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}>
            </div>
            {STEPS.map((_, i) => (
              <div key={i} className="relative z-10">
                <StepIcon status={getStepStatus(quotation, i + 1)} step={i + 1} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">

            {/* Assign to Manager & Finance — only Admin/Procurement can do this */}
            {canAssign() && (quotation.status === 'Pending' || quotation.status === 'Submitted' || quotation.status === 'L1 Approved') && (
              <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserCog className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Assign Approvers</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Assign to Manager
                    </label>
                    <select
                      value={selectedManagerId}
                      onChange={(e) => setSelectedManagerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">{quotation.manager_name || '— Select Manager —'}</option>
                      {managers.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Assign to Finance Manager
                    </label>
                    <select
                      value={selectedFinancerId}
                      onChange={(e) => setSelectedFinancerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">{quotation.financer_name || '— Select Finance Manager —'}</option>
                      {financers.map((f: any) => (
                        <option key={f.id} value={f.id}>{f.first_name} {f.last_name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAssign}
                    disabled={assignSaving || (!selectedManagerId && !selectedFinancerId)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {assignSaving ? 'Saving...' : 'Save Assignment'}
                  </button>
                </div>
              </div>
            )}

            {/* Approval Chain */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Approval Chain</h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Manager */}
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
                    quotation.manager_status === 'Approved' ? 'bg-emerald-100 text-emerald-600'
                    : quotation.manager_status === 'Rejected' ? 'bg-red-100 text-red-600'
                    : 'bg-amber-100 text-amber-600'}`}>
                    {quotation.manager_status === 'Approved' ? <CheckCircle className="h-4 w-4" />
                      : quotation.manager_status === 'Rejected' ? <XCircle className="h-4 w-4" />
                      : <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {quotation.manager_name || <span className="text-slate-400 italic">Not assigned yet</span>}
                      <span className="text-slate-500 font-normal"> (Manager)</span>
                    </p>
                    <p className="text-xs mt-0.5">
                      {quotation.manager_status === 'Awaiting' ? <span className="text-slate-500">Awaiting review</span>
                        : quotation.manager_status === 'Approved' ? <span className="text-emerald-600 font-bold">Approved on {new Date(quotation.manager_approved_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        : <span className="text-red-600 font-bold">Rejected on {new Date(quotation.manager_approved_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                    </p>
                    {quotation.manager_remarks && (
                      <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-slate-600 dark:text-slate-400 italic border border-slate-100 dark:border-slate-700">
                        "{quotation.manager_remarks}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-l-2 border-dashed border-slate-200 dark:border-slate-700 ml-4 h-4"></div>

                {/* Financer */}
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
                    quotation.financer_status === 'Approved' ? 'bg-emerald-100 text-emerald-600'
                    : quotation.financer_status === 'Rejected' ? 'bg-red-100 text-red-600'
                    : 'bg-amber-100 text-amber-600'}`}>
                    {quotation.financer_status === 'Approved' ? <CheckCircle className="h-4 w-4" />
                      : quotation.financer_status === 'Rejected' ? <XCircle className="h-4 w-4" />
                      : <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {quotation.financer_name || <span className="text-slate-400 italic">Not assigned yet</span>}
                      <span className="text-slate-500 font-normal"> (Financer)</span>
                    </p>
                    <p className="text-xs mt-0.5">
                      {quotation.financer_status === 'Awaiting' ? <span className="text-slate-500">Awaiting review</span>
                        : quotation.financer_status === 'Approved' ? <span className="text-emerald-600 font-bold">Approved on {new Date(quotation.financer_approved_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        : <span className="text-red-600 font-bold">Rejected on {new Date(quotation.financer_approved_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                    </p>
                    {quotation.financer_remarks && (
                      <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-slate-600 dark:text-slate-400 italic border border-slate-100 dark:border-slate-700">
                        "{quotation.financer_remarks}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks & Action Buttons */}
            {canAct() && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Your Approval Remarks</h3>
                {(user?.role?.name === 'Manager' || user?.role?.name === 'Financer') && (
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add your comments or conditions..."
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 resize-none"
                  />
                )}
                <div className="flex gap-3 mt-4">
                  <button onClick={handleApprove} disabled={submitting}
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                    {submitting ? 'Processing...' : 'Approve'}
                  </button>
                  <button onClick={handleReject} disabled={submitting}
                    className="flex-1 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors">
                    {submitting ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            )}

            {/* PO Generation */}
            {quotation.status === 'Approved' && !quotation.has_po && (role === 'Admin' || role === 'Procurement Officer') && (
              <button onClick={handleCreatePO} disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-md disabled:opacity-50 transition-colors">
                <ShoppingCart className="h-4 w-4" />
                {submitting ? 'Creating...' : 'Generate Purchase Order'}
              </button>
            )}
            {quotation.status === 'Approved' && quotation.has_po && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-center text-emerald-700 font-semibold text-sm flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" /> Purchase Order has been created
              </div>
            )}
          </div>

          {/* Right: Quotation Summary */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Quotation Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Vendor</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{quotation.vendor_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Total</span>
                <span className="text-lg font-display font-bold text-indigo-600">₹{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Items</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{quotation.lines?.length || 0} products</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Submitted</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{new Date(quotation.created_at).toLocaleDateString('en-IN')}</span>
              </div>

              {/* Line Items */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Line Items</h4>
                <div className="space-y-2">
                  {quotation.lines?.map((line: any) => (
                    <div key={line.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{line.product_name}</p>
                        <p className="text-[10px] text-slate-500">{line.quantity} × ₹{line.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">₹{(line.price * line.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
