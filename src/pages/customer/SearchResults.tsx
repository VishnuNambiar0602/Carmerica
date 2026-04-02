import React from 'react';
import { Search, MapPin, Star, Clock, Filter, ChevronDown, Map, List, Check, Info, Sparkles, ShieldCheck, TrendingDown, AlertCircle, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

const SearchResults = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = React.useState<'list' | 'map'>('list');

  const garages = [
    {
      id: 1,
      name: 'Elite Auto Care',
      location: 'Downtown, Los Angeles',
      distance: '2.4 miles away',
      rating: 4.8,
      reviews: 1240,
      price: 89,
      marketPrice: 110,
      services: ['General Service', 'Oil Change', 'Brake Repair'],
      availability: 'Next slot: Tomorrow, 10:00 AM',
      image: 'https://picsum.photos/seed/garage1/400/250',
      badge: 'Top Rated',
      trustScore: 98,
      isFairValue: true,
      aiAlert: 'High demand for SUV services in your area today.'
    },
    {
      id: 2,
      name: 'Precision Mechanics',
      location: 'Westside, Los Angeles',
      distance: '4.1 miles away',
      rating: 4.5,
      reviews: 850,
      price: 75,
      marketPrice: 95,
      services: ['Oil Change', 'AC Service', 'Battery Replacement'],
      availability: 'Next slot: Today, 4:30 PM',
      image: 'https://picsum.photos/seed/garage2/400/250',
      badge: 'Best Value',
      trustScore: 92,
      isFairValue: true
    },
    {
      id: 3,
      name: 'The Garage Co.',
      location: 'Santa Monica',
      distance: '6.8 miles away',
      rating: 4.9,
      reviews: 2100,
      price: 110,
      marketPrice: 105,
      services: ['Full Service', 'Engine Diagnostics', 'Transmission'],
      availability: 'Next slot: Monday, 9:00 AM',
      image: 'https://picsum.photos/seed/garage3/400/250',
      badge: 'Premium',
      trustScore: 99,
      isFairValue: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* AI Alerts System */}
      <div className="mb-8 space-y-3">
        {garages.filter(g => g.aiAlert).map((g, i) => (
          <div key={i} className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start space-x-3 animate-pulse">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900">AI Smart Alert: {g.aiAlert}</p>
              <p className="text-xs text-red-700 mt-1">Book now to secure your preferred slot at {g.name}.</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar (Condensed) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-grow flex items-center bg-gray-50 rounded-xl px-4 py-3 w-full border border-transparent focus-within:border-blue-200 transition-all">
          <MapPin className="h-4 w-4 text-gray-400 mr-3" />
          <input type="text" defaultValue="Los Angeles, CA" className="bg-transparent outline-none text-sm w-full font-medium" />
        </div>
        <div className="flex-grow flex items-center bg-gray-50 rounded-xl px-4 py-3 w-full border border-transparent focus-within:border-blue-200 transition-all">
          <Sparkles className="h-4 w-4 text-red-600 mr-3" />
          <input type="text" placeholder="Ask AI: 'Best value for SUV brake repair'" className="bg-transparent outline-none text-sm w-full font-medium placeholder:text-gray-400" />
        </div>
        <button className="bg-[#0071c2] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#005999] w-full md:w-auto transition-all active:scale-95 shadow-lg shadow-blue-900/10">
          Update Search
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-72 space-y-6">
          {/* AI Smart Filters */}
          <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-3xl shadow-xl text-white">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 fill-current text-yellow-400" />
              <h3 className="font-bold text-lg">AI Smart Filters</h3>
            </div>
            <p className="text-white/80 text-xs mb-6 leading-relaxed">Our AI has analyzed your vehicle and local market to suggest these filters.</p>
            <div className="space-y-3">
              {[
                { label: 'Best for your Toyota', icon: Zap },
                { label: 'Fair Value Verified', icon: TrendingDown },
                { label: 'Top Trust Score (90+)', icon: ShieldCheck },
                { label: 'Shop Local (Under 5mi)', icon: MapPin },
              ].map((filter, i) => (
                <button key={i} className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all border border-white/10 group">
                  <div className="flex items-center space-x-3">
                    <filter.icon className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium">{filter.label}</span>
                  </div>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 group-hover:border-white/60 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 flex items-center">
                <Filter className="h-4 w-4 mr-2" /> Filters
              </h3>
              <button className="text-xs text-[#0071c2] font-bold hover:underline">Clear all</button>
            </div>

            <div className="space-y-8">
              {/* Service Type */}
              <div>
                <h4 className="text-sm font-bold mb-4 text-gray-900">Service Type</h4>
                <div className="space-y-3">
                  {['General Service', 'Oil Change', 'Brake Repair', 'AC Service', 'Battery'].map(service => (
                    <label key={service} className="flex items-center text-sm cursor-pointer group">
                      <div className="relative flex items-center">
                        <input type="checkbox" className="peer h-5 w-5 rounded-lg border-gray-200 text-red-600 focus:ring-red-500 transition-all cursor-pointer" />
                        <Check className="absolute h-3 w-3 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <span className="ml-3 text-gray-600 group-hover:text-gray-900 transition-colors">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-bold mb-4 text-gray-900">Price Range</h4>
                <div className="space-y-3">
                  {['$0 - $50', '$50 - $100', '$100 - $200', '$200+'].map(range => (
                    <label key={range} className="flex items-center text-sm cursor-pointer group">
                      <div className="relative flex items-center">
                        <input type="checkbox" className="peer h-5 w-5 rounded-lg border-gray-200 text-red-600 focus:ring-red-500 transition-all cursor-pointer" />
                        <Check className="absolute h-3 w-3 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <span className="ml-3 text-gray-600 group-hover:text-gray-900 transition-colors">{range}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Los Angeles: {garages.length} garages found</h2>
              <p className="text-sm text-gray-500 mt-1">AI has sorted results by best value and proximity.</p>
            </div>
            <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-2.5 rounded-xl transition-all", viewMode === 'list' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600")}
              >
                <List className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={cn("p-2.5 rounded-xl transition-all", viewMode === 'map' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600")}
              >
                <Map className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {garages.map((garage) => (
              <div 
                key={garage.id} 
                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-2xl hover:border-red-100 transition-all duration-500 group cursor-pointer"
                onClick={() => navigate(`/garage/${garage.id}`)}
              >
                <div className="w-full md:w-80 h-64 md:h-auto relative overflow-hidden">
                  <img 
                    src={garage.image} 
                    alt={garage.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {garage.badge && (
                      <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center">
                        <Star className="h-3 w-3 mr-1 text-[#feba02] fill-current" />
                        {garage.badge}
                      </span>
                    )}
                    {garage.isFairValue && (
                      <span className="bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Fair Value
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center">
                      <ShieldCheck className="h-3 w-3 mr-1 text-green-400" />
                      Trust Score: {garage.trustScore}%
                    </div>
                  </div>
                </div>
                
                <div className="flex-grow p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">{garage.name}</h3>
                        <div className="flex items-center mt-1 space-x-3">
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1" /> {garage.location}
                          </p>
                          <span className="h-1 w-1 bg-gray-300 rounded-full" />
                          <p className="text-sm font-bold text-red-600 flex items-center">
                            <Zap className="h-3.5 w-3.5 mr-1" /> {garage.distance}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <p className="text-sm font-bold text-gray-900">Excellent</p>
                          <p className="text-xs text-gray-500">{garage.reviews} reviews</p>
                        </div>
                        <div className="bg-gray-900 text-white font-bold h-10 w-10 flex items-center justify-center rounded-2xl shadow-lg">
                          {garage.rating}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {garage.services.map(s => (
                        <span key={s} className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full border border-gray-100">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* AI Fair Value Pricing Engine */}
                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">AI Price Intelligence</span>
                        </div>
                        <span className="text-xs font-bold text-green-600">Save AED {garage.marketPrice - garage.price}</span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex-grow h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: '70%' }} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">Market: AED {garage.marketPrice}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                    <div className="text-sm text-green-600 font-bold flex items-center bg-green-50 px-3 py-1.5 rounded-full">
                      <Clock className="h-4 w-4 mr-2" /> {garage.availability}
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Starts from</p>
                        <p className="text-2xl font-bold text-gray-900">AED {garage.price}</p>
                      </div>
                      <button className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-red-600 transition-all active:scale-95 shadow-xl shadow-gray-900/10">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
