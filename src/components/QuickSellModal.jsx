import React, { useState, useEffect, useRef } from 'react';
import { saleAPI, customerAPI } from '../services/api';
import {
  X,
  ShoppingBag,
  DollarSign,
  CreditCard,
  Search,
  ChevronDown,
  Plus,
  Package
} from 'lucide-react';
import CustomerModal from './CustomerModal';

const QuickSellModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [saleType, setSaleType] = useState('Cash');
  const [customerId, setCustomerId] = useState('');
  const [downPayment, setDownPayment] = useState(0);
  const [notes, setNotes] = useState('');

  const [customers, setCustomers] = useState([]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const customerDropdownRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form & load customers when modal opens
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setUnitPrice(product.sellingPrice || 0);
      setSaleType('Cash');
      setCustomerId('');
      setCustomerSearchQuery('');
      setDownPayment(0);
      setNotes('');
      setError('');
      setIsCustomerDropdownOpen(false);

      customerAPI
        .getAll()
        .then((res) => {
          if (res.data.success) {
            setCustomers(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, product]);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!isOpen || !product) return null;

  const maxStock = product.stockQuantity || 0;
  const qty = parseInt(quantity, 10) || 1;
  const price = parseFloat(unitPrice) || 0;
  const totalAmount = parseFloat((qty * price).toFixed(2));
  const downPay = parseFloat(downPayment) || 0;
  const remainingDebt = Math.max(0, parseFloat((totalAmount - downPay).toFixed(2)));

  const selectedCustomer = customers.find((c) => (c._id || c.id) === customerId);
  const filteredCustomers = customers.filter((c) => {
    const q = customerSearchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  });

  const handleCreateCustomer = async (formData) => {
    const res = await customerAPI.create(formData);
    const newCust = res.data.data;
    setCustomers((prev) => [newCust, ...prev]);
    setCustomerId(newCust._id || newCust.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (maxStock < 1) {
      return setError('This item is currently out of stock.');
    }
    if (qty < 1) {
      return setError('Quantity must be at least 1 piece.');
    }
    if (qty > maxStock) {
      return setError(`Cannot sell ${qty} pcs. Only ${maxStock} pcs available in stock.`);
    }
    if (price <= 0) {
      return setError('Selling price must be greater than zero.');
    }
    if (saleType === 'Credit' && !customerId) {
      return setError('Please select a customer for the credit sale.');
    }

    try {
      setSubmitting(true);
      const payload = {
        productId: product._id || product.id,
        quantity: qty,
        unitPrice: price,
        saleType,
        customerId: saleType === 'Credit' ? customerId : null,
        downPayment: saleType === 'Credit' ? downPay : totalAmount,
        notes
      };

      const res = await saleAPI.create(payload);
      onSuccess(res.data.message || `Sold ${qty} × ${product.name} successfully!`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Sale failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Quick Sell Item</h3>
              <p className="text-[11px] text-slate-400">Record cash or credit sale</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium">
              {error}
            </div>
          )}

          {/* Selected Item Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Package size={16} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{product.name}</p>
                {(product.brand || product.model) && (
                  <p className="text-[11px] text-slate-500 truncate">
                    {product.brand} {product.model ? `• ${product.model}` : ''}
                  </p>
                )}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              {maxStock} in stock
            </span>
          </div>

          {/* Quantity, Unit Price & Payment Mode */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase text-[11px] mb-1">
                Pieces *
              </label>
              <input
                type="number"
                min="1"
                max={maxStock || 1}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-20 px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center bg-white"
              />
            </div>

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
                className="w-28 px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase text-[11px] mb-1">
                Payment
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSaleType('Cash')}
                  className={`py-1 px-2.5 rounded-lg flex items-center gap-1 text-xs font-bold transition ${
                    saleType === 'Cash'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <DollarSign size={12} />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSaleType('Credit')}
                  className={`py-1 px-2.5 rounded-lg flex items-center gap-1 text-xs font-bold transition ${
                    saleType === 'Credit'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard size={12} />
                  <span>Credit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Credit Fields */}
          {saleType === 'Credit' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                {/* Customer Searchable Dropdown */}
                <div ref={customerDropdownRef} className="relative flex-1 min-w-[180px]">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-amber-900 uppercase">
                      Customer *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomerModalOpen(true)}
                      className="text-[10px] text-amber-800 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={11} />
                      <span>New</span>
                    </button>
                  </div>

                  <div
                    onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg cursor-pointer flex items-center justify-between text-xs hover:border-amber-500 font-medium"
                  >
                    {selectedCustomer ? (
                      <span className="font-bold text-slate-900 truncate">
                        {selectedCustomer.name}
                      </span>
                    ) : (
                      <span className="text-slate-400">Search customer...</span>
                    )}
                    <ChevronDown size={14} className="text-amber-700 shrink-0 ml-1" />
                  </div>

                  {isCustomerDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-amber-300 rounded-xl shadow-lg z-30 overflow-hidden">
                      <div className="p-2 bg-amber-50/50 border-b border-amber-200">
                        <div className="relative">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search name or phone..."
                            value={customerSearchQuery}
                            onChange={(e) => setCustomerSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-2 py-1 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                        {filteredCustomers.length === 0 ? (
                          <div className="p-3 text-center text-slate-400 text-xs">
                            No customer found
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
                              <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                                {c.phone || 'No phone'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Down Payment */}
                <div className="w-28">
                  <label className="block text-[11px] font-semibold text-amber-900 uppercase mb-1">
                    Down Pay ($)
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
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-xs font-bold text-amber-950">
                <span>Remaining Customer Debt:</span>
                <span className="text-sm font-extrabold text-amber-800">${remainingDebt.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Receipt #, buyer note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Total & Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Total Sale</span>
              <span className="text-xl font-black text-slate-900">${totalAmount.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || maxStock < 1}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
              >
                <ShoppingBag size={14} />
                <span>{submitting ? 'Selling...' : 'Complete Sale'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={handleCreateCustomer}
      />
    </div>
  );
};

export default QuickSellModal;
