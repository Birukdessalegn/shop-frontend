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
  HandCoins,
  TrendingUp,
  PackageCheck,
  Wallet,
  BarChart3,
  PieChart,
  ShieldCheck
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
  const dailyTrend = data?.dailyTrend || [];
  const categoryBreakdown = data?.categoryBreakdown || [];

  // Financial aggregates
  const totalGrossSales = Number(m.totalGrossSales || 0);
  const totalCostOfSold = Number(m.totalCostOfSold || 0);
  const netProfit = Number(m.netProfit || 0);
  const profitMargin = Number(m.profitMargin || 0);
  const totalCashInHand = Number(m.totalCollected || 0) + Number(m.totalCashSales || 0);
  const totalCreditDebt = Number(m.totalCreditOutstanding || 0);
  const totalReceivablesPool = totalCashInHand + totalCreditDebt;
  const cashCollectionPct =
    totalReceivablesPool > 0
      ? Math.min(100, Math.round((totalCashInHand / totalReceivablesPool) * 100))
      : 0;

  // Chart max scale helper
  const maxDaySales = Math.max(...dailyTrend.map((d) => Math.max(d.sales || 0, d.collected || 0)), 100);

  // Total inventory pie counts
  const totalInventoryTracked =
    (m.availableSerials || 0) +
    (m.itemsOnCredit || 0) +
    (m.itemsSold || 0) +
    (m.itemsDamaged || 0) +
    (m.itemsReturned || 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shop Financial Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time sales revenue, net profit margin, debt receivables, and inventory telemetry
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

      {/* 1. PRIMARY FINANCIAL TELEMETRY CARDS (Gross Sales, Cash in Hand, Cost, Net Profit) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Financial & Sales Performance
          </h2>
          <span className="text-[11px] text-slate-400">
            Real-time Profit & Cost Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              Direct cash sales + debt installments collected
            </p>
          </div>

          {/* Card 3: Total Cost of Sold Items */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cost of Goods Sold (COGS)
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <PackageCheck size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800">
              ${totalCostOfSold.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Original wholesale purchase cost of sold items
            </p>
          </div>

          {/* Card 4: Net Amount (Pure Net Profit) */}
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-5 rounded-2xl shadow-md border border-emerald-900/60 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Net Profit (Net Amount)
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-900/80 text-emerald-300 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-400">
              {netProfit >= 0 ? '+' : ''}
              ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Total Sales − Cost</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {profitMargin}% Margin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GRAPHICAL REPRESENTATIONS (Sales Trend Chart & Cash vs Debt Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Last 7 Days Sales Trend (Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <BarChart3 size={18} />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Last 7 Days Sales & Cash Inflow</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600"></span>
                  Sales Volume
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span>
                  Cash Collected
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Daily comparison between items sold and cash received in your shop
            </p>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-2">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 border-b border-slate-100 pb-2">
              {dailyTrend.map((d, idx) => {
                const salesHeight = Math.max(8, Math.round((d.sales / maxDaySales) * 100));
                const collectedHeight = Math.max(8, Math.round((d.collected / maxDaySales) * 100));

                return (
                  <div key={idx} className="flex flex-col items-center justify-end h-full group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition absolute -translate-y-28 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md shadow-lg pointer-events-none z-10 whitespace-nowrap">
                      <p className="font-bold">{d.date}</p>
                      <p className="text-indigo-300">Sales: ${d.sales.toFixed(2)}</p>
                      <p className="text-emerald-300">Collected: ${d.collected.toFixed(2)}</p>
                    </div>

                    {/* Bars pair */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-36">
                      <div
                        style={{ height: `${salesHeight}%` }}
                        className="w-1/2 max-w-[18px] bg-indigo-500 hover:bg-indigo-600 rounded-t-sm transition-all"
                        title={`Sales: $${d.sales.toFixed(2)}`}
                      ></div>
                      <div
                        style={{ height: `${collectedHeight}%` }}
                        className="w-1/2 max-w-[18px] bg-emerald-400 hover:bg-emerald-500 rounded-t-sm transition-all"
                        title={`Collected: $${d.collected.toFixed(2)}`}
                      ></div>
                    </div>

                    {/* Day label */}
                    <span className="text-[11px] font-medium text-slate-500 mt-2">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
              <span>Past 7 days performance</span>
              <span>Updated in real-time</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Cash In Hand vs Credit Debt Split (Radial Visual) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <PieChart size={18} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Cash vs Uncollected Debt</h3>
            </div>
            <p className="text-xs text-slate-400">
              Distribution of sales revenue in hand vs customer debt
            </p>
          </div>

          {/* Visual Donut / Gauge */}
          <div className="my-6 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer SVG Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-amber-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Collected Progress Ring */}
                <path
                  className="text-emerald-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${cashCollectionPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900">{cashCollectionPct}%</span>
                <span className="text-[10px] font-semibold uppercase text-slate-400">Collected</span>
              </div>
            </div>
          </div>

          {/* Breakdown Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Cash in Hand:
              </span>
              <span className="font-bold text-emerald-700">
                ${totalCashInHand.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                Outstanding Debt:
              </span>
              <span className="font-bold text-amber-700">
                ${totalCreditDebt.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. OPERATIONAL INVENTORY & STORE METRICS STRIP */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Inventory & Catalog Overview
          </h2>
          <span className="text-[11px] text-slate-400">
            Wholesale Asset Valuation: <strong className="text-slate-700">${Number(m.currentInventoryCost || 0).toFixed(2)}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Catalog Products */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Catalog Models
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
                Catalog <ArrowUpRight size={14} />
              </Link>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total registered item lines</p>
          </div>

          {/* 2. Available Serials */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Available In Store
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
                In Stock <ArrowUpRight size={14} />
              </Link>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Ready for instant sale</p>
          </div>

          {/* 3. Items On Credit */}
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
                Credit Items <ArrowUpRight size={14} />
              </Link>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Units handed over with pending debt</p>
          </div>

          {/* 4. Total Units Sold */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Units Sold
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900">{m.itemsSold || 0}</span>
              <Link
                to="/serials?status=Sold"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                Sales History <ArrowUpRight size={14} />
              </Link>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Full cash sold PCs & items</p>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE CREDIT RECEIVABLES TABLE */}
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
                      <p className="font-semibold text-slate-800">{s.product?.name || '—'}</p>
                      <p className="text-[10px] text-slate-400">
                        {s.product?.brand} {s.product?.model}
                      </p>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-slate-800">{s.customer?.name || 'Walk-in'}</p>
                      <p className="text-[10px] text-slate-400">{s.customer?.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">
                      ${s.creditAmount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-emerald-600">
                      ${s.paidAmount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-amber-600">
                      ${s.remainingBalance?.toFixed(2)}
                    </td>
                    <td className="px-6 py-3.5">
                      <CreditBadge status={s.creditStatus} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedCreditSerial(s);
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
      {selectedCreditSerial && (
        <RecordPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedCreditSerial(null);
          }}
          onSubmit={handleRecordPayment}
          serial={selectedCreditSerial}
        />
      )}

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
