import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ChevronRight, ClipboardCheck } from 'lucide-react';

function getApprovalStatusBadge(status: string) {
  switch (status) {
    case 'Approved':
      return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100"><CheckCircle className="h-3 w-3" /> Approved</span>;
    case 'Rejected':
      return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-100"><XCircle className="h-3 w-3" /> Rejected</span>;
    default:
      return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-100"><Clock className="h-3 w-3" /> Awaiting</span>;
  }
}

export function ApprovalsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await api.get('/quotations');
      if (res.data) {
        // Filter based on role
        let filtered = res.data;
        if (user?.role?.name === 'Manager') {
          // Managers see quotations they still need to act on (Pending or already reviewed)
          filtered = res.data.filter((q: any) => q.status !== 'Rejected' || q.manager_status === 'Awaiting');
        } else if (user?.role?.name === 'Financer') {
          filtered = res.data.filter((q: any) => q.status !== 'Rejected' || q.financer_status === 'Awaiting');
        }
        setQuotations(filtered);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const getStep = (q: any) => {
    if (q.status === 'Approved') return 4;
    if (q.financer_status === 'Approved' || q.manager_status === 'Approved') return 3;
    if (q.manager_status !== 'Awaiting' || q.financer_status !== 'Awaiting') return 2;
    return 1;
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-indigo-600" />
            Approval Requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track and action approval requests for submitted quotations.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#2563EB] rounded-full border-t-transparent"></div></div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">RFQ Title</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Total Value</th>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4">Finance</th>
                  <th className="px-6 py-4">Overall Status</th>
                  <th className="px-6 py-4">Step</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quotations.map((q: any) => {
                  const totalValue = q.lines?.reduce((s: number, l: any) => s + l.price * l.quantity, 0) || 0;
                  const step = getStep(q);
                  const steps = ['Submitted', 'L1 Review', 'L2 Approval', 'Generate PO'];
                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/approvals/${q.id}`)}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{q.rfq_title}</td>
                      <td className="px-6 py-4">{q.vendor_name}</td>
                      <td className="px-6 py-4 font-semibold text-indigo-600">₹{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">{getApprovalStatusBadge(q.manager_status)}</td>
                      <td className="px-6 py-4">{getApprovalStatusBadge(q.financer_status)}</td>
                      <td className="px-6 py-4">
                        {q.status === 'Approved'
                          ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100"><CheckCircle className="h-3 w-3" /> Approved</span>
                          : q.status === 'Rejected'
                          ? <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-100"><XCircle className="h-3 w-3" /> Rejected</span>
                          : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-100"><Clock className="h-3 w-3" /> Pending</span>
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {steps.map((s, i) => (
                            <React.Fragment key={s}>
                              <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold border ${i + 1 <= step ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'}`}>
                                {i + 1}
                              </div>
                              {i < steps.length - 1 && <div className={`h-px w-3 ${i + 1 < step ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>}
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </td>
                    </tr>
                  );
                })}
                {quotations.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500">No approval requests found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
