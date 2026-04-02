import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

const VendorCalendar = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timeSlots = Array.from({ length: 12 }, (_, i) => `${i + 8}:00 AM`);

  const appointments = [
    { id: 1, customer: 'John Doe', service: 'Oil Change', time: '9:00 AM', duration: '1h', status: 'confirmed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 2, customer: 'Sarah Smith', service: 'Brake Repair', time: '11:00 AM', duration: '2h', status: 'in-progress', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { id: 3, customer: 'Mike Johnson', service: 'General Service', time: '2:00 PM', duration: '3h', status: 'pending', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Calendar</h1>
          <p className="text-gray-500">Manage your garage's daily schedule and technician availability.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </button>
          <button className="bg-[#003580] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#00224f] flex items-center">
            <Plus className="h-4 w-4 mr-2" /> Add Appointment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold text-gray-900">October 2026</h2>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button className="p-2 hover:bg-gray-50 border-r border-gray-200">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button className="text-sm font-medium text-[#003580] hover:underline">Today</button>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button className="px-3 py-1 text-xs font-bold rounded-md bg-white shadow-sm text-gray-900">Day</button>
            <button className="px-3 py-1 text-xs font-bold rounded-md text-gray-500 hover:text-gray-700">Week</button>
            <button className="px-3 py-1 text-xs font-bold rounded-md text-gray-500 hover:text-gray-700">Month</button>
          </div>
        </div>

        <div className="flex">
          {/* Time Column */}
          <div className="w-20 border-r border-gray-100 flex-shrink-0">
            <div className="h-12 border-b border-gray-100"></div>
            {timeSlots.map(time => (
              <div key={time} className="h-20 border-b border-gray-100 p-2 text-[10px] font-bold text-gray-400 text-right uppercase">
                {time}
              </div>
            ))}
          </div>

          {/* Days Columns */}
          <div className="flex-grow overflow-x-auto">
            <div className="flex min-w-[800px]">
              {days.map((day, i) => (
                <div key={day} className="flex-grow border-r border-gray-100 last:border-0">
                  <div className="h-12 border-b border-gray-100 flex flex-col items-center justify-center bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{day}</span>
                    <span className={cn(
                      "text-sm font-bold",
                      i === 1 ? "text-[#003580]" : "text-gray-900"
                    )}>{12 + i}</span>
                  </div>
                  <div className="relative h-[960px] bg-white">
                    {/* Grid Lines */}
                    {timeSlots.map((_, idx) => (
                      <div key={idx} className="h-20 border-b border-gray-50"></div>
                    ))}
                    
                    {/* Sample Appointment on Monday (i=1) */}
                    {i === 1 && appointments.map((apt, idx) => (
                      <div 
                        key={apt.id}
                        className={cn(
                          "absolute left-1 right-1 rounded-lg p-2 border text-xs shadow-sm cursor-pointer hover:shadow-md transition-shadow",
                          apt.color
                        )}
                        style={{ top: `${idx * 160 + 20}px`, height: '140px' }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold truncate">{apt.customer}</span>
                          <Clock className="h-3 w-3 opacity-50" />
                        </div>
                        <p className="font-medium opacity-90 mb-2">{apt.service}</p>
                        <div className="flex items-center text-[10px] font-bold uppercase opacity-70">
                          {apt.time} · {apt.duration}
                        </div>
                      </div>
                    ))}
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

export default VendorCalendar;
