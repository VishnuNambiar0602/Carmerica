import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  MoreVertical,
  Calendar,
  User,
  Wrench,
  Sparkles,
  Zap,
  TrendingDown,
  ShieldCheck,
  Package,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  Users,
  MessageSquare,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';

const stats = [
  { name: 'Bookings', value: '120', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Revenue', value: 'AED 24,300', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  { name: 'Rating', value: '4.8', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { name: 'Pending', value: '8', icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
];

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState<any>(null);
  const [recentBookingsData, setRecentBookingsData] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const fetchAiInsight = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/ai/optimize-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'AC Service',
          currentPrice: 150,
          competitorPrices: [160, 145, 170],
          demandLevel: 'high'
        })
      });
      const data = await response.json();
      setAiInsight(data);
    } catch (err) {
      console.error('AI Strategy fetch failed', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  useEffect(() => {
    fetchAiInsight();
    const load = async () => {
      try {
        const vendorId = localStorage.getItem('vendorId') || 'vendor-1';
        const res = await fetch(`/api/vendor/stats?vendorId=${encodeURIComponent(vendorId)}`);
        const data = await res.json();
        setStatsData(data);
        if (data) {
          setRecentBookingsData(data.recentBookings || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const defaultRecentBookings = [
    { id: "BK-1029", customer: "John Doe", car: "Toyota Camry", service: "Oil Change", time: "10:00 AM", status: "In Progress" },
    { id: "BK-1030", customer: "Sarah Smith", car: "Honda Civic", service: "Brake Repair", time: "11:30 AM", status: "Pending" },
    { id: "BK-1031", customer: "Mike Johnson", car: "Ford F-150", service: "General Service", time: "01:00 PM", status: "Confirmed" },
    { id: "BK-1032", customer: "Emily Davis", car: "Tesla Model 3", service: "AC Service", time: "02:30 PM", status: "Confirmed" },
  ];

  return (
    <div className="space-y-8">
      {/* AI Smart Alert for Vendor */}
      <div className="bg-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-full bg-linear-to-l from-red-600/20 to-transparent pointer-events-none group-hover:from-red-600/30 transition-all duration-700" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-start space-x-6">
            <div className="bg-red-600 p-4 rounded-2xl shadow-lg shadow-red-600/20 flex-shrink-0">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">AI Pulse</span>
                <h2 className="text-2xl font-black italic tracking-tight">DYNAMIC STRATEGY</h2>
              </div>
              <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
                {aiInsight ? aiInsight.explanation : "Our AI is currently analyzing market trends and competitor pricing to optimize your earnings..."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {aiInsight && (
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Recommended Price</p>
                  <p className="text-2xl font-black text-red-500">AED {aiInsight.suggestedPrice}</p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Est. Revenue Lift</p>
                  <p className="text-2xl font-black text-green-500">+{aiInsight.expectedRevenueIncrease}%</p>
                </div>
              </div>
            )}
              <button 
                onClick={fetchAiInsight}
                disabled={isOptimizing}
                className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Re-calculate Strategy
              </button>
            </div>
          </div>
        </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Good morning, Elite Motors!</h1>
          <p className="text-gray-500 mt-1">Your AI assistant has prepared your daily performance report.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/vendor/calendar')} className="bg-white border border-gray-100 text-gray-700 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50 flex items-center shadow-sm transition-all">
            <Calendar className="h-4 w-4 mr-2" /> View Calendar
          </button>
          <button onClick={() => navigate('/vendor/bookings')} className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-red-600 flex items-center shadow-xl shadow-gray-900/10 transition-all">
            <Wrench className="h-4 w-4 mr-2" /> Add New Job
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const values = statsData ? [
            statsData.totalBookings,
            `AED ${Number(statsData.monthlyRevenue || 0).toLocaleString()}`,
            Number(statsData.avgRating || 0).toFixed(1),
            statsData.pending,
          ] : null;
          const override = values ? values[idx] : stat.value;
          return (
            <div key={stat.name} className="bg-white p-8 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className={cn("p-4 rounded-2xl transition-colors", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center uppercase tracking-widest">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> 12%
                  </span>
                </div>
              </div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.name}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{override}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Demand Forecasting & Price Intelligence */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Insights Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Demand Forecasting AI */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-50 p-3 rounded-2xl">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Demand Forecasting</h3>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">AI Prediction</span>
              </div>
              <div className="space-y-6">
                <div className="flex items-end justify-between h-32 gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="grow flex flex-col items-center gap-2 group">
                      <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden h-full">
                        <div 
                          className={cn(
                            "absolute bottom-0 w-full rounded-t-lg transition-all duration-1000",
                            i === 5 ? "bg-red-600" : "bg-blue-600/40 group-hover:bg-blue-600"
                          )}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Peak demand expected on <strong>Saturday</strong>. We recommend increasing staff capacity by 20%.
                </p>
              </div>
            </div>

            {/* Price Intelligence AI */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-50 p-3 rounded-2xl">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Price Intelligence</h3>
                </div>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">Live Market</span>
              </div>
              <div className="space-y-6">
                {[
                  { service: 'Oil Change', current: 150, market: 165, trend: 'up' },
                  { service: 'Brake Repair', current: 450, market: 420, trend: 'down' },
                  { service: 'AC Service', current: 250, market: 280, trend: 'up' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.service}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Market Avg: AED {item.market}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">AED {item.current}</p>
                      <div className={cn("flex items-center text-[10px] font-bold uppercase tracking-widest", item.trend === 'up' ? "text-green-600" : "text-red-600")}>
                        {item.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {item.trend === 'up' ? 'Underpriced' : 'Overpriced'}
                      </div>
                    </div>
                  </div>
                ))}
                  <button onClick={() => navigate('/vendor/pricing')} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all">
                  Apply AI Pricing
                </button>
              </div>
            </div>
          </div>

          {/* Today's Schedule Table */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
              <button onClick={() => navigate('/vendor/bookings')} className="text-red-600 text-sm font-bold hover:underline">View All Bookings</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-8 py-5">Booking ID</th>
                    <th className="px-8 py-5">Customer</th>
                    <th className="px-8 py-5">Service</th>
                    <th className="px-8 py-5">Time</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(recentBookingsData.length ? recentBookingsData : defaultRecentBookings).map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-8 py-6 text-sm font-bold text-gray-900">{booking.id}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center mr-4 text-xs font-bold text-gray-500 border border-gray-50">
                            {booking.customer.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{booking.customer}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{booking.car}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-medium text-gray-600">{booking.service}</td>
                      <td className="px-8 py-6 text-sm font-medium text-gray-600">{booking.time}</td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                          booking.status === "In Progress" ? "bg-blue-50 text-blue-600" :
                          booking.status === "Pending" ? "bg-yellow-50 text-yellow-600" :
                          "bg-green-50 text-green-600"
                        )}>
                          {booking.status}
                        </span>
                      </td>
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

        {/* Sidebar: Inventory & Marketing AI */}
        <div className="space-y-8">
          {/* AI-Driven Inventory Management */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-50 p-3 rounded-2xl">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900">Smart Inventory</h3>
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest">Low Stock</span>
            </div>
            <div className="space-y-6">
              {[
                { item: 'Synthetic Oil (5W-30)', stock: 12, min: 20, status: 'Critical' },
                { item: 'Brake Pads (Toyota)', stock: 5, min: 15, status: 'Critical' },
                { item: 'AC Refrigerant', stock: 45, min: 30, status: 'Healthy' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-700">{item.item}</span>
                    <span className={cn("font-bold", item.stock < item.min ? "text-red-600" : "text-green-600")}>
                      {item.stock} units
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", item.stock < item.min ? "bg-red-500" : "bg-green-500")}
                      style={{ width: `${(item.stock / item.min) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-gray-900/10">
                AI Auto-Restock
              </button>
            </div>
          </div>

          {/* AI-Powered Marketing */}
          <div className="bg-linear-to-br from-red-600 to-red-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Megaphone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">AI Marketing</h3>
              </div>
              <p className="text-white/80 text-sm mb-8 leading-relaxed">
                Our AI identified <strong>150 past customers</strong> due for an oil change. Launch a targeted campaign?
              </p>
              <div className="space-y-3">
                <button onClick={() => navigate('/vendor/messages')} className="w-full py-4 bg-white text-red-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95">
                  Launch SMS Campaign
                </button>
                <button onClick={() => navigate('/vendor/promotions')} className="w-full py-4 bg-red-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-800 transition-all active:scale-95">
                  Create Email Blast
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Block Slots', icon: Calendar },
                { label: 'Create Deal', icon: Tag },
                { label: 'Staff Shift', icon: Users },
                { label: 'Broadcast', icon: MessageSquare },
              ].map((action, i) => (
                <button key={i} onClick={() => navigate(i === 0 ? '/vendor/calendar' : i === 1 ? '/vendor/promotions' : i === 2 ? '/vendor/staff' : '/vendor/messages')} className="flex flex-col items-center justify-center p-6 rounded-3xl border border-gray-50 hover:border-red-200 hover:bg-red-50 transition-all group">
                  <action.icon className="h-6 w-6 text-gray-400 group-hover:text-red-600 mb-3 transition-colors" />
                  <span className="text-[10px] font-bold text-gray-500 group-hover:text-red-600 uppercase tracking-widest text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
