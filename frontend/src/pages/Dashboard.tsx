import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Shield, LogOut, Users, Database, 
  Cpu, FileText, ClipboardList, TrendingUp, CheckCircle, FilePlus, 
  ShoppingCart, DollarSign, Award, Send, LayoutDashboard, Settings
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { role: urlRole } = useParams<{ role: string }>();
  
  // Verify if the active role matches the path, else redirect
  useEffect(() => {
    if (user && user.role) {
      const formattedRolePath = user.role.name.toLowerCase().replace(' ', '');
      if (urlRole !== formattedRolePath) {
        navigate(`/dashboard/${formattedRolePath}`, { replace: true });
      }
    }
  }, [user, urlRole, navigate]);

  // Handle mock actions
  const handleActionClick = (actionName: string) => {
    alert(`Action: "${actionName}" triggered successfully (Mock Functionality)`);
  };

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
        <nav className="flex-1 space-y-1 px-4 py-6">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ERP Workspace
          </div>
          
          <a href="#" className="flex items-center gap-3 rounded-lg bg-slate-800 px-3 py-2.5 text-sm font-medium text-white transition-colors">
            <LayoutDashboard className="h-4 w-4 text-[#2563EB]" />
            <span>Dashboard</span>
          </a>

          <a href="/products" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <ShoppingCart className="h-4 w-4" />
            <span>Products</span>
          </a>
          
          <a href="/categories" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Database className="h-4 w-4" />
            <span>Categories</span>
          </a>

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
              <a href="/system-audits" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
                <span>System Audits</span>
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
              <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <CheckCircle className="h-4 w-4" />
                <span>Pending Approvals</span>
              </a>
              <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <TrendingUp className="h-4 w-4" />
                <span>Spend Analytics</span>
              </a>
            </>
          )}

          {user?.role?.name === 'Vendor' && (
            <>
              <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <ClipboardList className="h-4 w-4" />
                <span>Active RFQs</span>
              </a>
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
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total System Users</span>
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><Users className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">148</p>
                  <p className="mt-1 text-xs text-emerald-600 font-semibold">&bull; +12 this week</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Database Sync</span>
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Database className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">100%</p>
                  <p className="mt-1 text-xs text-emerald-600 font-semibold">&bull; Local SQLite connected</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">API Health Index</span>
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><Cpu className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">99.98%</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">&bull; Latency 24ms</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Roles</span>
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600"><Shield className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">4</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">&bull; Preloaded in database</p>
                </div>
              </div>

              {/* Core Work area */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">System Activity &amp; Profiles</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">List of recently registered users across all roles</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 flex items-center justify-between">
                    <div className="flex gap-3 items-center">
                      <Shield className="h-5 w-5 text-[#2563EB]" />
                      <div className="text-sm">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Admin Control Panel Active</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400">You have full administrative privileges to edit settings, roles and security credentials.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleActionClick("Trigger Database Seed")}
                      className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 shadow-sm cursor-pointer"
                    >
                      Audit Trail
                    </button>
                  </div>
                  <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No security alerts detected. User management operations are running normally.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RENDER PROCUREMENT OFFICER CONTENT */}
          {user?.role?.name === 'Procurement Officer' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active RFQs</span>
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><ClipboardList className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">24</p>
                  <p className="mt-1 text-xs text-emerald-600 font-semibold">&bull; 4 open for bidding</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Received Bids</span>
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><FileText className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">89</p>
                  <p className="mt-1 text-xs text-emerald-600 font-semibold">&bull; +14 new quotations</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Purchase Orders</span>
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><ShoppingCart className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">42</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">&bull; 8 pending approval</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Invoices</span>
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600"><DollarSign className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">18</p>
                  <p className="mt-1 text-xs text-red-600 font-semibold">&bull; 3 unpaid invoices</p>
                </div>
              </div>

              {/* Core Actions */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Active Requests for Quotation</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Manage quotations and purchase requisitions</p>
                    </div>
                    <button 
                      onClick={() => handleActionClick("Create new RFQ")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                    >
                      <FilePlus className="h-3.5 w-3.5" />
                      <span>New RFQ</span>
                    </button>
                  </div>
                  <div className="p-6">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3">RFQ ID</th>
                          <th className="px-4 py-3">Title</th>
                          <th className="px-4 py-3">Deadline</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">RFQ-2026-001</td>
                          <td className="px-4 py-3">Raw Steel Materials Procurement</td>
                          <td className="px-4 py-3">June 15, 2026</td>
                          <td className="px-4 py-3"><span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700">Open Bidding</span></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">RFQ-2026-002</td>
                          <td className="px-4 py-3">Office Hardware Equipment Setup</td>
                          <td className="px-4 py-3">June 20, 2026</td>
                          <td className="px-4 py-3"><span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700">Draft</span></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">RFQ-2026-003</td>
                          <td className="px-4 py-3">Logistics Packaging Cartons</td>
                          <td className="px-4 py-3">June 10, 2026</td>
                          <td className="px-4 py-3"><span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700">Completed</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Procurement Officer Actions</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Shortcuts to create common procurement records</p>
                    <div className="space-y-2">
                      <button onClick={() => handleActionClick("Create Purchase Order")} className="w-full text-left rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 cursor-pointer">
                        &bull; Generate Purchase Order
                      </button>
                      <button onClick={() => handleActionClick("Log Supplier Invoice")} className="w-full text-left rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 cursor-pointer">
                        &bull; Record Supplier Invoice
                      </button>
                      <button onClick={() => handleActionClick("Compare Supplier Bids")} className="w-full text-left rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 cursor-pointer">
                        &bull; Bid Comparison Worksheet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RENDER MANAGER CONTENT */}
          {user?.role?.name === 'Manager' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Approvals</span>
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600"><ClipboardList className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">9</p>
                  <p className="mt-1 text-xs text-red-600 font-semibold">&bull; requires immediate action</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Approved Value</span>
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><DollarSign className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">₹340K</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">&bull; this fiscal month</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Approval Turnaround</span>
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><Cpu className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">4.2h</p>
                  <p className="mt-1 text-xs text-emerald-600 font-semibold">&bull; -1.5h compared to target</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Purchase Value</span>
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><TrendingUp className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">₹1.2M</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">&bull; annual total spend</p>
                </div>
              </div>

              {/* Core Approvals List */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Requisition Approval Queue</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Review and authorize pending purchase orders and RFQs</p>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">PO-2026-981 - Industrial Steel Supply</span>
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Requires Sign-off</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Requested by: Procurement Officer | Amount: <span className="font-bold text-slate-800 dark:text-slate-200">₹42,500.00</span></p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => handleActionClick("Approve PO-2026-981")}
                        className="rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleActionClick("Reject PO-2026-981")}
                        className="rounded-lg border border-red-200 text-red-700 px-3.5 py-1.5 text-xs font-semibold hover:bg-red-50 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">PO-2026-982 - Dell Hardware Workstations</span>
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Requires Sign-off</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Requested by: IT Procurement | Amount: <span className="font-bold text-slate-800 dark:text-slate-200">₹18,900.00</span></p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => handleActionClick("Approve PO-2026-982")}
                        className="rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleActionClick("Reject PO-2026-982")}
                        className="rounded-lg border border-red-200 text-red-700 px-3.5 py-1.5 text-xs font-semibold hover:bg-red-50 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RENDER VENDOR CONTENT */}
          {user?.role?.name === 'Vendor' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Available RFQs</span>
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><ClipboardList className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">12</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">&bull; open for bidding</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Submitted Bids</span>
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Send className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">4</p>
                  <p className="mt-1 text-xs text-emerald-600 font-semibold">&bull; 2 active, 2 under review</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Awarded Contracts</span>
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><Award className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">2</p>
                  <p className="mt-1 text-xs text-emerald-600 font-semibold">&bull; in execution</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Invoiced</span>
                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600"><DollarSign className="h-5 w-5" /></div>
                  </div>
                  <p className="mt-2 text-3xl font-display font-bold text-slate-900 dark:text-white">₹8,450</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">&bull; await client payout</p>
                </div>
              </div>

              {/* Vendor RFQ list */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Vendor Bid Portal - Active Requests</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">View corporate RFQs and submit quotation packages</p>
                </div>
                <div className="p-6">
                  <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">RFQ-2026-001 - Raw Steel Materials Procurement</span>
                        <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Open Bidding</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Requested by: VendorBridge Procurement Team | Deadline: June 15, 2026</p>
                    </div>
                    <button 
                      onClick={() => handleActionClick("Submit Quotation for RFQ-2026-001")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Bid</span>
                    </button>
                  </div>
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
