import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  Filter, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface Appointment {
  id: string;
  customer: string;
  customer_name?: string;
  service: string;
  service_id?: string;
  date: string;
  time: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  amount: number;
}

const VendorCalendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const formattedDate = currentDate.toISOString().split('T')[0];

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch all bookings for vendor to place in calendar
      const res = await fetch(`/api/vendor/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((b: any) => ({
          ...b,
          customer: b.customer_name || 'Customer',
          service: b.service || b.service_id || 'Service',
          date: b.scheduled_date,
          time: b.scheduled_time,
          price: Number(b.amount || 0)
        }));
        setAppointments(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleNavigateDate = (direction: 'prev' | 'next') => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'day') {
      nextDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      nextDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      nextDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(nextDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper: Get start of week (Sunday)
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  };

  // Helper: Get days of week
  const getWeekDays = () => {
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  // Helper: Get days of month
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayIndex = firstDay.getDay(); // 0 is Sunday
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Grid includes days from prev month to fill the first row
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthDays - i));
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    // Days of next month to pad
    const remaining = 42 - days.length; // 6 rows of 7
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  };

  // Time Slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const getAppointmentsForDateAndTime = (dateStr: string, timeStr: string) => {
    return appointments.filter(a => a.date === dateStr && a.time === timeStr);
  };

  const getAppointmentsForDate = (dateStr: string) => {
    return appointments.filter(a => a.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const renderHeaderDate = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } else if (viewMode === 'week') {
      const days = getWeekDays();
      return `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Service Calendar</h1>
          <p className="text-gray-500">Manage your garage's daily schedule and technician availability.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/vendor/bookings')}
            className="flex-grow md:flex-grow-0 border-2 border-black bg-white text-black px-4 py-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none flex items-center justify-center"
          >
            <Filter className="h-4 w-4 mr-2" /> Bookings List
          </button>
          <button 
            onClick={() => navigate('/vendor/bookings')}
            className="flex-grow md:flex-grow-0 border-2 border-black bg-[#003580] text-white px-4 py-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Appointment
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
        {/* Navigation panel */}
        <div className="p-4 border-b-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-black text-gray-900 leading-tight">{renderHeaderDate()}</h2>
            <div className="flex border-2 border-black rounded-none overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <button 
                onClick={() => handleNavigateDate('prev')}
                className="p-1.5 hover:bg-gray-150 bg-white border-r-2 border-black rounded-none transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleNavigateDate('next')}
                className="p-1.5 hover:bg-gray-150 bg-white rounded-none transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button 
              onClick={handleToday}
              className="text-xs font-black text-[#003580] hover:underline"
            >
              Today
            </button>
          </div>
          <div className="flex border-2 border-black bg-white p-1 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {(['day', 'week', 'month'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1.5 text-xs font-black capitalize rounded-none transition-all",
                  viewMode === mode ? "bg-[#003580] text-white" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-bold">Loading schedule...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* 1. Day View */}
            {viewMode === 'day' && (
              <div className="min-w-[600px] flex">
                <div className="w-24 border-r-2 border-black flex-shrink-0 bg-gray-50">
                  <div className="h-12 border-b-2 border-black"></div>
                  {timeSlots.map(time => (
                    <div key={time} className="h-24 border-b-2 border-black border-dashed p-3 text-[10px] font-black text-gray-500 text-right uppercase">
                      {time}
                    </div>
                  ))}
                </div>
                <div className="flex-grow bg-white">
                  <div className="h-12 border-b-2 border-black flex items-center px-4 bg-gray-50/50 font-black text-sm text-[#003580]">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </div>
                  <div className="relative">
                    {timeSlots.map(time => {
                      const dayStr = currentDate.toISOString().split('T')[0];
                      const apts = getAppointmentsForDateAndTime(dayStr, time);
                      
                      return (
                        <div key={time} className="h-24 border-b-2 border-black border-dashed p-2 relative flex gap-2 overflow-x-auto">
                          {apts.map(apt => (
                            <div 
                              key={apt.id}
                              onClick={() => navigate('/vendor/bookings')}
                              className={cn(
                                "h-full border-2 border-black p-3 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between rounded-none min-w-[200px]",
                                getStatusColor(apt.status)
                              )}
                            >
                              <div className="flex justify-between items-start font-black">
                                <span className="truncate">{apt.customer}</span>
                                <span className="text-[10px] bg-white border border-black px-1.5 py-0.5 font-bold uppercase">{apt.status}</span>
                              </div>
                              <p className="font-black opacity-90 truncate mt-0.5">{apt.service}</p>
                              <div className="text-[9px] font-bold uppercase mt-1">AED {apt.amount}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Week View */}
            {viewMode === 'week' && (
              <div className="min-w-[850px] flex">
                <div className="w-20 border-r-2 border-black flex-shrink-0 bg-gray-50">
                  <div className="h-12 border-b-2 border-black"></div>
                  {timeSlots.map(time => (
                    <div key={time} className="h-24 border-b-2 border-black border-dashed p-2 text-[10px] font-black text-gray-500 text-right uppercase">
                      {time}
                    </div>
                  ))}
                </div>
                <div className="flex-grow grid grid-cols-7 divide-x-2 divide-black">
                  {getWeekDays().map((day, i) => {
                    const dayStr = day.toISOString().split('T')[0];
                    const isToday = dayStr === new Date().toISOString().split('T')[0];
                    
                    return (
                      <div key={dayStr} className="min-w-[100px] flex flex-col">
                        <div className={cn(
                          "h-12 border-b-2 border-black flex flex-col items-center justify-center p-1 font-black",
                          isToday ? "bg-blue-50 text-[#003580]" : "bg-gray-50/50 text-gray-700"
                        )}>
                          <span className="text-[9px] uppercase tracking-wider">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                          <span className="text-sm">{day.getDate()}</span>
                        </div>
                        <div className="flex-grow divide-y-2 divide-black divide-dashed bg-white">
                          {timeSlots.map(time => {
                            const apts = getAppointmentsForDateAndTime(dayStr, time);
                            return (
                              <div key={time} className="h-24 p-1.5 space-y-1 overflow-y-auto">
                                {apts.map(apt => (
                                  <div 
                                    key={apt.id}
                                    onClick={() => navigate('/vendor/bookings')}
                                    className={cn(
                                      "border-2 border-black p-1 text-[10px] font-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all rounded-none truncate",
                                      getStatusColor(apt.status)
                                    )}
                                    title={`${apt.customer} - ${apt.service}`}
                                  >
                                    <div className="truncate">{apt.customer}</div>
                                    <div className="opacity-90 truncate">{apt.service}</div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Month View */}
            {viewMode === 'month' && (
              <div className="min-w-[700px] grid grid-cols-7 border-collapse bg-white divide-x-2 divide-y-2 divide-black">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="h-10 bg-gray-50 flex items-center justify-center text-xs font-black text-gray-700 uppercase tracking-widest border-b-2 border-black">
                    {d}
                  </div>
                ))}
                {getMonthDays().map((day, idx) => {
                  const dayStr = day.toISOString().split('T')[0];
                  const inCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const apts = getAppointmentsForDate(dayStr);
                  const isToday = dayStr === new Date().toISOString().split('T')[0];
                  
                  return (
                    <div 
                      key={idx} 
                      className={cn(
                        "h-28 p-2 flex flex-col justify-between hover:bg-gray-50 transition-colors",
                        inCurrentMonth ? "bg-white text-gray-900" : "bg-gray-50 text-gray-400"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "text-xs font-black p-1",
                          isToday && "bg-[#003580] text-white font-black px-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        )}>
                          {day.getDate()}
                        </span>
                        {apts.length > 0 && (
                          <span className="text-[10px] font-black text-[#003580] bg-blue-50 border border-[#003580] px-1.5 py-0.5 rounded-none">
                            {apts.length} jobs
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-1 space-y-1 overflow-y-auto max-h-16 flex-grow">
                        {apts.slice(0, 3).map(apt => (
                          <div 
                            key={apt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/vendor/bookings');
                            }}
                            className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 border border-black shadow-[0.5px_0.5px_0px_0px_rgba(0,0,0,1)] truncate cursor-pointer rounded-none hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all",
                              getStatusColor(apt.status)
                            )}
                            title={`${apt.customer}: ${apt.service}`}
                          >
                            {apt.time.split(' ')[0]} {apt.customer}
                          </div>
                        ))}
                        {apts.length > 3 && (
                          <div className="text-[7px] text-gray-500 font-bold text-center">
                            + {apts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorCalendar;
