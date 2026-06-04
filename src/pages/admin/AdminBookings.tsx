import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Search, Filter, MoreVertical, Check, X, Calendar, Clock, DollarSign, User, Building2, Eye, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

function formatDate(dStr: string) {
  if (!dStr) return '—';
  try {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dStr;
  }
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((b: any) => ({
          ...b,
          customer: b.customer_name || 'Unknown',
          vendor: b.garage_name || b.vendor_id || '—',
          service: b.service_name || b.service_id || '—',
          date: formatDate(b.scheduled_date),
          rawDate: b.scheduled_date,
          time: b.scheduled_time || '—',
          amount: Number(b.amount) || 0,
          status: b.status?.toLowerCase() || 'pending',
        }));
        setBookings(mapped);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Compute live stats from the raw bookings data
  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const revenue = bookings
      .filter((b) => ['confirmed', 'completed', 'in-progress'].includes(b.status))
      .reduce((sum, b) => sum + b.amount, 0);
    return { total, completed, pending, revenue };
  }, [bookings]);

  // Apply filters client-side
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Search filter
      const matchSearch = !search ||
        b.id?.toLowerCase().includes(search.toLowerCase()) ||
        b.customer?.toLowerCase().includes(search.toLowerCase()) ||
        b.vendor?.toLowerCase().includes(search.toLowerCase()) ||
        b.service?.toLowerCase().includes(search.toLowerCase());

      // Status filter
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;

      // Date filter (Today, Week, Month relative to today)
      let matchDate = true;
      if (dateFilter !== 'all' && b.rawDate) {
        const bDate = new Date(b.rawDate);
        if (!isNaN(bDate.getTime())) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const bookingDay = new Date(bDate);
          bookingDay.setHours(0, 0, 0, 0);

          const diffTime = Math.abs(bookingDay.getTime() - today.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (dateFilter === 'today') {
            matchDate = bookingDay.toDateString() === today.toDateString();
          } else if (dateFilter === 'week') {
            matchDate = diffDays <= 7;
          } else if (dateFilter === 'month') {
            matchDate = diffDays <= 30;
          }
        }
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [bookings, search, statusFilter, dateFilter]);

  // Export to CSV
  const handleExport = () => {
    const headers = ['Booking ID', 'Customer', 'Vendor', 'Service', 'Date', 'Time', 'Amount', 'Status'];
    const rows = filteredBookings.map((b) => [
      b.id,
      b.customer,
      b.vendor,
      b.service,
      b.rawDate || b.date,
      b.time,
      `$ ${b.amount.toFixed(2)}`,
      b.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This will notify the customer.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Cancelled by administrator' })
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking((prev: any) => prev ? { ...prev, status: 'cancelled' } : null);
        }
        alert('Booking cancelled successfully.');
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to the server.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-500">Monitor and manage all service bookings across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center transition-colors"
          >
            <ShoppingBag className="h-4 w-4 mr-2" /> Export Bookings
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Bookings</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : stats.total.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completed</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : stats.completed.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : stats.pending.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : `$ ${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 relative z-10">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings by ID, customer, vendor, service..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {/* Status Filter */}
          <div className="relative">
            <button 
              onClick={() => { setShowStatusMenu(!showStatusMenu); setShowDateMenu(false); }}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center capitalize"
            >
              <Filter className="h-4 w-4 mr-2" /> {statusFilter === 'all' ? 'Status' : statusFilter}
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden min-w-[160px]">
                {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => { setStatusFilter(s); setShowStatusMenu(false); }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm font-semibold capitalize hover:bg-gray-50 text-gray-700",
                      statusFilter === s && "bg-red-50 text-red-600"
                    )}
                  >
                    {s === 'all' ? 'All Statuses' : s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative">
            <button 
              onClick={() => { setShowDateMenu(!showDateMenu); setShowStatusMenu(false); }}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center capitalize"
            >
              <Calendar className="h-4 w-4 mr-2" /> {dateFilter === 'all' ? 'Date' : dateFilter}
            </button>
            {showDateMenu && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden min-w-[160px]">
                {['all', 'today', 'week', 'month'].map(d => (
                  <button 
                    key={d} 
                    onClick={() => { setDateFilter(d); setShowDateMenu(false); }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm font-semibold capitalize hover:bg-gray-50 text-gray-700",
                      dateFilter === d && "bg-red-50 text-red-600"
                    )}
                  >
                    {d === 'all' ? 'All Time' : d === 'today' ? 'Today' : d === 'week' ? 'Within 7 Days' : 'Within 30 Days'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
            <p className="text-gray-500 text-sm">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-sm">No bookings found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-red-600">{booking.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{booking.customer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{booking.vendor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {booking.service}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">{booking.date}</p>
                        <p className="text-xs text-gray-500">{booking.time}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      $ {booking.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full uppercase",
                        booking.status === 'confirmed' ? "bg-blue-100 text-blue-700" :
                        booking.status === 'in-progress' ? "bg-yellow-100 text-yellow-700" :
                        booking.status === 'completed' ? "bg-green-100 text-green-700" :
                        booking.status === 'pending' ? "bg-gray-100 text-gray-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 relative">
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === booking.id ? null : booking.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {activeMenuId === booking.id && (
                          <div className="absolute right-0 mt-8 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden text-left">
                            <button 
                              onClick={() => { setSelectedBooking(booking); setActiveMenuId(null); }}
                              className="w-full px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </button>
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button 
                                onClick={() => { handleCancelBooking(booking.id); setActiveMenuId(null); }}
                                className="w-full px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center border-t border-gray-100"
                              >
                                <X className="h-4 w-4 mr-2" /> Cancel Booking
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Booking #{selectedBooking.id}</h2>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Customer</span>
                <p className="mt-1 font-bold text-gray-900">{selectedBooking.customer}</p>
                {selectedBooking.customer_email && (
                  <p className="text-xs text-gray-500 mt-0.5">{selectedBooking.customer_email}</p>
                )}
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Vendor</span>
                <p className="mt-1 font-bold text-gray-900">{selectedBooking.vendor}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Service</span>
                <p className="mt-1 font-medium text-gray-800">{selectedBooking.service}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Amount</span>
                <p className="mt-1 font-bold text-gray-900">$ {selectedBooking.amount.toFixed(2)}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Date & Time</span>
                <p className="mt-1 font-medium text-gray-800">{selectedBooking.date} at {selectedBooking.time}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Status</span>
                <div className="mt-1">
                  <span className={cn(
                    "inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                    selectedBooking.status === 'confirmed' ? "bg-blue-100 text-blue-700" :
                    selectedBooking.status === 'in-progress' ? "bg-yellow-100 text-yellow-700" :
                    selectedBooking.status === 'completed' ? "bg-green-100 text-green-700" :
                    selectedBooking.status === 'pending' ? "bg-gray-100 text-gray-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
            </div>

            {selectedBooking.cancellation_reason && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800">
                <span className="font-bold block uppercase text-xs tracking-wider mb-1">Cancellation Reason</span>
                <p>{selectedBooking.cancellation_reason}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                <button 
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="flex-1 bg-red-50 text-red-700 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                >
                  Cancel Booking
                </button>
              )}
              <button 
                onClick={() => setSelectedBooking(null)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
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

export default AdminBookings;
