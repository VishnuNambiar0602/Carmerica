import React from 'react';
import { User, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Shield, Mail, Phone, Calendar, ArrowUpRight, ArrowDownRight, UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminUsers = () => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 8901', status: 'active', role: 'customer', joined: 'Oct 12, 2025', bookings: 12, image: 'https://i.pravatar.cc/150?u=john' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', phone: '+1 234 567 8902', status: 'active', role: 'customer', joined: 'Sep 15, 2025', bookings: 8, image: 'https://i.pravatar.cc/150?u=sarah' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1 234 567 8903', status: 'suspended', role: 'customer', joined: 'Aug 01, 2025', bookings: 45, image: 'https://i.pravatar.cc/150?u=mike' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', phone: '+1 234 567 8904', status: 'active', role: 'customer', joined: 'Jan 01, 2025', bookings: 210, image: 'https://i.pravatar.cc/150?u=emily' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage all registered customers and their account statuses.</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center">
          <UserPlus className="h-4 w-4 mr-2" /> Add New User
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">12,450</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Users</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">11,200</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Suspended</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">150</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users by name, email, or phone..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Role
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Clock className="h-4 w-4 mr-2" /> Status
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Bookings</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={user.image} alt={user.name} className="h-10 w-10 rounded-full object-cover mr-3" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">ID: #USR-{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-600">
                        <Mail className="h-3 w-3 mr-2 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Phone className="h-3 w-3 mr-2 text-gray-400" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      user.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {user.bookings}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Shield className="h-4 w-4" />
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

export default AdminUsers;
