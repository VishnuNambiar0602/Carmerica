import React from 'react';
import { Tag, Plus, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Clock, DollarSign, Wrench, Calendar, Percent, Gift, User, Building2, Eye, List, Layers, PieChart, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminPromotions = () => {
  const promotions = [
    { id: 1, name: 'Winter Ready Checkup', type: 'Discount', value: '20% Off', category: 'Full Service', status: 'active', startDate: 'Oct 01, 2026', endDate: 'Dec 31, 2026', usage: 124, description: 'Get your car winter-ready with our comprehensive checkup.' },
    { id: 2, name: 'Free AC Sanitization', type: 'Freebie', value: 'Free Service', category: 'AC Service', status: 'active', startDate: 'Sep 15, 2026', endDate: 'Nov 15, 2026', usage: 85, description: 'Join our loyalty program and get free add-ons with every service.' },
    { id: 3, name: 'Brake Pad Special', type: 'Fixed Amount', value: '$20 Off', category: 'Brake Repair', status: 'inactive', startDate: 'Aug 01, 2026', endDate: 'Aug 31, 2026', usage: 45, description: 'Save on brake pad replacement this month.' },
    { id: 4, name: 'New Customer Offer', type: 'Discount', value: '10% Off', category: 'All Services', status: 'active', startDate: 'Jan 01, 2026', endDate: 'Dec 31, 2026', usage: 210, description: 'Welcome offer for first-time customers.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Promotions</h1>
          <p className="text-gray-500">Create and manage platform-wide special offers and coupon codes.</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Create New Promotion
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Deals</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Redemptions</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">12,450</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Revenue from Deals</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">$124,850</p>
        </div>
      </div>

      {/* Promotions List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">All Promotions</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search promotions..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Promotion Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{promo.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{promo.category}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {promo.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">
                    {promo.value}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      promo.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {promo.usage}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
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

export default AdminPromotions;
