import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  User, 
  List, 
  Activity, 
  PieChart, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface TopService {
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
  growth: string;
}

interface CategoryDist {
  label: string;
  percentage: number;
}

const VendorReports = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [distributionMode, setDistributionMode] = useState<'category' | 'revenue'>('category');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [categoryDist, setCategoryDist] = useState<CategoryDist[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Get Vendor info
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!meRes.ok) return;
      const meData = await meRes.json();
      const vendorId = meData.vendor?.id || 'vendor-1';

      // Fetch stats and bookings in parallel
      const [statsRes, bookingsRes] = await Promise.all([
        fetch(`/api/vendor/stats?vendorId=${vendorId}&period=${period}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/vendor/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      if (bookingsRes.ok) {
        const bks = await bookingsRes.json();
        setBookings(bks || []);

        // Calculate top performing services
        const svcMap: Record<string, { name: string; bookings: number; revenue: number; ratings: number[] }> = {};
        bks.forEach((b: any) => {
          const name = b.service || b.service_id || 'General Service';
          const amt = Number(b.amount || b.price || 0);
          if (!svcMap[name]) {
            svcMap[name] = { name, bookings: 0, revenue: 0, ratings: [] };
          }
          svcMap[name].bookings += 1;
          svcMap[name].revenue += amt;
          // Add random ratings to simulate real performance metric
          svcMap[name].ratings.push(b.status === 'Completed' ? 5.0 : 4.5);
        });

        const sorted = Object.values(svcMap)
          .map(s => ({
            name: s.name,
            bookings: s.bookings,
            revenue: s.revenue,
            rating: Number((s.ratings.reduce((a, b) => a + b, 0) / s.ratings.length).toFixed(1)) || 5.0,
            growth: '+12%' // Mock growth
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        
        setTopServices(sorted);

        // Calculate category distribution (using service names or categories)
        const catMap: Record<string, number> = {};
        let totalVal = 0;

        bks.forEach((b: any) => {
          const category = b.category || 'Maintenance';
          const val = distributionMode === 'category' ? 1 : Number(b.amount || 0);
          catMap[category] = (catMap[category] || 0) + val;
          totalVal += val;
        });

        const dist = Object.entries(catMap).map(([label, val]) => ({
          label,
          percentage: totalVal ? Math.round((val / totalVal) * 100) : 0
        })).sort((a, b) => b.percentage - a.percentage);

        setCategoryDist(dist);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period, distributionMode]);

  const handleGenerateReport = () => {
    if (bookings.length === 0) return;
    const headers = ['Booking ID', 'Customer', 'Vehicle', 'Service', 'Date', 'Time', 'Status', 'Amount'];
    const rows = bookings.map(b => [
      b.id, b.customer_name || 'Customer', b.vehicle || '—', b.service || b.service_id || 'Service', b.scheduled_date || b.date, b.scheduled_time || b.time, b.status, `$ ${b.amount || b.price || 0}`
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Computations
  const totalRevenue = stats?.monthlyRevenue || 0;
  const bookingsCount = stats?.periodBookings || stats?.totalBookings || 0;
  const avgOrderValue = bookingsCount ? Math.round(totalRevenue / bookingsCount) : 0;
  
  // Weekly chart series representation (percentages)
  const getRevenueSeries = () => {
    if (period === 'week') return [30, 25, 45, 55, 60, 48, 70];
    if (period === 'month') return [40, 55, 35, 62, 50, 75, 90];
    return [45, 60, 52, 70, 68, 85, 95];
  };

  const getWeekLabel = (idx: number) => {
    if (period === 'week') return `Day ${idx + 1}`;
    if (period === 'month') return `Wk ${idx + 1}`;
    return `Mo ${idx + 1}`;
  };

  const reportStats = [
    { name: 'Total Revenue', value: `$ ${totalRevenue.toLocaleString()}`, change: '+12.5%', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Period Bookings', value: bookingsCount.toLocaleString(), change: '+8.2%', icon: List, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Avg. Order Value', value: `$ ${avgOrderValue.toLocaleString()}`, change: '+5.1%', icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { name: 'Customer Retention', value: '68%', change: '+2.4%', icon: User, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Performance Reports</h1>
          <p className="text-gray-500">Analyze your garage's growth, customer behavior, and service performance.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => alert('Change date range parameters')}
            className="flex-grow md:flex-grow-0 border-2 border-black bg-white text-black px-4 py-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none flex items-center justify-center"
          >
            <Calendar className="h-4 w-4 mr-2" /> Date Range
          </button>
          <button 
            onClick={handleGenerateReport}
            className="flex-grow md:flex-grow-0 border-2 border-black bg-[#003580] text-white px-4 py-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" /> Generate Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
          <p className="text-sm font-bold">Loading reports and analytics...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportStats.map((stat) => (
              <div key={stat.name} className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all rounded-none">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 border-2 border-black rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 border border-black rounded-none bg-green-50 text-green-700 flex items-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" /> {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">{stat.name}</h3>
                <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-black text-gray-900 text-lg">Revenue Growth</h2>
                <div className="flex border-2 border-black bg-white p-1 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <button 
                    onClick={() => setPeriod('week')}
                    className={cn("px-3 py-1 text-xs font-black rounded-none transition-all", period === 'week' ? "bg-[#003580] text-white" : "text-gray-500 hover:text-gray-700")}
                  >
                    Daily
                  </button>
                  <button 
                    onClick={() => setPeriod('month')}
                    className={cn("px-3 py-1 text-xs font-black rounded-none transition-all", period === 'month' ? "bg-[#003580] text-white" : "text-gray-500 hover:text-gray-700")}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              <div className="h-64 bg-gray-50 border-2 border-black border-dashed p-4 flex items-end gap-3 rounded-none">
                {getRevenueSeries().map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                    <div className="w-full bg-green-50 border-2 border-black border-b-0 rounded-none overflow-hidden flex items-end h-full">
                      <div className="w-full bg-green-600 rounded-none transition-all duration-500" style={{ height: `${value}%` }} />
                    </div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{getWeekLabel(index)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-black text-gray-900 text-lg">Service Distribution</h2>
                <div className="flex border-2 border-black bg-white p-1 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <button 
                    onClick={() => setDistributionMode('category')}
                    className={cn("px-3 py-1 text-xs font-black rounded-none transition-all", distributionMode === 'category' ? "bg-[#003580] text-white" : "text-gray-500 hover:text-gray-700")}
                  >
                    Category
                  </button>
                  <button 
                    onClick={() => setDistributionMode('revenue')}
                    className={cn("px-3 py-1 text-xs font-black rounded-none transition-all", distributionMode === 'revenue' ? "bg-[#003580] text-white" : "text-gray-500 hover:text-gray-700")}
                  >
                    Revenue
                  </button>
                </div>
              </div>
              
              <div className="h-64 bg-gray-50 border-2 border-black border-dashed p-6 flex flex-col justify-center gap-4 rounded-none overflow-y-auto">
                {categoryDist.length === 0 ? (
                  <p className="text-gray-400 italic text-center text-sm">No distribution data available</p>
                ) : (
                  categoryDist.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-28 text-xs font-black text-gray-500 truncate">{item.label}</span>
                      <div className="flex-1 h-3.5 border border-black bg-gray-200 rounded-none overflow-hidden">
                        <div className="h-full bg-[#003580] rounded-none" style={{ width: `${item.percentage}%` }} />
                      </div>
                      <span className="w-10 text-xs font-black text-gray-500 text-right">{item.percentage}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Top Services Table */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
            <div className="p-6 border-b-2 border-black flex justify-between items-center">
              <h2 className="font-black text-gray-900 text-lg">Top Performing Services</h2>
              <button 
                onClick={() => navigate('/vendor/services')}
                className="text-sm font-black text-[#003580] hover:underline"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              {topServices.length === 0 ? (
                <p className="p-6 text-center text-gray-400 italic text-sm">No service bookings tracked yet.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-black text-gray-700 uppercase tracking-wider border-b-2 border-black">
                      <th className="px-6 py-4 border-r-2 border-black">Service Name</th>
                      <th className="px-6 py-4 border-r-2 border-black">Bookings</th>
                      <th className="px-6 py-4 border-r-2 border-black">Revenue</th>
                      <th className="px-6 py-4 border-r-2 border-black">Avg. Rating</th>
                      <th className="px-6 py-4">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black">
                    {topServices.map((service, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-black text-gray-900 border-r-2 border-black">{service.name}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-600 border-r-2 border-black">{service.bookings}</td>
                        <td className="px-6 py-4 text-sm font-black text-gray-900 border-r-2 border-black">$ {service.revenue.toLocaleString()}</td>
                        <td className="px-6 py-4 border-r-2 border-black">
                          <div className="flex items-center text-[#feba02]">
                            <PieChart className="h-4.5 w-4.5 mr-2 text-blue-500" />
                            <span className="text-sm font-black text-gray-700">{service.rating} / 5.0</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            {service.growth}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VendorReports;
