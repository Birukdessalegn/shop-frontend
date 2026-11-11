import React, { useState, useEffect } from 'react';
import { customerAPI, serialAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import CustomerModal from '../components/CustomerModal';
import CustomerLedgerModal from '../components/CustomerLedgerModal';
import RecordPaymentModal from '../components/RecordPaymentModal';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomerIdForLedger, setSelectedCustomerIdForLedger] = useState(null);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedSerialForPayment, setSelectedSerialForPayment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { isAdmin } = useAuth();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;

      const res = await customerAPI.getAll(params);
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateOrUpdateCustomer = async (formData) => {
    if (editingCustomer) {
      await customerAPI.update(editingCustomer._id, formData);
      setSuccessMsg(`Customer "${formData.name}" updated successfully`);
    } else {
      await customerAPI.create(formData);
      setSuccessMsg(`Customer "${formData.name}" added successfully`);
    }
    fetchCustomers();
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) {
      return;
    }
    try {
      await customerAPI.delete(id);
      setSuccessMsg(`Customer "${name}" deleted`);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleRecordPayment = async (serialId, payload) => {
    await serialAPI.recordPayment(serialId, payload);
    setSuccessMsg('Payment recorded successfully!');
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage neighbors, regular credit buyers, contact info, and individual credit ledgers
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsCustomerModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
        >
          <UserPlus size={15} />
          <span>Add New Customer</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer by name, phone number, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Customer Cards Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">
              Add your neighborhood patrons and regular customers to start issuing credit.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Contact & Phone</th>
                  <th className="px-6 py-3.5">Address / Location</th>
                  <th className="px-6 py-3.5">Active Credit Items</th>
                  <th className="px-6 py-3.5">Outstanding Debt</th>
                  <th className="px-6 py-3.5">Total Paid to Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const st = c.stats || {};
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {c.name ? c.name[0].toUpperCase() : 'C'}
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                setSelectedCustomerIdForLedger(c._id);
                                setIsLedgerModalOpen(true);
                              }}
                              className="font-bold text-slate-900 text-sm hover:text-indigo-600 text-left transition"
                            >
                              {c.name}
                            </button>
                            {c.notes && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">
                                {c.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Phone size={13} className="text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{c.address || 'Not specified'}</span>
                        </div>
                      </td>

                      {/* Active Credit Items */}
                      <td className="px-6 py-4">
                        {st.itemsOnCredit > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            {st.itemsOnCredit} active item(s)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">0 items</span>
                        )}
                      </td>

                      {/* Outstanding Debt */}
                      <td className="px-6 py-4">
                        {st.totalOutstandingBalance > 0 ? (
                          <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 text-sm">
                            ${st.totalOutstandingBalance?.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-xs">$0.00 (Clear)</span>
                        )}
                      </td>

                      {/* Total Paid */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">
                          ${st.totalPaidAmount?.toFixed(2) || '0.00'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCustomerIdForLedger(c._id);
                              setIsLedgerModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition flex items-center gap-1"
                            title="View customer ledger"
                          >
                            <Eye size={13} />
                            <span>Ledger</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingCustomer(c);
                              setIsCustomerModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                            title="Edit customer info"
                          >
                            <Edit2 size={13} />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteCustomer(c._id, c.name)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition"
                              title="Delete customer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleCreateOrUpdateCustomer}
        customer={editingCustomer}
      />

      <CustomerLedgerModal
        isOpen={isLedgerModalOpen}
        onClose={() => {
          setIsLedgerModalOpen(false);
          setSelectedCustomerIdForLedger(null);
        }}
        customerId={selectedCustomerIdForLedger}
        onOpenPaymentModal={(serial) => {
          setSelectedSerialForPayment(serial);
          setIsPaymentModalOpen(true);
        }}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedSerialForPayment(null);
        }}
        onSubmit={handleRecordPayment}
        serial={selectedSerialForPayment}
      />
    </div>
  );
};

export default Customers;

