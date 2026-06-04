import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Calendar, 
  Percent, 
  Gift, 
  DollarSign, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_type: 'percent' | 'fixed' | 'freebie' | string;
  discount_value: number;
  promo_code?: string;
  usage_limit?: number | null;
  used_count: number;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'inactive' | string;
}

const VendorPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    discountType: 'percent',
    discountValue: '',
    promoCode: '',
    usageLimit: '',
    startsAt: '',
    endsAt: '',
    status: 'active'
  });

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vendor/promotions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPromotions(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleOpenAdd = () => {
    setEditingPromo(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];
    
    setForm({
      title: '',
      description: '',
      discountType: 'percent',
      discountValue: '10',
      promoCode: '',
      usageLimit: '',
      startsAt: today,
      endsAt: nextMonthStr,
      status: 'active'
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Promotion) => {
    setEditingPromo(p);
    setForm({
      title: p.title || '',
      description: p.description || '',
      discountType: p.discount_type || 'percent',
      discountValue: String(p.discount_value || 0),
      promoCode: p.promo_code || '',
      usageLimit: p.usage_limit ? String(p.usage_limit) : '',
      startsAt: p.starts_at ? p.starts_at.split('T')[0] : '',
      endsAt: p.ends_at ? p.ends_at.split('T')[0] : '',
      status: p.status || 'active'
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim() || !form.discountValue || !form.startsAt || !form.endsAt) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        discountType: form.discountType,
        discount_type: form.discountType,
        discountValue: Number(form.discountValue),
        discount_value: Number(form.discountValue),
        promoCode: form.promoCode.trim().toUpperCase(),
        promo_code: form.promoCode.trim().toUpperCase(),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        usage_limit: form.usageLimit ? Number(form.usageLimit) : null,
        startsAt: form.startsAt,
        starts_at: form.startsAt,
        endsAt: form.endsAt,
        ends_at: form.endsAt,
        status: form.status
      };

      let res;
      if (editingPromo) {
        res = await fetch(`/api/vendor/promotions/${editingPromo.id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/vendor/promotions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setShowModal(false);
        fetchPromotions();
      } else {
        const data = await res.json();
        setFormError(data.message || 'Failed to save promotion');
      }
    } catch (err) {
      setFormError('Network error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vendor/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPromotions(prev => prev.filter(p => p.id !== id));
      } else {
        alert('Failed to delete promotion');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  // Computations
  const todayStr = new Date().toISOString().split('T')[0];
  
  const activeCount = promotions.filter(p => {
    const isLive = p.status === 'active';
    const beforeEnd = p.ends_at ? p.ends_at >= todayStr : true;
    const afterStart = p.starts_at ? p.starts_at <= todayStr : true;
    return isLive && beforeEnd && afterStart;
  }).length;

  const totalRedemptions = promotions.reduce((sum, p) => sum + (p.used_count || 0), 0);
  
  // Mock Revenue from deals (each redemption estimates average savings of AED 50 or total booking values)
  const mockRevenue = totalRedemptions * 180;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Promotions & Deals</h1>
          <p className="text-gray-500">Create and manage special offers to attract more customers to your garage.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="border-2 border-black bg-[#003580] text-white px-4 py-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" /> Create New Promotion
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all rounded-none">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 border border-black p-2 rounded-none">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Deals</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">{activeCount}</p>
        </div>
        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all rounded-none">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 border border-black p-2 rounded-none">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Redemptions</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">{totalRedemptions}</p>
        </div>
        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all rounded-none">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 border border-black p-2 rounded-none">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Revenue from Deals</h3>
          </div>
          <p className="text-3xl font-black text-gray-900">AED {mockRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Promotions List */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
          <p className="text-sm font-bold">Loading deals and offers...</p>
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-white p-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-bold">No promotions found</p>
          <p className="text-sm">Create a new promotion to begin marketing discounts to customers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((promo) => {
            const isExpired = promo.ends_at && promo.ends_at < todayStr;
            const isLive = promo.status === 'active' && !isExpired;
            
            return (
              <div 
                key={promo.id} 
                className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all rounded-none overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "p-2 border-2 border-black rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                        promo.discount_type === 'percent' ? "bg-red-100 text-red-700" :
                        promo.discount_type === 'freebie' ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {promo.discount_type === 'percent' ? <Percent className="h-5 w-5" /> :
                         promo.discount_type === 'freebie' ? <Gift className="h-5 w-5" /> :
                         <DollarSign className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 text-base leading-tight">{promo.title}</h3>
                        <p className="text-xs font-bold text-[#003580] mt-0.5">Code: {promo.promo_code || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-black px-2.5 py-1 border-2 border-black rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                      isLive ? "bg-green-100 text-green-800" : "bg-gray-150 text-gray-800"
                    )}>
                      {isLive ? 'Active' : isExpired ? 'Expired' : 'Paused'}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-gray-650 mb-6 leading-relaxed bg-gray-55 p-3 border border-gray-100 italic">
                    "{promo.description}"
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 border-2 border-black p-3 rounded-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Discount Value</p>
                      <p className="text-sm font-black text-gray-900">
                        {promo.discount_type === 'percent' ? `${promo.discount_value}% Off` :
                         promo.discount_type === 'freebie' ? 'Free Service' :
                         `AED ${promo.discount_value} Off`}
                      </p>
                    </div>
                    <div className="bg-gray-50 border-2 border-black p-3 rounded-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Usage / Limit</p>
                      <p className="text-sm font-black text-gray-900">
                        {promo.used_count || 0} / {promo.usage_limit || '∞'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                    <div className="flex items-center text-xs font-bold text-gray-550">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                      <span>{promo.starts_at ? new Date(promo.starts_at).toLocaleDateString() : 'Start'} - {promo.ends_at ? new Date(promo.ends_at).toLocaleDateString() : 'End'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenEdit(promo)}
                        className="p-2 border-2 border-black bg-white hover:bg-blue-50 text-gray-700 hover:-translate-y-0.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(promo.id, promo.title)}
                        className="p-2 border-2 border-black bg-white hover:bg-red-50 text-red-650 hover:-translate-y-0.5 transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
            <div className="bg-[#003580] p-6 text-white border-b-4 border-black flex justify-between items-center rounded-none">
              <h2 className="text-2xl font-black tracking-tight">{editingPromo ? 'Edit Promotion' : 'Create New Promotion'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200 border-2 border-white hover:bg-white hover:text-black p-1 transition-all rounded-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="border-2 border-black bg-red-50 p-3 text-red-800 text-sm font-bold flex items-center gap-2 rounded-none">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}
              
              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Promotion Title *</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Ramadan Special 15%"
                  className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                  required 
                />
              </div>

              <div>
                <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Description</label>
                <textarea 
                  rows={2} 
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="E.g. Get 15% discount on all bookings made during Ramadan."
                  className="w-full p-3 border-2 border-black mt-1 text-sm outline-none resize-none focus:ring-2 focus:ring-[#003580] rounded-none font-bold" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Discount Type</label>
                  <select 
                    value={form.discountType} 
                    onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none font-bold"
                  >
                    <option value="percent">Percentage Off</option>
                    <option value="fixed">Fixed AED Discount</option>
                    <option value="freebie">Free Addon / Service</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Discount Value *</label>
                  <input 
                    type="number" 
                    min="0"
                    value={form.discountValue} 
                    onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Promo Code</label>
                  <input 
                    type="text" 
                    value={form.promoCode} 
                    onChange={e => setForm(f => ({ ...f, promoCode: e.target.value }))}
                    placeholder="e.g. RAMADAN15"
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none uppercase font-black" 
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Usage Limit</label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="Unlimited"
                    value={form.usageLimit} 
                    onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Start Date *</label>
                  <input 
                    type="date" 
                    value={form.startsAt} 
                    onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none font-bold" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">End Date *</label>
                  <input 
                    type="date" 
                    value={form.endsAt} 
                    onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))}
                    className="w-full p-3 border-2 border-black mt-1 text-sm outline-none focus:ring-2 focus:ring-[#003580] rounded-none font-bold" 
                    required 
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="promoStatus"
                  checked={form.status === 'active'}
                  onChange={e => setForm(f => ({ ...f, status: e.target.checked ? 'active' : 'inactive' }))}
                  className="h-4 w-4 border-2 border-black text-[#003580] focus:ring-[#003580] rounded-none"
                />
                <label htmlFor="promoStatus" className="ml-2 text-sm font-bold text-gray-700 cursor-pointer">Active and live for customers</label>
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
                  {saving ? 'Saving...' : editingPromo ? 'Save Changes' : 'Create Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorPromotions;
