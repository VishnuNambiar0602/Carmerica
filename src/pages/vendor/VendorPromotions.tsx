import React from 'react';
import { Tag, Plus, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Clock, DollarSign, Wrench, Calendar, Percent, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';

const VendorPromotions = () => {
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
          <h1 className="text-2xl font-bold text-gray-900">Promotions & Deals</h1>
          <p className="text-gray-500">Create and manage special offers to attract more customers to your garage.</p>
        </div>
        <button className="bg-[#003580] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#00224f] flex items-center">
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
          <p className="text-2xl font-bold text-gray-900">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Redemptions</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">464</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Revenue from Deals</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">$8,420.00</p>
        </div>
      </div>

      {/* Promotions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.map((promo) => (
          <div key={promo.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    promo.type === 'Discount' ? "bg-red-50 text-red-600" :
                    promo.type === 'Freebie' ? "bg-yellow-50 text-yellow-600" :
                    "bg-blue-50 text-blue-600"
                  )}>
                    {promo.type === 'Discount' ? <Percent className="h-5 w-5" /> :
                     promo.type === 'Freebie' ? <Gift className="h-5 w-5" /> :
                     <DollarSign className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{promo.name}</h3>
                    <p className="text-xs text-gray-500">{promo.category}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-full",
                  promo.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                )}>
                  {promo.status === 'active' ? 'Active' : 'Expired'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-6 leading-relaxed">"{promo.description}"</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Value</p>
                  <p className="text-sm font-bold text-gray-900">{promo.value}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Usage</p>
                  <p className="text-sm font-bold text-gray-900">{promo.usage} bookings</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{promo.startDate} - {promo.endDate}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-[#003580] hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorPromotions;
