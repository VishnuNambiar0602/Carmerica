import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  XCircle, 
  Download,
  Wrench,
  Car,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Zap,
  FileText,
  MessageSquare,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

const MyBookings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = React.useState<any[]>([]);

  // Action states
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
  const [reschedulingBooking, setReschedulingBooking] = React.useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = React.useState('');
  const [rescheduleTime, setRescheduleTime] = React.useState('');
  const [rescheduleSlots, setRescheduleSlots] = React.useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [tiltStates, setTiltStates] = React.useState<Record<string, { x: number; y: number }>>({});
  const [detailsModalTilt, setDetailsModalTilt] = React.useState({ x: 0, y: 0 });
  const [rescheduleModalTilt, setRescheduleModalTilt] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const authRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!authRes.ok) return;
        const user = await authRes.json();
        if (!user.email) return;
        const res = await fetch(`/api/bookings?customerEmail=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        setBookings(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  React.useEffect(() => {
    if (!rescheduleDate || !reschedulingBooking) return;
    setLoadingSlots(true);
    fetch(`/api/availability/slots?vendorId=${reschedulingBooking.vendor_id || 'vendor-1'}&date=${rescheduleDate}`)
      .then((r) => r.json())
      .then((data) => setRescheduleSlots(data.slots?.map((s: any) => s.time) || []))
      .catch(() => setRescheduleSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [rescheduleDate, reschedulingBooking]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: 'Customer cancelled' })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
        alert('Booking cancelled successfully.');
      } else {
        alert('Failed to cancel booking.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error cancelling booking.');
    }
  };

  const handleRescheduleConfirm = async () => {
    if (!rescheduleDate || !rescheduleTime || !reschedulingBooking) return;
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/bookings/${reschedulingBooking.id}/reschedule`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ date: rescheduleDate, time: rescheduleTime })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === reschedulingBooking.id ? { ...b, date: rescheduleDate, time: rescheduleTime } : b));
        setReschedulingBooking(null);
        setRescheduleDate('');
        setRescheduleTime('');
        alert('Booking rescheduled successfully.');
      } else {
        alert('Failed to reschedule booking.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error rescheduling booking.');
    }
  };

  const handleDownloadInvoice = (booking: any) => {
    const html = `
      <html>
      <head>
        <title>Invoice - ${booking.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; }
          .title { font-size: 28px; font-weight: bold; color: #e11d48; margin-bottom: 20px; }
          .details { margin-bottom: 30px; }
          .item { display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 10px 0; }
          .total { font-size: 20px; font-weight: bold; margin-top: 20px; display: flex; justify-content: space-between; color: #1e293b; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="title">CarServ Invoice</div>
          <div class="details">
            <p><strong>Booking ID:</strong> #${booking.id}</p>
            <p><strong>Customer Email:</strong> ${booking.customer_email || 'N/A'}</p>
            <p><strong>Garage:</strong> ${booking.garage || 'N/A'}</p>
            <p><strong>Location:</strong> ${booking.location || 'N/A'}</p>
            <p><strong>Appointment Date:</strong> ${booking.date} at ${booking.time}</p>
            <p><strong>Vehicle:</strong> ${booking.car || 'N/A'}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
          </div>
          <div class="item">
            <span>${booking.service || 'General Service'}</span>
            <span>AED ${booking.price}</span>
          </div>
          <div class="total">
            <span>Total Paid</span>
            <span>AED ${booking.price}</span>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${booking.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredBookings = bookings.filter(b => (activeTab === 'upcoming' ? ['Confirmed','Pending','In Progress'].includes(b.status) : b.status === 'Completed'));

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your car services and view AI verification reports.</p>
        </div>
        
        {/* AI Lifecycle Reminder Banner */}
        <div className="bg-linear-to-r from-red-600 to-red-700 p-6 rounded-3xl text-white shadow-xl shadow-red-600/20 flex items-center space-x-6">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">AI Prediction</p>
            <p className="text-sm font-bold">Next Service: ~Dec 2026</p>
            <p className="text-[10px] text-white/60">Based on your driving history</p>
          </div>
          <Link to="/smart-garage" className="bg-white text-red-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">
            View Lifecycle
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1.5 rounded-2xl mb-12 w-fit">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={cn(
            "px-8 py-3 font-bold text-xs uppercase tracking-widest transition-all rounded-xl",
            activeTab === 'upcoming' ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={cn(
            "px-8 py-3 font-bold text-xs uppercase tracking-widest transition-all rounded-xl",
            activeTab === 'past' ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Past Bookings
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-8">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => {
            const tilt = tiltStates[booking.id] || { x: 0, y: 0 };
            return (
              <div 
                key={booking.id}
                onMouseMove={(e) => {
                  const card = e.currentTarget;
                  const box = card.getBoundingClientRect();
                  const x = e.clientX - box.left - box.width / 2;
                  const y = e.clientY - box.top - box.height / 2;
                  const factorX = 10 / (box.height / 2);
                  const factorY = 10 / (box.width / 2);
                  setTiltStates(prev => ({
                    ...prev,
                    [booking.id]: { x: -y * factorX, y: x * factorY }
                  }));
                }}
                onMouseLeave={() => setTiltStates(prev => ({
                  ...prev,
                  [booking.id]: { x: 0, y: 0 }
                }))}
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  transition: 'transform 0.15s ease-out',
                  transformStyle: 'preserve-3d',
                }}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden group hover:border-red-100 transition-all"
              >
                <div className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center">
                      <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center mr-6 group-hover:bg-red-50 transition-colors">
                        <Wrench className="h-8 w-8 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xl text-gray-900">{booking.garage}</h3>
                          {booking.aiVerified && (
                            <div className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                              <ShieldCheck className="h-3 w-3 mr-1" /> AI Verified
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 flex items-center mt-1 font-bold uppercase tracking-widest">
                          <MapPin className="h-3 w-3 mr-1" /> {booking.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest",
                        booking.status === "Confirmed" ? "bg-blue-50 text-blue-600" :
                        booking.status === "Completed" ? "bg-green-50 text-green-600" :
                        "bg-red-50 text-red-600"
                      )}>
                        {booking.status}
                      </span>
                      <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-t border-b border-gray-50">
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Booking ID</p>
                      <p className="text-sm font-bold text-red-600">#{booking.id}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Date & Time</p>
                      <p className="text-sm font-bold text-gray-900">{booking.date} at {booking.time}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Vehicle</p>
                      <p className="text-sm font-bold text-gray-900">{booking.car}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Price</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-gray-900">AED {booking.price}</p>
                        {booking.savings && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            Saved AED {booking.savings}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-6 justify-between items-center">
                    <div className="flex flex-wrap gap-6">
                      {booking.status === "Confirmed" && (
                        <>
                          <button 
                            onClick={() => {
                              setReschedulingBooking(booking);
                              setRescheduleDate(booking.date || '');
                              setRescheduleTime(booking.time || '');
                            }}
                            className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors flex items-center uppercase tracking-widest"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" /> Reschedule
                          </button>
                          <button 
                            onClick={() => handleCancelBooking(booking.id)}
                            className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors flex items-center uppercase tracking-widest"
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Cancel Booking
                          </button>
                        </>
                      )}
                      {booking.status === "Completed" && (
                        <>
                          <button 
                            onClick={() => navigate(`/checkout?vendorId=${booking.vendor_id || ''}&service=${encodeURIComponent(booking.service || '')}&price=${booking.price || ''}`)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors flex items-center uppercase tracking-widest"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" /> Rebook Service
                          </button>
                          {booking.reportAvailable && (
                            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center uppercase tracking-widest">
                              <FileText className="h-4 w-4 mr-2" /> AI Verification Report
                            </button>
                          )}
                          <button 
                            onClick={() => handleDownloadInvoice(booking)}
                            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center uppercase tracking-widest"
                          >
                            <Download className="h-4 w-4 mr-2" /> Invoice
                          </button>
                        </>
                      )}
                    </div>
                    <button 
                      onClick={() => setSelectedBooking(booking)}
                      className="bg-gray-50 text-gray-900 px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 flex items-center transition-all active:scale-95"
                    >
                      View Details <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 border-dashed">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gray-50 mb-8">
              <AlertCircle className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No {activeTab} bookings found</h3>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto">You haven't scheduled any services yet. Let our AI Genie help you find the best garage.</p>
            <Link 
              to="/search" 
              className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all active:scale-95"
            >
              Explore Garages
            </Link>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div 
            onMouseMove={(e) => {
              const card = e.currentTarget;
              const box = card.getBoundingClientRect();
              const x = e.clientX - box.left - box.width / 2;
              const y = e.clientY - box.top - box.height / 2;
              const factorX = 6 / (box.height / 2);
              const factorY = 6 / (box.width / 2);
              setDetailsModalTilt({ x: -y * factorX, y: x * factorY });
            }}
            onMouseLeave={() => setDetailsModalTilt({ x: 0, y: 0 })}
            style={{
              transform: `perspective(1000px) rotateX(${detailsModalTilt.x}deg) rotateY(${detailsModalTilt.y}deg)`,
              transition: 'transform 0.15s ease-out',
              transformStyle: 'preserve-3d',
            }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-lg w-full border border-gray-100 shadow-2xl relative"
          >
            <button 
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-500 hover:text-gray-700"
            >
              <Plus className="h-6 w-6 rotate-45" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Booking ID</span>
                <span className="text-sm font-bold text-red-600">#{selectedBooking.id}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Garage Name</span>
                <span className="text-sm font-bold text-gray-900">{selectedBooking.garage}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location</span>
                <span className="text-sm font-semibold text-gray-500">{selectedBooking.location}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Service</span>
                <span className="text-sm font-bold text-gray-900">{selectedBooking.service || 'General Service'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vehicle</span>
                <span className="text-sm font-bold text-gray-900">{selectedBooking.car}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Time</span>
                <span className="text-sm font-bold text-gray-900">{selectedBooking.date} at {selectedBooking.time}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</span>
                <span className="text-sm font-bold text-gray-900">AED {selectedBooking.price}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
                <span className={cn(
                  "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                  selectedBooking.status === 'Confirmed' ? "bg-blue-50 text-blue-600" :
                  selectedBooking.status === 'Completed' ? "bg-green-50 text-green-600" :
                  "bg-red-50 text-red-600"
                )}>
                  {selectedBooking.status}
                </span>
              </div>
              {selectedBooking.cancellation_reason && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold">
                  Cancellation Reason: {selectedBooking.cancellation_reason}
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setSelectedBooking(null)}
                className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div 
            onMouseMove={(e) => {
              const card = e.currentTarget;
              const box = card.getBoundingClientRect();
              const x = e.clientX - box.left - box.width / 2;
              const y = e.clientY - box.top - box.height / 2;
              const factorX = 6 / (box.height / 2);
              const factorY = 6 / (box.width / 2);
              setRescheduleModalTilt({ x: -y * factorX, y: x * factorY });
            }}
            onMouseLeave={() => setRescheduleModalTilt({ x: 0, y: 0 })}
            style={{
              transform: `perspective(1000px) rotateX(${rescheduleModalTilt.x}deg) rotateY(${rescheduleModalTilt.y}deg)`,
              transition: 'transform 0.15s ease-out',
              transformStyle: 'preserve-3d',
            }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-lg w-full border border-gray-100 shadow-2xl relative"
          >
            <button 
              onClick={() => {
                setReschedulingBooking(null);
                setRescheduleDate('');
                setRescheduleTime('');
              }}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-500 hover:text-gray-700"
            >
              <Plus className="h-6 w-6 rotate-45" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reschedule Appointment</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select New Date</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available Slots</label>
                {!rescheduleDate ? (
                  <p className="text-sm text-gray-400 py-2">Please select a date first</p>
                ) : loadingSlots ? (
                  <p className="text-sm text-gray-400 py-2">Loading time slots...</p>
                ) : rescheduleSlots.length === 0 ? (
                  <p className="text-sm text-red-500 py-2 font-bold">No slots available for this date</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setRescheduleTime(slot)}
                        className={cn(
                          "p-2.5 rounded-xl text-xs font-bold border transition-all text-center",
                          rescheduleTime === slot
                            ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20"
                            : "bg-gray-50 text-gray-700 border-gray-100 hover:border-red-200"
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => {
                  setReschedulingBooking(null);
                  setRescheduleDate('');
                  setRescheduleTime('');
                }}
                className="text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={!rescheduleDate || !rescheduleTime}
                onClick={handleRescheduleConfirm}
                className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-600/10 disabled:opacity-50"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
