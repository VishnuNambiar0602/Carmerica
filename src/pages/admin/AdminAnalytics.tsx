import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Filter, ArrowUpRight, ArrowDownRight, Clock, DollarSign, User, Building2, Eye, List, Layers, Percent, Settings, Info, PieChart, Activity, Globe, MousePointer2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminAnalytics = () => {
  const stats = [
    { name: 'Total Platform Revenue', value: '$1,245,280', change: '+15.5%', icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50' },
    { name: 'Active Customers', value: '45,240', change: '+12.2%', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Active Vendors', value: '850', change: '+5.1%', icon: Building2, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Avg. Commission', value: '12.5%', change: '+0.4%', icon: Percent, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-500">Comprehensive data analysis of platform growth, revenue, and user behavior.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Calendar className="h-4 w-4 mr-2" /> Date Range
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center">
            <Download className="h-4 w-4 mr-2" /> Export Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-full flex items-center",
                stat.change.startsWith('+') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {stat.change.startsWith('+') ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900">Revenue Trends</h2>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-bold rounded-md bg-white shadow-sm text-gray-900">Weekly</button>
              <button className="px-3 py-1 text-xs font-bold rounded-md text-gray-500 hover:text-gray-700">Monthly</button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
            <p className="text-gray-400 text-sm font-medium">Revenue Trends Visualization Coming Soon</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900">User Acquisition</h2>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-bold rounded-md bg-white shadow-sm text-gray-900">Source</button>
              <button className="px-3 py-1 text-xs font-bold rounded-md text-gray-500 hover:text-gray-700">Region</button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
            <p className="text-gray-400 text-sm font-medium">User Acquisition Visualization Coming Soon</p>
          </div>
        </div>
      </div>

      {/* Regional Performance */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Regional Performance</h2>
          <button className="text-sm font-bold text-red-600 hover:underline">View Detailed Map</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Active Vendors</th>
                <th className="px-6 py-4">Total Bookings</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: 'Los Angeles, CA', vendors: 120, bookings: 4500, revenue: '$185,420', growth: '+12%' },
                { name: 'San Francisco, CA', vendors: 85, bookings: 3200, revenue: '$142,150', growth: '+8%' },
                { name: 'San Diego, CA', vendors: 65, bookings: 2100, revenue: '$98,420', growth: '+15%' },
                { name: 'Sacramento, CA', vendors: 45, bookings: 1200, revenue: '$54,890', growth: '+5%' },
              ].map((region) => (
                <tr key={region.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm font-bold text-gray-900">{region.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{region.vendors}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{region.bookings}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{region.revenue}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-green-600">{region.growth}</span>
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

export default AdminAnalytics;
