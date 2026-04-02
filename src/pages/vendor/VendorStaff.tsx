import React from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Clock, User, Shield, Phone, Mail, Star } from 'lucide-react';
import { cn } from '../../lib/utils';

const VendorStaff = () => {
  const staff = [
    { id: 1, name: 'Robert Wilson', role: 'Senior Mechanic', specialization: 'Engine & Transmission', rating: 4.9, status: 'active', email: 'robert@elitemotors.com', phone: '+1 234 567 8901', image: 'https://i.pravatar.cc/150?u=robert' },
    { id: 2, name: 'James Miller', role: 'Mechanic', specialization: 'Brakes & Suspension', rating: 4.7, status: 'active', email: 'james@elitemotors.com', phone: '+1 234 567 8902', image: 'https://i.pravatar.cc/150?u=james' },
    { id: 3, name: 'David Brown', role: 'Junior Mechanic', specialization: 'General Maintenance', rating: 4.5, status: 'on-leave', email: 'david@elitemotors.com', phone: '+1 234 567 8903', image: 'https://i.pravatar.cc/150?u=david' },
    { id: 4, name: 'Sarah Connor', role: 'Service Advisor', specialization: 'Customer Relations', rating: 5.0, status: 'active', email: 'sarah@elitemotors.com', phone: '+1 234 567 8904', image: 'https://i.pravatar.cc/150?u=sarah' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">Manage your garage's mechanics, service advisors, and staff members.</p>
        </div>
        <button className="bg-[#003580] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#00224f] flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add Staff Member
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <img src={member.image} alt={member.name} className="h-16 w-16 rounded-full object-cover border-2 border-gray-100" />
                  <div>
                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-[#003580] font-medium">{member.role}</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{member.specialization}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{member.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-[#feba02] fill-current mr-1" />
                  <span className="text-sm font-bold text-gray-900">{member.rating}</span>
                  <span className="text-xs text-gray-400 ml-1">Rating</span>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-full",
                  member.status === 'active' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                )}>
                  {member.status === 'active' ? 'Active' : 'On Leave'}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-between gap-2">
              <button className="flex-grow text-xs font-bold text-[#003580] hover:bg-blue-100 py-2 rounded transition-colors">
                View Schedule
              </button>
              <button className="flex-grow text-xs font-bold text-gray-600 hover:bg-gray-200 py-2 rounded transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorStaff;
