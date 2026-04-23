import React from 'react';
import { 
  Users, 
  Store, 
  ClipboardList, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  MoreVertical,
  PieChart,
  BarChart3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Zap,
  ShieldAlert,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminOverview = () => {
  const stats = [
    { name: "Total Bookings", value: "1,240", icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50", trend: "+15%" },
    { name: "Platform GMV", value: "$142,500", icon: DollarSign, color: "text-green-600", bg: "bg-green-50", trend: "+22%" },
    { name: "Active Vendors", value: "85", icon: Store, color: "text-purple-600", bg: "bg-purple-50", trend: "+5%" },
    { name: "Active Users", value: "4,250", icon: Users, color: "text-orange-600", bg: "bg-orange-50", trend: "+10%" },
  ];

  const recentVendors = [
    { id: "V-102", name: "Elite Motors", location: "Dubai", status: "Active", joined: "2 days ago" },
    { id: "V-103", name: "Precision Mechanics", location: "Abu Dhabi", status: "Pending", joined: "1 day ago" },
    { id: "V-104", name: "The Garage Co.", location: "Sharjah", status: "Active", joined: "5 hours ago" },
    { id: "V-105", name: "Auto Pros", location: "Ajman", status: "Suspended", joined: "1 week ago" },
  ];

  return (
    <div className="space-y-8">
      {/* AI Smart Alert for Admin */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-red-600/20 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center space-x-6">
            <div className="bg-red-600 p-4 rounded-3xl shadow-lg shadow-red-600/40">
              <ShieldAlert className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">AI Security Alert</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Anomalous Activity Detected</h2>
              <p className="text-white/60 text-sm mt-1 max-w-xl">Our AI has flagged 3 vendors with unusual pricing patterns and 12 suspicious booking requests in the last 24 hours.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none bg-red-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-600/20">
              Investigate Now
            </button>
            <button className="flex-1 lg:flex-none bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all backdrop-blur-md border border-white/10">
              Dismiss
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
          <p className="text-gray-500 mt-1">AI-driven insights for the CarServ Marketplace ecosystem.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-100 text-gray-700 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50 flex items-center shadow-sm transition-all">
            <BarChart3 className="h-4 w-4 mr-2" /> Export Reports
          </button>
          <button className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-red-600 flex items-center shadow-xl shadow-gray-900/10 transition-all">
            <ShieldCheck className="h-4 w-4 mr-2" /> System Health
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className={cn("p-4 rounded-2xl transition-colors", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center uppercase tracking-widest">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> {stat.trend}
                </span>
              </div>
            </div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.name}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Analytics & Insights */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Analytics Dashboard */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 p-3 rounded-2xl">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">AI Analytics Dashboard</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Real-time Platform Health</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                  <Search className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                  <Filter className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Demand Forecasting (Platform) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900">Demand Forecasting</h4>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Next 30 Days</span>
                </div>
                <div className="h-40 flex items-end gap-1">
                  {[30, 45, 35, 60, 50, 85, 75, 90, 80, 95, 70, 60].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-50 rounded-t-lg relative group">
                      <div 
                        className="absolute bottom-0 w-full bg-blue-600/40 group-hover:bg-blue-600 rounded-t-lg transition-all duration-500"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Platform-wide demand is projected to increase by <strong>18%</strong> next month, driven by seasonal maintenance trends in Dubai.
                </p>
              </div>

              {/* Price Intelligence (Platform) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900">Price Intelligence</h4>
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Market Index</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Market Fair Price Compliance', value: 92, color: 'bg-green-500' },
                    { label: 'Vendor Price Competitiveness', value: 78, color: 'bg-blue-500' },
                    { label: 'User Savings Index', value: 85, color: 'bg-purple-500' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-gray-900">{item.value}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all">
                  View Detailed Pricing Report
                </button>
              </div>
            </div>
          </div>

          {/* Recent Vendors Table */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Recent Vendor Registrations</h2>
              <button className="text-red-600 text-sm font-bold hover:underline">View All Vendors</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-5">Vendor ID</th>
                    <th className="px-8 py-5">Garage Name</th>
                    <th className="px-8 py-5">Location</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Joined</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-6 text-sm font-bold text-gray-900">{vendor.id}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center mr-4 text-xs font-bold text-gray-500 border border-gray-50">
                            {vendor.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-bold text-gray-900">{vendor.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-2 text-gray-400" /> {vendor.location}
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                          vendor.status === "Active" ? "bg-green-50 text-green-600" :
                          vendor.status === "Pending" ? "bg-yellow-50 text-yellow-600" :
                          "bg-red-50 text-red-600"
                        )}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-600 font-medium">{vendor.joined}</td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all">
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Fraud Detection & AI Support */}
        <div className="space-y-8">
          {/* AI-Driven Fraud Detection */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-red-50 p-3 rounded-2xl">
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900">Fraud Detection</h3>
              </div>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-900 uppercase">Suspicious Payout</span>
                  <span className="text-[10px] font-bold text-red-600">High Risk</span>
                </div>
                <p className="text-xs text-red-700 leading-relaxed">
                  Elite Motors requested a payout of $12,500 with 4 duplicate transaction IDs.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-yellow-900 uppercase">Review Botting</span>
                  <span className="text-[10px] font-bold text-yellow-600">Medium Risk</span>
                </div>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  Precision Mechanics received 15 5-star reviews from the same IP address.
                </p>
              </div>
              <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-gray-900/10">
                Run Security Audit
              </button>
            </div>
          </div>

          {/* AI-Powered Support */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">AI Support Genie</h3>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/60">
                  <span>Tickets Resolved by AI</span>
                  <span>85%</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <p className="text-white/80 text-sm mb-8 leading-relaxed">
                AI Support has successfully handled <strong>1,240 queries</strong> this week without human intervention.
              </p>
              <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95">
                Manage Support AI
              </button>
            </div>
          </div>

          {/* Booking Distribution */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Booking Distribution</h2>
            <div className="space-y-4">
              {[
                { label: 'General Service', value: 45, color: 'bg-blue-500' },
                { label: 'Oil Change', value: 30, color: 'bg-green-500' },
                { label: 'Brake Repair', value: 15, color: 'bg-red-500' },
                { label: 'Others', value: 10, color: 'bg-gray-400' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-gray-900">{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
