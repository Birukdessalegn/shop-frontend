import React, { useState, useEffect } from 'react';
import { X, PackagePlus, DollarSign } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onSubmit, product = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    category: 'Computers & PCs',
    purchasePrice: '',
    sellingPrice: '',
    stockQuantity: 1,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Computers & PCs',
    'Laptops',
    'Smartphones',
    'Televisions',
    'Audio & Speakers',
    'Accessories',
    'Appliances',
    'Tablets',
    'Gaming',
    'General'
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        model: product.model || '',
        category: product.category || 'Computers & PCs',
        purchasePrice: product.purchasePrice || '',
        sellingPrice: product.sellingPrice || '',
        stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : 1,
        description: product.description || ''
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        model: '',
        category: 'Computers & PCs',
        purchasePrice: '',
        sellingPrice: '',
        stockQuantity: 1,
        description: ''
      });
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      return setError('Item / Product name is required');
    }
    if (formData.purchasePrice === '' || Number(formData.purchasePrice) < 0) {
      return setError('Valid cost price is required');
    }
    if (formData.sellingPrice === '' || Number(formData.sellingPrice) < 0) {
      return setError('Valid selling price is required');
    }

    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        stockQuantity: Math.max(0, parseInt(formData.stockQuantity, 10) || 0)
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const cost = Number(formData.purchasePrice) || 0;
  const sell = Number(formData.sellingPrice) || 0;
  const qty = parseInt(formData.stockQuantity, 10) || 0;
  const unitProfit = sell - cost;
  const totalInvestment = cost * qty;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus size={20} className="text-indigo-400" />
            <h3 className="font-semibold text-base">
              {product ? 'Edit Item Details' : 'Register New Item'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dell OptiPlex 7080 PC, HP Core i7 Laptop"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Brand & Specs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Brand</label>
              <input
                type="text"
                placeholder="e.g. Dell, HP, Apple"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Specs / Model</label>
              <input
                type="text"
                placeholder="e.g. i7 16GB 512GB"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity in Stock */}
            <div>
              <label className="block font-semibold text-indigo-900 uppercase mb-1">
                Quantity in Stock (Pcs) *
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="How many pcs?"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full px-3 py-2 border-2 border-indigo-200 bg-indigo-50/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-extrabold text-sm text-center text-indigo-950"
              />
            </div>
          </div>

          {/* Cost Price & Selling Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Cost Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Selling Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          {/* Live Profit Preview */}
          {cost > 0 && sell > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span>Profit per piece:</span>
                <span className={`font-bold ${unitProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {unitProfit >= 0 ? '+' : ''}${unitProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200/60 font-medium">
                <span>Total Stock Investment ({qty} pcs):</span>
                <span className="font-extrabold text-slate-900">${totalInvestment.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 uppercase mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Origin, warranty, or supplier notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              disabled={loading}
              className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : product ? 'Update Item' : 'Register Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
