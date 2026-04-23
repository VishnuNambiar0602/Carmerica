import React from 'react';
import { CreditCard, DollarSign, Search, Filter, MoreVertical, Download, Check, X, Clock, ArrowUpRight, ArrowDownRight, Banknote, Wallet, ShieldCheck, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminPayments = () => {
  const transactions = [
    { id: 'TXN-9021', date: 'Oct 12, 2026', user: 'John Doe', vendor: 'Elite Auto Care', amount: 89.00, fee: 13.35, status: 'completed', method: 'Visa •••• 4242' },
    { id: 'TXN-9022', date: 'Oct 11, 2026', user: 'Sarah Smith', vendor: 'Precision Mechanics', amount: 120.00, fee: 18.00, status: 'completed', method: 'Mastercard •••• 5555' },
    { id: 'TXN-9023', date: 'Oct 10, 2026', user: 'Mike Johnson', vendor: 'Elite Auto Care', amount: 189.00, fee: 28.35, status: 'pending', method: 'Apple Pay' },
    { id: 'TXN-9024', date: 'Oct 09, 2026', user: 'Emily Davis', vendor: 'The Garage Co.', amount: 65.00, fee: 9.75, status: 'completed', method: 'Visa •••• 1234' },
    { id: 'TXN-9025', date: 'Oct 08, 2026', user: 'Robert Brown', vendor: 'Quick Fix Motors', amount: 150.00, fee: 22.50, status: 'failed', method: 'Mastercard •••• 9999' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Settlements</h1>
          <p className="text-gray-500">Monitor platform transactions, vendor payouts, and financial health.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" /> Export Financials
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center">
            <Banknote className="h-4 w-4 mr-2" /> Process Payouts
          </button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Gross Volume</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">$1.2M</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Net Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">$185.4K</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Wallet className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Payouts</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">$42.8K</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Refund Rate</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">1.2%</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Recent Transactions</h2>
          <div className="flex gap-2">
            <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center">
              <Filter className="h-3 w-3 mr-2" /> Status
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Fee (15%)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-[#003580]">{txn.id}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{txn.method}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{txn.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{txn.user}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{txn.vendor}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">${txn.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">${txn.fee.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      txn.status === 'completed' ? "bg-green-100 text-green-700" :
                      txn.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <CreditCard className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
