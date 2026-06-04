import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Filter, ArrowUpRight, ArrowDownRight, Clock, DollarSign, User, Building2, Eye, List, Layers, Percent, Settings, Info, PieChart, Activity, Globe, MousePointer2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AnalyticsData {
  totalRevenue: number;
  netRevenue: number;
  activeCustomers: number;
  activeVendors: number;
  avgCommission: number;
  weeklySeries: number[];
  totalBookings: number;
}

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setAnalyticsData(await res.json());
        }
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { 
      name: 'Total Platform Revenue', 
      value: analyticsData ? `AED ${analyticsData.totalRevenue.toLocaleString()}` : '...', 
      change: '+15.5%', 
      icon: DollarSign, 
      color: 'text-red-600', 
      bg: 'bg-red-50' 
    },
    { 
      name: 'Active Customers', 
      value: analyticsData ? analyticsData.activeCustomers.toLocaleString() : '...', 
      change: '+12.2%', 
      icon: User, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      name: 'Active Vendors', 
      value: analyticsData ? analyticsData.activeVendors.toLocaleString() : '...', 
      change: '+5.1%', 
      icon: Building2, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      name: 'Avg. Commission', 
      value: analyticsData ? `${analyticsData.avgCommission}%` : '...', 
      change: '+0.4%', 
      icon: Percent, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50' 
    },
  ];

  // Map revenue values to heights (0-100) relative to maximum value
  const rawWeeklyRevenue = analyticsData?.weeklySeries || [0, 0, 0, 0, 0, 0, 0];
  const maxRevenue = Math.max(...rawWeeklyRevenue, 1);
  const revenueSeries = rawWeeklyRevenue.map(val => Math.round((val / maxRevenue) * 100));

  // User Acquisition chart remains illustrative or mapped from standard data
  const acquisitionSeries = [24, 38, 45, 52, 47, 61, 68];

  const exportData = () => {
    if (!analyticsData) return;
    const headers = ['Week', 'Weekly Revenue (AED)'];
    const rows = rawWeeklyRevenue.map((val, idx) => [`Week ${idx + 1}`, val]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `carserv_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <button 
            onClick={exportData}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center transition-colors disabled:opacity-50"
          >
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
        {/* Revenue Trends Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900">Revenue Trends</h2>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-bold rounded-md bg-white shadow-sm text-gray-900">Weekly</button>
              <button className="px-3 py-1 text-xs font-bold rounded-md text-gray-500 hover:text-gray-700" onClick={() => alert('Monthly trend data is coming soon!')}>Monthly</button>
            </div>
          </div>
          {loading ? (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 p-4 flex items-end gap-3">
              {revenueSeries.map((percentage, index) => {
                const actualVal = rawWeeklyRevenue[index];
                return (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 font-bold">
                      AED {actualVal.toLocaleString()}
                    </div>
                    <div className="w-full bg-red-100 rounded-t-lg overflow-hidden flex items-end h-full cursor-pointer hover:bg-red-200 transition-colors">
                      <div className="w-full bg-red-600 rounded-t-lg transition-all duration-500" style={{ height: `${percentage}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">W{index + 1}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* User Acquisition Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900">User Acquisition</h2>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-bold rounded-md bg-white shadow-sm text-gray-900">Source</button>
              <button className="px-3 py-1 text-xs font-bold rounded-md text-gray-500 hover:text-gray-700">Region</button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 p-4 flex items-end gap-3">
            {acquisitionSeries.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                <div className="w-full bg-blue-100 rounded-t-lg overflow-hidden flex items-end h-full">
                  <div className="w-full bg-blue-600 rounded-t-lg" style={{ height: `${value}%` }} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">M{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Performance Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-900">Regional Performance</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">TODO: Connect to live geographical database metrics</p>
          </div>
          <button className="text-sm font-bold text-red-600 hover:underline" onClick={() => alert('Detailed Map visualization coming soon!')}>View Detailed Map</button>
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
                { name: 'Dubai Marina, Dubai', vendors: 120, bookings: 4500, revenue: 'AED 185,420', growth: '+12%' },
                { name: 'Downtown Dubai, Dubai', vendors: 85, bookings: 3200, revenue: 'AED 142,150', growth: '+8%' },
                { name: 'Jumeirah, Dubai', vendors: 65, bookings: 2100, revenue: 'AED 98,420', growth: '+15%' },
                { name: 'Al Barsha, Dubai', vendors: 45, bookings: 1200, revenue: 'AED 54,890', growth: '+5%' },
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
