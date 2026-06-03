import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Check, X, Clock, DollarSign, Wrench, Sparkles, Percent, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const VendorServices = () => {
  const [optimizingId, setOptimizingId] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);

  const services = [
    { id: 1, name: 'General Service', category: 'Maintenance', price: 89, duration: '2-3 hours', status: 'active', description: 'Includes oil change, filter replacement, and 50-point inspection.' },
    { id: 2, name: 'Full Service', category: 'Maintenance', price: 189, duration: '4-5 hours', status: 'active', description: 'Comprehensive service including engine tuning and fluid top-ups.' },
    { id: 3, name: 'Brake Repair', category: 'Repairs', price: 120, duration: '1-2 hours', status: 'active', description: 'Replacement of brake pads and inspection of rotors.' },
    { id: 4, name: 'AC Service', category: 'Repairs', price: 65, duration: '1 hour', status: 'inactive', description: 'Recharge refrigerant and clean filters.' },
    { id: 5, name: 'Battery Replacement', category: 'Electrical', price: 150, duration: '30 mins', status: 'active', description: 'New battery installation with warranty.' },
  ];

  const handleOptimize = async (service: any) => {
    setOptimizingId(service.id);
    try {
      const response = await fetch('/api/ai/optimize-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: service.name,
          location: 'Dubai Marina',
          competitorPrices: [service.price * 0.9, service.price * 1.1, service.price * 1.05],
          currentPrice: service.price,
          demandLevel: 'high',
          garageRating: 4.8
        })
      });
      if (!response.ok) throw new Error('API returned ' + response.status);
      const data = await response.json();
      setRecommendation({ ...data, serviceId: service.id });
    } catch (error) {
      console.error('Optimization failed', error);
      setRecommendation({
        recommendedPrice: service.price,
        marketPosition: 'Market Average',
        reasoning: 'Unable to fetch AI recommendation. Using current price as baseline.',
        suggestedPromotion: null,
        serviceId: service.id
      });
    } finally {
      setOptimizingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-500">Add, edit, and manage the services offered by your garage.</p>
        </div>
        <button className="bg-[#003580] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#00224f] flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Add New Service
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Wrench className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Services</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Services</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">10</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg. Price</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">$122.50</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search services..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003580] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Filter className="h-4 w-4 mr-2" /> Category
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
            <Clock className="h-4 w-4 mr-2" /> Status
          </button>
        </div>
      </div>

      {/* AI Recommendation Modal/Toast */}
      {recommendation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-blue-100">
            <div className="bg-[#003580] p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <h3 className="font-bold">AI Price Insight</h3>
              </div>
              <button onClick={() => setRecommendation(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-500 text-sm">Recommended Price</p>
                  <p className="text-3xl font-bold text-gray-900">${recommendation.recommendedPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Market Position</p>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                    {recommendation.marketPosition}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  "{recommendation.reasoning}"
                </p>
              </div>

              {recommendation.suggestedPromotion && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                  <Percent className="h-4 w-4" />
                  <p className="text-xs font-bold">PROMO: {recommendation.suggestedPromotion}</p>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setRecommendation(null)}
                  className="flex-1 bg-[#003580] text-white py-2.5 rounded-xl font-bold hover:bg-[#00224f] transition-all"
                >
                  Apply Recommendation
                </button>
                <button 
                  onClick={() => setRecommendation(null)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold hover:bg-gray-200"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{service.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    ${service.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {service.duration}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      service.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {service.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOptimize(service)}
                        disabled={optimizingId === service.id}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                        title="AI Optimize Price"
                      >
                        {optimizingId === service.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        AI
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#003580] hover:bg-blue-50 rounded-lg transition-colors">
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

export default VendorServices;
