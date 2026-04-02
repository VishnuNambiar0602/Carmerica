import React from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Download, 
  ChevronRight, 
  Mail, 
  Printer, 
  Share2,
  Car
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Confirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600">Your appointment at Elite Auto Care has been successfully scheduled.</p>
        <p className="text-sm font-bold text-[#003580] mt-2">Booking ID: #BK-102938</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Booking Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-6 border-b border-gray-100 pb-4">Booking Summary</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mr-4 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Date</p>
                <p className="text-sm font-medium">Monday, October 12, 2026</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-400 mr-4 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Time</p>
                <p className="text-sm font-medium">10:00 AM - 12:30 PM</p>
              </div>
            </div>
            <div className="flex items-start">
              <Car className="h-5 w-5 text-gray-400 mr-4 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Vehicle</p>
                <p className="text-sm font-medium">Toyota Camry (2022) · ABC-1234</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-gray-400 mr-4 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Service</p>
                <p className="text-sm font-medium">General Service Package</p>
              </div>
            </div>
          </div>
        </div>

        {/* Garage Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-6 border-b border-gray-100 pb-4">Garage Details</h2>
          <div className="flex items-center mb-6">
            <img 
              src="https://picsum.photos/seed/garage1/100/100" 
              alt="Garage" 
              className="h-12 w-12 rounded object-cover mr-4"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="font-bold text-gray-900">Elite Auto Care</p>
              <p className="text-xs text-gray-500">4.8 Stars · 1,240 Reviews</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-4 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Address</p>
                <p className="text-sm font-medium">123 Downtown St, Los Angeles, CA 90012</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mr-4 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Phone</p>
                <p className="text-sm font-medium">+1 (213) 555-0198</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button className="flex-grow bg-blue-50 text-[#0071c2] py-2 rounded font-bold text-sm hover:bg-blue-100 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 mr-2" /> Chat
            </button>
            <button className="flex-grow bg-blue-50 text-[#0071c2] py-2 rounded font-bold text-sm hover:bg-blue-100 flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-2" /> Directions
            </button>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-[#003580] text-white p-8 rounded-xl mb-12">
        <h2 className="text-xl font-bold mb-6">What's next?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mb-4 font-bold">1</div>
            <p className="text-sm font-bold mb-2">Confirmation Email</p>
            <p className="text-xs text-white/70">We've sent a detailed summary and calendar invite to your email.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mb-4 font-bold">2</div>
            <p className="text-sm font-bold mb-2">Arrive on Time</p>
            <p className="text-xs text-white/70">Please arrive 10 minutes early to complete any necessary paperwork.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mb-4 font-bold">3</div>
            <p className="text-sm font-bold mb-2">Pay After Service</p>
            <p className="text-xs text-white/70">No payment is needed now. You'll pay at the garage after the job is done.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg font-bold text-sm hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" /> Download Invoice
        </button>
        <button className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg font-bold text-sm hover:bg-gray-50">
          <Printer className="h-4 w-4 mr-2" /> Print Confirmation
        </button>
        <button className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg font-bold text-sm hover:bg-gray-50">
          <Share2 className="h-4 w-4 mr-2" /> Share Details
        </button>
        <Link 
          to="/my-bookings" 
          className="flex items-center px-6 py-3 bg-[#0071c2] text-white rounded-lg font-bold text-sm hover:bg-[#005999]"
        >
          Manage My Bookings <ChevronRight className="h-4 w-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default Confirmation;
