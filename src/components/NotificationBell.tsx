import React, { useState, useRef, useEffect } from 'react';
import { Bell, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Props {
  userId: string;
  role: 'customer' | 'vendor' | 'admin';
}

export function NotificationBell({ userId, role }: Props) {
  const { notifications, unreadCount } = useNotifications(userId);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/notifications/read-all`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleNotificationClick = async (n: any) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/notifications/${n.id}/read`, {
        method: 'PATCH',
        headers,
      });

      // Handle navigation
      const bookingId = n.metadata?.bookingId || n.metadata?.booking_id;
      if (bookingId) {
        if (role === 'vendor') {
          navigate('/vendor/bookings');
        } else if (role === 'admin') {
          navigate('/admin/bookings');
        } else {
          navigate('/my-bookings');
        }
      }
      setOpen(false);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setOpen(!open)} 
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer select-none"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white
            text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl
          border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <span className="font-bold text-gray-900 text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button 
                type="button"
                onClick={handleMarkAllRead} 
                className="text-xs text-red-600 hover:text-red-700 font-bold cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <ShieldCheck className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">No notifications</p>
                <p className="text-xs text-gray-400 mt-1">You are all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button 
                  type="button"
                  key={n.id} 
                  onClick={() => handleNotificationClick(n)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors cursor-pointer text-left border-l-4 border-red-600 block focus:outline-none"
                >
                  <p className="text-sm font-bold text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.body}</p>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2 block">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
