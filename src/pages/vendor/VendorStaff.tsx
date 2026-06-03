import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Shield, Mail, Phone, Star, AlertCircle, Loader2, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StaffMember {
  id: string;
  vendor_id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  active: boolean;
}

const StaffCard = ({ member, onEdit, onDelete }: { member: StaffMember; onEdit: (m: StaffMember) => void; onDelete: (id: string) => void }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <div 
      onMouseMove={(e) => {
        const card = e.currentTarget;
        const box = card.getBoundingClientRect();
        const x = e.clientX - box.left - box.width / 2;
        const y = e.clientY - box.top - box.height / 2;
        const factorX = 12 / (box.height / 2);
        const factorY = 12 / (box.width / 2);
        setTilt({ x: -y * factorX, y: x * factorY });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all p-6 relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center font-bold text-lg text-[#003580] shadow-inner">
            {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{member.name}</h3>
            <p className="text-sm text-[#003580] font-bold mt-0.5">{member.role}</p>
          </div>
        </div>
        <span className={cn(
          "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider",
          member.active ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        )}>
          {member.active ? 'Active' : 'On Leave'}
        </span>
      </div>

      <div className="space-y-2.5 mb-6 text-sm text-gray-500">
        {member.email && (
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-3 text-gray-400 shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>
        )}
        {member.phone && (
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-3 text-gray-400 shrink-0" />
            <span>{member.phone}</span>
          </div>
        )}
        {!member.email && !member.phone && (
          <p className="text-xs text-gray-400 italic">No contact information</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(member)} 
            className="p-2 hover:bg-blue-50 rounded-xl transition-colors text-blue-600 cursor-pointer"
            title="Edit Staff"
          >
            <Edit3 className="h-4.5 w-4.5" />
          </button>
          <button 
            onClick={() => onDelete(member.id)} 
            className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-600 cursor-pointer"
            title="Delete Staff"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="flex items-center text-xs font-bold text-gray-400">
          <Shield className="h-3.5 w-3.5 mr-1" />
          <span>Assigned to Jobs</span>
        </div>
      </div>
    </div>
  );
};

const VendorStaff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Technician');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [active, setActive] = useState(true);
  
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [tiltModal, setTiltModal] = useState({ x: 0, y: 0 });

  const fetchStaff = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vendor/staff', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      } else {
        setError('Failed to fetch staff members.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Failed to load staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedId('');
    setName('');
    setRole('Technician');
    setEmail('');
    setPhone('');
    setActive(true);
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setIsEditing(true);
    setSelectedId(member.id);
    setName(member.name);
    setRole(member.role);
    setEmail(member.email || '');
    setPhone(member.phone || '');
    setActive(member.active);
    setModalError('');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vendor/staff/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setStaff(prev => prev.filter(s => s.id !== id));
      } else {
        alert('Failed to delete staff member.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setModalError('Staff name is required');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setModalError('Provide at least email or phone number');
      return;
    }
    setModalLoading(true);
    setModalError('');

    const token = localStorage.getItem('token');
    const url = isEditing ? `/api/vendor/staff/${selectedId}` : '/api/vendor/staff';
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          role,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          active
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (isEditing) {
          setStaff(prev => prev.map(s => s.id === selectedId ? data : s));
        } else {
          setStaff(prev => [...prev, data]);
        }
        setShowModal(false);
      } else {
        setModalError(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      setModalError('Network error. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Management</h1>
          <p className="text-gray-500 mt-1">Manage mechanics, service advisors, and assign them to diagnostic jobs.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#003580] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#00224f] transition-all shadow-xl shadow-blue-600/10 flex items-center cursor-pointer select-none"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Staff Member
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#003580]" />
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No staff members listed</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">Add technicians and support personnel to track assignments and performance.</p>
          <button 
            onClick={handleOpenAdd}
            className="mt-6 bg-[#003580] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#00224f] transition-all inline-flex items-center cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" /> Add First Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {staff.map((member) => (
            <StaffCard 
              key={member.id} 
              member={member} 
              onEdit={handleOpenEdit} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div 
            onMouseMove={(e) => {
              const card = e.currentTarget;
              const box = card.getBoundingClientRect();
              const x = e.clientX - box.left - box.width / 2;
              const y = e.clientY - box.top - box.height / 2;
              const factorX = 8 / (box.height / 2);
              const factorY = 8 / (box.width / 2);
              setTiltModal({ x: -y * factorX, y: x * factorY });
            }}
            onMouseLeave={() => setTiltModal({ x: 0, y: 0 })}
            style={{
              transform: `perspective(1000px) rotateX(${tiltModal.x}deg) rotateY(${tiltModal.y}deg)`,
              transition: 'transform 0.1s ease-out',
              transformStyle: 'preserve-3d',
            }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden max-w-lg w-full"
          >
            <div className="bg-gradient-to-r from-[#003580] to-[#005999] p-8 text-white relative">
              <h2 className="text-2xl font-bold flex items-center">
                <Shield className="h-6 w-6 mr-3 text-[#feba02]" />
                {isEditing ? 'Edit Staff Member' : 'Add Staff Member'}
              </h2>
              <p className="text-white/80 mt-1">Complete the details below to update your garage team list.</p>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-2xl flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Robert Wilson"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setModalError(''); }}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#003580] outline-none font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#003580] outline-none font-medium appearance-none"
                  >
                    <option value="Technician">Technician</option>
                    <option value="Senior Mechanic">Senior Mechanic</option>
                    <option value="Service Advisor">Service Advisor</option>
                    <option value="Manager">Manager</option>
                    <option value="Receptionist">Receptionist</option>
                  </select>
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-[#003580] focus:ring-[#003580] cursor-pointer"
                    />
                    <span className="text-sm font-bold text-gray-700">Active Status</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. robert@elitemotors.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setModalError(''); }}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#003580] outline-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +971 50 123 4567"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setModalError(''); }}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#003580] outline-none font-medium"
                />
              </div>

              <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-4 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-[#003580] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#00224f] transition-all shadow-xl shadow-blue-600/10 flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {modalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorStaff;
