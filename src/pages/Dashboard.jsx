import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, saleAPI, productAPI, customerAPI } from '../services/api';
import {
  Package,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Users,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  HandCoins,
  TrendingUp,
  PackageCheck,
  Boxes
} from 'lucide-react';
import { CreditBadge } from '../components/StatusBadge';
import ProductModal from '../components/ProductModal';
import RecordPaymentModal from '../components/RecordPaymentModal';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Modals state
  const [selectedCreditSale, setSelectedCreditSale] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setError('');
      const dashRes = await dashboardAPI.getStats();
      if (dashRes.data.success) {
        setData(dashRes.data.data);
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

  const handleRecordPayment = async (saleId, payload) => {
    await saleAPI.recordPayment(saleId, payload);
    fetchDashboardData();
  };

  const handleAddProduct = async (payload) => {
    await productAPI.create(payload);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Loading shop overview...</p>
      </div>
    );
  }

  const m = data?.metrics || {};

  // Financial aggregates
  const totalGrossSales = Number(m.totalGrossSales || 0);
  const totalCashInHand = Number(m.totalCollected || 0);
  const totalCreditDebt = Number(m.totalCreditOutstanding || 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shop Financial Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time sales revenue, cash collected, debt receivables, and stock counts
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/sales"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
          >
            <ShoppingBag size={15} />
            <span>Go to Sell / POS</span>
          </Link>

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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white shadow-xs transition"
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

      {/* 1. FINANCIAL & STORE OVERVIEW CARDS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Shop Performance Overview
          </h2>
          <span className="text-[11px] text-slate-400">
            Real-time Sales & Inventory
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Gross Sales */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-indigo-950 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                Total Sales Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-800/80 text-indigo-200 flex items-center justify-center">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight">
              ${totalGrossSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 text-[11px] text-indigo-200 flex items-center justify-between">
              <span>Cash: ${Number(m.totalCashSales || 0).toFixed(2)}</span>
              <span>Credit: ${Number(m.totalCreditIssued || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Card 2: Actual Cash In Hand */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cash Received in Hand
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HandCoins size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-700">
              ${totalCashInHand.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Direct cash sales + customer debt installments collected
            </p>
          </div>

          {/* Card 3: Total Pieces in Store */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Pieces in Store
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Boxes size={18} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-indigo-700">
                {m.totalStockPieces || 0} Pcs
              </span>
              <Link to="/products" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
                View Stock <ArrowUpRight size={14} />
              </Link>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Physical units available in shop inventory</p>
          </div>
        </div>
      </div>

      {/* 2. QUICK SELL / POS BANNER */}
      {/* QUICK SELL / POS BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-indigo-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h3 className="font-bold text-base tracking-tight">Point of Sale (POS) Counter</h3>
            <p className="text-xs text-indigo-200 mt-0.5">
              Select in-stock items, process cash or credit checkout, and record sales in real time.
            </p>
          </div>
        </div>

        <Link
          to="/sales"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-950 hover:bg-indigo-50 shadow-md transition shrink-0"
        >
          <ShoppingBag size={15} className="text-indigo-600" />
          <span>Open Sales / POS Page</span>
          <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* ACTIVE CREDIT RECEIVABLES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Active Credit Accounts & Receivables
            </h3>
            <p className="text-xs text-slate-500">
              Sales made on credit with remaining balance to collect
            </p>
          </div>
          <Link
            to="/customers"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View Customers ({m.totalCustomers || 0})</span>
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
              There is currently no outstanding credit balance.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3 text-center">Qty</th>
                  <th className="px-6 py-3">Total Credit</th>
                  <th className="px-6 py-3">Paid Amount</th>
                  <th className="px-6 py-3">Remaining Balance</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentCreditItems?.map((s) => (
                  <tr key={s._id || s.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      {s.product?.name || 'Item'}
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-slate-800">{s.customer?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-400">{s.customer?.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-3.5 text-center font-bold text-slate-700">
                      {s.quantity || 1}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">
                      ${Number(s.totalAmount || s.creditAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-emerald-600">
                      ${Number(s.paidAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-amber-600">
                      ${Number(s.remainingBalance || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5">
                      <CreditBadge status={s.creditStatus} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedCreditSale(s);
                          setIsPaymentModalOpen(true);
                        }}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-[11px] shadow-2xs transition inline-flex items-center gap-1"
                      >
                        <HandCoins size={12} />
                        <span>Collect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedCreditSale && (
        <RecordPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedCreditSale(null);
          }}
          onSubmit={handleRecordPayment}
          serial={selectedCreditSale}
        />
      )}

      <ProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSubmit={handleAddProduct}
      />
    </div>
  );
};

export default Dashboard;
