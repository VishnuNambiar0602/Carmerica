import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Shield, Mail, Phone, Calendar, ArrowUpRight, ArrowDownRight, Clock, User, Building2, Eye, List, Layers, Percent, Settings, Info, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PricingRule {
  id: string;
  vendor_id: string;
  category_id?: string;
  name: string;
  rule_type: 'percentage' | 'fixed' | 'time_based' | string;
  payload: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminPricing = () => {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // AI strategy optimization states
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);

  // Form & Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [form, setForm] = useState({
    name: '',
    ruleType: 'percentage',
    value: '15',
    categoryId: '',
    vendorId: 'platform',
    active: true,
    payloadJson: '{\n  "value": 15\n}'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [rulesRes, catsRes, statsRes] = await Promise.all([
        fetch('/api/admin/pricing', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (rulesRes.ok) setPricingRules(await rulesRes.json());
      if (catsRes.ok) setCategories(await catsRes.json());
      if (statsRes.ok) setStatsData(await statsRes.json());
    } catch (err) {
      console.error('Failed to load pricing dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingRule(null);
    setForm({
      name: '',
      ruleType: 'percentage',
      value: '15',
      categoryId: '',
      vendorId: 'platform',
      active: true,
      payloadJson: '{\n  "value": 15\n}'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      ruleType: rule.rule_type,
      value: String(rule.payload?.value || ''),
      categoryId: rule.category_id || '',
      vendorId: rule.vendor_id || 'platform',
      active: rule.active,
      payloadJson: JSON.stringify(rule.payload || {}, null, 2)
    });
    setShowModal(true);
  };

  const handleTypeOrValueChange = (type: string, val: string) => {
    const numericVal = parseFloat(val) || 0;
    let payloadObj: any = { value: numericVal };
    if (type === 'time_based') {
      payloadObj = { value: numericVal, days: ['Saturday', 'Sunday'], surcharge_percentage: 10 };
    }
    setForm(prev => ({
      ...prev,
      ruleType: type,
      value: val,
      payloadJson: JSON.stringify(payloadObj, null, 2)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Rule name is required');
      return;
    }

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(form.payloadJson);
    } catch (err) {
      alert('Invalid JSON in payload field. Please check your syntax.');
      return;
    }

    const token = localStorage.getItem('token');
    const method = editingRule ? 'PATCH' : 'POST';
    const url = editingRule ? `/api/admin/pricing/${editingRule.id}` : '/api/admin/pricing';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name.trim(),
          ruleType: form.ruleType,
          categoryId: form.categoryId || null,
          vendorId: form.vendorId || 'platform',
          active: form.active,
          payload: parsedPayload
        })
      });

      if (!res.ok) {
        throw new Error('Save pricing rule failed');
      }

      const saved = await res.json();
      if (editingRule) {
        setPricingRules(prev => prev.map(r => r.id === editingRule.id ? saved : r));
      } else {
        setPricingRules(prev => [...prev, saved]);
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Error saving rule');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete pricing rule "${name}" permanently?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/pricing/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPricingRules(prev => prev.filter(r => r.id !== id));
      } else {
        alert('Failed to delete pricing rule');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting pricing rule');
    }
  };

  const handleToggleActive = async (rule: PricingRule) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/pricing/${rule.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !rule.active })
      });
      if (res.ok) {
        setPricingRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !r.active } : r));
      }
    } catch (err) {
      console.error('Failed to toggle rule active status:', err);
    }
  };

  const handleOptimizeRule = async (rule: PricingRule) => {
    setOptimizingId(rule.id);
    try {
      const response = await fetch('/api/ai/optimize-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: rule.name,
          location: 'Global Platform',
          competitorPrices: [10, 12, 15, 20],
          currentPrice: parseFloat(rule.payload?.value || '15'),
          demandLevel: 'high',
          garageRating: 4.5
        })
      });
      if (!response.ok) throw new Error('API returned ' + response.status);
      const data = await response.json();
      setRecommendation(data);
    } catch (error) {
      console.error('Optimization failed', error);
      setRecommendation({
        recommendedPrice: parseFloat(rule.payload?.value || '15'),
        marketPosition: 'Current Rate',
        reasoning: 'Unable to fetch AI strategy at this time. Keeping current rate as baseline.'
      });
    } finally {
      setOptimizingId(null);
    }
  };

  // Compute stats
  const activeRulesCount = pricingRules.filter(r => r.active).length;
  const pctRules = pricingRules.filter(r => r.active && r.rule_type === 'percentage');
  const avgCommission = pctRules.length
    ? (pctRules.reduce((sum, r) => sum + Number(r.payload?.value || 0), 0) / pctRules.length).toFixed(1) + '%'
    : '15.0%';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing & Commission</h1>
          <p className="text-gray-500">Manage platform commission rates, service fees, and pricing rules.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Rule
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Percent className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Commission</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgCommission}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Platform Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {statsData ? `AED ${Number(statsData.platformGmv * 0.15).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '...'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Settings className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Rules</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeRulesCount}</p>
        </div>
      </div>

      {/* AI Recommendation Modal */}
      {recommendation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-100">
            <div className="bg-red-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <h3 className="font-bold">Admin Strategy Insight</h3>
              </div>
              <button onClick={() => setRecommendation(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-500 text-sm">Recommended Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{recommendation.recommendedPrice}%</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Strategy</p>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase">
                    {recommendation.marketPosition}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  "{recommendation.reasoning}"
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setRecommendation(null)}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all"
                >
                  Apply to Platform
                </button>
                <button 
                  onClick={() => setRecommendation(null)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-gray-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Rules List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Pricing Rules</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="text-gray-500 text-sm">Loading rules...</p>
          </div>
        ) : pricingRules.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No pricing rules defined.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Rule Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Vendor scope</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pricingRules.map((rule) => {
                  const catName = categories.find(c => c.id === rule.category_id)?.name || 'All Categories';
                  const displayValue = rule.rule_type === 'percentage' 
                    ? `${rule.payload?.value}%` 
                    : rule.rule_type === 'fixed' 
                    ? `AED ${rule.payload?.value}`
                    : `AED ${rule.payload?.value} (${rule.rule_type})`;

                  return (
                    <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{rule.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">Custom payload configuration</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full uppercase">
                          {rule.rule_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-red-600">
                        {displayValue}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {catName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {rule.vendor_id}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(rule)}
                          className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full hover:opacity-85 transition-opacity",
                            rule.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          )}
                          title="Click to toggle status"
                        >
                          {rule.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOptimizeRule(rule)}
                            disabled={optimizingId === rule.id}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                            title="AI Strategy Analysis"
                          >
                            {optimizingId === rule.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            Strategy
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(rule)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Edit rule"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(rule.id, rule.name)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete rule"
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

      {/* Add / Edit Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative border border-gray-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingRule ? 'Edit Pricing Rule' : 'Add New Pricing Rule'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Peak Hours Surcharge"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Rule Type</label>
                  <select
                    value={form.ruleType}
                    onChange={(e) => handleTypeOrValueChange(e.target.value, form.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none font-medium"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat Rate</option>
                    <option value="time_based">Time Based Uplift</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Value Amount</label>
                  <input
                    type="number"
                    required
                    value={form.value}
                    onChange={(e) => handleTypeOrValueChange(form.ruleType, e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Category (Optional)</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none font-medium"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Vendor Scope ID</label>
                <input
                  type="text"
                  required
                  value={form.vendorId}
                  onChange={(e) => setForm(prev => ({ ...prev, vendorId: e.target.value }))}
                  placeholder="e.g. platform, vendor-102"
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm(prev => ({ ...prev, active: e.target.checked }))}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4"
                  />
                  <span className="text-sm font-bold text-gray-700">Rule Active</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">JSON Payload Configuration</label>
                <textarea
                  required
                  rows={4}
                  value={form.payloadJson}
                  onChange={(e) => setForm(prev => ({ ...prev, payloadJson: e.target.value }))}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 font-mono focus:ring-red-500 focus:border-red-500 focus:outline-none resize-none bg-gray-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-start space-x-4">
        <div className="bg-red-100 p-2 rounded-lg">
          <Info className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-900 mb-1">Commission Rule Logic</h3>
          <p className="text-sm text-red-700 leading-relaxed">
            Pricing rules are applied in order of specificity. Category-specific rules override global rules. 
            Changes to commission rates will only apply to new bookings and will not affect existing ones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPricing;
