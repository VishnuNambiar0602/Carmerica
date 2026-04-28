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
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [activeTab, setActiveTab] = React.useState<'upcoming' | 'past'>('upcoming');

  const bookings = [
    {
      id: "BK-102938",
      garage: "Elite Auto Care",
      location: "Downtown, Dubai",
      date: "Oct 12, 2026",
      time: "10:00 AM",
      service: "General Service",
      car: "Toyota Camry (2022)",
      status: "Confirmed",
      price: 367.50,
      type: "upcoming",
      aiVerified: true,
      savings: 45
    },
    {
      id: "BK-102845",
      garage: "Precision Mechanics",
      location: "Al Quoz, Dubai",
      date: "Sep 20, 2026",
      time: "02:30 PM",
      service: "Oil Change",
      car: "Toyota Camry (2022)",
      status: "Completed",
      price: 250.00,
      type: "past",
      aiVerified: true,
      reportAvailable: true
    },
    {
      id: "BK-102712",
      garage: "The Garage Co.",
      location: "Jumeirah",
      date: "Aug 15, 2026",
      time: "09:00 AM",
      service: "Brake Repair",
      car: "Toyota Camry (2022)",
      status: "Cancelled",
      price: 420.00,
      type: "past",
      aiVerified: false
    }
  ];

  const filteredBookings = bookings.filter(b => b.type === activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your car services and view AI verification reports.</p>
        </div>
        
        {/* AI Lifecycle Reminder Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-3xl text-white shadow-xl shadow-red-600/20 flex items-center space-x-6">
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
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden group hover:border-red-100 transition-all">
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
                        <button className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors flex items-center uppercase tracking-widest">
                          <RotateCcw className="h-4 w-4 mr-2" /> Reschedule
                        </button>
                        <button className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors flex items-center uppercase tracking-widest">
                          <XCircle className="h-4 w-4 mr-2" /> Cancel Booking
                        </button>
                      </>
                    )}
                    {booking.status === "Completed" && (
                      <>
                        <button className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors flex items-center uppercase tracking-widest">
                          <RotateCcw className="h-4 w-4 mr-2" /> Rebook Service
                        </button>
                        {booking.reportAvailable && (
                          <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center uppercase tracking-widest">
                            <FileText className="h-4 w-4 mr-2" /> AI Verification Report
                          </button>
                        )}
                        <button className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center uppercase tracking-widest">
                          <Download className="h-4 w-4 mr-2" /> Invoice
                        </button>
                      </>
                    )}
                  </div>
                  <button className="bg-gray-50 text-gray-900 px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 flex items-center transition-all active:scale-95">
                    View Details <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))
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
    </div>
  );
};

export default MyBookings;
