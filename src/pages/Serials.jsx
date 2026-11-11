import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { serialAPI, productAPI, customerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Barcode,
  Search,
  Filter,
  CreditCard,
  DollarSign,
  HandCoins,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw,
  Plus,
  User,
  HelpCircle
} from 'lucide-react';
import { StatusBadge, CreditBadge } from '../components/StatusBadge';
import AddSerialsModal from '../components/AddSerialsModal';
import SellSerialModal from '../components/SellSerialModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import CustomerLedgerModal from '../components/CustomerLedgerModal';

const Serials = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [serials, setSerials] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [productFilter, setProductFilter] = useState(searchParams.get('product') || '');
  const [saleTypeFilter, setSaleTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Modals state
  const [isAddSerialsOpen, setIsAddSerialsOpen] = useState(false);
  const [selectedSerialForSale, setSelectedSerialForSale] = useState(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedSerialForPayment, setSelectedSerialForPayment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomerIdForLedger, setSelectedCustomerIdForLedger] = useState(null);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);

  const { isAdmin } = useAuth();

  const statusOptions = ['All', 'Available', 'On Credit', 'Sold', 'Returned', 'Damaged'];

  const fetchFiltersData = async () => {
    try {
      const [prodRes, custRes] = await Promise.all([
        productAPI.getAll(),
        customerAPI.getAll()
      ]);
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (custRes.data.success) setCustomers(custRes.data.data);
    } catch (err) {
      console.error('Failed to load filter lookups:', err);
    }
  };

  const fetchSerials = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (productFilter) params.product = productFilter;
      if (saleTypeFilter !== 'All') params.saleType = saleTypeFilter;
      if (search) params.search = search;

      const res = await serialAPI.getAll(params);
      if (res.data.success) {
        setSerials(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load serial numbers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSerials();
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, productFilter, saleTypeFilter, search]);

  const handleAddSerials = async (payload) => {
    await serialAPI.addSerials(payload);
    setSuccessMsg('Serial numbers registered into inventory');
    fetchSerials();
  };

  const handleSellSerial = async (serialId, payload) => {
    await serialAPI.sellSerial(serialId, payload);
    setSuccessMsg(
      payload.saleType === 'Credit'
        ? 'Item successfully sold on credit!'
        : 'Item successfully sold for cash!'
    );
    fetchSerials();
  };

  const handleRecordPayment = async (serialId, payload) => {
    await serialAPI.recordPayment(serialId, payload);
    setSuccessMsg('Payment successfully recorded against credit account!');
    fetchSerials();
  };

  const handleStatusChange = async (serialId, newStatus) => {
    try {
      await serialAPI.update(serialId, { status: newStatus });
      setSuccessMsg(`Serial status changed to ${newStatus}`);
      fetchSerials();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update serial status');
    }
  };

  const handleDeleteSerial = async (serialId, serialNumber) => {
    if (!window.confirm(`Are you sure you want to delete serial "${serialNumber}"?`)) {
      return;
    }
    try {
      await serialAPI.delete(serialId);
      setSuccessMsg(`Serial "${serialNumber}" deleted`);
      fetchSerials();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete serial');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Serial Number Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track individual unit lifecycles, IMEI/Barcodes, credit sales, and installment balances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddSerialsOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
          >
            <Barcode size={16} />
            <span>Register Serials</span>
          </button>
        </div>
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

      {/* Filter and Control Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statusOptions.map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setSearchParams((prev) => {
                  if (st === 'All') prev.delete('status');
                  else prev.set('status', st);
                  return prev;
                });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Select dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search serial number, IMEI, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div>
            <select
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value);
                setSearchParams((prev) => {
                  if (!e.target.value) prev.delete('product');
                  else prev.set('product', e.target.value);
                  return prev;
                });
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} {p.brand ? `(${p.brand})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={saleTypeFilter}
              onChange={(e) => setSaleTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            >
              <option value="All">All Sale Types</option>
              <option value="Credit">Credit Sales Only</option>
              <option value="Cash">Cash Sales Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Serials Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : serials.length === 0 ? (
          <div className="p-12 text-center">
            <Barcode size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No serial numbers found</p>
            <p className="text-xs text-slate-400 mt-1">
              No matching records for current filters. Try changing filter criteria or register new
              serials.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Serial / IMEI</th>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Credit / Paid</th>
                  <th className="px-6 py-3.5">Remaining Balance</th>
                  <th className="px-6 py-3.5">Credit Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {serials.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/70 transition">
                    {/* Serial Number */}
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {s.serialNumber}
                      </div>
                      {s.notes && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {s.notes}
                        </p>
                      )}
                    </td>

                    {/* Product */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{s.product?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {s.product?.brand} {s.product?.model && `• ${s.product?.model}`}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <StatusBadge status={s.status} />
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      {s.customer ? (
                        <div>
                          <button
                            onClick={() => {
                              setSelectedCustomerIdForLedger(s.customer._id);
                              setIsLedgerModalOpen(true);
                            }}
                            className="font-semibold text-indigo-600 hover:text-indigo-800 text-left"
                          >
                            {s.customer.name}
                          </button>
                          <p className="text-[11px] text-slate-400">{s.customer.phone}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None (In Stock)</span>
                      )}
                    </td>

                    {/* Credit & Paid Breakdown */}
                    <td className="px-6 py-4">
                      {s.saleType === 'Credit' ? (
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800">
                            Total: ${s.creditAmount?.toFixed(2)}
                          </p>
                          <p className="text-emerald-700 text-[11px]">
                            Paid: ${s.paidAmount?.toFixed(2)}
                          </p>
                        </div>
                      ) : s.saleType === 'Cash' ? (
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          Cash Sale
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          Price: ${s.product?.sellingPrice?.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Remaining Balance */}
                    <td className="px-6 py-4">
                      {s.status === 'On Credit' ? (
                        <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                          ${s.remainingBalance?.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">$0.00</span>
                      )}
                    </td>

                    {/* Credit Status Badge */}
                    <td className="px-6 py-4">
                      {s.saleType === 'Credit' ? (
                        <CreditBadge creditStatus={s.creditStatus} />
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* If Available -> Sell / Issue Credit */}
                        {s.status === 'Available' && (
                          <button
                            onClick={() => {
                              setSelectedSerialForSale(s);
                              setIsSellModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition flex items-center gap-1"
                          >
                            <CreditCard size={13} />
                            <span>Sell / Credit</span>
                          </button>
                        )}

                        {/* If On Credit & has remaining balance -> Record Payment */}
                        {s.status === 'On Credit' && s.remainingBalance > 0 && (
                          <button
                            onClick={() => {
                              setSelectedSerialForPayment(s);
                              setIsPaymentModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition flex items-center gap-1"
                          >
                            <HandCoins size={13} />
                            <span>Pay</span>
                          </button>
                        )}

                        {/* Status Change Quick Dropdown */}
                        <select
                          value={s.status}
                          onChange={(e) => handleStatusChange(s._id, e.target.value)}
                          className="px-2 py-1 text-[11px] font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
                        >
                          <option value="Available">Available</option>
                          <option value="On Credit">On Credit</option>
                          <option value="Sold">Sold</option>
                          <option value="Returned">Returned</option>
                          <option value="Damaged">Damaged</option>
                        </select>

                        {/* Delete serial (admin) */}
                        {isAdmin && s.status !== 'On Credit' && (
                          <button
                            onClick={() => handleDeleteSerial(s._id, s.serialNumber)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition"
                            title="Delete serial"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddSerialsModal
        isOpen={isAddSerialsOpen}
        onClose={() => setIsAddSerialsOpen(false)}
        onSubmit={handleAddSerials}
        products={products}
      />

      <SellSerialModal
        isOpen={isSellModalOpen}
        onClose={() => {
          setIsSellModalOpen(false);
          setSelectedSerialForSale(null);
        }}
        onSubmit={handleSellSerial}
        serial={selectedSerialForSale}
        customers={customers}
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
    </div>
  );
};

export default Serials;

