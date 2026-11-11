import React, { useState, useEffect } from 'react';
import { X, HandCoins, AlertCircle, CheckCircle2 } from 'lucide-react';

const RecordPaymentModal = ({ isOpen, onClose, onSubmit, serial = null }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [markAsSoldWhenFullyPaid, setMarkAsSoldWhenFullyPaid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (serial) {
      setAmount(serial.remainingBalance || '');
      setPaymentMethod('Cash');
      setNotes('');
      setError('');
    }
  }, [serial, isOpen]);

  if (!isOpen || !serial) return null;

  const paymentNum = Number(amount) || 0;
  const currentBalance = serial.remainingBalance || 0;
  const newBalance = Math.max(0, +(currentBalance - paymentNum).toFixed(2));
  const isFullSettlement = newBalance === 0 && paymentNum >= currentBalance;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (paymentNum <= 0) {
      return setError('Payment amount must be greater than zero');
    }
    if (paymentNum > currentBalance) {
      return setError(`Payment cannot exceed the remaining balance of $${currentBalance}`);
    }

    try {
      setLoading(true);
      await onSubmit(serial._id, {
        amount: paymentNum,
        paymentMethod,
        notes,
        markAsSoldWhenFullyPaid
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment recording failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandCoins size={20} className="text-emerald-400" />
            <div>
              <h3 className="font-semibold text-base">Record Credit Payment</h3>
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

        {/* Account Details Box */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Customer:</span>
            <span className="font-semibold text-slate-800">
              {serial.customer?.name} ({serial.customer?.phone})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Product:</span>
            <span className="font-semibold text-slate-800">{serial.product?.name}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase block">Total Credit</span>
              <span className="font-bold text-slate-800 text-sm">
                ${serial.creditAmount?.toFixed(2)}
              </span>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="text-emerald-600 text-[10px] uppercase block">Already Paid</span>
              <span className="font-bold text-emerald-700 text-sm">
                ${serial.paidAmount?.toFixed(2)}
              </span>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-amber-700 text-[10px] uppercase block">Balance Due</span>
              <span className="font-bold text-amber-900 text-sm">
                ${currentBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Payment Amount ($) *
              </label>
              <button
                type="button"
                onClick={() => setAmount(currentBalance)}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Pay Full Balance (${currentBalance})
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={currentBalance}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-base font-semibold px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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
              <option value="Mobile Money">Mobile Money (Telebirr / CBE / M-Pesa)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Receipt / Transaction Note
            </label>
            <input
              type="text"
              placeholder="e.g. Receipt #4092, Bank ref: FT2409..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Balance Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">New Balance After Payment:</span>
              <span className="font-bold text-slate-900">${newBalance.toFixed(2)}</span>
            </div>
            {isFullSettlement && (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold pt-1">
                <CheckCircle2 size={14} />
                <span>This payment will completely settle this credit!</span>
              </div>
            )}
          </div>

          {isFullSettlement && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={markAsSoldWhenFullyPaid}
                onChange={(e) => setMarkAsSoldWhenFullyPaid(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Mark status as 'Sold' once fully settled</span>
            </label>
          )}

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
              disabled={loading || paymentNum <= 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Recording...' : `Record Payment ($${paymentNum.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;

