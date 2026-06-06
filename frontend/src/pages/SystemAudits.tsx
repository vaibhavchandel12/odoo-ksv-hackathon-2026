import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { Activity, Clock, ShieldAlert, User as UserIcon, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTableFilterSort } from '../hooks/useTableFilterSort';

export function SystemAudits() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { searchTerm, setSearchTerm, sortConfig, requestSort, processedData } = useTableFilterSort(
    logs, 
    ['user_name', 'action', 'entity_type', 'details']
  );

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await api.get('/audits/');
    if (res.data) setLogs(res.data);
    setLoading(false);
  };

  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">Create</span>;
      case 'UPDATE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">Update</span>;
      case 'DELETE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">Delete</span>;
      case 'APPROVE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">Approve</span>;
      case 'REJECT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800">Reject</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">{action}</span>;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">System Audits</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Review chronological logs of system modifications and workflow actions.</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs by user, action, entity, or details..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-900 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center bg-white dark:bg-slate-900 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Audit Logs Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">There are no recorded actions in the system yet.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 w-48 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('created_at')}>
                      <div className="flex items-center gap-1">Timestamp {sortConfig?.key === 'created_at' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('user_name')}>
                      <div className="flex items-center gap-1">User {sortConfig?.key === 'user_name' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 w-24 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('action')}>
                      <div className="flex items-center gap-1">Action {sortConfig?.key === 'action' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 w-32 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('entity_type')}>
                      <div className="flex items-center gap-1">Entity {sortConfig?.key === 'entity_type' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                    </th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedData.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-slate-500 dark:text-slate-400">
                          <Clock className="h-3.5 w-3.5 mr-2 shrink-0" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mr-3 shrink-0">
                            {log.user_name !== 'System' ? log.user_name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{log.user_name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{log.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                          <Activity className="h-3 w-3 mr-1" />
                          {log.entity_type}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                  {processedData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No matching logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
