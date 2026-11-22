import React, { useState } from 'react';
import { X, PlusCircle, Package } from 'lucide-react';

const AddStockModal = ({ isOpen, onClose, onSubmit, product }) => {
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const currentStock = product.stockQuantity || 0;
  const qty = parseInt(quantityToAdd, 10) || 1;
  const newTotalStock = currentStock + qty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (qty < 1) {
      return setError('Please enter at least 1 piece to add.');
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit(product._id || product.id, { quantity: qty });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-600 rounded-lg">
              <PlusCircle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Add Stock</h3>
              <p className="text-xs text-slate-400">Increase available pieces</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-slate-500 font-medium">Item Name:</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{product.name}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Currently in store: <strong className="text-slate-700">{currentStock} Pcs</strong>
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Quantity / Pieces to Add *
            </label>
            <input
              type="number"
              min="1"
              required
              autoFocus
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(e.target.value)}
              className="w-full px-3 py-2.5 text-center text-lg font-extrabold text-emerald-700 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between font-bold text-emerald-900">
            <span>New Stock Total:</span>
            <span className="text-base text-emerald-800">{newTotalStock} Pcs</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition"
            >
              {loading ? 'Adding...' : 'Add Pieces'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockModal;
