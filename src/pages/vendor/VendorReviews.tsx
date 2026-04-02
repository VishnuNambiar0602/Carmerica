import React from 'react';
import { Star, MessageSquare, Filter, Search, MoreVertical, ThumbsUp, ThumbsDown, Reply, ShieldCheck, Flag } from 'lucide-react';
import { cn } from '../../lib/utils';

const VendorReviews = () => {
  const reviews = [
    { id: 1, user: 'John Doe', rating: 5, date: '2 days ago', comment: 'Excellent service! The team at Elite Motors was very professional and transparent about the costs. My car feels like new again.', service: 'Full Service', car: 'Toyota Camry', status: 'responded' },
    { id: 2, user: 'Sarah Smith', rating: 4, date: '1 week ago', comment: 'Good experience, but the waiting lounge was a bit crowded. The brake repair was done perfectly though.', service: 'Brake Repair', car: 'Honda Civic', status: 'pending' },
    { id: 3, user: 'Mike Johnson', rating: 5, date: '2 weeks ago', comment: 'Fast and reliable. They found an issue with my oil filter that I hadn\'t noticed. Saved me from a potential engine problem.', service: 'Oil Change', car: 'Ford F-150', status: 'responded' },
    { id: 4, user: 'Emily Davis', rating: 3, date: '3 weeks ago', comment: 'The AC service was okay, but it took longer than estimated. I had to wait an extra hour.', service: 'AC Service', car: 'Tesla Model 3', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-500">Monitor and respond to customer feedback to build your garage's reputation.</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button className="px-4 py-2 text-sm font-bold rounded-md bg-[#003580] text-white">All Reviews</button>
          <button className="px-4 py-2 text-sm font-bold rounded-md text-gray-500 hover:text-gray-700">Unanswered</button>
        </div>
      </div>

      {/* Reviews Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-1">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Average Rating</h3>
            <p className="text-5xl font-bold text-gray-900 mb-2">4.8</p>
            <div className="flex justify-center text-[#feba02] mb-2">
              {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-5 w-5 fill-current" />)}
            </div>
            <p className="text-xs text-gray-500">Based on 1,240 reviews</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-1 md:col-span-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center">
                <span className="text-xs font-bold text-gray-600 w-4">{rating}</span>
                <Star className="h-3 w-3 text-[#feba02] fill-current mx-2" />
                <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#feba02] h-full rounded-full" 
                    style={{ width: `${rating === 5 ? 85 : rating === 4 ? 10 : 5}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400 ml-4 w-10 text-right">{rating === 5 ? '85%' : rating === 4 ? '10%' : '5%'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-400">
                  {review.user.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{review.user}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium text-[#003580]">{review.car}</span>
                    <span className="mx-2">·</span>
                    <span>{review.service}</span>
                    <span className="mx-2">·</span>
                    <span>{review.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex text-[#feba02]">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={cn("h-4 w-4 fill-current", s > review.rating && "text-gray-200")} />
                  ))}
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed mb-6">"{review.comment}"</p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex gap-4">
                <button className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-700">
                  <ThumbsUp className="h-4 w-4 mr-1" /> Helpful (12)
                </button>
                <button className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-700">
                  <Flag className="h-4 w-4 mr-1" /> Report
                </button>
              </div>
              {review.status === 'responded' ? (
                <div className="flex items-center text-xs font-bold text-green-600">
                  <ShieldCheck className="h-4 w-4 mr-1" /> Responded
                </div>
              ) : (
                <button className="flex items-center text-xs font-bold text-[#003580] hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-[#003580] transition-colors">
                  <Reply className="h-4 w-4 mr-1" /> Reply to Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorReviews;
