import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, UserCheck, AlertCircle } from 'lucide-react';

const SellSerialModal = ({
  isOpen,
  onClose,
  onSubmit,
  serial = null,
  customers = []
}) => {
  const [saleType, setSaleType] = useState('Credit'); // 'Credit' or 'Cash'
  const [customerId, setCustomerId] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [downPayment, setDownPayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (serial) {
      const price = serial.product?.sellingPrice || 0;
      setCreditAmount(price);
      setDownPayment(0);
      setSaleType('Credit');
      setCustomerId('');
      setNotes('');
      setError('');
    }
  }, [serial, isOpen]);

  if (!isOpen || !serial) return null;

  const totalAmount = Number(creditAmount) || 0;
  const initialDown = Number(downPayment) || 0;
  const remainingDebt = Math.max(0, +(totalAmount - initialDown).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (saleType === 'Credit') {
      if (!customerId) {
        return setError('Please select a customer to issue credit to');
      }
      if (totalAmount <= 0) {
        return setError('Credit amount must be greater than zero');
      }
      if (initialDown > totalAmount) {
        return setError('Down payment cannot exceed the total credit amount');
      }
    }

    try {
      setLoading(true);
      await onSubmit(serial._id, {
        saleType,
        customerId: customerId || null,
        creditAmount: totalAmount,
        downPayment: initialDown,
        paymentMethod,
        notes
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Sale transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={20} className="text-amber-400" />
            <div>
              <h3 className="font-semibold text-base">Sell / Issue Item</h3>
              <p className="text-xs text-slate-400">SN: {serial.serialNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Product Snapshot */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 text-xs text-slate-700 flex justify-between items-center">
          <div>
            <p className="font-bold text-slate-900">{serial.product?.name}</p>
            <p className="text-slate-500">
              Brand: {serial.product?.brand || 'N/A'} | Model: {serial.product?.model || 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-slate-400">Base Selling Price</span>
            <p className="text-base font-bold text-indigo-600">
              ${serial.product?.sellingPrice?.toFixed(2)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Sale Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Sale Agreement Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSaleType('Credit')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  saleType === 'Credit'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard size={18} className="text-amber-600" />
                <span>Sell on Credit</span>
              </button>

              <button
                type="button"
                onClick={() => setSaleType('Cash')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition ${
                  saleType === 'Cash'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <DollarSign size={18} className="text-emerald-600" />
                <span>Full Cash Sale</span>
              </button>
            </div>
          </div>

          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Customer {saleType === 'Credit' ? '*' : '(Optional)'}
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required={saleType === 'Credit'}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">
                {saleType === 'Credit' ? '-- Select Customer (Required) --' : '-- Walk-in Customer (None) --'}
              </option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phone}) {c.address ? `- ${c.address}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Price & Payment Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                {saleType === 'Credit' ? 'Total Agreed Price ($) *' : 'Cash Price ($) *'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {saleType === 'Credit' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Initial Down Payment ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
          </div>

          {/* Credit Sale Financial Summary Box */}
          {saleType === 'Credit' && (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Credit Agreement:</span>
                <span className="font-semibold text-slate-900">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Initial Down Payment Received:</span>
                <span className="font-semibold text-emerald-700">-${initialDown.toFixed(2)}</span>
              </div>
              <div className="pt-1.5 border-t border-amber-200/80 flex justify-between text-sm font-bold">
                <span className="text-amber-900">Remaining Customer Balance:</span>
                <span className="text-amber-700">${remainingDebt.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Notes / Terms
            </label>
            <input
              type="text"
              placeholder={
                saleType === 'Credit'
                  ? 'e.g. Pay remainder by 30th of this month'
                  : 'e.g. Walk-in receipt or invoice number'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition disabled:opacity-50 ${
                saleType === 'Credit'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading ? 'Processing...' : saleType === 'Credit' ? 'Confirm Credit Sale' : 'Complete Cash Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellSerialModal;

