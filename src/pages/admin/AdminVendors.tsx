import React from 'react';
import { Building2, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Shield, Mail, Phone, Calendar, ArrowUpRight, ArrowDownRight, Building, CheckCircle2, AlertCircle, MapPin, Star, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const AdminVendors = () => {
  const navigate = useNavigate();
  const vendors = [
    { id: 1, name: 'Elite Auto Care', owner: 'Robert Wilson', location: 'Downtown, LA', status: 'verified', rating: 4.8, reviews: 1240, revenue: '$45,280', joined: 'Oct 12, 2025', image: 'https://picsum.photos/seed/garage1/100/100' },
    { id: 2, name: 'Precision Mechanics', owner: 'James Miller', location: 'Westside, LA', status: 'verified', rating: 4.5, reviews: 850, revenue: '$32,150', joined: 'Sep 15, 2025', image: 'https://picsum.photos/seed/garage2/100/100' },
    { id: 3, name: 'The Garage Co.', owner: 'David Brown', location: 'Santa Monica', status: 'pending', rating: 4.9, reviews: 2100, revenue: '$68,420', joined: 'Aug 01, 2025', image: 'https://picsum.photos/seed/garage3/100/100' },
    { id: 4, name: 'Quick Fix Motors', owner: 'Sarah Connor', location: 'Hollywood', status: 'suspended', rating: 3.8, reviews: 450, revenue: '$12,890', joined: 'Jan 01, 2025', image: 'https://picsum.photos/seed/garage4/100/100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-500">Manage all registered garages, their verification statuses, and performance.</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center">
          <Building className="h-4 w-4 mr-2" /> Add New Vendor
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Vendors</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">850</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Verified</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">720</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">115</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Suspended</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">15</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search vendors by name, owner, or location..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Verification
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Star className="h-4 w-4 mr-2" /> Rating
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={vendor.image} alt={vendor.name} className="h-10 w-10 rounded-lg object-cover mr-3" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{vendor.name}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" /> {vendor.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {vendor.owner}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      vendor.status === 'verified' ? "bg-green-100 text-green-700" :
                      vendor.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-[#feba02] fill-current mr-1" />
                      <span className="text-sm font-bold text-gray-900">{vendor.rating}</span>
                      <span className="text-xs text-gray-400 ml-1">({vendor.reviews})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {vendor.revenue}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/admin/vendors/${vendor.id}/kyv`)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group relative"
                        title="View KYV Profile"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">Know Your Vendor</span>
                      </button>
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

export default AdminVendors;
