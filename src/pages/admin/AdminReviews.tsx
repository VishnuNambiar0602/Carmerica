import React from 'react';
import { Star, MessageSquare, Filter, Search, MoreVertical, ThumbsUp, ThumbsDown, Reply, ShieldCheck, Flag, Building2, User, CheckCircle2, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminReviews = () => {
  const reviews = [
    { id: 1, user: 'John Doe', vendor: 'Elite Auto Care', rating: 5, date: '2 days ago', comment: 'Excellent service! The team at Elite Motors was very professional and transparent about the costs.', status: 'published' },
    { id: 2, user: 'Sarah Smith', vendor: 'Precision Mechanics', rating: 4, date: '1 week ago', comment: 'Good experience, but the waiting lounge was a bit crowded. The brake repair was done perfectly though.', status: 'published' },
    { id: 3, user: 'Mike Johnson', vendor: 'Elite Auto Care', rating: 2, date: '2 weeks ago', comment: 'The service took much longer than expected and the staff was quite rude when I asked for an update.', status: 'flagged' },
    { id: 4, user: 'Emily Davis', vendor: 'The Garage Co.', rating: 5, date: '3 weeks ago', comment: 'Best garage in town! Highly recommended for any electrical issues.', status: 'published' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
          <p className="text-gray-500">Monitor and moderate customer reviews across all vendors on the platform.</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button className="px-4 py-2 text-sm font-bold rounded-md bg-red-600 text-white">All Reviews</button>
          <button className="px-4 py-2 text-sm font-bold rounded-md text-gray-500 hover:text-gray-700">Flagged</button>
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
          <p className="text-2xl font-bold text-gray-900">12,450</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Published</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">12,380</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-50 p-2 rounded-lg">
              <Flag className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Flagged</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">45</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Rating</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">4.7</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{review.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{review.vendor}</span>
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
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      review.status === 'published' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
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

export default AdminReviews;
