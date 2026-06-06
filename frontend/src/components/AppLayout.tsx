import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Shield, LogOut, Users, Database, 
  Cpu, FileText, ClipboardList, TrendingUp, CheckCircle, FilePlus, 
  ShoppingCart, DollarSign, Award, Send, LayoutDashboard, Settings, ArrowLeft,
  Moon, Sun, Bell, ClipboardCheck
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/audits/notifications').then((res) => {
        if (res.data) setNotifications(res.data);
      });
    }
  }, [user]);

  return (
    <div className="flex h-screen print:h-auto bg-[#F8FAFC] dark:bg-slate-950 transition-colors print:block">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0F172A] text-white print:hidden">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <img src="/logo.jpg" alt="VendorBridge Logo" className="h-10 w-auto rounded object-contain" />
        </div>
        
        {/* Navigation links based on role */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            ERP Workspace
          </div>
          
          {[
            {
              name: 'Dashboard',
              icon: LayoutDashboard,
              path: user?.role ? `/dashboard/${user.role.name.toLowerCase().replace(' ', '')}` : '/',
              show: true,
            },
            {
              name: 'Product',
              icon: ShoppingCart,
              path: '/products',
              show: ['Admin', 'Manager', 'Procurement Officer', 'Financer'].includes(user?.role?.name || ''),
            },
            {
              name: 'Category',
              icon: Database,
              path: '/categories',
              show: ['Admin', 'Manager', 'Procurement Officer', 'Financer'].includes(user?.role?.name || ''),
            },
            {
              name: 'Vendor',
              icon: Users,
              path: '/vendors',
              show: ['Admin', 'Manager', 'Procurement Officer'].includes(user?.role?.name || ''),
            },
            {
              name: "RFQ's",
              icon: ClipboardList,
              path: '/rfqs',
              show: ['Admin', 'Procurement Officer'].includes(user?.role?.name || ''),
            },
            {
              name: 'Submitted Quotation',
              icon: FileText,
              path: user?.role?.name === 'Vendor' ? '/vendor-quotations' : '/submitted-quotations',
              show: ['Admin', 'Procurement Officer', 'Manager', 'Financer', 'Vendor'].includes(user?.role?.name || ''),
            },
            {
              name: 'Approvals',
              icon: ClipboardCheck,
              path: '/approvals',
              show: ['Admin', 'Procurement Officer', 'Manager', 'Financer'].includes(user?.role?.name || ''),
            },
            {
              name: 'Purchase Order',
              icon: ShoppingCart,
              path: '/purchase-orders',
              show: ['Admin', 'Manager', 'Procurement Officer', 'Financer'].includes(user?.role?.name || ''),
            },
            {
              name: 'Vendor Bills',
              icon: FileText,
              path: '/bills',
              show: ['Admin', 'Financer'].includes(user?.role?.name || ''),
            },
            {
              name: 'Report & Analysis',
              icon: TrendingUp,
              path: '/reports',
              show: ['Admin', 'Manager', 'Financer'].includes(user?.role?.name || ''),
            },
            {
              name: 'System Audit',
              icon: Settings,
              path: '/system-audits',
              show: user?.role?.name === 'Admin',
            },
            {
              name: 'User Management',
              icon: Users,
              path: '/users',
              show: user?.role?.name === 'Admin',
            }
          ].filter(item => item.show).map(item => (
            <a key={item.name} href={item.path} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <item.icon className={`h-4 w-4 ${item.name === 'Dashboard' ? 'text-[#2563EB]' : ''}`} />
              <span>{item.name}</span>
            </a>
          ))}
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
      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible print:block">
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
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden animate-fadeIn">
                    <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n, i) => (
                          <div key={i} className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white mb-0.5">{n.action} - {n.entity}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{n.message}</p>
                            <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">{new Date(n.time).toLocaleString()}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-500">No new notifications.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
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
        <main className="flex-1 overflow-y-auto p-6 md:p-8 text-slate-900 dark:text-slate-200 print:p-0 print:overflow-visible print:block">
          {children}
        </main>
      </div>
    </div>
  );
};
