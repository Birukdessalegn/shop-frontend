import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  UserCog,
  UserPlus,
  ShieldCheck,
  ShoppingBag,
  Boxes,
  Users as UsersIcon,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Mail,
  User,
  Power
} from 'lucide-react';

const Users = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await authAPI.getUsers();
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'sales',
      isActive: true
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'sales',
      isActive: user.isActive !== false
    });
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setEditingUser(null);
    setSubmitting(false);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (editingUser) {
        // Update user
        const updatePayload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive
        };
        if (formData.password && formData.password.trim() !== '') {
          updatePayload.password = formData.password;
        }

        const res = await authAPI.updateUser(editingUser.id, updatePayload);
        if (res.data.success) {
          setSuccessMsg(`User "${formData.name}" updated successfully.`);
          handleCloseModals();
          fetchUsers();
        }
      } else {
        // Create user
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setSubmitting(false);
          return;
        }

        const res = await authAPI.createUser(formData);
        if (res.data.success) {
          setSuccessMsg(`New user "${formData.name}" created with role "${formData.role}".`);
          handleCloseModals();
          fetchUsers();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (id === currentUser?.id) {
      alert('You cannot delete your own logged-in account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) {
      return;
    }

    try {
      setError('');
      const res = await authAPI.deleteUser(id);
      if (res.data.success) {
        setSuccessMsg(`User "${name}" has been deleted.`);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck size={13} className="text-purple-600" />
            Admin
          </span>
        );
      case 'sales':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <ShoppingBag size={13} className="text-blue-600" />
            Sales Only
          </span>
        );
      case 'stock':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Boxes size={13} className="text-amber-600" />
            Stock Only
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <UsersIcon size={13} className="text-slate-500" />
            Staff
          </span>
        );
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto mt-12">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-red-900 mb-1">Access Restricted</h2>
        <p className="text-sm text-red-700">
          Only administrators have permission to access the User & Staff Management section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <UserCog size={22} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Staff & Users</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage store team members and configure roles (Sales, Stock, and Admin).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-600/20 transition"
        >
          <UserPlus size={16} />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name or email..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 uppercase">Role:</span>
          {['ALL', 'sales', 'stock', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                roleFilter === r
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r === 'sales' ? 'Sales' : r === 'stock' ? 'Stock' : 'Admin'}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Permissions Scope</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center border border-slate-200 shrink-0">
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {u.role === 'admin' && (
                          <span className="text-purple-700 font-medium">
                            Full Control: Products, Inventory, Users & Finance
                          </span>
                        )}
                        {u.role === 'sales' && (
                          <span className="text-blue-700 font-medium">
                            Sell Items, Collect Installments, Verify Serials
                          </span>
                        )}
                        {u.role === 'stock' && (
                          <span className="text-amber-700 font-medium">
                            Register Products, Accept Stock & Serials
                          </span>
                        )}
                        {u.role === 'staff' && (
                          <span className="text-slate-600">General Staff Access</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Edit User"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              title="Delete User"
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  {editingUser ? <Edit2 size={18} /> : <UserPlus size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    {editingUser ? `Edit ${editingUser.name}` : 'Add New Staff Member'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingUser ? 'Update account details and role' : 'Create login credentials'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModals}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Abebe Kebede"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sales@shop.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  {editingUser ? 'Reset Password (leave empty to keep current)' : 'Login Password'}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'Enter new password or leave blank' : 'Minimum 6 characters'}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Select Role & Responsibilities
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {/* Sales */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      formData.role === 'sales'
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="sales"
                      checked={formData.role === 'sales'}
                      onChange={() => setFormData({ ...formData, role: 'sales' })}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <ShoppingBag size={14} className="text-blue-600" />
                        Sales Staff
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        Can sell items (Cash/Credit), collect installment payments, and verify serials. Cannot register new stock.
                      </p>
                    </div>
                  </label>

                  {/* Stock */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      formData.role === 'stock'
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="stock"
                      checked={formData.role === 'stock'}
                      onChange={() => setFormData({ ...formData, role: 'stock' })}
                      className="mt-1 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Boxes size={14} className="text-amber-600" />
                        Stock / Inventory Staff
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        Can create new products, accept incoming inventory, and register serial numbers. Cannot execute sales.
                      </p>
                    </div>
                  </label>

                  {/* Admin */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      formData.role === 'admin'
                        ? 'border-purple-500 bg-purple-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === 'admin'}
                      onChange={() => setFormData({ ...formData, role: 'admin' })}
                      className="mt-1 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-purple-600" />
                        Administrator
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        Full access to all modules, sales, stock, financial balances, reports, and user management.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Active Toggle (Edit mode) */}
              {editingUser && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center gap-2">
                    <Power size={16} className={formData.isActive ? 'text-emerald-500' : 'text-slate-400'} />
                    <span className="text-xs font-semibold text-slate-800">Account Status</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      formData.isActive
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {formData.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition"
                >
                  {submitting ? 'Saving...' : editingUser ? 'Update Staff Member' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

