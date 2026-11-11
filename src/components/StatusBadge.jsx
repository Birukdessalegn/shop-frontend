import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
    'On Credit': 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
    Sold: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
    Returned: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20',
    Damaged: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20'
  };

  const currentStyle = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-xs ${currentStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
};

export const CreditBadge = ({ creditStatus }) => {
  if (!creditStatus) return null;

  const styles = {
    Pending: 'bg-red-50 text-red-700 border-red-200',
    'Partially Paid': 'bg-orange-50 text-orange-700 border-orange-200',
    'Fully Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const currentStyle = styles[creditStatus] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${currentStyle}`}
    >
      {creditStatus}
    </span>
  );
};

