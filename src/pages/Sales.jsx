import React, { useState, useEffect, useRef } from 'react';
import { productAPI, saleAPI, customerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  DollarSign,
  CreditCard,
  User,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  HandCoins,
  Package,
  ChevronDown,
  X,
  Check
} from 'lucide-react';
import { CreditBadge } from '../components/StatusBadge';
import RecordPaymentModal from '../components/RecordPaymentModal';
import CustomerModal from '../components/CustomerModal';

const Sales = () => {
  const { user, isAdmin, canSell } = useAuth();

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // POS Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [saleType, setSaleType] = useState('Cash');
  const [customerId, setCustomerId] = useState('');
  const [downPayment, setDownPayment] = useState(0);
  const [notes, setNotes] = useState('');

  // Searchable Dropdown States
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const itemDropdownRef = useRef(null);

  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const customerDropdownRef = useRef(null);

  // Filter & Search for Sales History
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Modals
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [prodRes, custRes, saleRes] = await Promise.all([
        productAPI.getAll(),
        customerAPI.getAll(),
        saleAPI.getAll()
      ]);

      if (prodRes.data.success) {
        setProducts(prodRes.data.data);
      }
      if (custRes.data.success) {
        setCustomers(custRes.data.data);
      }
      if (saleRes.data.success) {
        setSales(saleRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(e.target)) {
        setIsItemDropdownOpen(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // When a product is selected in POS, auto-fill unitPrice
  const selectedProduct = products.find(
    (p) => (p._id || p.id) === selectedProductId
  );

  const selectedCustomer = customers.find(
    (c) => (c._id || c.id) === customerId
  );

  useEffect(() => {
    if (selectedProduct) {
      setUnitPrice(selectedProduct.sellingPrice || 0);
      setQuantity(1);
      setDownPayment(0);
    } else {
      setUnitPrice('');
    }
  }, [selectedProductId]);

  const maxStock = selectedProduct ? selectedProduct.stockQuantity || 0 : 0;
  const qty = parseInt(quantity, 10) || 1;
  const price = parseFloat(unitPrice) || 0;
  const totalAmount = parseFloat((qty * price).toFixed(2));
  const downPay = parseFloat(downPayment) || 0;
  const remainingDebt = Math.max(0, parseFloat((totalAmount - downPay).toFixed(2)));

  const handleCompleteSale = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedProductId) {
      return setError('Please select an item to sell');
    }
    if (maxStock < 1) {
      return setError('Selected item is currently out of stock!');
    }
    if (qty > maxStock) {
      return setError(`Cannot sell ${qty} pcs. Only ${maxStock} pcs available in stock.`);
    }
    if (price <= 0) {
      return setError('Selling price must be greater than zero');
    }
    if (saleType === 'Credit' && !customerId) {
      return setError('Please select a customer for the credit sale');
    }

    try {
      setSubmitting(true);
      const payload = {
        productId: selectedProductId,
        quantity: qty,
        unitPrice: price,
        saleType,
        customerId: saleType === 'Credit' ? customerId : null,
        downPayment: saleType === 'Credit' ? downPay : totalAmount,
        notes
      };

      const res = await saleAPI.create(payload);
      setSuccessMsg(res.data.message || 'Sale completed successfully!');

      // Reset form
      setSelectedProductId('');
      setItemSearchQuery('');
      setQuantity(1);
      setUnitPrice('');
      setSaleType('Cash');
      setCustomerId('');
      setCustomerSearchQuery('');
      setDownPayment(0);
      setNotes('');

      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Sale failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (saleId, payload) => {
    await saleAPI.recordPayment(saleId, payload);
    setSuccessMsg('Credit payment recorded successfully!');
    fetchData();
  };

  const handleCreateCustomer = async (formData) => {
    const res = await customerAPI.create(formData);
    const newCust = res.data.data;
    setCustomers((prev) => [newCust, ...prev]);
    setCustomerId(newCust._id || newCust.id);
    setSuccessMsg(`Customer "${newCust.name}" registered and selected!`);
  };

  // Filter products inside the search dropdown
  const filteredProducts = products.filter((p) => {
    if (!itemSearchQuery.trim()) return true;
    const q = itemSearchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.model?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  // Filter customers inside customer search dropdown
  const filteredCustomers = customers.filter((c) => {
    if (!customerSearchQuery.trim()) return true;
    const q = customerSearchQuery.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q);
  });

  // Filter sales list
  const filteredSales = sales.filter((s) => {
    const matchesType = filterType === 'ALL' || s.saleType === filterType;
    const matchesSearch =
      !search ||
      (s.product?.name && s.product.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.customer?.name && s.customer.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()));

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingBag size={22} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sell & Point of Sale (POS)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fast checkout for walk-in cash sales and credit handovers to customers & neighbor shops
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="font-bold text-red-700">
            &times;
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="font-bold text-emerald-700">
            &times;
          </button>
        </div>
      )}

      {/* 1. FAST CHECKOUT POINT OF SALE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-indigo-400" />
            <h3 className="font-bold text-base leading-tight">Checkout Counter</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Cashier: <strong className="text-white">{user?.name}</strong>
          </span>
        </div>

        <form onSubmit={handleCompleteSale} className="p-6 space-y-4 text-xs">
          {/* SEARCHABLE ITEM DROPDOWN */}
          <div ref={itemDropdownRef} className="relative max-w-sm">
            <label className="block font-semibold text-slate-700 uppercase text-[11px] mb-1">
              Select Item to Sell *
            </label>

            {/* Dropdown Trigger Button */}
            <div
              onClick={() => setIsItemDropdownOpen(!isItemDropdownOpen)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer flex items-center justify-between text-xs hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 transition"
            >
              {selectedProduct ? (
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-2 truncate">
                    <Package size={15} className="text-indigo-600 shrink-0" />
                    <span className="font-bold text-slate-900 truncate">{selectedProduct.name}</span>
                    {selectedProduct.brand && (
                      <span className="text-[11px] text-slate-500 shrink-0">({selectedProduct.brand})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-xs font-bold text-indigo-700">
                      ${Number(selectedProduct.sellingPrice).toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        maxStock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {maxStock > 0 ? `${maxStock} in stock` : '0 in stock'}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 font-medium flex items-center gap-2 text-xs">
                  <Search size={14} />
                  <span>Search & select item...</span>
                </span>
              )}

              <div className="flex items-center gap-1.5 shrink-0">
                {selectedProduct && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProductId('');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                  >
                    <X size={14} />
                  </button>
                )}
                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform ${isItemDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </div>

            {/* Dropdown Popover with Search Bar */}
            {isItemDropdownOpen && (
              <div className="absolute top-full left-0 w-full min-w-[320px] max-w-sm mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {/* Search Bar inside dropdown */}
                <div className="p-2.5 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type to search by item name, brand, model..."
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No items found matching "{itemSearchQuery}"
                    </div>
                  ) : (
                    filteredProducts.map((p) => {
                      const stock = p.stockQuantity || 0;
                      const isSelected = (p._id || p.id) === selectedProductId;
                      const isOutOfStock = stock < 1;

                      return (
                        <div
                          key={p._id || p.id}
                          onClick={() => {
                            if (!isOutOfStock) {
                              setSelectedProductId(p._id || p.id);
                              setIsItemDropdownOpen(false);
                            }
                          }}
                          className={`p-3 flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'bg-indigo-50/80 text-indigo-900 font-bold'
                              : isOutOfStock
                              ? 'opacity-40 cursor-not-allowed bg-slate-50/30'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{p.name}</span>
                              {p.brand && (
                                <span className="text-[11px] text-slate-500 font-normal">
                                  {p.brand}
                                </span>
                              )}
                              {p.model && (
                                <span className="text-[10px] text-slate-400">
                                  • {p.model}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 capitalize">{p.category}</span>
                          </div>

                          <div className="flex items-center gap-3 text-right">
                            <span className="font-extrabold text-xs text-slate-900">
                              ${Number(p.sellingPrice).toFixed(2)}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                stock > 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {stock > 0 ? `${stock} in stock` : '0 in stock'}
                            </span>
                            {isSelected && <Check size={16} className="text-indigo-600" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quantity, Unit Price & Payment Mode in compact, minimal styling */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {/* Pieces to Sell */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase text-[11px] mb-1">
                Pieces to Sell *
              </label>
              <input
                type="number"
                min="1"
                max={maxStock || 9999}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-24 px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center bg-white shadow-2xs"
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase text-[11px] mb-1">
                Unit Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-32 px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right bg-white shadow-2xs"
              />
            </div>

            {/* Payment Mode Small Pill Buttons */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase text-[11px] mb-1">
                Payment Mode
              </label>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSaleType('Cash')}
                  className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs font-bold transition ${
                    saleType === 'Cash'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <DollarSign size={13} />
                  <span>Cash Sale</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSaleType('Credit')}
                  className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs font-bold transition ${
                    saleType === 'Credit'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <CreditCard size={13} />
                  <span>Credit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Credit Sale: Searchable Customer & Down Payment */}
          {saleType === 'Credit' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                {/* Customer Dropdown */}
                <div ref={customerDropdownRef} className="relative w-64 max-w-full">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-amber-900 uppercase">
                      Select Customer *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomerModalOpen(true)}
                      className="text-[10px] text-amber-800 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={11} />
                      <span>+ New</span>
                    </button>
                  </div>

                  {/* Customer Dropdown Trigger */}
                  <div
                    onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg cursor-pointer flex items-center justify-between text-xs hover:border-amber-500 font-medium"
                  >
                    {selectedCustomer ? (
                      <span className="font-bold text-slate-900 truncate">
                        {selectedCustomer.name} {selectedCustomer.phone ? `(${selectedCustomer.phone})` : ''}
                      </span>
                    ) : (
                      <span className="text-slate-400">Search customer...</span>
                    )}
                    <ChevronDown size={14} className="text-amber-700 shrink-0 ml-1" />
                  </div>

                  {/* Customer Popover Search */}
                  {isCustomerDropdownOpen && (
                    <div className="absolute top-full left-0 w-72 sm:w-80 mt-1 bg-white border border-amber-300 rounded-xl shadow-lg z-30 overflow-hidden">
                      <div className="p-2 bg-amber-50/50 border-b border-amber-200">
                        <div className="relative">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search customer by name or phone..."
                            value={customerSearchQuery}
                            onChange={(e) => setCustomerSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-2 py-1 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {filteredCustomers.length === 0 ? (
                          <div className="p-3 text-center text-slate-400 text-xs">
                            No customer found matching "{customerSearchQuery}"
                          </div>
                        ) : (
                          filteredCustomers.map((c) => (
                            <div
                              key={c._id || c.id}
                              onClick={() => {
                                setCustomerId(c._id || c.id);
                                setIsCustomerDropdownOpen(false);
                              }}
                              className="p-2 hover:bg-amber-50/70 cursor-pointer flex items-center justify-between text-xs"
                            >
                              <span className="font-semibold text-slate-800 truncate">{c.name}</span>
                              <span className="text-[11px] text-slate-400 shrink-0 ml-2">{c.phone || 'No phone'}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Down Payment */}
                <div className="w-32">
                  <label className="block text-[11px] font-semibold text-amber-900 uppercase mb-1">
                    Down Payment ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={totalAmount}
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>

                {/* Remaining Debt Badge */}
                <div className="py-1.5 px-3 bg-white/80 border border-amber-200 rounded-lg flex items-center gap-2 text-xs font-bold text-amber-950">
                  <span className="text-amber-700">Debt:</span>
                  <span className="text-sm font-extrabold text-amber-800">${remainingDebt.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="max-w-xs">
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Receipt #, buyer note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Total & Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100">
            <div className="flex items-baseline gap-2">
              <span className="text-slate-500 font-semibold">Total Sale Value:</span>
              <span className="text-2xl font-black text-slate-900">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedProductId || maxStock < 1}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              <span>{submitting ? 'Recording Sale...' : `Complete Sale ($${totalAmount.toFixed(2)})`}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. SALES TRANSACTION HISTORY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Recent Sales Transactions</h3>
            <p className="text-xs text-slate-500">Record of all completed cash and credit sales</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['ALL', 'Cash', 'Credit'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    filterType === t
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t === 'ALL' ? 'All Sales' : t}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search sales..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading sales history...</div>
        ) : filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No sales transactions found</p>
            <p className="text-xs text-slate-400 mt-1">
              Sales made above will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Item & Qty</th>
                  <th className="px-6 py-3.5">Mode</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Paid</th>
                  <th className="px-6 py-3.5">Balance Due</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((s) => {
                  const isCredit = s.saleType === 'Credit';
                  const total = Number(s.totalAmount || 0);
                  const paid = Number(s.paidAmount || 0);
                  const rem = Number(s.remainingBalance || 0);

                  return (
                    <tr key={s._id || s.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(s.soldDate).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-3.5">
                        <span className="font-bold text-slate-900 block">
                          {s.quantity || 1}x {s.product?.name || 'Item'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          @ ${Number(s.unitPrice || 0).toFixed(2)}/pc
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            isCredit
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isCredit ? 'Credit' : 'Cash'}
                        </span>
                      </td>

                      <td className="px-6 py-3.5">
                        <span className="font-medium text-slate-800 block">
                          {s.customer?.name || (isCredit ? 'Customer' : 'Walk-in')}
                        </span>
                        {s.customer?.phone && (
                          <span className="text-[10px] text-slate-400">{s.customer.phone}</span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        ${total.toFixed(2)}
                      </td>

                      <td className="px-6 py-3.5 font-semibold text-emerald-700">
                        ${paid.toFixed(2)}
                      </td>

                      <td className="px-6 py-3.5 font-bold text-amber-700">
                        ${rem.toFixed(2)}
                      </td>

                      <td className="px-6 py-3.5">
                        <CreditBadge status={s.creditStatus || (isCredit && rem === 0 ? 'Fully Paid' : 'Cash Sale')} />
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        {isCredit && rem > 0 && (
                          <button
                            onClick={() => {
                              setSelectedSaleForPayment(s);
                              setIsPaymentModalOpen(true);
                            }}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-[11px] shadow-2xs transition inline-flex items-center gap-1"
                          >
                            <HandCoins size={12} />
                            <span>Collect</span>
                          </button>
                        )}
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
      {selectedSaleForPayment && (
        <RecordPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedSaleForPayment(null);
          }}
          onSubmit={handleRecordPayment}
          serial={selectedSaleForPayment}
        />
      )}

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={handleCreateCustomer}
      />
    </div>
  );
};

export default Sales;
