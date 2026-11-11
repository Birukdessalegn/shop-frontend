import React, { useState } from 'react';
import { X, Barcode, Plus, CheckCircle2 } from 'lucide-react';

const AddSerialsModal = ({ isOpen, onClose, onSubmit, products = [], defaultProductId = '' }) => {
  const [productId, setProductId] = useState(defaultProductId || '');
  const [serialInput, setSerialInput] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (defaultProductId) {
      setProductId(defaultProductId);
    } else if (products.length > 0 && !productId) {
      setProductId(products[0]._id);
    }
  }, [defaultProductId, products]);

  if (!isOpen) return null;

  // Parsed count helper
  const parsedSerials = serialInput
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!productId) {
      return setError('Please select a product');
    }
    if (parsedSerials.length === 0) {
      return setError('Please enter at least one serial number');
    }

    try {
      setLoading(true);
      await onSubmit({
        productId,
        serialNumbers: parsedSerials,
        notes
      });
      setSerialInput('');
      setNotes('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add serials');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p._id === productId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Barcode size={20} className="text-emerald-400" />
            <h3 className="font-semibold text-base">Register Serial Numbers</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Product *
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="" disabled>
                -- Choose a serialized product --
              </option>
              {products
                .filter((p) => p.hasSerial)
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.brand ? `(${p.brand})` : ''} - Sell: ${p.sellingPrice}
                  </option>
                ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900">
              <span className="font-semibold">Target Product: </span>
              {selectedProduct.name} | Model: {selectedProduct.model || 'N/A'} | Price: $
              {selectedProduct.sellingPrice}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Serial Numbers (IMEI / Barcode) *
              </label>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {parsedSerials.length} detected
              </span>
            </div>
            <textarea
              rows={5}
              required
              placeholder="Enter one serial number per line or separated by commas:&#10;SN-882910&#10;SN-882911&#10;SN-882912"
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              className="w-full font-mono text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tip: You can scan barcodes directly with a handheld USB scanner or paste multiple
              lines from your delivery invoice.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Batch Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Shipment container #4, shelf B2"
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
              disabled={loading || parsedSerials.length === 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>
                {loading
                  ? 'Registering...'
                  : `Register ${parsedSerials.length || ''} Serial(s)`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSerialsModal;

