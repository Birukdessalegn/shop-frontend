import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, serialAPI, customerAPI, productAPI } from '../services/api';
import {
  Package,
  Barcode,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Users,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  HandCoins
} from 'lucide-react';
import { StatusBadge, CreditBadge } from '../components/StatusBadge';
import RecordPaymentModal from '../components/RecordPaymentModal';
import AddSerialsModal from '../components/AddSerialsModal';
import ProductModal from '../components/ProductModal';
import CustomerModal from '../components/CustomerModal';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Modals state
  const [selectedCreditSerial, setSelectedCreditSerial] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddSerialsOpen, setIsAddSerialsOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setError('');
      const [dashRes, prodRes] = await Promise.all([
        dashboardAPI.getStats(),
        productAPI.getAll()
      ]);

      if (dashRes.data.success) {
        setData(dashRes.data.data);
      }
      if (prodRes.data.success) {
        setAllProducts(prodRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleRecordPayment = async (serialId, payload) => {
    await serialAPI.recordPayment(serialId, payload);
    fetchDashboardData();
  };

  const handleAddSerials = async (payload) => {
    await serialAPI.addSerials(payload);
    fetchDashboardData();
  };

  const handleAddProduct = async (payload) => {
    await productAPI.create(payload);
    fetchDashboardData();
  };

  const handleAddCustomer = async (payload) => {
    await customerAPI.create(payload);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Loading shop telemetry...</p>
      </div>
    );
  }

  const m = data?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shop Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inventory overview, serial tracking, and credit receivables
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs"
            title="Refresh metrics"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setIsAddProductOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
          >
            <Plus size={15} />
            <span>Register New Item</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* 4 Core Required KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{m.totalProducts || 0}</span>
            <Link
              to="/products"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              Manage <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Catalog items registered</p>
        </div>

        {/* 2. Available Serials */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Serials
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Barcode size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-700">{m.availableSerials || 0}</span>
            <Link
              to="/serials?status=Available"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center"
            >
              View Stock <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for sale in shop</p>
        </div>

        {/* 3. Items Currently on Credit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Items on Credit
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-700">{m.itemsOnCredit || 0}</span>
            <Link
              to="/serials?status=On+Credit"
              className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center"
            >
              Credit Serials <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Given out with remaining debt</p>
        </div>

        {/* 4. Total Credit Outstanding */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Outstanding Credit
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-700">
              ${m.totalCreditOutstanding?.toFixed(2) || '0.00'}
            </span>
            <Link
              to="/customers"
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center"
            >
              Customers <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total uncollected credit receivable
          </p>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <DollarSign size={16} />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Cash Collected</span>
            <span className="font-bold text-slate-800 text-sm">
              ${m.totalCollected?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Users size={16} />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Customers</span>
            <span className="font-bold text-slate-800 text-sm">{m.totalCustomers || 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Total Units Sold</span>
            <span className="font-bold text-slate-800 text-sm">{m.itemsSold || 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <CreditCard size={16} />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Credit Volume</span>
            <span className="font-bold text-slate-800 text-sm">
              ${m.totalCreditIssued?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Active Credit Sales & Receivables Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Active Credit Accounts & Receivables
            </h3>
            <p className="text-xs text-slate-500">
              Serial numbers currently on credit with outstanding balances
            </p>
          </div>
          <Link
            to="/serials?status=On+Credit"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All ({m.itemsOnCredit || 0})</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {data?.recentCreditItems?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-800">All Credits Settled</p>
            <p className="text-xs text-slate-500 mt-0.5">
              There are no active serial numbers with outstanding credit balance.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Serial / IMEI</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Agreed Credit</th>
                  <th className="px-6 py-3">Paid Amount</th>
                  <th className="px-6 py-3">Remaining Balance</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentCreditItems?.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                      {s.serialNumber}
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-slate-800">{s.product?.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {s.product?.brand} {s.product?.model}
                      </p>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-slate-900">{s.customer?.name}</p>
                      <p className="text-[11px] text-slate-400">{s.customer?.phone}</p>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-700">
                      ${s.creditAmount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 text-emerald-700 font-medium">
                      ${s.paidAmount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                        ${s.remainingBalance?.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <CreditBadge creditStatus={s.creditStatus} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedCreditSerial(s);
                          setIsPaymentModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition flex items-center gap-1 ml-auto"
                      >
                        <HandCoins size={13} />
                        <span>Record Payment</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Column Section: Recent Payments & Fast Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payment Receipts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Payment Receipts</h3>
              <p className="text-xs text-slate-500">Latest installment payments collected</p>
            </div>
            <Link
              to="/serials"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              Browse Serials
            </Link>
          </div>

          {data?.recentPayments?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No payments logged yet.</p>
          ) : (
            <div className="space-y-3">
              {data?.recentPayments?.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <DollarSign size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{p.customer?.name || 'Customer'}</p>
                      <p className="text-[11px] text-slate-500">
                        SN: {p.serialNumber?.serialNumber || 'Item'} • {p.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-emerald-700 text-sm">
                      +${p.amount?.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Operations Guide */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Shop Operation Workflows
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Standard operating procedures for electronics store staff
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                  1
                </div>
                <div>
                  <p className="font-semibold text-indigo-900">Register Inventory Serials</p>
                  <p className="text-slate-600 mt-0.5">
                    When new electronics arrive, add the product model then register all IMEI or
                    serial numbers in bulk with your scanner.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                  2
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Issuing on Credit</p>
                  <p className="text-slate-600 mt-0.5">
                    Go to Serials, choose any Available item and click "Sell/Issue". Select the
                    customer, agreed credit amount and any initial down payment.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                  3
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">Collecting Installments</p>
                  <p className="text-slate-600 mt-0.5">
                    When a neighbor or customer returns to make a payment, click "Record Payment".
                    The remaining balance and status are calculated automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need to onboard a new customer?</span>
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              + Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedCreditSerial(null);
        }}
        onSubmit={handleRecordPayment}
        serial={selectedCreditSerial}
      />

      <AddSerialsModal
        isOpen={isAddSerialsOpen}
        onClose={() => setIsAddSerialsOpen(false)}
        onSubmit={handleAddSerials}
        products={allProducts}
      />

      <ProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSubmit={handleAddProduct}
      />

      <CustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSubmit={handleAddCustomer}
      />
    </div>
  );
};

export default Dashboard;

