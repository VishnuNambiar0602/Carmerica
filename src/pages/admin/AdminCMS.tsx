import React, { useState, useEffect } from 'react';
import { Layout, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Shield, Mail, Phone, Calendar, ArrowUpRight, ArrowDownRight, Clock, DollarSign, User, Building2, Eye, List, Layers, Percent, Settings, Info, FileText, Globe, Image as ImageIcon, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CmsPage {
  slug: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

const AdminCMS = () => {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    status: 'draft' as 'draft' | 'published',
    content: ''
  });
  
  // Custom slug tracking
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/cms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPages(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch CMS pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenCreate = () => {
    setEditingPage(null);
    setForm({ title: '', slug: '', status: 'draft', content: '' });
    setIsSlugManuallyEdited(false);
    setShowModal(true);
  };

  const handleOpenEdit = (page: CmsPage) => {
    setEditingPage(page);
    setForm({
      title: page.title,
      slug: page.slug,
      status: page.status,
      content: page.content
    });
    setIsSlugManuallyEdited(true);
    setShowModal(true);
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => {
      const updates: any = { title };
      if (!isSlugManuallyEdited) {
        updates.slug = slugify(title);
      }
      return { ...prev, ...updates };
    });
  };

  const handleSlugChange = (slug: string) => {
    setIsSlugManuallyEdited(true);
    setForm(prev => ({ ...prev, slug: slugify(slug) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }

    const token = localStorage.getItem('token');
    const method = editingPage ? 'PATCH' : 'POST';
    const url = editingPage ? `/api/admin/cms/${editingPage.slug}` : '/api/admin/cms';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Operation failed');
      }

      const savedPage = await res.json();

      if (editingPage) {
        setPages(prev => prev.map(p => p.slug === editingPage.slug ? savedPage : p));
      } else {
        setPages(prev => [...prev, savedPage]);
      }
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save page');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete the page "${slug}"?`)) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/admin/cms/${slug}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPages(prev => prev.filter(p => p.slug !== slug));
      } else {
        alert('Failed to delete CMS page');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting');
    }
  };

  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management (CMS)</h1>
          <p className="text-gray-500">Manage platform pages, blog posts, legal documents, and static content.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Create New Page
        </button>
      </div>

      {/* CMS Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="bg-blue-50 p-3 rounded-lg w-fit mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Static Pages</h3>
          <p className="text-sm text-gray-500">Manage Home, About, and Legal pages.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="bg-green-50 p-3 rounded-lg w-fit mb-4">
            <Globe className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Blog Posts</h3>
          <p className="text-sm text-gray-500">Create and edit articles and guides.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="bg-purple-50 p-3 rounded-lg w-fit mb-4">
            <ImageIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Media Library</h3>
          <p className="text-sm text-gray-500">Manage images, icons, and assets.</p>
        </div>
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Recent Pages</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search pages..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="text-gray-500 text-sm">Loading CMS pages...</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No CMS pages found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Page Title</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Last Modified</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPages.map((page) => (
                  <tr key={page.slug} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="text-sm font-bold text-gray-900">{page.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {page.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(page.updated_at || page.created_at).toLocaleDateString()} at {new Date(page.updated_at || page.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full uppercase",
                        page.status === 'published' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(page)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Edit page"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(page.slug)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete page"
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

      {/* Editor & Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl relative border border-gray-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPage ? `Edit Page: ${editingPage.title}` : 'Create New CMS Page'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content - Two Columns */}
            <div className="flex-grow flex overflow-hidden">
              {/* Left Column: Form Editor */}
              <form onSubmit={handleSubmit} id="cms-editor-form" className="w-1/2 p-6 overflow-y-auto border-r border-gray-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Page Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. About Us"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="e.g. about-us"
                    className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 focus:outline-none font-medium"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="flex flex-col h-72">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Content (HTML / Text)</label>
                  <textarea
                    required
                    value={form.content}
                    onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="<h1>About Our Company</h1><p>We provide the best automotive repair services...</p>"
                    className="flex-grow w-full text-sm border border-gray-300 rounded-lg p-3 font-mono focus:ring-red-500 focus:border-red-500 focus:outline-none resize-none"
                  />
                </div>
              </form>

              {/* Right Column: HTML Live Preview */}
              <div className="w-1/2 p-6 bg-gray-50 overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live HTML Preview</span>
                  <Globe className="h-4 w-4 text-gray-400" />
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-full prose max-w-none">
                  {form.title && <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-2 mb-4">{form.title}</h1>}
                  {form.content ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: form.content }}
                      className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words"
                    />
                  ) : (
                    <p className="text-gray-400 italic text-sm">Type HTML content in the editor to see it rendered here.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="cms-editor-form"
                className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Save Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCMS;
