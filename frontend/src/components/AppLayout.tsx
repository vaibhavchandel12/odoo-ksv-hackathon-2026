import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, LogOut, Users, Database, 
  Cpu, FileText, ClipboardList, TrendingUp, CheckCircle, FilePlus, 
  ShoppingCart, DollarSign, Award, Send, LayoutDashboard, Settings, ArrowLeft,
  Moon, Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AppLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, showBack }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0F172A] text-white print:hidden">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] shadow-lg shadow-blue-500/20">
            <Shield className="h-5.5 w-5.5 text-white" />
          </div>
          <span className="font-display font-bold tracking-tight text-lg">VendorBridge</span>
        </div>
        
        {/* Navigation links based on role */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            ERP Workspace
          </div>
          
          <a href={user?.role ? `/dashboard/${user.role.name.toLowerCase().replace(' ', '')}` : '/'} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
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
              <a href="/system-audits" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
                <span>System Audits</span>
              </a>
            </>
          )}

          {(user?.role?.name === 'Admin' || user?.role?.name === 'Financer') && (
            <>
              <a href="/bills" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <FileText className="h-4 w-4" />
                <span>Vendor Bills</span>
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
          
          {user?.role?.name === 'Vendor' && (
            <>
              <a href="/vendor-quotations" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <FileText className="h-4 w-4" />
                <span>My Quotations</span>
              </a>
            </>
          )}
        </nav>

        {/* User Card inside Sidebar */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-900/60 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
              {user?.first_name?.[0] || '?'}{user?.last_name?.[0] || '?'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.first_name || 'Guest'} {user?.last_name || ''}</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase truncate">{user?.role?.name || 'Guest'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 shadow-sm transition-colors print:hidden">
          <div className="flex items-center gap-4">
            {showBack && (
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
            )}
            <h1 className="font-display font-bold text-slate-900 dark:text-white">
              {user ? `Welcome back, ${user.first_name}` : 'VendorBridge'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            {user ? (
              <>
                <div className="hidden lg:flex flex-col items-end text-right">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.first_name} {user.last_name}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{user.role?.name}</span>
                </div>
                
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-900/30 cursor-pointer transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Login
              </button>
            )}
          </div>
        </header>

        {/* Content canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 text-slate-900 dark:text-slate-200 print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
};
