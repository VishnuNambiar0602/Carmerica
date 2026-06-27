import React from 'react';
import { 
  Search, 
  ChevronDown, 
  MoreVertical, 
  Calendar, 
  Clock, 
  Car, 
  CheckCircle2, 
  X,
  Plus,
  Download,
  Mail,
  Phone,
  Check,
  XCircle,
  AlertCircle,
  DollarSign,
  Star,
  ClipboardList,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Booking {
  id: string;
  customer: string;
  customer_email: string;
  phone?: string;
  car: string;
  service: string;
  service_id?: string;
  date: string;
  time: string;
  status: string;
  price: number;
  vehicle?: string;
}

const VendorBookings = () => {
  const [activeTab, setActiveTab] = React.useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [statsData, setStatsData] = React.useState<any>(null);
  const [services, setServices] = React.useState<any[]>([]);
  const [garageId, setGarageId] = React.useState('garage-1');
  const [vendorId, setVendorId] = React.useState('vendor-1');
  
  // Filtering & Pagination State
  const [search, setSearch] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState('all');
  const [serviceFilter, setServiceFilter] = React.useState('all');
  const [mechanicFilter, setMechanicFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [page, setPage] = React.useState(0);
  const PAGE_SIZE = 10;

  // Modals & Menu State
  const [menuOpen, setMenuOpen] = React.useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [modalError, setModalError] = React.useState('');

  // Schedule Form State
  const [form, setForm] = React.useState({
    customer: '',
    email: '',
    phone: '',
    car: '',
    serviceId: '',
    date: '',
    time: '09:00 AM',
    price: ''
  });

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Get Vendor info
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!meRes.ok) return;
      const meData = await meRes.json();
      const vId = meData.vendor?.id || 'vendor-1';
      setVendorId(vId);

      // Get Garages
      const garageRes = await fetch(`/api/garages?vendorId=${vId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (garageRes.ok) {
        const garages = await garageRes.json();
        if (garages && garages.length > 0) {
          setGarageId(garages[0].id);
        }
      }

      // Fetch bookings
      const res = await fetch(`/api/vendor/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const mapped = (data || []).map((b: any) => ({
        ...b,
        customer: b.customer_name || 'Unknown',
        car: b.vehicle || '—',
        date: b.scheduled_date || b.date,
        time: b.scheduled_time || b.time,
        service: b.service || b.service_id || 'Service',
        price: Number(b.amount || b.price || 0),
      }));
      setBookings(mapped);

      // Fetch services
      const svcRes = await fetch('/api/vendor/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (svcRes.ok) {
        setServices(await svcRes.json());
      }

      // Fetch stats
      const statsRes = await fetch(`/api/vendor/stats?vendorId=${encodeURIComponent(vId)}&period=month`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        setStatsData(await statsRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Handle click outside for dropdown
  React.useEffect(() => {
    const handleOutsideClick = () => setMenuOpen(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filter Bookings Client Side
  const filteredBookings = bookings.filter(b => {
    // Search filter
    const matchesSearch = !search || 
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase()) ||
      b.car.toLowerCase().includes(search.toLowerCase());

    // Tab filter
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'pending' && b.status === 'Pending') ||
      (activeTab === 'active' && ['In Progress', 'Confirmed'].includes(b.status)) ||
      (activeTab === 'completed' && b.status === 'Completed');

    // Extra Date filter
    let matchesDate = true;
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateFilter === 'today') {
      matchesDate = b.date === todayStr;
    } else if (dateFilter === 'week') {
      const bDate = new Date(b.date);
      const diff = (new Date().getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24);
      matchesDate = diff >= 0 && diff <= 7;
    }

    // Extra Service filter
    const matchesService = serviceFilter === 'all' || b.service === serviceFilter || b.service_id === serviceFilter;

    // Extra Mechanic filter (using status or car type as helper or simple true)
    const matchesMechanic = true;

    return matchesSearch && matchesTab && matchesDate && matchesService && matchesMechanic;
  });

  const paginatedBookings = filteredBookings.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Booking ID', 'Customer', 'Email', 'Phone', 'Vehicle', 'Service', 'Date', 'Time', 'Status', 'Amount'];
    const rows = filteredBookings.map(b => [
      b.id, b.customer, b.customer_email || '', b.phone || '', b.car, b.service, b.date, b.time, b.status, `$ ${b.price}`
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Status transitions
  const handleConfirmBooking = async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: 'Confirmed' }),
    });
    if (res.ok) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b));
      setMenuOpen(null);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ reason: 'Cancelled by vendor' }),
    });
    if (res.ok) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
      setMenuOpen(null);
    }
  };

  const handleMarkComplete = async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: 'Completed' }),
    });
    if (res.ok) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Completed' } : b));
      setMenuOpen(null);
    }
  };

  // Schedule New Booking Action
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!form.email || !form.date || !form.time || !form.price || !form.customer) {
      setModalError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const selectedSvc = services.find(s => s.id === form.serviceId);
      const serviceName = selectedSvc ? selectedSvc.name : 'General Service';

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          vendorId,
          garageId,
          service: serviceName,
          serviceId: form.serviceId,
          date: form.date,
          time: form.time,
          price: Number(form.price),
          email: form.email,
          phone: form.phone,
          customer: form.customer,
          car: form.car || 'Vehicle'
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Optimistic refresh
        setShowScheduleModal(false);
        setForm({
          customer: '',
          email: '',
          phone: '',
          car: '',
          serviceId: '',
          date: '',
          time: '09:00 AM',
          price: ''
        });
        loadData();
      } else {
        setModalError(data.message || 'Failed to create booking');
      }
    } catch (err) {
      setModalError('Network error');
    } finally {
      setSaving(false);
    }
  };

  // Unique service types for filtering
  const uniqueServiceNames = Array.from(new Set(bookings.map(b => b.service)));

  const bookingStats = [
    { name: 'Bookings', value: statsData ? String(statsData.periodBookings || statsData.totalBookings) : '120', icon: ClipboardList, color: 'text-blue-655', bg: 'bg-blue-50' },
    { name: 'Revenue', value: statsData ? `$ ${Number(statsData.monthlyRevenue || 0).toLocaleString()}` : '$ 24,300', icon: DollarSign, color: 'text-green-655', bg: 'bg-green-50' },
    { name: 'Rating', value: statsData ? Number(statsData.avgRating || 4.8).toFixed(1) : '4.8', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { name: 'Pending Jobs', value: statsData ? String(statsData.pending) : '8', icon: Clock, color: 'text-red-655', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Booking Management</h1>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-grow md:flex-grow-0 border-2 border-black bg-white text-black px-4 py-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </button>
          <button 
            onClick={() => {
              setModalError('');
              setShowScheduleModal(true);
            }}
            className="flex-grow md:flex-grow-0 border-2 border-black bg-[#003580] text-white px-4 py-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" /> Schedule New
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {bookingStats.map((stat) => (
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

      {/* Tabs & Search */}
      <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] rounded-none space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex border-b-2 border-gray-100 w-full md:w-auto">
            {['all', 'pending', 'active', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab as any);
                  setPage(0);
                }}
                className={cn(
                  "px-4 py-2 text-sm font-black capitalize relative transition-colors rounded-none",
                  activeTab === tab ? "text-[#003580] border-b-4 border-[#003580]" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Date range filter */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(0); }}
              className="bg-gray-50 border-2 border-black text-gray-800 px-3 py-1.5 rounded-none text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#003580] appearance-none pr-8"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
            </select>
            <ChevronDown className="h-3 w-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Service type filter */}
          <div className="relative">
            <select
              value={serviceFilter}
              onChange={(e) => { setServiceFilter(e.target.value); setPage(0); }}
              className="bg-gray-50 border-2 border-black text-gray-800 px-3 py-1.5 rounded-none text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#003580] appearance-none pr-8"
            >
              <option value="all">All Service Types</option>
              {uniqueServiceNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mechanic Filter */}
          <div className="relative">
            <select
              value={mechanicFilter}
              onChange={(e) => { setMechanicFilter(e.target.value); setPage(0); }}
              className="bg-gray-50 border-2 border-black text-gray-800 px-3 py-1.5 rounded-none text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#003580] appearance-none pr-8"
            >
              <option value="all">All Mechanics</option>
              <option value="alex">Alex (Master Tech)</option>
              <option value="steve">Steve (Electrical)</option>
            </select>
            <ChevronDown className="h-3 w-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-bold">No bookings found</p>
              <p className="text-sm">We couldn't find any bookings matching your filter parameters.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-black text-gray-700 uppercase tracking-wider border-b-2 border-black">
                  <th className="px-6 py-4 border-r-2 border-black">Booking ID</th>
                  <th className="px-6 py-4 border-r-2 border-black">Customer & Vehicle</th>
                  <th className="px-6 py-4 border-r-2 border-black">Service</th>
                  <th className="px-6 py-4 border-r-2 border-black">Date & Time</th>
                  <th className="px-6 py-4 border-r-2 border-black">Status</th>
                  <th className="px-6 py-4 border-r-2 border-black">Price</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-black text-[#003580] border-r-2 border-black">{booking.id}</td>
                    <td className="px-6 py-4 border-r-2 border-black">
                      <div className="flex items-center">
                        <div className="h-10 w-10 border-2 border-black bg-gray-100 flex items-center justify-center mr-3 text-xs font-bold text-gray-500 rounded-none">
                          {(booking.customer || 'Unknown').split(' ').filter(Boolean).map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{booking.customer}</p>
                          <p className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Car className="h-3 w-3 mr-1" /> {booking.car}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-600 border-r-2 border-black">{booking.service}</td>
                    <td className="px-6 py-4 border-r-2 border-black font-bold">
                      <div className="text-sm text-gray-900">{booking.date}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-0.5">
                        <Clock className="h-3 w-3 mr-1" /> {booking.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r-2 border-black">
                      <span className={cn(
                        "text-xs font-black px-2.5 py-1 border-2 border-black rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                        booking.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                        booking.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        booking.status === "Confirmed" ? "bg-purple-100 text-purple-800" :
                        booking.status === "Cancelled" ? "bg-red-100 text-red-800" :
                        "bg-green-100 text-green-800"
                      )}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900 border-r-2 border-black">$ {booking.price}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.phone && (
                          <button 
                            onClick={() => window.open(`tel:${booking.phone}`, '_self')}
                            className="p-2 border-2 border-black bg-white hover:bg-blue-50 hover:-translate-y-0.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none"
                            title={`Call ${booking.customer}`}
                          >
                            <Phone className="h-4 w-4 text-gray-700" />
                          </button>
                        )}
                        <button 
                          onClick={() => window.open(`mailto:${booking.customer_email}?subject=Your Booking ${booking.id}`, '_blank')}
                          className="p-2 border-2 border-black bg-white hover:bg-blue-50 hover:-translate-y-0.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none"
                          title={`Email ${booking.customer}`}
                        >
                          <Mail className="h-4 w-4 text-gray-700" />
                        </button>
                        
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(menuOpen === booking.id ? null : booking.id);
                            }}
                            className="p-2 border-2 border-black bg-white hover:bg-gray-100 hover:-translate-y-0.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-700" />
                          </button>
                          
                          {menuOpen === booking.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-10 w-48 bg-white border-2 border-black z-20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none"
                            >
                              {booking.status !== 'Confirmed' && booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
                                <button 
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-green-700 hover:bg-green-50 flex items-center gap-2 border-b border-gray-100 rounded-none"
                                >
                                  <Check className="h-3.5 w-3.5" /> Confirm Booking
                                </button>
                              )}
                              {booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
                                <button 
                                  onClick={() => handleMarkComplete(booking.id)}
                                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-blue-700 hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100 rounded-none"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                                </button>
                              )}
                              {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                                <button 
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-700 hover:bg-red-50 flex items-center gap-2 rounded-none"
                                >
                                  <XCircle className="h-3.5 w-3.5" /> Cancel Booking
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {filteredBookings.length > 0 && (
          <div className="p-6 border-t-2 border-black flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm font-bold text-gray-500">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredBookings.length)} of {filteredBookings.length} entries
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className={cn(
                  "px-4 py-2 border-2 border-black font-bold text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none",
                  page === 0 ? "text-gray-400 bg-gray-100 shadow-none cursor-not-allowed" : "bg-white text-black hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                Previous
              </button>
              <button 
                disabled
                className="px-4 py-2 border-2 border-black bg-[#003580] text-white font-bold text-xs rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                {page + 1}
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * PAGE_SIZE >= filteredBookings.length}
                className={cn(
                  "px-4 py-2 border-2 border-black font-bold text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none",
                  (page + 1) * PAGE_SIZE >= filteredBookings.length ? "text-gray-400 bg-gray-100 shadow-none cursor-not-allowed" : "bg-white text-black hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Schedule New Booking Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-4 border-black max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none transform scale-100 transition-all">
            <div className="bg-[#003580] p-6 text-white border-b-4 border-black flex justify-between items-center rounded-none">
              <h2 className="text-2xl font-black tracking-tight">Schedule New Booking</h2>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="text-white hover:text-gray-200 p-1 border-2 border-white hover:bg-white hover:text-black transition-all rounded-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="border-2 border-black bg-red-50 p-3 text-red-800 text-sm font-bold flex items-center gap-2 rounded-none">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {modalError}
                </div>
              )}
              
              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Customer Name *</label>
                <input 
                  type="text" 
                  value={form.customer} 
                  onChange={e => setForm(f => ({ ...f, customer: e.target.value }))}
                  placeholder="e.g. John Smith"
                  className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Email *</label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Phone</label>
                  <input 
                    type="tel" 
                    value={form.phone} 
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+971 50 123 4567"
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Vehicle (Model & Year)</label>
                  <input 
                    type="text" 
                    value={form.car} 
                    onChange={e => setForm(f => ({ ...f, car: e.target.value }))}
                    placeholder="e.g. Toyota Camry 2021"
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Select Service *</label>
                  <select 
                    value={form.serviceId} 
                    onChange={e => {
                      const selected = services.find(s => s.id === e.target.value);
                      setForm(f => ({ 
                        ...f, 
                        serviceId: e.target.value,
                        price: selected ? String(selected.price) : f.price
                      }));
                    }}
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                    required
                  >
                    <option value="">-- Choose Service --</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ($ {s.price})</option>
                    ))}
                    <option value="custom">Custom Service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Booking Date *</label>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Time Slot *</label>
                  <select 
                    value={form.time} 
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none font-bold"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Price (USD) *</label>
                <input 
                  type="number" 
                  min="0"
                  value={form.price} 
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="250"
                  className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                  required 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-black">
                <button 
                  type="button" 
                  onClick={() => setShowScheduleModal(false)} 
                  className="px-5 py-2.5 border-2 border-black bg-white text-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-[#003580] text-white border-2 border-black px-6 py-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none disabled:opacity-50"
                >
                  {saving ? 'Scheduling...' : 'Schedule Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorBookings;
