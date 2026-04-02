import React from 'react';
import { ShoppingBag, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Shield, Mail, Phone, Calendar, ArrowUpRight, ArrowDownRight, Clock, DollarSign, User, Building2, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminBookings = () => {
  const bookings = [
    { id: 'BK-1024', customer: 'John Doe', vendor: 'Elite Auto Care', service: 'Oil Change', date: 'Oct 12, 2026', time: '09:00 AM', amount: 89.00, status: 'confirmed' },
    { id: 'BK-1025', customer: 'Sarah Smith', vendor: 'Precision Mechanics', service: 'Brake Repair', date: 'Oct 12, 2026', time: '11:30 AM', amount: 120.00, status: 'in-progress' },
    { id: 'BK-1026', customer: 'Mike Johnson', vendor: 'Elite Auto Care', service: 'General Service', date: 'Oct 13, 2026', time: '02:00 PM', amount: 189.00, status: 'pending' },
    { id: 'BK-1027', customer: 'Emily Davis', vendor: 'The Garage Co.', service: 'AC Service', date: 'Oct 14, 2026', time: '10:00 AM', amount: 65.00, status: 'cancelled' },
    { id: 'BK-1028', customer: 'Robert Brown', vendor: 'Quick Fix Motors', service: 'Battery Replacement', date: 'Oct 15, 2026', time: '04:00 PM', amount: 150.00, status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-500">Monitor and manage all service bookings across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Calendar className="h-4 w-4 mr-2" /> Calendar View
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center">
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
          <p className="text-2xl font-bold text-gray-900">2,450</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Completed</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">1,820</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">415</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">$185,420</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search bookings by ID, customer, or vendor..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Status
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Calendar className="h-4 w-4 mr-2" /> Date
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
              {bookings.map((booking) => (
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
                    ${booking.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      booking.status === 'confirmed' ? "bg-blue-100 text-blue-700" :
                      booking.status === 'in-progress' ? "bg-yellow-100 text-yellow-700" :
                      booking.status === 'completed' ? "bg-green-100 text-green-700" :
                      booking.status === 'pending' ? "bg-gray-100 text-gray-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
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

export default AdminBookings;
