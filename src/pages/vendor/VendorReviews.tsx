import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Filter, Search, MoreVertical, ThumbsUp, ThumbsDown, Reply, ShieldCheck, Flag, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  created_at: string;
  comment: string;
  vendor_response?: string;
  garage_id?: string;
  vehicle?: string;
  service?: string;
}

const VendorReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unanswered'>('all');
  const [search, setSearch] = useState('');
  
  // Reply form state
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Thumbs up local tracker
  const [helpfulLikes, setHelpfulLikes] = useState<Record<string, number>>({});

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Get Vendor info
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!meRes.ok) return;
      const meData = await meRes.json();
      const vendorId = meData.vendor?.id || 'vendor-1';

      const res = await fetch(`/api/reviews?vendorId=${vendorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reviews/${reviewId}/response`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ response: replyText.trim() })
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, vendor_response: replyText.trim() } : r));
        setReplyingId(null);
        setReplyText('');
      } else {
        alert('Failed to submit reply');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleHelpfulClick = (id: string) => {
    setHelpfulLikes(prev => ({
      ...prev,
      [id]: (prev[id] || 12) + 1
    }));
  };

  // Computed metrics
  const totalReviews = reviews.length;
  const avgRating = totalReviews 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const distribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percentage = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percentage };
  });

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = !search || 
      (r.user_name || '').toLowerCase().includes(search.toLowerCase()) || 
      (r.comment || '').toLowerCase().includes(search.toLowerCase());
      
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'unanswered' && !r.vendor_response);

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Reviews</h1>
          <p className="text-gray-500">Monitor and respond to customer feedback to build your garage's reputation.</p>
        </div>
        <div className="flex border-2 border-black bg-white p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">
          <button 
            onClick={() => setActiveTab('all')}
            className={cn("px-4 py-2 text-sm font-black rounded-none transition-all", activeTab === 'all' ? "bg-[#003580] text-white" : "text-gray-500 hover:text-gray-700")}
          >
            All Reviews
          </button>
          <button 
            onClick={() => setActiveTab('unanswered')}
            className={cn("px-4 py-2 text-sm font-black rounded-none transition-all", activeTab === 'unanswered' ? "bg-[#003580] text-white" : "text-gray-500 hover:text-gray-700")}
          >
            Unanswered
          </button>
        </div>
      </div>

      {/* Reviews Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all rounded-none col-span-1 flex flex-col justify-center">
          <div className="text-center">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Average Rating</h3>
            <p className="text-5xl font-black text-gray-900 mb-2">{avgRating}</p>
            <div className="flex justify-center text-[#feba02] mb-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star 
                  key={s} 
                  className={cn(
                    "h-5 w-5 fill-current", 
                    s <= Math.round(Number(avgRating)) ? "text-[#feba02]" : "text-gray-200"
                  )} 
                />
              ))}
            </div>
            <p className="text-xs font-bold text-gray-500">Based on {totalReviews} reviews</p>
          </div>
        </div>
        
        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all rounded-none col-span-1 md:col-span-3">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {distribution.map(({ stars, percentage }) => (
              <div key={stars} className="flex items-center">
                <span className="text-xs font-black text-gray-700 w-4">{stars}</span>
                <Star className="h-3.5 w-3.5 text-[#feba02] fill-current mx-2" />
                <div className="flex-grow bg-gray-100 h-2 border border-black rounded-none overflow-hidden">
                  <div 
                    className="bg-[#feba02] h-full rounded-none" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-gray-500 ml-4 w-10 text-right">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Filter reviews by keyword or customer name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]"
        />
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-bold">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white p-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-bold">No reviews found</p>
            <p className="text-sm">We couldn't find any reviews matching your current filters.</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all rounded-none">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 border-2 border-black bg-gray-150 flex items-center justify-center text-lg font-black text-gray-650 rounded-none">
                    {(review.user_name || 'A').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{review.user_name || 'Anonymous'}</h3>
                    <div className="flex items-center text-xs text-gray-500 font-bold mt-0.5">
                      <span className="font-black text-[#003580]">{review.vehicle || 'Customer Car'}</span>
                      <span className="mx-2">·</span>
                      <span>{review.service || 'Service Booking'}</span>
                      <span className="mx-2">·</span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex text-[#feba02]">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={cn("h-4 w-4 fill-current", s > review.rating ? "text-gray-200" : "text-[#feba02]")} />
                    ))}
                  </div>
                  <button className="p-1.5 border border-transparent hover:border-black rounded-none">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 text-sm font-bold leading-relaxed mb-6 bg-gray-50 p-3 border border-gray-100">
                "{review.comment}"
              </p>

              {/* Vendor response displayed */}
              {review.vendor_response && (
                <div className="mb-6 p-4 bg-blue-50 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-xs font-black text-[#003580] uppercase tracking-widest mb-1 flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-green-700" /> Your Response
                  </p>
                  <p className="text-sm font-bold text-blue-900">"{review.vendor_response}"</p>
                </div>
              )}

              {/* Reply Box inline form */}
              {replyingId === review.id && (
                <div className="mb-6 space-y-3 p-4 border-2 border-black bg-gray-50 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-widest block">Write Reply *</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="E.g. Thank you for your feedback! We're glad you had a great experience."
                    rows={3}
                    className="w-full p-3 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580] resize-none font-bold"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleReplySubmit(review.id)}
                      disabled={submittingReply || !replyText.trim()}
                      className="border-2 border-black bg-[#003580] text-white px-4 py-2 font-black text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-none disabled:opacity-50"
                    >
                      {submittingReply ? 'Posting...' : 'Post Reply'}
                    </button>
                    <button 
                      onClick={() => { setReplyingId(null); setReplyText(''); }}
                      className="border-2 border-black bg-white text-gray-700 px-4 py-2 font-black text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-none"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleHelpfulClick(review.id)}
                    className="flex items-center text-xs font-black text-gray-500 hover:text-gray-700 border-2 border-black bg-white px-2.5 py-1.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all rounded-none"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1 text-[#003580]" /> Helpful ({helpfulLikes[review.id] || 12})
                  </button>
                  <button className="flex items-center text-xs font-black text-gray-500 hover:text-gray-700 border-2 border-black bg-white px-2.5 py-1.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all rounded-none">
                    <Flag className="h-4 w-4 mr-1 text-red-650" /> Report
                  </button>
                </div>
                {!review.vendor_response && replyingId !== review.id && (
                  <button 
                    onClick={() => {
                      setReplyingId(review.id);
                      setReplyText('');
                    }}
                    className="flex items-center text-xs font-black text-[#003580] hover:bg-blue-50 px-3 py-1.5 border-2 border-[#003580] shadow-[2px_2px_0px_0px_rgba(0,53,128,0.2)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-none"
                  >
                    <Reply className="h-4 w-4 mr-1" /> Reply to Review
                  </button>
                )}
                {review.vendor_response && (
                  <div className="flex items-center text-xs font-black text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none">
                    <ShieldCheck className="h-4 w-4 mr-1 text-green-700" /> Responded
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VendorReviews;
