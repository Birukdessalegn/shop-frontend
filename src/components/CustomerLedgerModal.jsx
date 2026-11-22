import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, CreditCard, DollarSign, Calendar, ShoppingBag } from 'lucide-react';
import { customerAPI } from '../services/api';
import { CreditBadge } from './StatusBadge';

const CustomerLedgerModal = ({ isOpen, onClose, customerId, onOpenPaymentModal }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetails();
    }
  }, [isOpen, customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await customerAPI.getById(customerId);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const purchases = [
    ...(data?.sales || []),
    ...(data?.serials || [])
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
              {data?.name ? data.name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">
                {loading ? 'Loading...' : data?.name}
              </h3>
              <p className="text-xs text-slate-400">Customer Credit Account & Purchase Ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>
          ) : data ? (
            <>
              {/* Profile Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-slate-400" />
                  <span className="font-medium text-slate-800">{data.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-slate-400" />
                  <span className="text-slate-700 truncate">{data.address || 'No address specified'}</span>
                </div>
                <div className="text-slate-600">
                  <span className="font-medium text-slate-800">Notes: </span>
                  {data.notes || 'None'}
                </div>
              </div>

              {/* Financial KPI Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                    Outstanding Debt
                  </span>
                  <span className="text-2xl font-bold text-amber-900 mt-1 block">
                    ${data.summary?.totalOutstanding?.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-amber-600 mt-0.5 block">
                    Unsettled balance due
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                    Total Paid to Date
                  </span>
                  <span className="text-2xl font-bold text-emerald-800 mt-1 block">
                    ${data.summary?.totalPaid?.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-emerald-600 mt-0.5 block">
                    Total collected
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
                    Total Purchases
                  </span>
                  <span className="text-2xl font-bold text-indigo-900 mt-1 block">
                    ${data.summary?.totalCredit?.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-indigo-600 mt-0.5 block">
                    Across {purchases.length} transaction(s)
                  </span>
                </div>
              </div>

              {/* Purchases & Credit Ledger */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
                  <span>Purchases & Credit Ledger ({purchases.length})</span>
                </h4>
                {purchases.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-lg">
                    No items registered to this customer yet.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Item</th>
                          <th className="px-3 py-2.5 text-center">Qty</th>
                          <th className="px-3 py-2.5">Type</th>
                          <th className="px-3 py-2.5">Total Amount</th>
                          <th className="px-3 py-2.5">Paid</th>
                          <th className="px-3 py-2.5">Remaining Balance</th>
                          <th className="px-3 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {purchases.map((s) => {
                          const total = Number(s.totalAmount || s.creditAmount || 0);
                          const paid = Number(s.paidAmount || 0);
                          const balance = Number(s.remainingBalance || 0);
                          const isCredit = s.saleType === 'Credit' || s.status === 'On Credit';

                          return (
                            <tr key={s._id || s.id} className="hover:bg-slate-50/70">
                              <td className="px-3 py-2.5 font-medium text-slate-900">
                                {s.product?.name || 'Item'}
                              </td>
                              <td className="px-3 py-2.5 text-center font-bold text-slate-700">
                                {s.quantity || 1}
                              </td>
                              <td className="px-3 py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isCredit
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {isCredit ? 'Credit' : 'Cash'}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 font-medium text-slate-800">
                                ${total.toFixed(2)}
                              </td>
                              <td className="px-3 py-2.5 text-emerald-700 font-medium">
                                ${paid.toFixed(2)}
                              </td>
                              <td className="px-3 py-2.5 font-bold text-amber-700">
                                ${balance.toFixed(2)}
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                {isCredit && balance > 0 && (
                                  <button
                                    onClick={() => {
                                      onClose();
                                      onOpenPaymentModal(s);
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition shadow-2xs"
                                  >
                                    Pay
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

              {/* Payment History Log */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3">
                  Payment History ({data.payments?.length || 0})
                </h4>
                {data.payments?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-lg">
                    No payments logged yet.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5">Date</th>
                          <th className="px-3 py-2.5">Method</th>
                          <th className="px-3 py-2.5">Amount</th>
                          <th className="px-3 py-2.5">Staff</th>
                          <th className="px-3 py-2.5">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.payments.map((p) => (
                          <tr key={p._id || p.id} className="hover:bg-slate-50/70">
                            <td className="px-3 py-2 text-slate-500">
                              {new Date(p.paymentDate).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2 text-slate-700 font-medium">{p.paymentMethod}</td>
                            <td className="px-3 py-2 font-bold text-emerald-700">
                              ${Number(p.amount).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-slate-600">{p.recordedBy?.name || 'Staff'}</td>
                            <td className="px-3 py-2 text-slate-400 italic">{p.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CustomerLedgerModal;
