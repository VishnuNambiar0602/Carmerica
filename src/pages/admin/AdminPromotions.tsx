import React, { useState, useEffect, useMemo } from 'react';
import { Tag, Plus, Search, Check, X, DollarSign, Edit2, Trash2, Loader2, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

function formatDate(dStr: string) {
  if (!dStr) return '—';
  try {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dStr;
  }
}

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  
  // Controlled form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscountType, setFormDiscountType] = useState('percent');
  const [formDiscountValue, setFormDiscountValue] = useState(0);
  const [formPromoCode, setFormPromoCode] = useState('');
  const [formStartsAt, setFormStartsAt] = useState('');
  const [formEndsAt, setFormEndsAt] = useState('');
  const [formUsageLimit, setFormUsageLimit] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/promotions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPromotions(data);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Compute live stats
  const stats = useMemo(() => {
    const active = promotions.filter(p => p.status === 'active').length;
    const redemptions = promotions.reduce((sum, p) => sum + (Number(p.used_count) || 0), 0);
    // Simple revenue estimated from deals
    const estimatedValue = promotions.reduce((sum, p) => {
      const uses = Number(p.used_count) || 0;
      const value = Number(p.discount_value) || 0;
      return sum + (uses * (p.discount_type === 'fixed' ? value : 30)); // 30 is a placeholder avg discount for percent
    }, 0);
    return { active, redemptions, estimatedValue };
  }, [promotions]);

  // Client-side search
  const filteredPromotions = useMemo(() => {
    return promotions.filter(p => {
      const title = p.title || p.name || '';
      const matchSearch = !search ||
        title.toLowerCase().includes(search.toLowerCase()) ||
        p.promo_code?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [promotions, search]);

  const handleOpenAdd = () => {
    setEditingPromo(null);
    setFormTitle('');
    setFormDescription('');
    setFormDiscountType('percent');
    setFormDiscountValue(0);
    setFormPromoCode('');
    setFormStartsAt('');
    setFormEndsAt('');
    setFormUsageLimit('');
    setFormStatus('active');
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (promo: any) => {
    setEditingPromo(promo);
    setFormTitle(promo.title || promo.name || '');
    setFormDescription(promo.description || '');
    setFormDiscountType(promo.discount_type || 'percent');
    setFormDiscountValue(Number(promo.discount_value) || 0);
    setFormPromoCode(promo.promo_code || '');
    setFormStartsAt(promo.starts_at ? new Date(promo.starts_at).toISOString().split('T')[0] : '');
    setFormEndsAt(promo.ends_at ? new Date(promo.ends_at).toISOString().split('T')[0] : '');
    setFormUsageLimit(promo.usage_limit ? String(promo.usage_limit) : '');
    setFormStatus(promo.status || 'active');
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Promotion title is required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const token = localStorage.getItem('token');
      const url = editingPromo ? `/api/admin/promotions/${editingPromo.id}` : '/api/admin/promotions';
      const method = editingPromo ? 'PATCH' : 'POST';

      const payload = {
        title: formTitle.trim(),
        name: formTitle.trim(),
        description: formDescription.trim(),
        discountType: formDiscountType,
        discount_type: formDiscountType,
        discountValue: Number(formDiscountValue),
        discount_value: Number(formDiscountValue),
        promoCode: formPromoCode.trim() || null,
        promo_code: formPromoCode.trim() || null,
        startsAt: formStartsAt || null,
        starts_at: formStartsAt || null,
        endsAt: formEndsAt || null,
        ends_at: formEndsAt || null,
        usageLimit: formUsageLimit ? Number(formUsageLimit) : null,
        usage_limit: formUsageLimit ? Number(formUsageLimit) : null,
        status: formStatus
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        if (editingPromo) {
          setPromotions(prev => prev.map(p => p.id === editingPromo.id ? data : p));
        } else {
          setPromotions(prev => [...prev, data]);
        }
        setShowModal(false);
      } else {
        setFormError(data.message || 'Failed to save promotion.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promo: any) => {
    const promoTitle = promo.title || promo.name;
    if (!confirm(`Are you sure you want to delete promotion "${promoTitle}"? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/promotions/${promo.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPromotions(prev => prev.filter(p => p.id !== promo.id));
      } else {
        alert('Failed to delete promotion.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to the server.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Promotions</h1>
          <p className="text-gray-500">Create and manage platform-wide special offers and coupon codes.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Create New Promotion
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Deals</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : stats.active.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Redemptions</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : stats.redemptions.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Est. Deal Value</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : `AED ${stats.estimatedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          </p>
        </div>
      </div>

      {/* Promotions List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-bold text-gray-900">All Promotions</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search promotions..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
            <p className="text-gray-500 text-sm">Loading promotions...</p>
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-sm">No promotions found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Promotion Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Validity</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPromotions.map((promo) => {
                  const title = promo.title || promo.name || '—';
                  const isExpired = promo.ends_at && new Date(promo.ends_at).getTime() < Date.now();
                  const displayStatus = isExpired ? 'expired' : (promo.status || 'active').toLowerCase();
                  
                  return (
                    <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{title}</p>
                          <p className="text-xs text-gray-400 font-mono">
                            {promo.promo_code ? `CODE: ${promo.promo_code}` : 'PLATFORM AUTOMATIC'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full uppercase">
                          {promo.discount_type || 'percent'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-red-600">
                        {promo.discount_type === 'percent' ? `${promo.discount_value}% Off` : promo.discount_type === 'fixed' ? `AED ${promo.discount_value} Off` : 'Free service'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full uppercase",
                          displayStatus === 'active' ? "bg-green-100 text-green-700" :
                          displayStatus === 'expired' ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"
                        )}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {formatDate(promo.starts_at)} to {formatDate(promo.ends_at)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {promo.used_count || 0} {promo.usage_limit ? `/ ${promo.usage_limit}` : ''}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(promo)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Edit Promotion"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(promo)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Promotion"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Promotion Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPromo ? 'Edit Promotion' : 'Create New Promotion'}
              </h2>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-100 text-red-800 p-3 rounded-xl text-sm font-semibold">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">Promotion Title</label>
                <input 
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                  placeholder="e.g. Eid Mubarak Special Offer"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">Description</label>
                <textarea 
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                  placeholder="Detail the discount or offer..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">Discount Type</label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium bg-white"
                  >
                    <option value="percent">Percentage Off</option>
                    <option value="fixed">Fixed AED Discount</option>
                    <option value="freebie">Free Service Gift</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">Discount Value</label>
                  <input 
                    type="number"
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                    disabled={formDiscountType === 'freebie'}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                    placeholder="e.g. 15 or 100"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">Promo Code (Optional)</label>
                <input 
                  type="text"
                  value={formPromoCode}
                  onChange={(e) => setFormPromoCode(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium uppercase"
                  placeholder="e.g. CAR50 (Leave blank for auto-applied)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">Start Date</label>
                  <input 
                    type="date"
                    value={formStartsAt}
                    onChange={(e) => setFormStartsAt(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">End Date</label>
                  <input 
                    type="date"
                    value={formEndsAt}
                    onChange={(e) => setFormEndsAt(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">Usage Limit</label>
                  <input 
                    type="number"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                    placeholder="e.g. 500 (Optional)"
                    min={0}
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button 
                type="submit"
                disabled={saving}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 disabled:bg-red-400 transition-colors flex items-center justify-center"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingPromo ? 'Save Changes' : 'Create Promotion'}
              </button>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
