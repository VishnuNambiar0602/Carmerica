import React, { useState, useEffect, useMemo } from 'react';
import { Star, MessageSquare, Search, MoreVertical, ShieldCheck, Flag, Building2, User, CheckCircle2, Edit2, Trash2, ShieldAlert, Sparkles, Loader2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

function formatReviewDate(dStr: string) {
  if (!dStr) return '—';
  try {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dStr;
  }
}

const AdminReviews = () => {
  const [reviewsData, setReviewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'flagged'>('all');
  const [search, setSearch] = useState('');
  const [auditingId, setAuditingId] = useState<string | number | null>(null);

  const [editingReview, setEditingReview] = useState<any>(null);
  const [editComment, setEditComment] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviewsData(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const runAiAudit = async (review: any) => {
    setAuditingId(review.id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/moderate-review', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: review.rating, comment: review.comment })
      });
      if (response.ok) {
        const audit = await response.json();
        setReviewsData(prev => prev.map(r => r.id === review.id ? { ...r, aiAudit: audit } : r));
      } else {
        alert('AI Moderation API failed or returned an error.');
      }
    } catch (err) {
      console.error('Audit failed', err);
    } finally {
      setAuditingId(null);
    }
  };

  const handleOpenEdit = (review: any) => {
    setEditingReview(review);
    setEditComment(review.comment || '');
    setActiveMenuId(null);
  };

  const handleSaveEdit = async () => {
    if (!editComment.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/reviews/${editingReview.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: editComment.trim(), status: editingReview.status })
      });
      if (res.ok) {
        const updated = await res.json();
        setReviewsData(prev => prev.map(r => r.id === editingReview.id ? { ...r, comment: updated.comment || editComment.trim() } : r));
        setEditingReview(null);
      } else {
        alert('Failed to edit review.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating review.');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Delete this review permanently? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReviewsData(prev => prev.filter(r => r.id !== id));
        setActiveMenuId(null);
      } else {
        alert('Failed to delete review.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFlag = async (review: any) => {
    const newStatus = review.status === 'flagged' ? 'published' : 'flagged';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setReviewsData(prev => prev.map(r => r.id === review.id ? { ...r, status: newStatus } : r));
        setActiveMenuId(null);
      } else {
        alert('Failed to toggle review flag status.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compute live stats from reviews data
  const stats = useMemo(() => {
    const total = reviewsData.length;
    const published = reviewsData.filter(r => r.status === 'published').length;
    const flagged = reviewsData.filter(r => r.status === 'flagged').length;
    const avg = reviewsData.length
      ? (reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length).toFixed(1)
      : '0.0';
    return { total, published, flagged, avg };
  }, [reviewsData]);

  // Filter reviews client-side
  const displayedReviews = useMemo(() => {
    return reviewsData.filter(r => {
      const matchTab = tab === 'flagged' ? r.status === 'flagged' : true;
      const userName = r.user_name || 'Anonymous';
      const vendorName = r.vendor_name || 'Garage';
      const matchSearch = !search ||
        userName.toLowerCase().includes(search.toLowerCase()) ||
        vendorName.toLowerCase().includes(search.toLowerCase()) ||
        r.comment?.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [reviewsData, tab, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
          <p className="text-gray-500">Monitor and moderate customer reviews across all vendors on the platform.</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm relative z-10">
          <button 
            onClick={() => setTab('all')}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-md transition-colors",
              tab === 'all' ? "bg-red-600 text-white" : "text-gray-500 hover:text-gray-700"
            )}
          >
            All Reviews
          </button>
          <button 
            onClick={() => setTab('flagged')}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-md transition-colors",
              tab === 'flagged' ? "bg-red-600 text-white" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Flagged
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Reviews</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : stats.total.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Published</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : stats.published.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <Flag className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Flagged</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : stats.flagged.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Rating</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : stats.avg}
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by reviewer, vendor or comment..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
            <p className="text-gray-500 text-sm">Loading reviews...</p>
          </div>
        ) : displayedReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-sm">No reviews found matching the criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Reviewer</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Comment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedReviews.map((review) => {
                  const userName = review.user_name || 'Anonymous';
                  const vendorName = review.vendor_name || 'Garage';
                  return (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{userName}</span>
                            <span className="text-xs text-gray-400">{formatReviewDate(review.created_at)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{vendorName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex text-[#feba02]">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={cn("h-3 w-3 fill-current", s > review.rating && "text-gray-200")} />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{review.comment}</p>
                        {review.aiAudit && (
                          <div className={cn(
                            "mt-2 p-2 rounded-lg text-[10px] font-bold flex items-center gap-2",
                            review.aiAudit.status === 'flagged' ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
                          )}>
                            {review.aiAudit.status === 'flagged' ? <ShieldAlert className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3 text-green-600" />}
                            AI AUDIT: {review.aiAudit.status.toUpperCase()} {review.aiAudit.flagReason && `- ${review.aiAudit.flagReason}`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full uppercase",
                          review.status === 'published' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {review.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 text-gray-400 relative">
                          <button 
                            onClick={() => runAiAudit(review)}
                            disabled={auditingId === review.id}
                            className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                            title="AI Integrity Audit"
                          >
                            {auditingId === review.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 group-hover:fill-current" />
                            )}
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(review)}
                            className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Edit Review"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(review.id)}
                            className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === review.id ? null : review.id)}
                            className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Moderation Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {activeMenuId === review.id && (
                            <div className="absolute right-0 mt-8 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden text-left">
                              <button 
                                onClick={() => handleToggleFlag(review)}
                                className="w-full px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center"
                              >
                                <Flag className="h-4 w-4 mr-2 text-gray-400" />
                                {review.status === 'flagged' ? 'Unflag Review' : 'Flag Review'}
                              </button>
                            </div>
                          )}
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

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Review Content</h2>
              <button 
                onClick={() => setEditingReview(null)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Reviewer</span>
                <p className="mt-1 font-bold text-gray-900">{editingReview.user_name || 'Anonymous'}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-xs tracking-widest block">Vendor</span>
                <p className="mt-1 font-bold text-gray-900">{editingReview.vendor_name || 'Garage'}</p>
              </div>
              <div>
                <label className="font-bold text-gray-400 uppercase text-xs tracking-widest block mb-2">Review Comment</label>
                <textarea 
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                  placeholder="Review content..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button 
                onClick={handleSaveEdit}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setEditingReview(null)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
