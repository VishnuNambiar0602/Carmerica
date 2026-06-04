import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, DollarSign, Search, Filter, MoreVertical, Download, Check, X, Clock, Wallet, Banknote, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

function formatPaymentDate(dStr: string) {
  if (!dStr) return '—';
  try {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dStr;
  }
}

const AdminPayments = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bookingsMap, setBookingsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [processingPayouts, setProcessingPayouts] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [paymentsRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/payments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/bookings', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      let bookingsData: any[] = [];
      if (bookingsRes.ok) {
        bookingsData = await bookingsRes.json();
        const map: Record<string, any> = {};
        bookingsData.forEach((b: any) => {
          map[b.id] = b;
        });
        setBookingsMap(map);
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setTransactions(paymentsData);
      }
    } catch (err) {
      console.error('Error fetching payments details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute live financial stats
  const stats = useMemo(() => {
    const paidList = transactions.filter(t => t.status === 'paid' || t.status === 'completed');
    const pendingList = transactions.filter(t => t.status === 'pending');
    const refundedList = transactions.filter(t => t.status === 'refunded');

    const gross = paidList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    // Net Commission is 15% of the gross processed volume
    const net = Math.round(gross * 0.15);
    const pending = pendingList.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const refundRate = transactions.length > 0
      ? Number(((refundedList.length / transactions.length) * 100).toFixed(1))
      : 0;

    return { gross, net, pending, refundRate };
  }, [transactions]);

  // Apply filters client-side
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const booking = bookingsMap[t.booking_id] || {};
      const customer = booking.customer_name || 'Unknown';
      const vendor = booking.garage_name || booking.vendor_id || '—';
      
      const matchSearch = !search ||
        t.id?.toLowerCase().includes(search.toLowerCase()) ||
        t.booking_id?.toLowerCase().includes(search.toLowerCase()) ||
        customer.toLowerCase().includes(search.toLowerCase()) ||
        vendor.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || t.status?.toLowerCase() === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [transactions, bookingsMap, search, statusFilter]);

  // Export CSV
  const handleExport = () => {
    const headers = ['Transaction ID', 'Booking ID', 'Date', 'Customer', 'Vendor', 'Amount', 'Platform Fee (15%)', 'Status', 'Stripe ID'];
    const rows = filteredTransactions.map((t) => {
      const booking = bookingsMap[t.booking_id] || {};
      const customer = booking.customer_name || 'Unknown';
      const vendor = booking.garage_name || booking.vendor_id || '—';
      const amount = Number(t.amount) || 0;
      const fee = amount * 0.15;
      return [
        t.id,
        t.booking_id,
        t.created_at,
        customer,
        vendor,
        `AED ${amount.toFixed(2)}`,
        `AED ${fee.toFixed(2)}`,
        t.status,
        t.stripe_payment_intent_id || '—'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financials_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process vendor payouts
  const handleProcessPayouts = async () => {
    if (!confirm('Process all pending vendor payouts? This action cannot be undone.')) return;
    setProcessingPayouts(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/process-payouts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Payouts processed successfully. Vendors will receive funds within 2 business days.');
        // Optionally refresh page or data
        fetchData();
      } else {
        alert('Payout processing failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to payouts server.');
    } finally {
      setProcessingPayouts(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Settlements</h1>
          <p className="text-gray-500">Monitor platform transactions, vendor payouts, and financial health.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center transition-colors"
          >
            <Download className="h-4 w-4 mr-2" /> Export Financials
          </button>
          <button 
            onClick={handleProcessPayouts}
            disabled={processingPayouts}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-red-400 flex items-center transition-colors"
          >
            {processingPayouts ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Banknote className="h-4 w-4 mr-2" />
            )}
            Process Payouts
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
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : `AED ${stats.gross.toLocaleString()}`}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Net Commission</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : `AED ${stats.net.toLocaleString()}`}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Wallet className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Payouts</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : `AED ${stats.pending.toLocaleString()}`}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <Activity className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Refund Rate</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : `${stats.refundRate}%`}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden z-10 relative">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-bold text-gray-900">Recent Transactions</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..." 
                className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-48 font-medium"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center capitalize"
              >
                <Filter className="h-3 w-3 mr-2" /> {statusFilter === 'all' ? 'Status' : statusFilter}
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden min-w-[140px] text-left">
                  {['all', 'paid', 'pending', 'refunded', 'failed'].map(s => (
                    <button 
                      key={s} 
                      onClick={() => { setStatusFilter(s); setShowStatusMenu(false); }}
                      className={cn(
                        "w-full px-4 py-2 text-xs font-semibold capitalize hover:bg-gray-50 text-gray-700 block",
                        statusFilter === s && "bg-red-50 text-red-600"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
            <p className="text-gray-500 text-sm">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-sm">No transactions found matching filters.</p>
          </div>
        ) : (
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
                {filteredTransactions.map((txn) => {
                  const booking = bookingsMap[txn.booking_id] || {};
                  const customer = booking.customer_name || 'Unknown';
                  const vendor = booking.garage_name || booking.vendor_id || '—';
                  const amount = Number(txn.amount) || 0;
                  const fee = amount * 0.15;
                  const paymentMethod = txn.stripe_charge_id ? 'Card payment via Stripe' : 'Online Payment';
                  
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-[#003580]">{txn.id}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{paymentMethod}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatPaymentDate(txn.created_at)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vendor}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">AED {amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-red-600">AED {fee.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full uppercase",
                          txn.status === 'paid' || txn.status === 'completed' ? "bg-green-100 text-green-700" :
                          txn.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 relative">
                          <button 
                            onClick={() => setSelectedTxn({ ...txn, customer, vendor, fee })}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="View Financial Details"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === txn.id ? null : txn.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {activeMenuId === txn.id && (
                            <div className="absolute right-0 mt-8 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden text-left">
                              <button 
                                onClick={() => { setSelectedTxn({ ...txn, customer, vendor, fee }); setActiveMenuId(null); }}
                                className="w-full px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center"
                              >
                                <CreditCard className="h-4 w-4 mr-2" /> View Details
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
              <button 
                onClick={() => setSelectedTxn(null)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Transaction ID</span>
                <p className="mt-1 font-bold text-[#003580]">{selectedTxn.id}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Booking ID</span>
                <p className="mt-1 font-bold text-red-600">#{selectedTxn.booking_id}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Customer</span>
                <p className="mt-1 font-bold text-gray-900">{selectedTxn.customer}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Vendor / Garage</span>
                <p className="mt-1 font-bold text-gray-900">{selectedTxn.vendor}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Payment Date</span>
                <p className="mt-1 font-medium text-gray-800">{formatPaymentDate(selectedTxn.created_at)}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Stripe Payment Intent</span>
                <p className="mt-1 font-mono text-xs text-gray-700 max-w-[180px] break-all">
                  {selectedTxn.stripe_payment_intent_id || '—'}
                </p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Stripe Charge ID</span>
                <p className="mt-1 font-mono text-xs text-gray-700 max-w-[180px] break-all">
                  {selectedTxn.stripe_charge_id || '—'}
                </p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Refunded Amount</span>
                <p className="mt-1 font-medium text-red-600">AED {(Number(selectedTxn.refund_amount) || 0).toFixed(2)}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Transaction Status</span>
                <div className="mt-1">
                  <span className={cn(
                    "inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                    selectedTxn.status === 'paid' || selectedTxn.status === 'completed' ? "bg-green-100 text-green-700" :
                    selectedTxn.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {selectedTxn.status}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Currency</span>
                <p className="mt-1 font-semibold uppercase text-gray-700">{selectedTxn.currency || 'AED'}</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between font-medium text-gray-600">
                <span>Gross Amount:</span>
                <span className="text-gray-900">AED {(Number(selectedTxn.amount) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-red-600">
                <span>Platform Commission (15%):</span>
                <span>AED {(Number(selectedTxn.fee) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2">
                <span>Vendor Settlement Amount:</span>
                <span>AED {((Number(selectedTxn.amount) || 0) * 0.85).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button 
                onClick={() => setSelectedTxn(null)}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
