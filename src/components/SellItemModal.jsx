import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, CreditCard, DollarSign, User, AlertCircle } from 'lucide-react';

const SellItemModal = ({ isOpen, onClose, onSubmit, product, customers = [] }) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    unitPrice: '',
    saleType: 'Cash',
    customerId: '',
    downPayment: 0,
    paymentMethod: 'Cash',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        quantity: 1,
        unitPrice: product.sellingPrice || 0,
        saleType: 'Cash',
        customerId: customers[0]?.id || customers[0]?._id || '',
        downPayment: 0,
        paymentMethod: 'Cash',
        notes: ''
      });
    }
    setError('');
  }, [product, customers, isOpen]);

  if (!isOpen || !product) return null;

  const maxQty = product.stockQuantity || 0;
  const qty = parseInt(formData.quantity, 10) || 1;
  const unitPrice = parseFloat(formData.unitPrice) || 0;
  const totalAmount = parseFloat((qty * unitPrice).toFixed(2));
  const downPayment = parseFloat(formData.downPayment) || 0;
  const remainingBalance = Math.max(0, parseFloat((totalAmount - downPayment).toFixed(2)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (maxQty < 1) {
      return setError('This item is currently out of stock!');
    }
    if (qty > maxQty) {
      return setError(`Cannot sell ${qty} pcs. Only ${maxQty} pcs available in stock.`);
    }
    if (unitPrice <= 0) {
      return setError('Selling price must be greater than zero');
    }
    if (formData.saleType === 'Credit' && !formData.customerId) {
      return setError('Please select a customer for the credit sale.');
    }
    if (formData.saleType === 'Credit' && downPayment > totalAmount) {
      return setError('Down payment cannot exceed the total price.');
    }

    try {
      setLoading(true);
      await onSubmit({
        productId: product.id || product._id,
        quantity: qty,
        unitPrice,
        saleType: formData.saleType,
        customerId: formData.saleType === 'Credit' ? formData.customerId : null,
        downPayment: formData.saleType === 'Credit' ? downPayment : totalAmount,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Sale failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Sell Item</h3>
              <p className="text-xs text-slate-400">Record cash sale or credit handover</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Info Banner */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-indigo-950 text-sm">{product.name}</p>
              <p className="text-slate-500 text-[11px]">
                {product.brand && `${product.brand} • `}Cost: ${Number(product.purchasePrice).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Available</span>
              <span className={`font-extrabold text-sm ${maxQty > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {maxQty} Pcs in stock
              </span>
            </div>
          </div>

          {/* Quantity & Unit Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Pieces to Sell *
              </label>
              <input
                type="number"
                min="1"
                max={maxQty}
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Unit Sell Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
              />
            </div>
          </div>

          {/* Sale Type Selector */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1.5">
              Payment Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, saleType: 'Cash' })}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  formData.saleType === 'Cash'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <DollarSign size={16} />
                <span>Full Cash Sale</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, saleType: 'Credit' })}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  formData.saleType === 'Credit'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <CreditCard size={16} />
                <span>Customer Credit</span>
              </button>
            </div>
          </div>

          {/* If Credit Sale: Customer & Down Payment */}
          {formData.saleType === 'Credit' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <div>
                <label className="block font-semibold text-amber-900 uppercase mb-1">
                  Customer / Neighbor Shop *
                </label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-amber-900 uppercase mb-1">
                  Initial Cash Paid / Down Payment ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={totalAmount}
                  value={formData.downPayment}
                  onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between font-bold text-amber-950">
                <span>Remaining Debt:</span>
                <span className="text-sm text-amber-800">${remainingBalance.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Total & Summary Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="font-semibold text-slate-600">Total Sale Value:</span>
            <span className="text-base font-extrabold text-slate-900">${totalAmount.toFixed(2)}</span>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Receipt #, buyer name, or special terms..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || maxQty < 1}
              className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition"
            >
              {loading ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellItemModal;
