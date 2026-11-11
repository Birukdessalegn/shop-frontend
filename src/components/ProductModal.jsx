import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Barcode } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onSubmit, product = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    category: 'General',
    purchasePrice: '',
    sellingPrice: '',
    hasSerial: true,
    serialNumbers: '',
    stockQuantity: 1,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'General',
    'Computers & PCs',
    'Laptops',
    'Smartphones',
    'Televisions',
    'Audio & Speakers',
    'Accessories',
    'Appliances',
    'Tablets',
    'Gaming'
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        model: product.model || '',
        category: product.category || 'General',
        purchasePrice: product.purchasePrice || '',
        sellingPrice: product.sellingPrice || '',
        hasSerial: product.hasSerial !== undefined ? product.hasSerial : true,
        serialNumbers: '',
        stockQuantity: product.stockQuantity || 0,
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
        hasSerial: true,
        serialNumbers: '',
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
      return setError('Valid purchase/cost price is required');
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
        stockQuantity: Number(formData.stockQuantity) || 1
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
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
            <PackagePlus size={20} className="text-indigo-400" />
            <h3 className="font-semibold text-base">
              {product ? 'Edit Item Details' : 'Register New Item & Serial Number'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dell OptiPlex 7080 PC, HP Core i7 Laptop"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Brand
              </label>
              <input
                type="text"
                placeholder="e.g. Dell, HP, Apple"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Model / Specs
              </label>
              <input
                type="text"
                placeholder="e.g. i7-10700 16GB 512GB SSD"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Direct Serial Number Input at Registration */}
          {!product && (
            <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-indigo-900 font-semibold text-xs">
                <Barcode size={16} className="text-indigo-600" />
                <span>Serial Number(s) / Service Tag / IMEI</span>
              </div>
              <textarea
                rows={2}
                placeholder="Enter serial number here (e.g. DELL-PC-77821) or multiple separated by comma or new line"
                value={formData.serialNumbers}
                onChange={(e) => setFormData({ ...formData, serialNumbers: e.target.value })}
                className="w-full font-mono text-xs uppercase px-3 py-2 bg-white rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500">
                You can scan the barcode directly or type the serial number so you can identify it later when giving it to a neighbor shop.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Cost ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Sell Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Origin, warranty, or condition notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : product ? 'Update Item' : 'Register Item & Serial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
