import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Filter, ArrowUpRight, ArrowDownRight, CreditCard, Wallet, Banknote } from 'lucide-react';
import { cn } from '../../lib/utils';

const VendorEarnings = () => {
  const stats = [
    { name: 'Total Earnings', value: '$45,280.50', change: '+12.5%', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Pending Payout', value: '$3,420.00', change: '+5.2%', icon: Wallet, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { name: 'Completed Payouts', value: '$41,860.50', change: '+8.1%', icon: Banknote, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const transactions = [
    { id: 'TXN-9021', date: 'Oct 12, 2026', customer: 'John Doe', service: 'Oil Change', amount: 89.00, status: 'completed' },
    { id: 'TXN-9022', date: 'Oct 11, 2026', customer: 'Sarah Smith', service: 'Brake Repair', amount: 120.00, status: 'completed' },
    { id: 'TXN-9023', date: 'Oct 10, 2026', customer: 'Mike Johnson', service: 'General Service', amount: 189.00, status: 'pending' },
    { id: 'TXN-9024', date: 'Oct 09, 2026', customer: 'Emily Davis', service: 'AC Service', amount: 65.00, status: 'completed' },
    { id: 'TXN-9025', date: 'Oct 08, 2026', customer: 'Robert Brown', service: 'Battery Replacement', amount: 150.00, status: 'failed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
          <p className="text-gray-500">Track your garage's revenue, pending payments, and payout history.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Download className="h-4 w-4 mr-2" /> Export
          </button>
          <button className="bg-[#003580] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#00224f] flex items-center">
            <CreditCard className="h-4 w-4 mr-2" /> Request Payout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-full flex items-center",
                stat.change.startsWith('+') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {stat.change.startsWith('+') ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-gray-900">Revenue Overview</h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button className="px-3 py-1 text-xs font-bold rounded-md bg-white shadow-sm text-gray-900">7 Days</button>
            <button className="px-3 py-1 text-xs font-bold rounded-md text-gray-500 hover:text-gray-700">30 Days</button>
            <button className="px-3 py-1 text-xs font-bold rounded-md text-gray-500 hover:text-gray-700">12 Months</button>
          </div>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
          <p className="text-gray-400 text-sm font-medium">Revenue Chart Visualization Coming Soon</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Recent Transactions</h2>
          <div className="flex gap-2">
            <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center">
              <Calendar className="h-3 w-3 mr-2" /> Date Range
            </button>
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
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#003580]">{txn.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{txn.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{txn.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{txn.service}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">${txn.amount.toFixed(2)}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorEarnings;
