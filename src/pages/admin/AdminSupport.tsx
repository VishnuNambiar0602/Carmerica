import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, MoreVertical, Send, User, Building2, Check, X, Clock, Paperclip, Smile, Phone, Video, ShieldAlert, AlertCircle, CheckCircle2, Flag, Trash2, Edit } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  user?: {
    full_name?: string;
    email?: string;
  };
}

const AdminSupport = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals / State
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    message: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    userId: ''
  });

  const [showResolveModal, setShowResolveModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [resolving, setResolving] = useState(false);

  // Dropdown menus
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/support', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch support tickets');
      }
      const data = await res.json();
      setTickets(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.subject.trim() || !newTicketForm.message.trim()) {
      alert('Please fill out subject and message');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: newTicketForm.subject,
          message: newTicketForm.message,
          priority: newTicketForm.priority,
          userId: newTicketForm.userId || 'platform-admin',
          status: 'open'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create ticket');
      }

      const created = await res.json();
      setTickets(prev => [created, ...prev]);
      setShowNewTicketModal(false);
      setNewTicketForm({ subject: '', message: '', priority: 'medium', userId: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to create ticket');
    }
  };

  const handleUpdateStatus = async (id: string, status: Ticket['status']) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        throw new Error('Failed to update ticket status');
      }

      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      setActiveDropdownId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAssignToMe = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assigned_to: 'admin' }) // Simulating assigned to logged in admin
      });

      if (!res.ok) {
        throw new Error('Failed to assign ticket');
      }

      setTickets(prev => prev.map(t => t.id === id ? { ...t, assigned_to: 'admin' } : t));
      setActiveDropdownId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to assign ticket');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm('Are you sure you want to delete this support ticket permanently?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete support ticket');
      }

      setTickets(prev => prev.filter(t => t.id !== id));
      setActiveDropdownId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete ticket');
    }
  };

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;
    setResolving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/support/${activeTicket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'resolved',
          admin_response: responseMessage
        })
      });

      if (!res.ok) {
        throw new Error('Failed to resolve support ticket');
      }

      setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, status: 'resolved' } : t));
      setShowResolveModal(false);
      setActiveTicket(null);
      setResponseMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to resolve ticket');
    } finally {
      setResolving(false);
    }
  };

  // Compute stats
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress' || t.status === 'in-progress' as any).length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;
  const resolvedToday = tickets.filter(t => {
    return t.status === 'resolved' && new Date(t.updated_at || t.created_at).toDateString() === new Date().toDateString();
  }).length;

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchSearch = !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.message.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.user?.full_name || t.user_id || '').toLowerCase().includes(search.toLowerCase());

    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter || 
      (statusFilter === 'in_progress' && (t.status === 'in_progress' || t.status === 'in-progress' as any));

    return matchSearch && matchPriority && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Desk</h1>
          <p className="text-gray-500">Manage customer and vendor support tickets, inquiries, and disputes.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <button
            onClick={() => setShowNewTicketModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center transition-colors"
          >
            <MessageSquare className="h-4 w-4 mr-2" /> New Ticket
          </button>
        </div>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Open Tickets</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{openCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">In Progress</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Resolved Today</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{resolvedToday} <span className="text-xs font-normal text-gray-400">({resolvedCount} total)</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Flag className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Response</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">1.5h</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold mr-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg p-1.5 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold mr-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg p-1.5 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="text-gray-500 text-sm">Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No support tickets match the filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Subject & Message</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-red-600">
                      {ticket.id.startsWith('ticket-') ? `#${ticket.id.substring(7)}` : `#${ticket.id}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {ticket.user?.full_name || 'Customer'}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            {ticket.user_id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs md:max-w-md">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{ticket.message}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                        ticket.priority === 'high' ? "bg-red-100 text-red-700" :
                        ticket.priority === 'medium' ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                        ticket.status === 'open' ? "bg-red-100 text-red-700" :
                        (ticket.status === 'in_progress' || ticket.status === 'in-progress' as any) ? "bg-yellow-100 text-yellow-700" :
                        ticket.status === 'resolved' ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        {(ticket.status === 'in_progress' || ticket.status === 'in-progress' as any) ? 'In Progress' : ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ticket.assigned_to ? (
                        <span className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {ticket.assigned_to}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 relative">
                        <button
                          onClick={() => {
                            setActiveTicket(ticket);
                            setResponseMessage('');
                            setShowResolveModal(true);
                          }}
                          title="Respond / Resolve"
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdownId(activeDropdownId === ticket.id ? null : ticket.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {activeDropdownId === ticket.id && (
                            <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 text-left">
                              {!ticket.assigned_to && (
                                <button
                                  onClick={() => handleAssignToMe(ticket.id)}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                >
                                  Assign to Me
                                </button>
                              )}
                              {(ticket.status === 'open') && (
                                <button
                                  onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                >
                                  Mark In Progress
                                </button>
                              )}
                              {ticket.status !== 'resolved' && (
                                <button
                                  onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                >
                                  Mark Resolved
                                </button>
                              )}
                              {ticket.status !== 'closed' && (
                                <button
                                  onClick={() => handleUpdateStatus(ticket.id, 'closed')}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                >
                                  Mark Closed
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteTicket(ticket.id)}
                                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-1 border-t border-gray-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete Ticket
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative border border-gray-200">
            <button
              onClick={() => setShowNewTicketModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Refund requested by customer"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">User Email / ID</label>
                <input
                  type="text"
                  value={newTicketForm.userId}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="customer@email.com (optional)"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Priority</label>
                <select
                  value={newTicketForm.priority}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Description Message</label>
                <textarea
                  required
                  rows={4}
                  value={newTicketForm.message}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Detailed description of the issue..."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Respond/Resolve Ticket Modal */}
      {showResolveModal && activeTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative border border-gray-200">
            <button
              onClick={() => {
                setShowResolveModal(false);
                setActiveTicket(null);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Respond and Resolve Ticket</h2>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-red-600">Ticket ID: #{activeTicket.id}</span>
                <span className="text-gray-400">{new Date(activeTicket.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm font-bold text-gray-800">{activeTicket.subject}</p>
              <p className="text-xs text-gray-600 whitespace-pre-wrap">{activeTicket.message}</p>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                <span>User: {activeTicket.user?.full_name || activeTicket.user_id || 'Platform User'}</span>
                <span className="capitalize">Priority: {activeTicket.priority}</span>
              </div>
            </div>

            <form onSubmit={handleResolveTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Response Message</label>
                <textarea
                  required
                  rows={4}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Type a response to the user. This ticket will be marked as Resolved."
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResolveModal(false);
                    setActiveTicket(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {resolving ? 'Resolving...' : 'Send & Mark Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
