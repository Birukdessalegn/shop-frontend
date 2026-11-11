import React, { useState } from 'react';
import { X, Search, ShieldCheck, ShieldAlert, CheckCircle2, Clock, User, Store } from 'lucide-react';
import { serialAPI } from '../services/api';
import { StatusBadge } from './StatusBadge';

const VerifyItemModal = ({ isOpen, onClose }) => {
  const [serialQuery, setSerialQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!serialQuery.trim()) return;

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const res = await serialAPI.verify(serialQuery.trim());
      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification search failed');
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSerialQuery('');
    setResult(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-400" />
            <div>
              <h3 className="font-semibold text-base">Check Item Ownership</h3>
              <p className="text-xs text-slate-400">Verify if an item belongs to your shop</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetSearch();
              onClose();
            }}
            className="text-slate-400 hover:text-white transition p-1 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Search Box */}
          <form onSubmit={handleVerify} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase">
              Scan or Enter Serial Number / Service Tag
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. DELL-PC-77821, IMEI..."
                  value={serialQuery}
                  onChange={(e) => setSerialQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 font-mono text-sm uppercase rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !serialQuery.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Verify'}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="pt-2 animate-in fade-in duration-200">
              {result.isOurShopItem ? (
                /* Item is OUR shop's device */
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-950 text-base leading-tight">
                        YES — This is YOUR Shop's Item!
                      </h4>
                      <p className="text-xs text-emerald-700 font-mono mt-0.5 font-semibold">
                        Serial: {result.data?.serialNumber}
                      </p>
                    </div>
                  </div>

                  {/* Device Snapshot */}
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {result.data?.product?.name}
                        </p>
                        <p className="text-slate-500">
                          {result.data?.product?.brand} {result.data?.product?.model && `• ${result.data?.product?.model}`}
                        </p>
                      </div>
                      <StatusBadge status={result.data?.status} />
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Category</span>
                        <span className="font-medium text-slate-800">{result.data?.product?.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Selling Price</span>
                        <span className="font-medium text-slate-800">${result.data?.product?.sellingPrice?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Location / Holder Info */}
                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 text-xs space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Current Location / Holder
                    </span>

                    {result.data?.customer ? (
                      <div className="flex items-start gap-2">
                        <User size={15} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-900">
                            Given to: {result.data.customer.name}
                          </p>
                          <p className="text-slate-500">Phone: {result.data.customer.phone}</p>
                          {result.data.customer.address && (
                            <p className="text-slate-500">Location: {result.data.customer.address}</p>
                          )}
                          {result.data.status === 'On Credit' && (
                            <p className="font-semibold text-amber-700 mt-1">
                              Remaining Balance: ${result.data.remainingBalance?.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                        <Store size={15} className="text-emerald-600" />
                        <span>Currently In Shop (Available in inventory)</span>
                      </div>
                    )}

                    {result.data?.notes && (
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 italic">
                        Notes: "{result.data.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* Item is NOT found in our shop */
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <ShieldAlert size={26} />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-950 text-base">
                      NOT FOUND — Not Your Shop's Item
                    </h4>
                    <p className="text-xs text-rose-700 mt-1">
                      Serial number <span className="font-mono font-bold">"{result.serialNumber}"</span> was not found in your registered inventory.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-2">
                      This PC or device was not registered in your shop's database.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              resetSearch();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyItemModal;

