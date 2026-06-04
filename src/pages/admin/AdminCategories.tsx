import React, { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, Plus, Search, Check, X, Layers, List, Edit2, Trash2, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Compute live stats
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.status === 'active' || c.active === true).length;
    const services = categories.reduce((sum, c) => sum + (Number(c.services) || 0), 0);
    return { total, active, services };
  }, [categories]);

  // Client-side search
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchSearch = !search ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.slug?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [categories, search]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormDescription('');
    setFormStatus('active');
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (category: any) => {
    setEditingCategory(category);
    setFormName(category.name || '');
    setFormDescription(category.description || '');
    setFormStatus(category.status === 'active' || category.active !== false ? 'active' : 'inactive');
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Category name is required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const token = localStorage.getItem('token');
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PATCH' : 'POST';
      
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        status: formStatus,
        active: formStatus === 'active'
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
        if (editingCategory) {
          setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? data : c)));
        } else {
          setCategories((prev) => [...prev, data]);
        }
        setShowModal(false);
      } else {
        setFormError(data.message || 'An error occurred while saving.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: any) => {
    if (!confirm(`Are you sure you want to delete category "${category.name}"? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
      } else {
        alert('Failed to delete category. It may have associated services.');
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
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-500">Manage service categories and sub-categories across the platform.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Category
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Layers className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Categories</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : stats.total.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : stats.active.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <List className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Services</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : stats.services.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-bold text-gray-900">All Categories</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
            <p className="text-gray-500 text-sm">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-sm">No categories found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Services</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((category) => {
                  const isActive = category.status === 'active' || category.active === true;
                  return (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center mr-3">
                            <LayoutGrid className="h-4 w-4 text-gray-500" />
                          </div>
                          <span className="text-sm font-bold text-gray-900">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        /{category.slug}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {category.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {category.services || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full uppercase",
                          isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        )}>
                          {isActive ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(category)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(category)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6"
          >
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">Category Name</label>
                <input 
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                  placeholder="e.g. Engine Tuning"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">Description</label>
                <textarea 
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                  placeholder="Describe this service category..."
                />
              </div>

              <div>
                <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center text-sm font-semibold text-gray-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="status" 
                      value="active"
                      checked={formStatus === 'active'}
                      onChange={() => setFormStatus('active')}
                      className="mr-2 text-red-600 focus:ring-red-500"
                    />
                    Active
                  </label>
                  <label className="flex items-center text-sm font-semibold text-gray-700 cursor-pointer">
                    <input 
                      type="radio" 
                      name="status" 
                      value="inactive"
                      checked={formStatus === 'inactive'}
                      onChange={() => setFormStatus('inactive')}
                      className="mr-2 text-red-600 focus:ring-red-500"
                    />
                    Inactive
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button 
                type="submit"
                disabled={saving}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 disabled:bg-red-400 transition-colors flex items-center justify-center"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingCategory ? 'Save Changes' : 'Add Category'}
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

export default AdminCategories;
