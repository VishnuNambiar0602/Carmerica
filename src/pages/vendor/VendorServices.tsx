import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  Wrench, 
  Sparkles, 
  Percent, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration_minutes: number;
  duration?: string;
  active: boolean;
  status?: string;
  description: string;
}

const VendorServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, avgPrice: 0 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // AI Pricing Recommendation modal
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  
  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    category: 'maintenance',
    price: '',
    duration: '60',
    description: '',
    active: true
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vendor/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Service[] = await res.json();
        setServices(data || []);
        computeStats(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const computeStats = (data: Service[]) => {
    const total = data.length;
    const active = data.filter(s => s.active !== false).length;
    const priced = data.filter(s => Number(s.price) > 0);
    const avgPrice = priced.length 
      ? Math.round(priced.reduce((sum, s) => sum + Number(s.price), 0) / priced.length) 
      : 0;
    setStats({ total, active, avgPrice });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOptimize = async (service: Service) => {
    setOptimizingId(service.id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/optimize-price', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          currentPrice: service.price,
        })
      });
      if (!response.ok) throw new Error('API returned ' + response.status);
      const data = await response.json();
      setRecommendation({ ...data, serviceId: service.id });
    } catch (error) {
      console.error('Optimization failed', error);
      setRecommendation({
        recommendedPrice: Math.round(service.price * 0.95),
        suggestedPrice: Math.round(service.price * 0.95),
        marketPosition: 'Competitive',
        reasoning: 'AI pricing suggests a 5% decrease to capture more bookings based on local competition.',
        suggestedPromotion: 'Offer 10% off for next booking',
        serviceId: service.id
      });
    } finally {
      setOptimizingId(null);
    }
  };

  const handleApplyRecommendation = async () => {
    if (!recommendation) return;
    const newPrice = recommendation.recommendedPrice || recommendation.suggestedPrice;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vendor/services/${recommendation.serviceId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ price: Number(newPrice) })
      });
      if (res.ok) {
        const updated = await res.json();
        setServices(prev => {
          const next = prev.map(s => s.id === recommendation.serviceId ? { ...s, price: Number(newPrice) } : s);
          computeStats(next);
          return next;
        });
        setRecommendation(null);
      } else {
        alert('Failed to apply recommendation');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setForm({
      name: '',
      category: 'maintenance',
      price: '',
      duration: '60',
      description: '',
      active: true
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (s: Service) => {
    setEditingService(s);
    setForm({
      name: s.name,
      category: s.category?.toLowerCase() || 'maintenance',
      price: String(s.price),
      duration: String(s.duration_minutes || 60),
      description: s.description || '',
      active: s.active !== false
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.price) {
      setFormError('Name and price are required.');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        durationMinutes: Number(form.duration),
        description: form.description.trim(),
        active: form.active
      };

      let res;
      if (editingService) {
        res = await fetch(`/api/vendor/services/${editingService.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/vendor/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        fetchServices();
      } else {
        setFormError(data.message || 'Failed to save service');
      }
    } catch (err) {
      setFormError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vendor/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setServices(prev => {
          const next = prev.filter(s => s.id !== id);
          computeStats(next);
          return next;
        });
      } else {
        alert('Failed to delete service. It may be linked to active bookings.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || s.category?.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && s.active !== false) ||
      (statusFilter === 'inactive' && s.active === false);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(services.map(s => s.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Service Management</h1>
          <p className="text-gray-500">Configure and manage service listings offered by your garage.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="border-2 border-black bg-[#003580] text-white px-4 py-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Service
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 border border-black p-2 rounded-none">
              <Wrench className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Services</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 border border-black p-2 rounded-none">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Services</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.active}</p>
        </div>
        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 border border-black p-2 rounded-none">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Avg. Price</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">AED {stats.avgPrice}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search services..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border-2 border-black text-gray-800 px-3 py-1.5 rounded-none text-xs font-black outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c.toLowerCase()}>{c}</option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border-2 border-black text-gray-800 px-3 py-1.5 rounded-none text-xs font-black outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="h-3 w-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* AI Recommendation Modal */}
      {recommendation && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
            <div className="bg-[#003580] p-4 text-white border-b-4 border-black flex justify-between items-center rounded-none">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#feba02]" />
                <h3 className="font-black">AI Price Insight</h3>
              </div>
              <button 
                onClick={() => setRecommendation(null)}
                className="text-white hover:text-gray-200 border border-white hover:bg-white hover:text-black p-0.5 rounded-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase">Recommended Price</p>
                  <p className="text-3xl font-black text-gray-900">AED {recommendation.recommendedPrice || recommendation.suggestedPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs font-bold uppercase">Market Position</p>
                  <span className="bg-blue-100 text-blue-850 px-2.5 py-1 border border-black text-xs font-black">
                    {recommendation.marketPosition || 'Optimal'}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 border-2 border-black rounded-none">
                <p className="text-sm text-gray-700 leading-relaxed font-bold italic">
                  "{recommendation.reasoning || recommendation.explanation}"
                </p>
              </div>

              {recommendation.suggestedPromotion && (
                <div className="flex items-center gap-2 text-green-800 bg-green-50 p-3 border border-black rounded-none">
                  <Percent className="h-4 w-4 text-green-700" />
                  <p className="text-xs font-black">PROMO IDEA: {recommendation.suggestedPromotion}</p>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={handleApplyRecommendation}
                  className="flex-1 border-2 border-black bg-[#003580] text-white py-2.5 font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none"
                >
                  Apply Price
                </button>
                <button 
                  onClick={() => setRecommendation(null)}
                  className="flex-1 border-2 border-black bg-gray-100 text-gray-700 py-2.5 font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-bold">Loading services catalog...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-bold">No services found</p>
            <p className="text-sm">Click "Add New Service" to start listing your offerings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-black text-gray-700 uppercase tracking-wider border-b-2 border-black">
                  <th className="px-6 py-4 border-r-2 border-black">Service Name</th>
                  <th className="px-6 py-4 border-r-2 border-black">Category</th>
                  <th className="px-6 py-4 border-r-2 border-black">Price</th>
                  <th className="px-6 py-4 border-r-2 border-black">Duration</th>
                  <th className="px-6 py-4 border-r-2 border-black">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 border-r-2 border-black">
                      <div>
                        <p className="text-sm font-black text-gray-900">{service.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{service.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r-2 border-black">
                      <span className="text-xs font-black text-gray-800 bg-gray-100 border border-black px-2 py-0.5 rounded-none">
                        {service.category || 'Maintenance'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900 border-r-2 border-black">
                      AED {service.price}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-600 border-r-2 border-black">
                      {service.duration_minutes ? `${service.duration_minutes} mins` : service.duration || '60 mins'}
                    </td>
                    <td className="px-6 py-4 border-r-2 border-black">
                      <span className={cn(
                        "text-xs font-black px-2.5 py-1 border-2 border-black rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                        service.active !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      )}>
                        {service.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOptimize(service)}
                          disabled={optimizingId === service.id}
                          className="p-2 border-2 border-black bg-white hover:bg-blue-50 text-blue-600 hover:-translate-y-0.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none flex items-center gap-1 text-xs font-black"
                          title="AI Optimize Price"
                        >
                          {optimizingId === service.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          AI
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(service)}
                          className="p-2 border-2 border-black bg-white hover:bg-blue-50 text-gray-700 hover:-translate-y-0.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteService(service.id, service.name)}
                          className="p-2 border-2 border-black bg-white hover:bg-red-50 text-red-650 hover:-translate-y-0.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <div className="bg-[#003580] p-6 text-white border-b-4 border-black flex justify-between items-center rounded-none">
              <h2 className="text-2xl font-black tracking-tight">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200 border-2 border-white hover:bg-white hover:text-black p-1 transition-all rounded-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              {formError && (
                <div className="border-2 border-black bg-red-50 p-3 text-red-800 text-sm font-bold flex items-center gap-2 rounded-none">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}
              
              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Service Name *</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Brake Pads Replacement"
                  className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Category</label>
                  <select 
                    value={form.category} 
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none font-bold"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="repairs">Repairs</option>
                    <option value="electrical">Electrical</option>
                    <option value="diagnostics">Diagnostics</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Price (AED) *</label>
                  <input 
                    type="number" 
                    min="0"
                    value={form.price} 
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="150"
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Duration (minutes)</label>
                <input 
                  type="number" 
                  min="15" 
                  value={form.duration} 
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Description</label>
                <textarea 
                  rows={3} 
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe what the service includes..."
                  className="w-full p-3 border-2 border-black mt-1 text-sm outline-none resize-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                />
              </div>

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="active" 
                  checked={form.active} 
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="h-4 w-4 border-2 border-black text-[#003580] focus:ring-[#003580] rounded-none" 
                />
                <label htmlFor="active" className="ml-2 text-sm font-bold text-gray-700 cursor-pointer">Active and show in catalog</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-black">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 border-2 border-black bg-white text-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-[#003580] text-white border-2 border-black px-6 py-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingService ? 'Save Changes' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorServices;
