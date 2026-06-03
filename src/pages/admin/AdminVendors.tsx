import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter, ShieldCheck, Star, AlertCircle, MapPin, X, Building, CheckCircle2, ShieldAlert, Shield, ShieldAlert as SuspendedIcon, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface VendorRecord {
  id: string;
  name: string;
  owner_name?: string;
  email?: string;
  phone?: string;
  verified: boolean;
  active: boolean;
  rating?: number;
  reviews?: number;
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

const AdminVendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'suspended'>('all');

  const fetchVendors = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      } else {
        setError('Failed to fetch vendors list.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const action = currentActive ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this vendor?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !currentActive })
      });
      if (res.ok) {
        setVendors(prev => prev.map(v => v.id === id ? { ...v, active: !currentActive } : v));
      } else {
        alert(`Failed to ${action} vendor.`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleVerifyVendor = async (id: string, currentVerified: boolean) => {
    const action = currentVerified ? 'unverify' : 'verify';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verified: !currentVerified })
      });
      if (res.ok) {
        setVendors(prev => prev.map(v => v.id === id ? { ...v, verified: !currentVerified } : v));
      } else {
        alert(`Failed to ${action} vendor.`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  // Metrics calculations
  const totalCount = vendors.length;
  const verifiedCount = vendors.filter(v => v.verified).length;
  const pendingCount = vendors.filter(v => !v.verified && v.active).length;
  const suspendedCount = vendors.filter(v => !v.active).length;

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                          (v.owner_name && v.owner_name.toLowerCase().includes(search.toLowerCase()));
    
    if (filter === 'verified') return matchesSearch && v.verified;
    if (filter === 'pending') return matchesSearch && !v.verified && v.active;
    if (filter === 'suspended') return matchesSearch && !v.active;
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Vendor Management</h1>
          <p className="text-gray-500 mt-1">Manage registered garages, verification status, and credentials.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Vendors" value={loading ? '...' : totalCount} icon={Building2} color="text-blue-600" bg="bg-blue-50" />
        <MetricCard title="Verified" value={loading ? '...' : verifiedCount} icon={CheckCircle2} color="text-green-600" bg="bg-green-50" />
        <MetricCard title="Pending" value={loading ? '...' : pendingCount} icon={AlertCircle} color="text-yellow-600" bg="bg-yellow-50" />
        <MetricCard title="Suspended" value={loading ? '...' : suspendedCount} icon={X} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search vendors by name or owner..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:bg-white transition-all font-semibold"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'verified', 'pending', 'suspended'] as const).map((opt) => (
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
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
          <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No vendors found</h3>
          <p className="text-sm text-gray-400 mt-1">There are no vendors matching your search or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Vendor</th>
                  <th className="px-8 py-5">Owner / Contact</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Rating</th>
                  <th className="px-8 py-5">Joined</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mr-4 text-sm font-bold text-gray-500 border border-gray-50 shadow-inner">
                          {vendor.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{vendor.name}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {vendor.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-900">{vendor.owner_name || 'N/A'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{vendor.email || '-'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={cn(
                          "text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider",
                          vendor.verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        )}>
                          {vendor.verified ? 'Verified' : 'Unverified'}
                        </span>
                        <span className={cn(
                          "text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-1",
                          vendor.active ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                        )}>
                          {vendor.active ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <Star className="h-4.5 w-4.5 text-[#feba02] fill-current mr-1" />
                        <span className="text-sm font-bold text-gray-900">{vendor.rating || '4.7'}</span>
                        <span className="text-xs text-gray-400 ml-1">({vendor.reviews || '0'})</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleVerifyVendor(vendor.id, vendor.verified)}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer",
                            vendor.verified
                              ? "bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
                              : "bg-green-50 hover:bg-green-100 text-green-700"
                          )}
                        >
                          {vendor.verified ? 'Unverify' : 'Verify'}
                        </button>
                        <button 
                          onClick={() => handleToggleActive(vendor.id, vendor.active)}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer",
                            vendor.active
                              ? "bg-red-50 hover:bg-red-100 text-red-700"
                              : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                          )}
                        >
                          {vendor.active ? 'Suspend' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/vendor-kyv?vendorId=${vendor.id}`)}
                          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          KYV
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

export default AdminVendors;
