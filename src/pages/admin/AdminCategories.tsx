import React from 'react';
import { LayoutGrid, Plus, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Shield, Mail, Phone, Calendar, ArrowUpRight, ArrowDownRight, Clock, DollarSign, User, Building2, Eye, List, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminCategories = () => {
  const categories = [
    { id: 1, name: 'Maintenance', slug: 'maintenance', description: 'Routine car care services like oil changes and inspections.', services: 24, status: 'active', icon: 'Wrench' },
    { id: 2, name: 'Repairs', slug: 'repairs', description: 'Major and minor mechanical repairs for all car systems.', services: 45, status: 'active', icon: 'Tool' },
    { id: 3, name: 'Electrical', slug: 'electrical', description: 'Battery, lighting, and complex electrical system diagnostics.', services: 18, status: 'active', icon: 'Zap' },
    { id: 4, name: 'Body & Paint', slug: 'body-paint', description: 'Dent removal, painting, and exterior restoration services.', services: 12, status: 'active', icon: 'Palette' },
    { id: 5, name: 'Tires & Wheels', slug: 'tires-wheels', description: 'Tire replacement, balancing, and wheel alignment.', services: 8, status: 'inactive', icon: 'Disc' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-500">Manage service categories and sub-categories across the platform.</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add New Category
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Layers className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Categories</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">10</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <List className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Services</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">154</p>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">All Categories</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Services</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center mr-3">
                        <LayoutGrid className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    /{category.slug}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {category.description}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {category.services}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      category.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
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
    </div>
  );
};

export default AdminCategories;
