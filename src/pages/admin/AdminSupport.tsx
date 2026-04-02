import React from 'react';
import { MessageSquare, Search, Filter, MoreVertical, Send, User, Building2, Check, X, Clock, Paperclip, Smile, Phone, Video, ShieldAlert, AlertCircle, CheckCircle2, Flag } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminSupport = () => {
  const tickets = [
    { id: 'TK-9021', user: 'John Doe', subject: 'Refund Request', priority: 'high', status: 'open', time: '2h ago', category: 'Payments' },
    { id: 'TK-9022', user: 'Elite Auto Care', subject: 'Payout Delayed', priority: 'medium', status: 'in-progress', time: '5h ago', category: 'Vendor' },
    { id: 'TK-9023', user: 'Sarah Smith', subject: 'Booking Cancellation', priority: 'low', status: 'closed', time: 'Yesterday', category: 'Bookings' },
    { id: 'TK-9024', user: 'Precision Mechanics', subject: 'Profile Verification', priority: 'medium', status: 'open', time: 'Yesterday', category: 'Vendor' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Desk</h1>
          <p className="text-gray-500">Manage customer and vendor support tickets, inquiries, and disputes.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filter Tickets
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" /> New Ticket
          </button>
        </div>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Open Tickets</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">24</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">In Progress</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Resolved Today</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">45</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Flag className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Response</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">1.5h</p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-red-600">{ticket.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{ticket.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{ticket.subject}</p>
                      <p className="text-xs text-gray-500">{ticket.category}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                      ticket.priority === 'high' ? "bg-red-100 text-red-700" :
                      ticket.priority === 'medium' ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    )}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      ticket.status === 'open' ? "bg-red-100 text-red-700" :
                      ticket.status === 'in-progress' ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    )}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {ticket.time}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <MessageSquare className="h-4 w-4" />
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

export default AdminSupport;
