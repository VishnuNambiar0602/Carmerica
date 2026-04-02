import React from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MoreVertical, 
  Calendar, 
  Clock, 
  User, 
  Car, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Download,
  Mail,
  Phone
} from 'lucide-react';
import { cn } from '../../lib/utils';

const VendorBookings = () => {
  const [activeTab, setActiveTab] = React.useState<'all' | 'pending' | 'active' | 'completed'>('all');

  const bookings = [
    { id: "BK-1029", customer: "John Doe", car: "Toyota Camry (2022)", service: "Oil Change", date: "Oct 12, 2026", time: "10:00 AM", status: "In Progress", price: 89.00 },
    { id: "BK-1030", customer: "Sarah Smith", car: "Honda Civic (2021)", service: "Brake Repair", date: "Oct 12, 2026", time: "11:30 AM", status: "Pending", price: 120.00 },
    { id: "BK-1031", customer: "Mike Johnson", car: "Ford F-150 (2020)", service: "General Service", date: "Oct 12, 2026", time: "01:00 PM", status: "Confirmed", price: 189.00 },
    { id: "BK-1032", customer: "Emily Davis", car: "Tesla Model 3 (2023)", service: "AC Service", date: "Oct 12, 2026", time: "02:30 PM", status: "Confirmed", price: 65.00 },
    { id: "BK-1028", customer: "Robert Brown", car: "BMW 3 Series (2019)", service: "Full Service", date: "Oct 11, 2026", time: "09:00 AM", status: "Completed", price: 250.00 },
  ];

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return b.status === 'Pending';
    if (activeTab === 'active') return b.status === 'In Progress' || b.status === 'Confirmed';
    if (activeTab === 'completed') return b.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-grow md:flex-grow-0 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </button>
          <button className="flex-grow md:flex-grow-0 bg-[#003580] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#00224f] flex items-center justify-center">
            <Calendar className="h-4 w-4 mr-2" /> Schedule New
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex border-b border-gray-100 w-full md:w-auto">
            {['all', 'pending', 'active', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-4 py-2 text-sm font-bold capitalize relative transition-colors",
                  activeTab === tab ? "text-[#003580]" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#003580]" />}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#003580]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center hover:bg-gray-100">
            Date Range <ChevronDown className="h-3 w-3 ml-1" />
          </button>
          <button className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center hover:bg-gray-100">
            Service Type <ChevronDown className="h-3 w-3 ml-1" />
          </button>
          <button className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center hover:bg-gray-100">
            Mechanic <ChevronDown className="h-3 w-3 ml-1" />
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer & Vehicle</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#003580]">{booking.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-xs font-bold text-gray-500">
                        {booking.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{booking.customer}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Car className="h-3 w-3 mr-1" /> {booking.car}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.service}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{booking.date}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> {booking.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      booking.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                      booking.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                      booking.status === "Confirmed" ? "bg-purple-100 text-purple-700" :
                      "bg-green-100 text-green-700"
                    )}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">${booking.price}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-[#003580] hover:bg-blue-50 rounded-lg transition-colors">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#003580] hover:bg-blue-50 rounded-lg transition-colors">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 flex justify-between items-center">
          <p className="text-sm text-gray-500">Showing 1 to {filteredBookings.length} of {bookings.length} entries</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded text-sm font-medium text-gray-400 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 bg-[#003580] text-white rounded text-sm font-medium">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorBookings;
