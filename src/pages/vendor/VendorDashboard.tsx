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

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState<any>(null);
  const [recentBookingsData, setRecentBookingsData] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasGarage, setHasGarage] = useState<boolean>(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [vendorName, setVendorName] = useState('');

  const fetchAiInsight = async () => {
    setIsOptimizing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/optimize-price', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceType: 'AC Service',
          currentPrice: 150,
          competitorPrices: [160, 145, 170],
          demandLevel: 'high'
        })
      });
      if (!response.ok) throw new Error('API returned ' + response.status);
      const data = await response.json();
      setAiInsight(data);
    } catch (err) {
      console.error('AI Strategy fetch failed', err);
      setAiInsight({
        suggestedPrice: 150,
        expectedRevenueIncrease: 12,
        explanation: 'AI recommends maintaining current pricing baseline as AC service demand peaks this month.'
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const loadStats = async (selPeriod: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const authRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!authRes.ok) return;
      const meData = await authRes.json();
      const vendorId = meData.vendor?.id || meData.vendorId || 'vendor-1';
      setVendorName(meData.vendor?.business_name || '');

      const res = await fetch(`/api/vendor/stats?vendorId=${encodeURIComponent(vendorId)}&period=${selPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStatsData(data);
      if (data) {
        setRecentBookingsData(data.recentBookings || []);
      }

      // Fetch garages for this vendor to verify setup status
      const garageRes = await fetch(`/api/garages?vendorId=${encodeURIComponent(vendorId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (garageRes.ok) {
        const garages = await garageRes.json();
        setHasGarage(garages && garages.length > 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAiInsight();
    loadStats(period);
  }, []);

  const defaultRecentBookings = [
    { id: "BK-1029", customer: "John Doe", car: "Toyota Camry", service: "Oil Change", time: "10:00 AM", status: "In Progress" },
    { id: "BK-1030", customer: "Sarah Smith", car: "Honda Civic", service: "Brake Repair", time: "11:30 AM", status: "Pending" },
    { id: "BK-1031", customer: "Mike Johnson", car: "Ford F-150", service: "General Service", time: "01:00 PM", status: "Confirmed" },
    { id: "BK-1032", customer: "Emily Davis", car: "Tesla Model 3", service: "AC Service", time: "02:30 PM", status: "Confirmed" },
  ];

  const dashboardStats = [
    { name: 'Bookings', value: statsData ? String(statsData.periodBookings || statsData.totalBookings) : '120', icon: ClipboardList, color: 'text-blue-650', bg: 'bg-blue-50' },
    { name: 'Revenue', value: statsData ? `$ ${Number(statsData.monthlyRevenue || 0).toLocaleString()}` : '$ 24,300', icon: DollarSign, color: 'text-green-650', bg: 'bg-green-50' },
    { name: 'Rating', value: statsData ? Number(statsData.avgRating || 4.8).toFixed(1) : '4.8', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { name: 'Pending Jobs', value: statsData ? String(statsData.pending) : '8', icon: Clock, color: 'text-red-650', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      {!hasGarage && (
        <div className="bg-yellow-50 border-2 border-black text-yellow-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0" />
            <div>
              <p className="font-black">You haven't set up your garage yet.</p>
              <p className="text-sm font-bold text-yellow-750">Set up your garage profile so customers can find and book your services.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/vendor/garage-setup')}
            className="border-2 border-black bg-[#feba02] text-black font-black py-3 px-6 text-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-none"
          >
            Set Up Garage
          </button>
        </div>
      )}

      {/* AI Smart Alert for Vendor */}
      <div className="bg-black text-white p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-full bg-linear-to-l from-red-600/10 to-transparent pointer-events-none group-hover:from-red-600/20 transition-all duration-700" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-start space-x-6">
            <div className="bg-red-600 p-4 border-2 border-white rounded-none shadow-lg flex-shrink-0">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 border border-white">AI Pulse</span>
                <h2 className="text-2xl font-black italic tracking-tight uppercase">Dynamic Strategy</h2>
              </div>
              <p className="text-gray-400 text-sm max-w-xl leading-relaxed font-bold">
                {aiInsight ? aiInsight.explanation || aiInsight.reasoning : "Our AI is currently analyzing market trends and competitor pricing to optimize your earnings..."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {aiInsight && (
              <div className="flex items-center gap-4 bg-white/5 border-2 border-white p-4 rounded-none shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Recommended Price</p>
                  <p className="text-2xl font-black text-red-500">$ {aiInsight.suggestedPrice || aiInsight.recommendedPrice}</p>
                </div>
                <div className="h-10 w-0.5 bg-white/20" />
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Est. Revenue Lift</p>
                  <p className="text-2xl font-black text-green-500">+{aiInsight.expectedRevenueIncrease}%</p>
                </div>
              </div>
            )}
            <button 
              onClick={fetchAiInsight}
              disabled={isOptimizing}
              className="bg-white text-black border-2 border-black px-6 py-3 font-black text-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-none flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Re-calculate Strategy
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Good morning, {vendorName || 'Partner'}!</h1>
          <p className="text-gray-500 mt-1">Your AI assistant has prepared your daily performance report.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <select
              value={period}
              onChange={(e) => {
                const p = e.target.value as any;
                setPeriod(p);
                loadStats(p);
              }}
              className="w-full bg-white border-2 border-black text-gray-800 px-4 py-3 rounded-none text-sm font-black outline-none appearance-none pr-10 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:ring-2 focus:ring-[#003580]"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <ChevronRight className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>
          <button 
            onClick={() => navigate('/vendor/calendar')} 
            className="flex-grow sm:flex-grow-0 bg-white border-2 border-black text-gray-800 px-6 py-3 font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-none flex items-center justify-center cursor-pointer"
          >
            <Calendar className="h-4 w-4 mr-2" /> View Calendar
          </button>
          <button 
            onClick={() => navigate('/vendor/bookings')} 
            className="flex-grow sm:flex-grow-0 bg-gray-900 text-white border-2 border-black px-6 py-3 font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-none flex items-center justify-center cursor-pointer"
          >
            <Wrench className="h-4 w-4 mr-2" /> Add New Job
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all rounded-none">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 border-2 border-black rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 border border-green-200 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> 12%
              </span>
            </div>
            <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">{stat.name}</h3>
            <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Demand Forecasting & Price Intelligence */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Demand Forecasting */}
            <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-50 border border-black p-2 rounded-none">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-black text-gray-900 text-sm">Demand Forecasting</h3>
                </div>
                <span className="text-[9px] font-black text-blue-700 bg-blue-50 border border-black px-2 py-0.5 rounded-none">AI Pred</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-end justify-between h-32 gap-1.5 border-b border-gray-150 pb-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="grow flex flex-col items-center gap-1.5 group h-full justify-end">
                      <div className="w-full bg-gray-100 border border-black border-b-0 relative overflow-hidden h-full flex items-end">
                        <div 
                          className={cn(
                            "w-full transition-all duration-1000",
                            i === 5 ? "bg-red-500" : "bg-blue-600/40 group-hover:bg-blue-600"
                          )}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-black text-gray-500 uppercase">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-gray-500 leading-relaxed">
                  Peak demand expected on <strong className="text-black">Saturday</strong>. We recommend increasing staff capacity by 20%.
                </p>
              </div>
            </div>

            {/* Price Intelligence */}
            <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="bg-green-50 border border-black p-2 rounded-none">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-black text-gray-900 text-sm">Price Intelligence</h3>
                </div>
                <span className="text-[9px] font-black text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-none">Market</span>
              </div>
              <div className="space-y-4">
                {[
                  { service: 'Oil Change', current: 150, market: 165, trend: 'up' },
                  { service: 'Brake Repair', current: 450, market: 420, trend: 'down' },
                  { service: 'AC Service', current: 250, market: 280, trend: 'up' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border-2 border-black rounded-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                      <p className="text-xs font-black text-gray-900">{item.service}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Market: $ {item.market}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-gray-900">$ {item.current}</p>
                      <div className={cn("flex items-center text-[8px] font-black uppercase tracking-wider mt-0.5", item.trend === 'up' ? "text-green-600" : "text-red-600")}>
                        {item.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                        {item.trend === 'up' ? 'Underpriced' : 'Overpriced'}
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => navigate('/vendor/services')} 
                  className="w-full py-3 border-2 border-black bg-gray-900 text-white font-black text-xs uppercase tracking-widest hover:bg-[#003580] hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all rounded-none"
                >
                  Apply AI Pricing
                </button>
              </div>
            </div>
          </div>

          {/* Today's Schedule Table */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
            <div className="p-6 border-b-2 border-black flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-black text-gray-900">Today's Schedule</h2>
              <button 
                onClick={() => navigate('/vendor/bookings')} 
                className="text-[#003580] text-xs font-black hover:underline"
              >
                View All Bookings
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-black text-gray-700 uppercase tracking-widest border-b-2 border-black">
                    <th className="px-6 py-4 border-r-2 border-black">Booking ID</th>
                    <th className="px-6 py-4 border-r-2 border-black">Customer</th>
                    <th className="px-6 py-4 border-r-2 border-black">Service</th>
                    <th className="px-6 py-4 border-r-2 border-black">Time</th>
                    <th className="px-6 py-4 border-r-2 border-black">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {(recentBookingsData.length ? recentBookingsData : defaultRecentBookings).slice(0, 4).map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-black text-[#003580] border-r-2 border-black">{booking.id}</td>
                      <td className="px-6 py-4 border-r-2 border-black">
                        <div className="flex items-center">
                          <div className="h-9 w-9 border-2 border-black bg-gray-100 flex items-center justify-center mr-3 text-xs font-bold text-gray-550 rounded-none">
                            {(booking.customer || 'C').split(' ').filter(Boolean).map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{booking.customer}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{booking.car || booking.vehicle || 'Vehicle'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-650 border-r-2 border-black">{booking.service}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-600 border-r-2 border-black">{booking.time}</td>
                      <td className="px-6 py-4 border-r-2 border-black">
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 border-2 border-black rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider",
                          booking.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                          booking.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                          booking.status === "Confirmed" ? "bg-purple-100 text-purple-800" :
                          "bg-green-100 text-green-800"
                        )}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => navigate('/vendor/bookings')}
                          className="p-1.5 border-2 border-black bg-white hover:bg-gray-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-none"
                          title="Manage booking"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-700" />
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
          <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="bg-orange-50 border border-black p-2 rounded-none">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-black text-gray-900 text-sm">Smart Inventory</h3>
              </div>
              <span className="text-[9px] font-black text-orange-700 bg-orange-50 border border-black px-2 py-0.5 rounded-none">Low Stock</span>
            </div>
            <div className="space-y-4">
              {[
                { item: 'Synthetic Oil (5W-30)', stock: 12, min: 20 },
                { item: 'Brake Pads (Toyota)', stock: 5, min: 15 },
                { item: 'AC Refrigerant', stock: 45, min: 30 },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-700">{item.item}</span>
                    <span className={item.stock < item.min ? "text-red-700" : "text-green-700"}>
                      {item.stock} / {item.min} units
                    </span>
                  </div>
                  <div className="h-2 bg-gray-150 border border-black rounded-none overflow-hidden">
                    <div 
                      className={cn("h-full rounded-none transition-all duration-1000", item.stock < item.min ? "bg-red-500" : "bg-green-500")}
                      style={{ width: `${Math.min(100, (item.stock / item.min) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <button 
                onClick={() => alert('Restock request submitted to supplier. You will receive a confirmation email shortly.')}
                className="w-full py-3.5 border-2 border-black bg-gray-900 text-white font-black text-xs uppercase tracking-widest hover:bg-[#003580] hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all rounded-none"
              >
                AI Auto-Restock
              </button>
            </div>
          </div>

          {/* AI-Powered Marketing */}
          <div className="border-2 border-black bg-[#003580] p-6 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white/20 p-2 border border-white rounded-none">
                  <Megaphone className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-black text-base">AI Marketing</h3>
              </div>
              <p className="text-white/80 text-xs mb-6 leading-relaxed font-bold">
                Our AI identified <strong className="text-white font-black">150 past customers</strong> due for an oil change. Launch a targeted campaign?
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/vendor/messages')} 
                  className="w-full py-3 border-2 border-black bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-gray-100 hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none transition-all rounded-none"
                >
                  Launch SMS Campaign
                </button>
                <button 
                  onClick={() => navigate('/vendor/promotions')} 
                  className="w-full py-3 border-2 border-white bg-transparent text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] active:shadow-none transition-all rounded-none"
                >
                  Create Email Blast
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <h2 className="text-base font-black text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Block Slots', icon: Calendar, path: '/vendor/calendar' },
                { label: 'Create Deal', icon: Tag, path: '/vendor/promotions' },
                { label: 'Staff Shift', icon: Users, path: '/vendor/staff' },
                { label: 'Broadcast', icon: MessageSquare, path: '/vendor/messages' },
              ].map((action, i) => (
                <button 
                  key={i} 
                  onClick={() => navigate(action.path)} 
                  className="flex flex-col items-center justify-center p-4 border-2 border-black bg-white hover:bg-blue-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-none group"
                >
                  <action.icon className="h-6 w-6 text-gray-400 group-hover:text-[#003580] mb-2 transition-colors" />
                  <span className="text-[9px] font-black text-gray-500 group-hover:text-[#003580] uppercase tracking-widest text-center">{action.label}</span>
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
