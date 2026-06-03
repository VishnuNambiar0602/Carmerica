import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Plus, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Send,
  Sparkles,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Support() {
  const [tickets, setBookings] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // 3D Tilt states
  const [formTilt, setFormTilt] = useState({ x: 0, y: 0 });
  const [cardTilts, setCardTilts] = useState<Record<string, { x: number; y: number }>>({});

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/support/tickets', { headers });
      if (res.ok) {
        const data = await res.json();
        setBookings(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers,
        body: JSON.stringify({ subject, message, priority })
      });
      if (res.ok) {
        setSubject('');
        setMessage('');
        setPriority('medium');
        setShowForm(false);
        fetchTickets();
        alert('Support ticket created successfully!');
      } else {
        alert('Failed to create ticket.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <LifeBuoy className="h-10 w-10 text-red-600" /> Support Center
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Track your help requests or open a new support ticket with our team.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-700 flex items-center justify-center gap-2 shadow-xl shadow-red-600/20 transition-all active:scale-95 cursor-pointer"
        >
          {showForm ? 'Cancel Request' : 'Open Support Ticket'} <Plus className={cn("h-5 w-5 transition-transform", showForm && "rotate-45")} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Ticket Form */}
        <div className={cn("lg:col-span-2 space-y-8", !showForm && "hidden lg:block")}>
          <div 
            onMouseMove={(e) => {
              const card = e.currentTarget;
              const box = card.getBoundingClientRect();
              const x = e.clientX - box.left - box.width / 2;
              const y = e.clientY - box.top - box.height / 2;
              const factorX = 6 / (box.height / 2);
              const factorY = 6 / (box.width / 2);
              setFormTilt({ x: -y * factorX, y: x * factorY });
            }}
            onMouseLeave={() => setFormTilt({ x: 0, y: 0 })}
            style={{
              transform: `perspective(1000px) rotateX(${formTilt.x}deg) rotateY(${formTilt.y}deg)`,
              transition: 'transform 0.15s ease-out',
              transformStyle: 'preserve-3d',
            }}
            className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-red-600" /> Create New Ticket
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  placeholder="e.g. Booking reschedule request" 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-gray-900"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Priority</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-gray-900 appearance-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Priority</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message Details</label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  rows={5}
                  placeholder="Please describe your issue in detail..." 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-gray-900"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-red-600/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Support Request'} <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Existing Tickets list */}
        <div className={cn("lg:col-span-1 space-y-6", showForm && "hidden lg:block")}>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600" /> Active Tickets
          </h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500 font-medium">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 p-6 flex flex-col items-center">
              <HelpCircle className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-bold text-gray-900 mb-1">No Support Tickets</p>
              <p className="text-xs text-gray-400 text-center">If you need help, open a new ticket above.</p>
            </div>
          ) : (
            tickets.map((t) => {
              const tilt = cardTilts[t.id] || { x: 0, y: 0 };
              return (
                <div 
                  key={t.id}
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const box = card.getBoundingClientRect();
                    const x = e.clientX - box.left - box.width / 2;
                    const y = e.clientY - box.top - box.height / 2;
                    const factorX = 12 / (box.height / 2);
                    const factorY = 12 / (box.width / 2);
                    setCardTilts(prev => ({
                      ...prev,
                      [t.id]: { x: -y * factorX, y: x * factorY }
                    }));
                  }}
                  onMouseLeave={() => setCardTilts(prev => ({
                    ...prev,
                    [t.id]: { x: 0, y: 0 }
                  }))}
                  style={{
                    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    transition: 'transform 0.15s ease-out',
                    transformStyle: 'preserve-3d',
                  }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                      t.status === 'open' ? "bg-red-50 text-red-600" :
                      t.status === 'resolved' ? "bg-green-50 text-green-600" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      {t.status}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                      #{t.id}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{t.subject}</h3>
                  <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">{t.message}</p>
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50 pt-4">
                    <span>Priority: <span className="text-gray-900">{t.priority}</span></span>
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
