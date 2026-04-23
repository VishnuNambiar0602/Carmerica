import React from 'react';
import { Layout, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Shield, Mail, Phone, Calendar, ArrowUpRight, ArrowDownRight, Clock, DollarSign, User, Building2, Eye, List, Layers, Percent, Settings, Info, FileText, Globe, Image as ImageIcon, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminCMS = () => {
  const pages = [
    { id: 1, title: 'Home Page', slug: '/', lastModified: '2 days ago', status: 'published', author: 'Admin' },
    { id: 2, title: 'Terms & Conditions', slug: '/terms', lastModified: '1 month ago', status: 'published', author: 'Legal' },
    { id: 3, title: 'Privacy Policy', slug: '/privacy', lastModified: '1 month ago', status: 'published', author: 'Legal' },
    { id: 4, title: 'About Us', slug: '/about', lastModified: '1 week ago', status: 'draft', author: 'Admin' },
    { id: 5, title: 'FAQ', slug: '/faq', lastModified: '3 days ago', status: 'published', author: 'Support' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-500">Manage platform pages, blog posts, legal documents, and static content.</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Page Title</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Last Modified</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
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
                    {page.lastModified}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {page.author}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      page.status === 'published' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                      {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCMS;
