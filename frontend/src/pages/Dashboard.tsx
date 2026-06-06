import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Shield, LogOut, Users, Database, 
  Cpu, FileText, ClipboardList, TrendingUp, CheckCircle, FilePlus, 
  ShoppingCart, DollarSign, Award, Send, LayoutDashboard, Settings
} from 'lucide-react';
import { AppLayout } from '../components/AppLayout'; // Optional: if we want to use AppLayout instead of the hardcoded sidebar. Let's stick to the existing structure for safety.

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { role: urlRole } = useParams<{ role: string }>();
  const [stats, setStats] = useState<any>(null);
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Verify if the active role matches the path, else redirect
  useEffect(() => {
    if (user && user.role) {
      const formattedRolePath = user.role.name.toLowerCase().replace(' ', '');
      if (urlRole !== formattedRolePath) {
        navigate(`/dashboard/${formattedRolePath}`, { replace: true });
      } else {
        fetchStats();
      }
    }
  }, [user, urlRole, navigate]);

  const fetchStats = async () => {
    setLoading(true);
    const res = await api.get('/analytics/dashboard');
    if (res.data) setStats(res.data);
    
    // Fetch reports data for charts if admin or manager
    if (user?.role?.name === 'Admin' || user?.role?.name === 'Manager') {
      const repRes = await api.get('/analytics/reports');
      if (repRes.data) setReportsData(repRes.data);
    }
    
    setLoading(false);
  };

  // Handle mock actions for buttons
  const handleActionClick = (actionName: string) => {
    alert(`Action: "${actionName}" triggered successfully (Mock Functionality)`);
  };

  if (!user || loading || !stats) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0F172A] text-white">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] shadow-lg shadow-blue-500/20">
            <Shield className="h-5.5 w-5.5 text-white" />
          </div>
          <span className="font-display font-bold tracking-tight text-lg">VendorBridge</span>
        </div>
        
        {/* Navigation links based on role */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ERP Workspace
          </div>
          
          <a href="#" className="flex items-center gap-3 rounded-lg bg-slate-800 px-3 py-2.5 text-sm font-medium text-white transition-colors">
            <LayoutDashboard className="h-4 w-4 text-[#2563EB]" />
            <span>Dashboard</span>
          </a>

          {user?.role?.name !== 'Vendor' && (
            <>
              <a href="/products" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <ShoppingCart className="h-4 w-4" />
                <span>Products</span>
              </a>
              <a href="/categories" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Database className="h-4 w-4" />
                <span>Categories</span>
              </a>
            </>
          )}

          {user?.role?.name === 'Admin' && (
            <>
              <a href="/users" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Users className="h-4 w-4" />
                <span>User Management</span>
              </a>
              <a href="/vendors" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Users className="h-4 w-4" />
                <span>Vendors</span>
              </a>
              <a href="/rfqs" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <ClipboardList className="h-4 w-4" />
                <span>Requests for Quotation</span>
              </a>
              <a href="/submitted-quotations" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <FileText className="h-4 w-4" />
                <span>All Quotations</span>
              </a>
              <a href="/purchase-orders" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <ShoppingCart className="h-4 w-4" />
                <span>Purchase Orders</span>
              </a>
              <a href="/bills" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <DollarSign className="h-4 w-4" />
                <span>Vendor Bills</span>
              </a>
              <a href="/system-audits" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
                <span>System Audits</span>
              </a>
              <a href="/reports" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <TrendingUp className="h-4 w-4" />
                <span>Reports & Analytics</span>
              </a>
            </>
          )}

          {user?.role?.name === 'Procurement Officer' && (
            <>
              <a href="/vendors" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Users className="h-4 w-4" />
                <span>Vendors</span>
              </a>
              <a href="/rfqs" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <ClipboardList className="h-4 w-4" />
                <span>Requests for Quotation</span>
              </a>
              <a href="/submitted-quotations" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <FileText className="h-4 w-4" />
                <span>Submitted Quotations</span>
              </a>
              <a href="/purchase-orders" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <ShoppingCart className="h-4 w-4" />
                <span>Purchase Orders</span>
              </a>
            </>
          )}

          {user?.role?.name === 'Manager' && (
            <>
              <a href="/submitted-quotations" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <CheckCircle className="h-4 w-4" />
                <span>Pending Approvals</span>
              </a>
              <a href="/reports" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <TrendingUp className="h-4 w-4" />
                <span>Reports & Analytics</span>
              </a>
            </>
          )}

          {user?.role?.name === 'Vendor' && (
            <>
              <a href="/vendor-quotations" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Send className="h-4 w-4" />
                <span>My Quotations</span>
              </a>
            </>
          )}
        </nav>

        {/* User Card inside Sidebar */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-900/60 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
              {user?.first_name[0]}{user?.last_name[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase truncate">{user?.role?.name}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 shadow-sm transition-colors">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-slate-900 dark:text-white">
              Welcome back, {user?.first_name}
            </h1>
            <span className="hidden sm:inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Active Session
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.first_name} {user?.last_name}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{user?.role?.name}</span>
            </div>
            
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-100 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Content canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* RENDER ADMIN CONTENT */}
          {user?.role?.name === 'Admin' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total System Users</span>
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><Users className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.total_users}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Open POs</span>
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><ShoppingCart className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.open_pos}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Approvals</span>
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><CheckCircle className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.pending_approvals}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active RFQs</span>
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600"><ClipboardList className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.active_rfqs}</p>
                </div>
              </div>
              
              {reportsData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5">
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Top 10 Products On Hand</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {reportsData?.top_products_on_hand?.map((p: any, i: number) => {
                        const maxQty = Math.max(...reportsData.top_products_on_hand.map((x: any) => x.qty));
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
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5">
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Most Purchased Products</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {reportsData?.most_purchased_products?.map((p: any, i: number) => {
                        const maxQty = Math.max(...reportsData.most_purchased_products.map((x: any) => x.qty));
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
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RENDER PROCUREMENT OFFICER CONTENT */}
          {user?.role?.name === 'Procurement Officer' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active RFQs</span>
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><ClipboardList className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.active_rfqs}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Received Bids</span>
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><FileText className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.received_bids}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Purchase Orders</span>
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><ShoppingCart className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.purchase_orders}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Invoices</span>
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600"><DollarSign className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.invoices}</p>
                </div>
              </div>
            </div>
          )}

          {/* RENDER MANAGER CONTENT */}
          {user?.role?.name === 'Manager' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Approvals</span>
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600"><ClipboardList className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.pending_approvals}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Approved Value</span>
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><DollarSign className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.approved_value}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Approval Turnaround</span>
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><Cpu className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.approval_turnaround}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Purchase Value</span>
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><TrendingUp className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.total_purchase_value}</p>
                </div>
              </div>
              
              {reportsData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5">
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Top 10 Products On Hand</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {reportsData?.top_products_on_hand?.map((p: any, i: number) => {
                        const maxQty = Math.max(...reportsData.top_products_on_hand.map((x: any) => x.qty));
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
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5">
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Most Purchased Products</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {reportsData?.most_purchased_products?.map((p: any, i: number) => {
                        const maxQty = Math.max(...reportsData.most_purchased_products.map((x: any) => x.qty));
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
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RENDER VENDOR CONTENT */}
          {user?.role?.name === 'Vendor' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Available RFQs</span>
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><ClipboardList className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.available_rfqs}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Submitted Bids</span>
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Send className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.submitted_bids}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Awarded Contracts</span>
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><Award className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.awarded_contracts}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Invoiced</span>
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600"><DollarSign className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.pending_invoiced}</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
export default Dashboard;
