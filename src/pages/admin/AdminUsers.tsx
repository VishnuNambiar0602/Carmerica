import React, { useState, useEffect } from 'react';
import { User, Search, Filter, Shield, Mail, Phone, Calendar, Loader2, ArrowUpRight, ArrowDownRight, UserCheck, UserX, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  status: string; // 'active' | 'disabled'
  role: string;
  created_at: string;
}

const MetricCard = ({ title, value, icon: Icon, color, bg }: { title: string; value: string | number; icon: any; color: string; bg: string }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return (
    <div 
      onMouseMove={(e) => {
        const card = e.currentTarget;
        const box = card.getBoundingClientRect();
        const x = e.clientX - box.left - box.width / 2;
        const y = e.clientY - box.top - box.height / 2;
        const factorX = 10 / (box.height / 2);
        const factorY = 10 / (box.width / 2);
        setTilt({ x: -y * factorX, y: x * factorY });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all flex items-center justify-between"
    >
      <div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</span>
        <p className="text-3xl font-black text-gray-900 mt-2">{value}</p>
      </div>
      <div className={cn("p-4 rounded-xl", bg)}>
        <Icon className={cn("h-6 w-6", color)} />
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'customer' | 'vendor' | 'admin'>('all');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError('Failed to fetch users list.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    const action = newStatus === 'disabled' ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      } else {
        alert(`Failed to ${action} user.`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user permanently? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        alert('Failed to delete user.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  // Metrics calculations
  const totalCount = users.length;
  const activeCount = users.filter(u => u.status === 'active').length;
  const disabledCount = users.filter(u => u.status === 'disabled').length;

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && u.role === filter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-1">Manage registered customer, vendor, and administrator accounts.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard title="Total Users" value={loading ? '...' : totalCount} icon={User} color="text-blue-600" bg="bg-blue-50" />
        <MetricCard title="Active Accounts" value={loading ? '...' : activeCount} icon={UserCheck} color="text-green-600" bg="bg-green-50" />
        <MetricCard title="Suspended Accounts" value={loading ? '...' : disabledCount} icon={UserX} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:bg-white transition-all font-semibold"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'customer', 'vendor', 'admin'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer",
                filter === opt
                  ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-100"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              )}
            >
              {opt === 'all' ? 'All Roles' : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No users found</h3>
          <p className="text-sm text-gray-400 mt-1">There are no users matching your query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">User</th>
                  <th className="px-8 py-5">Contact Info</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Joined</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-4 text-sm font-bold text-gray-500 border border-gray-50 shadow-inner">
                          {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-600">
                          <Mail className="h-3.5 w-3.5 mr-2 text-gray-400 shrink-0" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Phone className="h-3.5 w-3.5 mr-2 text-gray-400 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider",
                        user.role === 'admin' ? "bg-red-100 text-red-700" :
                        user.role === 'vendor' ? "bg-purple-100 text-purple-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider",
                        user.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer",
                            user.status === 'active'
                              ? "bg-red-50 hover:bg-red-100 text-red-700"
                              : "bg-green-50 hover:bg-green-100 text-green-700"
                          )}
                        >
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
