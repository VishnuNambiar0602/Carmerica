import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Star, Clock, Filter, ChevronDown, Map, List, Check, Info, Sparkles, ShieldCheck, TrendingDown, AlertCircle, Zap, Shield, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../../lib/utils';

// Leaflet Map Imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LeafletMapContainer = MapContainer as React.ComponentType<any>;
const LeafletTileLayer = TileLayer as React.ComponentType<any>;
const LeafletMarker = Marker as React.ComponentType<any>;
const LeafletPopup = Popup as React.ComponentType<any>;

// Fix for default markers in Leaflet using CDN assets to avoid bundler png resolutions
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


interface FilterState {
  serviceTypes: string[];
  priceRanges: string[];
  minRating: number | null;
  maxDistance: number | null;
}

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [garages, setGarages] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAnalysis, setSearchAnalysis] = useState<any>(null);
  
  // Pagination & Total Results
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // States initialized from URLSearchParams
  const [locationInput, setLocationInput] = useState(() => searchParams.get('location') || 'Dubai');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('query') || '');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'price_asc' | 'price_desc' | 'distance'>(
    () => (searchParams.get('sortBy') as any) || 'relevance'
  );
  const [filters, setFilters] = useState<FilterState>(() => {
    const serviceTypes = searchParams.get('serviceTypes')?.split(',').filter(Boolean) || [];
    const priceRanges = searchParams.get('priceRanges')?.split(',').filter(Boolean) || [];
    const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : null;
    const maxDistance = searchParams.get('maxDistance') ? Number(searchParams.get('maxDistance')) : null;
    return { serviceTypes, priceRanges, minRating, maxDistance };
  });

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.serviceTypes.length;
    count += filters.priceRanges.length;
    if (filters.minRating !== null) count++;
    if (filters.maxDistance !== null) count++;
    return count;
  }, [filters]);

  // Synchronise state changes to URL
  useEffect(() => {
    const params: any = {};
    if (locationInput) params.location = locationInput;
    if (searchQuery) params.query = searchQuery;
    if (filters.serviceTypes.length > 0) params.serviceTypes = filters.serviceTypes.join(',');
    if (filters.priceRanges.length > 0) params.priceRanges = filters.priceRanges.join(',');
    if (filters.minRating !== null) params.minRating = String(filters.minRating);
    if (filters.maxDistance !== null) params.maxDistance = String(filters.maxDistance);
    if (sortBy !== 'relevance') params.sortBy = sortBy;
    setSearchParams(params);
  }, [locationInput, searchQuery, filters, sortBy, setSearchParams]);

  // Fetch initial garages and update when location or main query changes
  const fetchGarages = async (resetList = true) => {
    setIsSearching(resetList);
    setIsLoadingMore(!resetList);
    try {
      const curPage = resetList ? 0 : page + 1;
      const limit = 20;
      const offset = curPage * limit;
      
      const queryParams = new URLSearchParams({
        location: locationInput,
        query: searchQuery,
        limit: String(limit),
        offset: String(offset),
      });

      const response = await fetch(`/api/garages?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (resetList) {
          setGarages(data.garages || data);
          setPage(0);
        } else {
          setGarages((prev) => [...prev, ...(data.garages || data)]);
          setPage(curPage);
        }
        setTotalResults(data.total !== undefined ? data.total : (data.length || 0));
      }
    } catch (err) {
      console.error('Failed to fetch garages:', err);
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  // Perform AI smart search
  const performSmartSearch = async (query: string) => {
    if (!query) return;
    setIsSearching(true);
    try {
      const response = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        const data = await response.json();
        
        // Match the enriched structure from search API
        const transformed = data.garages.map((g: any, i: number) => {
          const price = Number(g.services?.[0]?.price || 100);
          return {
            id: g.id,
            name: g.name,
            location: g.location,
            distance: `${(i + 1) * 1.5} miles away`,
            rating: Number(g.rating || 4.5),
            reviews: Number(g.reviews || 100),
            price: price,
            marketPrice: price + 15,
            services: g.services?.map((s: any) => s.name) || [],
            availability: 'Available Today',
            image: g.image || `https://picsum.photos/seed/garage${g.id}/400/250`,
            trustScore: Number(g.trustScore || 90 + i),
            isFairValue: true,
            lat: g.lat ? Number(g.lat) : undefined,
            lng: g.lng ? Number(g.lng) : undefined,
            badge: g.rating >= 4.8 ? 'Top Rated' : undefined,
          };
        });

        setGarages(transformed);
        setSearchAnalysis(data.analysis);
        setTotalResults(transformed.length);
      }
    } catch (err) {
      console.error('Smart search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger search on mount based on initial URL
  useEffect(() => {
    if (searchQuery) {
      performSmartSearch(searchQuery);
    } else {
      fetchGarages(true);
    }
  }, []);

  // Client-side filtering logic
  const filteredGarages = useMemo(() => {
    return garages.filter((garage) => {
      // Filter by Service Type
      if (filters.serviceTypes.length > 0) {
        const hasMatchingService = garage.services?.some((serviceName: string) =>
          filters.serviceTypes.some((type) => serviceName.toLowerCase().includes(type.toLowerCase()))
        );
        if (!hasMatchingService) return false;
      }

      // Filter by Price Range
      if (filters.priceRanges.length > 0) {
        const matchesPrice = filters.priceRanges.some((range) => {
          const price = garage.price;
          if (range === '$0 - $50') return price <= 50;
          if (range === '$50 - $100') return price > 50 && price <= 100;
          if (range === '$100 - $200') return price > 100 && price <= 200;
          if (range === '$200+') return price > 200;
          return false;
        });
        if (!matchesPrice) return false;
      }

      // Filter by Rating
      if (filters.minRating !== null) {
        if (garage.rating < filters.minRating) return false;
      }

      // Filter by Distance
      if (filters.maxDistance !== null) {
        const dist = parseFloat(garage.distance);
        if (isNaN(dist) || dist > filters.maxDistance) return false;
      }

      return true;
    });
  }, [garages, filters]);

  // Client-side sorting logic
  const sortedGarages = useMemo(() => {
    const list = [...filteredGarages];
    if (sortBy === 'rating') return list.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'price_asc') return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') return list.sort((a, b) => b.price - a.price);
    if (sortBy === 'distance') {
      return list.sort((a, b) => {
        const distA = parseFloat(a.distance) || 0;
        const distB = parseFloat(b.distance) || 0;
        return distA - distB;
      });
    }
    return list; // relevance
  }, [filteredGarages, sortBy]);

  // 3D Tilt Effect on mouse movement
  const handle3DMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const tiltX = (y / (box.height / 2)) * -8; // Max tilt 8 deg
    const tiltY = (x / (box.width / 2)) * 8;
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.015, 1.015, 1.015)`;
    card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
  };

  const handle3DMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.boxShadow = 'none';
  };

  const handleClearFilters = () => {
    setFilters({ serviceTypes: [], priceRanges: [], minRating: null, maxDistance: null });
  };

  const handleServiceCheckboxChange = (service: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      serviceTypes: checked
        ? [...prev.serviceTypes, service]
        : prev.serviceTypes.filter((s) => s !== service),
    }));
  };

  const handlePriceCheckboxChange = (range: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      priceRanges: checked
        ? [...prev.priceRanges, range]
        : prev.priceRanges.filter((r) => r !== range),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* AI Alerts System */}
      <div className="mb-8 space-y-3">
        {sortedGarages.filter(g => g.aiAlert).map((g, i) => (
          <div key={i} className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start space-x-3 animate-pulse">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900">AI Smart Alert: {g.aiAlert}</p>
              <p className="text-xs text-red-700 mt-1">Book now to secure your preferred slot at {g.name}.</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="grow flex items-center bg-gray-50 rounded-xl px-4 py-3 w-full border border-transparent focus-within:border-blue-200 transition-all">
          <MapPin className="h-4 w-4 text-gray-400 mr-3" />
          <input 
            type="text" 
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchGarages(true)}
            className="bg-transparent outline-none text-sm w-full font-medium" 
          />
        </div>
        <div className="grow flex items-center bg-gray-50 rounded-xl px-4 py-3 w-full border border-transparent focus-within:border-blue-200 transition-all">
          <Sparkles className={cn("h-4 w-4 mr-3", isSearching ? "text-blue-500 animate-spin" : "text-red-600")} />
          <input 
            type="text" 
            placeholder="Ask AI: 'My car is making a squeaking sound'" 
            className="bg-transparent outline-none text-sm w-full font-medium placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (searchQuery ? performSmartSearch(searchQuery) : fetchGarages(true))}
          />
        </div>
        <button 
          onClick={() => searchQuery ? performSmartSearch(searchQuery) : fetchGarages(true)}
          disabled={isSearching}
          className="bg-[#0071c2] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#005999] w-full md:w-auto transition-all active:scale-95 shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
        >
          {isSearching && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Search
        </button>
      </div>

      {searchAnalysis && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-3xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900">AI Diagnosis: {searchAnalysis.category} Needed</h3>
              <p className="text-blue-700/80 text-sm mt-1 leading-relaxed">
                {searchAnalysis.reasoning}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Status:</span>
                <span className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full",
                  searchAnalysis.urgency === 'high' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                )}>
                  Urgency: {searchAnalysis.urgency}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-72 space-y-6">
          {/* AI Smart Filters (3D Tilt effect) */}
          <div 
            onMouseMove={handle3DMouseMove}
            onMouseLeave={handle3DMouseLeave}
            className="bg-linear-to-br from-red-600 to-red-700 p-6 rounded-3xl shadow-xl text-white transition-all duration-300 transform-gpu cursor-default"
          >
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
                <Filter className="h-4 w-4 mr-2" /> Filters {activeFilterCount > 0 && <span className="ml-1.5 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{activeFilterCount}</span>}
              </h3>
              <button onClick={handleClearFilters} className="text-xs text-[#0071c2] font-bold hover:underline">Clear all</button>
            </div>

            <div className="space-y-8">
              {/* Service Type */}
              <div>
                <h4 className="text-sm font-bold mb-4 text-gray-900">Service Type</h4>
                <div className="space-y-3">
                  {['General Service', 'Oil Change', 'Brake Repair', 'AC Service', 'Battery'].map(service => {
                    const isChecked = filters.serviceTypes.includes(service);
                    return (
                      <label 
                        key={service} 
                        className={cn(
                          "flex items-center text-sm cursor-pointer group p-2 rounded-xl border border-transparent transition-all",
                          isChecked && "border-red-100 bg-red-50/20"
                        )}
                      >
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => handleServiceCheckboxChange(service, e.target.checked)}
                            className="peer h-5 w-5 rounded-lg border-gray-200 text-red-600 focus:ring-red-500 transition-all cursor-pointer" 
                          />
                          <Check className="absolute h-3 w-3 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <span className="ml-3 text-gray-600 group-hover:text-gray-900 transition-colors">{service}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-bold mb-4 text-gray-900">Price Range</h4>
                <div className="space-y-3">
                  {['$0 - $50', '$50 - $100', '$100 - $200', '$200+'].map(range => {
                    const isChecked = filters.priceRanges.includes(range);
                    return (
                      <label 
                        key={range} 
                        className={cn(
                          "flex items-center text-sm cursor-pointer group p-2 rounded-xl border border-transparent transition-all",
                          isChecked && "border-red-100 bg-red-50/20"
                        )}
                      >
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => handlePriceCheckboxChange(range, e.target.checked)}
                            className="peer h-5 w-5 rounded-lg border-gray-200 text-red-600 focus:ring-red-500 transition-all cursor-pointer" 
                          />
                          <Check className="absolute h-3 w-3 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <span className="ml-3 text-gray-600 group-hover:text-gray-900 transition-colors">{range}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="text-sm font-bold mb-4 text-gray-900">Minimum Rating</h4>
                <div className="space-y-3">
                  {[4.5, 4.0, 3.5].map((rating) => {
                    const isChecked = filters.minRating === rating;
                    return (
                      <label 
                        key={rating} 
                        className={cn(
                          "flex items-center text-sm cursor-pointer group p-2 rounded-xl border border-transparent transition-all",
                          isChecked && "border-red-100 bg-red-50/20"
                        )}
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => setFilters(prev => ({ ...prev, minRating: prev.minRating === rating ? null : rating }))}
                            className="peer h-5 w-5 rounded-lg border-gray-200 text-red-600 focus:ring-red-500 transition-all cursor-pointer"
                          />
                          <Check className="absolute h-3 w-3 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <span className="ml-3 text-gray-600 group-hover:text-gray-900 transition-colors">
                          {rating === 4.5 ? 'Excellent (4.5+)' : rating === 4.0 ? 'Very Good (4.0+)' : 'Good (3.5+)'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Distance */}
              <div>
                <h4 className="text-sm font-bold mb-4 text-gray-900">Distance</h4>
                <div className="space-y-3">
                  {[5, 10, 20].map((dist) => {
                    const isChecked = filters.maxDistance === dist;
                    return (
                      <label 
                        key={dist} 
                        className={cn(
                          "flex items-center text-sm cursor-pointer group p-2 rounded-xl border border-transparent transition-all",
                          isChecked && "border-red-100 bg-red-50/20"
                        )}
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => setFilters(prev => ({ ...prev, maxDistance: prev.maxDistance === dist ? null : dist }))}
                            className="peer h-5 w-5 rounded-lg border-gray-200 text-red-600 focus:ring-red-500 transition-all cursor-pointer"
                          />
                          <Check className="absolute h-3 w-3 text-white left-1 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                        <span className="ml-3 text-gray-600 group-hover:text-gray-900 transition-colors">
                          Within {dist} miles
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <div className="grow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {locationInput}: {sortedGarages.length} garages found
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                AI has sorted results by best value and proximity.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative flex items-center bg-white border border-gray-100 rounded-2xl px-3 py-2 shadow-sm">
                <span className="text-xs text-gray-400 mr-2 font-bold uppercase tracking-wider">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-sm font-bold text-gray-900 outline-none cursor-pointer pr-4"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="distance">Nearest First</option>
                </select>
              </div>

              {/* View Mode Toggle */}
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
          </div>

          {/* Display View Mode */}
          {viewMode === 'map' ? (
            <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative z-0">
              <LeafletMapContainer
                center={
                  sortedGarages.length > 0 && sortedGarages[0].lat && sortedGarages[0].lng
                    ? [sortedGarages[0].lat, sortedGarages[0].lng]
                    : [25.2048, 55.2708] // Dubai default
                }
                zoom={12}
                className="w-full h-full"
              >
                <LeafletTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {sortedGarages.map((garage) => (
                  garage.lat && garage.lng ? (
                    <LeafletMarker key={garage.id} position={[garage.lat, garage.lng]} icon={defaultIcon}>
                      <LeafletPopup>
                        <div className="p-2 min-w-48">
                          <p className="font-bold text-sm text-gray-900">{garage.name}</p>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" /> {garage.location}
                          </p>
                          <p className="text-xs font-bold text-red-600 mt-1">AED {garage.price}</p>
                          <button
                            onClick={() => navigate(`/garage/${garage.id}`)}
                            className="mt-2 w-full text-center text-xs bg-gray-900 hover:bg-red-600 text-white py-1.5 rounded-lg font-bold transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </LeafletPopup>
                    </LeafletMarker>
                  ) : null
                ))}
              </LeafletMapContainer>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedGarages.map((garage) => (
                <div 
                  key={garage.id} 
                  onMouseMove={handle3DMouseMove}
                  onMouseLeave={handle3DMouseLeave}
                  className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row transition-all duration-300 transform-gpu group cursor-pointer"
                  onClick={() => navigate(`/garage/${garage.id}`)}
                >
                  <div className="w-full md:w-80 h-64 md:h-auto relative overflow-hidden">
                    <img 
                      src={garage.image} 
                      alt={garage.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      width="320"
                      height="240"
                      decoding="async"
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
                  
                  <div className="grow p-8 flex flex-col justify-between">
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
                        {garage.services.map((s: string) => (
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
                          <div className="grow h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
                        <button className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-red-600 transition-all active:scale-95 shadow-xl shadow-gray-900/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/checkout?vendorId=vendor-${garage.id}&service=${encodeURIComponent(garage.services[0] || 'General Service')}&price=${encodeURIComponent(garage.price)}`);
                          }}
                        >
                            Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {garages.length < totalResults && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => fetchGarages(false)}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-950 font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-sm active:scale-95"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 text-gray-500" />
                        Loading...
                      </>
                    ) : (
                      `Load more (${totalResults - garages.length} remaining)`
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
