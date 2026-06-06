import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AppLayout } from '../components/AppLayout';
import { Shield, UserX, UserCheck, KeyRound, Edit2, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTableFilterSort } from '../hooks/useTableFilterSort';

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { searchTerm, setSearchTerm, sortConfig, requestSort, processedData } = useTableFilterSort(
    users, 
    ['first_name', 'last_name', 'email', 'role_name']
  );
  
  // Add User State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addForm, setAddForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role_id: '',
    password: '',
    is_active: true,
    gst_details: ''
  });

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    role_id: '',
    is_active: true,
    password: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [usersRes, rolesRes] = await Promise.all([
      api.get('/users/'),
      api.get('/roles/')
    ]);
    if (usersRes.data) setUsers(usersRes.data);
    if (rolesRes.data) setRoles(rolesRes.data);
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...addForm };
    if (!payload.phone) delete payload.phone;
    
    const res = await api.post('/users/', payload);
    if (!res.error) {
      setIsAddingUser(false);
      setAddForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role_id: '',
        password: '',
        is_active: true,
        gst_details: ''
      });
      fetchData(); // Refresh list
    } else {
      alert("Failed to add user: " + (typeof res.error === 'object' ? JSON.stringify(res.error) : res.error));
    }
  };

  const handleEditClick = (user: any) => {
    // Find the role_id corresponding to user's role_name
    const userRole = roles.find(r => r.name === user.role_name);
    setEditingUser(user);
    setEditForm({
      role_id: userRole ? userRole.id : '',
      is_active: user.is_active,
      password: ''
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    // Only send password if it's not empty
    const payload: any = {
      role_id: editForm.role_id,
      is_active: editForm.is_active
    };
    if (editForm.password.trim() !== '') {
      payload.password = editForm.password;
    }

    const res = await api.patch(`/users/${editingUser.id}`, payload);
    if (!res.error) {
      setEditingUser(null);
      fetchData(); // Refresh list
    } else {
      alert("Failed to update user: " + (typeof res.error === 'object' ? JSON.stringify(res.error) : res.error));
    }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">User Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage system access, roles, and credentials (Admin only)</p>
          </div>
          <button 
            onClick={() => setIsAddingUser(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Add User
          </button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
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
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('first_name')}>
                    <div className="flex items-center gap-1">Name & Email {sortConfig?.key === 'first_name' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('role_name')}>
                    <div className="flex items-center gap-1">Role {sortConfig?.key === 'role_name' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('is_active')}>
                    <div className="flex items-center gap-1">Status {sortConfig?.key === 'is_active' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:bg-slate-800 transition-colors" onClick={() => requestSort('last_login')}>
                    <div className="flex items-center gap-1">Last Login {sortConfig?.key === 'last_login' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-50" />}</div>
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedData.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                        <Shield className="h-3 w-3" />
                        {user.role_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                          <UserCheck className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-100">
                          <UserX className="h-3 w-3" />
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : <span className="text-slate-400">Never</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {processedData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add User Modal */}
        {isAddingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 animate-fadeIn max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800 shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white font-display">Add New User</h3>
                <button onClick={() => setIsAddingUser(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 text-xl leading-none">&times;</button>
              </div>
              
              <div className="overflow-y-auto flex-1">
                <form onSubmit={handleAddUser} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">First Name</label>
                      <input 
                        type="text"
                        value={addForm.first_name}
                        onChange={(e) => setAddForm({...addForm, first_name: e.target.value})}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Last Name</label>
                      <input 
                        type="text"
                        value={addForm.last_name}
                        onChange={(e) => setAddForm({...addForm, last_name: e.target.value})}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Email</label>
                    <input 
                      type="email"
                      value={addForm.email}
                      onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Phone</label>
                    <input 
                      type="tel"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">GST Details</label>
                    <input 
                      type="text"
                      value={addForm.gst_details}
                      onChange={(e) => setAddForm({...addForm, gst_details: e.target.value})}
                      placeholder="Optional"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Role</label>
                    <select 
                      value={addForm.role_id}
                      onChange={(e) => setAddForm({...addForm, role_id: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm bg-white dark:bg-slate-900"
                      required
                    >
                      <option value="">Select Role...</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5" />
                      Password
                    </label>
                    <input 
                      type="password"
                      value={addForm.password}
                      onChange={(e) => setAddForm({...addForm, password: e.target.value})}
                      minLength={8}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsAddingUser(false)}
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-2 rounded-lg bg-[#2563EB] text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
                    >
                      Add User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 animate-fadeIn">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white font-display">Edit User Profile</h3>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 text-xl leading-none">&times;</button>
              </div>
              
              <form onSubmit={handleUpdateUser} className="p-6 space-y-5">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{editingUser.first_name} {editingUser.last_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{editingUser.email}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Role</label>
                  <select 
                    value={editForm.role_id}
                    onChange={(e) => setEditForm({...editForm, role_id: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm bg-white dark:bg-slate-900"
                    required
                  >
                    <option value="">Select Role...</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Account Status</label>
                  <select 
                    value={editForm.is_active ? 'true' : 'false'}
                    onChange={(e) => setEditForm({...editForm, is_active: e.target.value === 'true'})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm bg-white dark:bg-slate-900"
                  >
                    <option value="true">Active (Can Login)</option>
                    <option value="false">Archived (Access Revoked)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" />
                    Reset Password
                  </label>
                  <input 
                    type="password"
                    placeholder="Leave blank to keep unchanged"
                    value={editForm.password}
                    onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                    minLength={8}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#2563EB] outline-none text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Must be at least 8 characters if provided.</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-[#2563EB] text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
