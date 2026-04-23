import React from 'react';
import { DollarSign, Plus, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Shield, Mail, Phone, Calendar, ArrowUpRight, ArrowDownRight, Clock, User, Building2, Eye, List, Layers, Percent, Settings, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminPricing = () => {
  const rules = [
    { id: 1, name: 'Standard Commission', type: 'Percentage', value: '15%', category: 'All Services', status: 'active', description: 'Default commission for all service bookings.' },
    { id: 2, name: 'Premium Vendor Rate', type: 'Percentage', value: '10%', category: 'All Services', status: 'active', description: 'Reduced commission for high-volume vendors.' },
    { id: 3, name: 'Maintenance Flat Fee', type: 'Fixed', value: '$10', category: 'Maintenance', status: 'inactive', description: 'Flat fee for routine maintenance services.' },
    { id: 4, name: 'Repair Surcharge', type: 'Percentage', value: '2%', category: 'Repairs', status: 'active', description: 'Additional platform fee for complex repairs.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing & Commission</h1>
          <p className="text-gray-500">Manage platform commission rates, service fees, and pricing rules.</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add New Rule
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Percent className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Commission</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">12.5%</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Platform Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">$24,850</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Settings className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Rules</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">8</p>
        </div>
      </div>

      {/* Pricing Rules List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Pricing Rules</h2>
          <div className="flex gap-2">
            <button className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center">
              <Filter className="h-3 w-3 mr-2" /> Type
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Rule Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{rule.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{rule.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {rule.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">
                    {rule.value}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {rule.category}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      rule.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {rule.status.charAt(0).toUpperCase() + rule.status.slice(1)}
                    </span>
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

      <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-start space-x-4">
        <div className="bg-red-100 p-2 rounded-lg">
          <Info className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-900 mb-1">Commission Rule Logic</h3>
          <p className="text-sm text-red-700 leading-relaxed">
            Pricing rules are applied in order of specificity. Category-specific rules override global rules. 
            Changes to commission rates will only apply to new bookings and will not affect existing ones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPricing;
