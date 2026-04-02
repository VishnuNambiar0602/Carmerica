import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Filter, ArrowUpRight, ArrowDownRight, Clock, DollarSign, User, Building2, Eye, List, Layers, Percent, Settings, Info, PieChart, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

const VendorReports = () => {
  const stats = [
    { name: 'Total Revenue', value: '$45,280.50', change: '+12.5%', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Total Bookings', value: '1,240', change: '+8.2%', icon: List, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Avg. Order Value', value: '$122.50', change: '+5.1%', icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { name: 'Customer Retention', value: '68%', change: '+2.4%', icon: User, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Reports</h1>
          <p className="text-gray-500">Analyze your garage's growth, customer behavior, and service performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Calendar className="h-4 w-4 mr-2" /> Date Range
          </button>
          <button className="bg-[#003580] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#00224f] flex items-center">
            <Download className="h-4 w-4 mr-2" /> Generate Report
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
            <h2 className="font-bold text-gray-900">Revenue Growth</h2>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-bold rounded-md bg-white shadow-sm text-gray-900">Daily</button>
              <button className="px-3 py-1 text-xs font-bold rounded-md text-gray-500 hover:text-gray-700">Monthly</button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
            <p className="text-gray-400 text-sm font-medium">Revenue Growth Visualization Coming Soon</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900">Service Distribution</h2>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-bold rounded-md bg-white shadow-sm text-gray-900">Category</button>
              <button className="px-3 py-1 text-xs font-bold rounded-md text-gray-500 hover:text-gray-700">Revenue</button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
            <p className="text-gray-400 text-sm font-medium">Service Distribution Visualization Coming Soon</p>
          </div>
        </div>
      </div>

      {/* Top Services Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Top Performing Services</h2>
          <button className="text-sm font-bold text-[#003580] hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Bookings</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Avg. Rating</th>
                <th className="px-6 py-4">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: 'Full Service', bookings: 450, revenue: '$18,420', rating: 4.9, growth: '+12%' },
                { name: 'Oil Change', bookings: 320, revenue: '$8,420', rating: 4.7, growth: '+8%' },
                { name: 'Brake Repair', bookings: 210, revenue: '$12,150', rating: 4.8, growth: '+15%' },
                { name: 'AC Service', bookings: 150, revenue: '$4,890', rating: 4.5, growth: '+5%' },
              ].map((service) => (
                <tr key={service.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{service.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{service.bookings}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{service.revenue}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <PieChart className="h-3 w-3 mr-2 text-blue-500" />
                      <span className="text-sm text-gray-600">{service.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-green-600">{service.growth}</span>
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

export default VendorReports;
