import React from 'react';
import { 
  MapPin, 
  Star, 
  Clock, 
  Check, 
  Info, 
  Phone, 
  MessageSquare, 
  Share2, 
  Heart, 
  ChevronRight, 
  Wrench, 
  ShieldCheck, 
  Calendar,
  User,
  Image as ImageIcon,
  Sparkles,
  Zap,
  TrendingDown,
  Shield,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const GarageDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedService, setSelectedService] = React.useState<number | null>(null);

  const garage = {
    id: 1,
    name: 'Elite Auto Care',
    location: '123 Downtown St, Los Angeles, CA 90012',
    rating: 4.8,
    reviews: 1240,
    trustScore: 98,
    description: 'Elite Auto Care is a family-owned business with over 20 years of experience in the automotive industry. We specialize in high-end European and Asian vehicles, providing dealership-quality service at competitive prices.',
    images: [
      'https://picsum.photos/seed/garage1/800/500',
      'https://picsum.photos/seed/garage2/400/300',
      'https://picsum.photos/seed/garage3/400/300',
      'https://picsum.photos/seed/garage4/400/300',
    ],
    amenities: ['Free WiFi', 'Waiting Lounge', 'Complimentary Coffee', 'Shuttle Service', 'Child Friendly'],
    services: [
      { id: 1, name: 'General Service', price: 350, marketPrice: 420, duration: '2-3 hours', description: 'Includes oil change, filter replacement, and 50-point inspection.', aiTag: 'Best Value' },
      { id: 2, name: 'Full Service', price: 850, marketPrice: 1100, duration: '4-5 hours', description: 'Comprehensive service including engine tuning and fluid top-ups.', aiTag: 'Recommended' },
      { id: 3, name: 'Brake Repair', price: 450, marketPrice: 550, duration: '1-2 hours', description: 'Replacement of brake pads and inspection of rotors.', aiTag: 'Safety First' },
      { id: 4, name: 'AC Service', price: 250, marketPrice: 320, duration: '1 hour', description: 'Recharge refrigerant and clean filters.', aiTag: 'Summer Deal' }
    ],
    smartBundles: [
      {
        id: 'b1',
        name: 'Essential Maintenance Bundle',
        services: ['General Service', 'AC Performance Check', 'Tire Rotation'],
        price: 499,
        originalPrice: 650,
        savings: 151,
        tag: 'AI Suggested'
      },
      {
        id: 'b2',
        name: 'Road Trip Ready Kit',
        services: ['Full Service', 'Brake Inspection', 'Battery Health Check'],
        price: 999,
        originalPrice: 1350,
        savings: 351,
        tag: 'Popular'
      }
    ],
    trustMetrics: [
      { label: 'Mechanical Accuracy', score: 99 },
      { label: 'Price Fairness', score: 97 },
      { label: 'Customer Satisfaction', score: 98 },
      { label: 'Verified Parts Used', score: 100 }
    ],
    reviews_list: [
      { id: 1, user: 'John D.', rating: 5, comment: 'Excellent service! Very professional and transparent about the costs.', date: '2 days ago', verified: true },
      { id: 2, user: 'Sarah M.', rating: 4, comment: 'Good experience, but the waiting lounge was a bit crowded.', date: '1 week ago', verified: true }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-red-600 mb-8">
        <Link to="/" className="hover:underline font-medium">Home</Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-300" />
        <Link to="/search" className="hover:underline font-medium">Los Angeles Garages</Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-300" />
        <span className="text-gray-400">{garage.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start mb-10 gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Certified Garage</span>
            <div className="flex items-center bg-red-50 px-3 py-1 rounded-full text-red-600 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3 mr-1.5" />
              Trust Score: {garage.trustScore}%
            </div>
            <div className="flex text-[#feba02]">
              {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 fill-current" />)}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">{garage.name}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-red-600" /> {garage.location}
            </p>
            <button className="text-red-600 text-sm font-bold hover:underline flex items-center">
              View on Map <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button className="p-3.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-gray-100 transition-all">
            <Heart className="h-6 w-6" />
          </button>
          <button className="p-3.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-gray-100 transition-all">
            <Share2 className="h-6 w-6" />
          </button>
          <button 
            onClick={() => navigate('/checkout')}
            className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-xl shadow-gray-900/10 active:scale-95"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 mb-12 h-[600px]">
        <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden rounded-[2.5rem]">
          <img src={garage.images[0]} alt="Garage" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
        </div>
        <div className="relative group cursor-pointer overflow-hidden rounded-[2rem]">
          <img src={garage.images[1]} alt="Garage" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
        </div>
        <div className="relative group cursor-pointer overflow-hidden rounded-[2rem]">
          <img src={garage.images[2]} alt="Garage" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
        </div>
        <div className="relative group cursor-pointer overflow-hidden rounded-[2rem]">
          <img src={garage.images[3]} alt="Garage" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
        </div>
        <div className="relative group cursor-pointer overflow-hidden rounded-[2rem]">
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-10">
            <ImageIcon className="h-8 w-8 mb-2" />
            <span className="font-bold text-lg">+12 photos</span>
          </div>
          <img src={garage.images[0]} alt="Garage" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* AI Trust Engine Detailed Metrics */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center space-x-2 text-red-600 mb-1">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">AI Trust Engine</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Verification Report</h2>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-green-600">{garage.trustScore}%</span>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Overall Score</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {garage.trustMetrics.map((metric, i) => (
                <div key={i} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-700">{metric.label}</span>
                    <span className="text-sm font-bold text-green-600">{metric.score}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${metric.score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Our AI has verified this garage's credentials, equipment standards, and historical pricing accuracy. You are protected by our <strong>100% Service Guarantee</strong>.
              </p>
            </div>
          </section>

          {/* AI Smart Bundles */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-red-600 mb-1">
                  <Sparkles className="h-5 w-5 fill-current" />
                  <span className="text-xs font-bold uppercase tracking-widest">Smart Bundles AI</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Recommended Maintenance Kits</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {garage.smartBundles.map((bundle) => (
                <div key={bundle.id} className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/20 rounded-full blur-3xl group-hover:bg-red-600/40 transition-colors" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        {bundle.tag}
                      </span>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Save</p>
                        <p className="text-xl font-bold text-green-400">AED {bundle.savings}</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-4">{bundle.name}</h3>
                    <ul className="space-y-3 mb-8">
                      {bundle.services.map((s, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-300">
                          <Check className="h-4 w-4 text-green-400 mr-2" /> {s}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest line-through">AED {bundle.originalPrice}</p>
                        <p className="text-2xl font-bold">AED {bundle.price}</p>
                      </div>
                      <button className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all active:scale-95">
                        Add Bundle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Services with AI Price Intelligence */}
          <section id="services" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Services</h2>
            <div className="space-y-4">
              {garage.services.map(service => (
                <div 
                  key={service.id} 
                  className={cn(
                    "p-8 rounded-[2rem] border transition-all cursor-pointer group",
                    selectedService === service.id 
                      ? "border-red-600 bg-red-50/30 shadow-lg" 
                      : "border-gray-100 bg-white hover:border-red-200 hover:shadow-xl"
                  )}
                  onClick={() => setSelectedService(service.id)}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "p-4 rounded-2xl transition-colors",
                        selectedService === service.id ? "bg-red-600 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-red-600"
                      )}>
                        <Wrench className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-xl text-gray-900">{service.name}</h3>
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {service.aiTag}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1.5" /> {service.duration}
                        </p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="flex items-center md:justify-end space-x-2">
                        <span className="text-sm text-gray-400 line-through font-medium">AED {service.marketPrice}</span>
                        <span className="text-2xl font-bold text-gray-900">AED {service.price}</span>
                      </div>
                      <div className="flex items-center md:justify-end space-x-1 text-green-600 text-[10px] font-bold uppercase tracking-widest mt-1">
                        <TrendingDown className="h-3 w-3" />
                        <span>AI Verified Fair Price</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-8 leading-relaxed max-w-2xl">{service.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <button className="text-red-600 text-sm font-bold hover:underline flex items-center group/btn">
                      <Info className="h-4 w-4 mr-2" /> 
                      Full Service Details 
                      <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button className={cn(
                      "px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95",
                      selectedService === service.id 
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                        : "bg-gray-900 text-white hover:bg-red-600"
                    )}>
                      {selectedService === service.id ? 'Service Selected' : 'Select This Service'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              <div className="flex items-center">
                <div className="text-right mr-4">
                  <p className="font-bold text-gray-900">Excellent</p>
                  <p className="text-xs text-gray-500">{garage.reviews} verified reviews</p>
                </div>
                <div className="bg-gray-900 text-white font-bold h-12 w-12 flex items-center justify-center rounded-2xl shadow-lg">
                  {garage.rating}
                </div>
              </div>
            </div>
            <div className="space-y-8">
              {garage.reviews_list.map(review => (
                <div key={review.id} className="border-b border-gray-50 pb-8 last:border-0">
                  <div className="flex justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mr-4 border border-gray-50">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900">{review.user}</span>
                          {review.verified && (
                            <span className="bg-green-50 text-green-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center">
                              <ShieldCheck className="h-2 w-2 mr-1" /> Verified
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{review.date}</span>
                      </div>
                    </div>
                    <div className="flex text-[#feba02]">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className={cn("h-4 w-4 fill-current", s > review.rating && "text-gray-200")} />)}
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
              ))}
              <button className="w-full py-4 text-gray-900 font-bold border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                Read All {garage.reviews} Reviews
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar / Booking Card */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl sticky top-24">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900">Book Service</h3>
              <div className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-3 py-1 rounded-full">
                <Zap className="h-3 w-3 mr-1.5 fill-current" />
                Instant Confirmation
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center group cursor-pointer hover:border-red-200 transition-all">
                <Calendar className="h-5 w-5 text-gray-400 mr-4 group-hover:text-red-600 transition-colors" />
                <div className="flex-grow">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Preferred Date</p>
                  <p className="text-sm font-bold text-gray-900">Select Date</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center group cursor-pointer hover:border-red-200 transition-all">
                <Clock className="h-5 w-5 text-gray-400 mr-4 group-hover:text-red-600 transition-colors" />
                <div className="flex-grow">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Time Slot</p>
                  <p className="text-sm font-bold text-gray-900">Select Time</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            </div>

            {selectedService ? (
              <div className="mb-8 p-6 bg-gray-900 rounded-3xl text-white shadow-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold">{garage.services.find(s => s.id === selectedService)?.name}</span>
                  <span className="text-xl font-bold">AED {garage.services.find(s => s.id === selectedService)?.price}</span>
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="h-3 w-3 mr-1.5" />
                  <span>Est. {garage.services.find(s => s.id === selectedService)?.duration}</span>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-6 bg-red-50 text-red-900 text-xs rounded-2xl border border-red-100 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                <p className="font-medium leading-relaxed">
                  Please select a service from the list to see the final price and book your slot.
                </p>
              </div>
            )}

            <button 
              disabled={!selectedService}
              onClick={() => navigate('/checkout')}
              className={cn(
                "w-full py-5 rounded-2xl font-bold text-lg transition-all mb-6 shadow-xl active:scale-95",
                selectedService 
                  ? "bg-red-600 text-white shadow-red-600/20 hover:bg-red-700" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              Confirm Booking
            </button>
            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              No Upfront Payment Required
            </p>
            
            <div className="mt-10 pt-8 border-t border-gray-50 space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-red-50 transition-all group">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-gray-400 mr-4 group-hover:text-red-600 transition-colors" />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors">Chat with Mechanics</span>
                </div>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              </button>
            </div>
          </div>

          {/* AI Recommendation Engine - Similar Garages */}
          <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
            <div className="flex items-center space-x-2 text-red-600 mb-6">
              <Zap className="h-5 w-5 fill-current" />
              <span className="text-xs font-bold uppercase tracking-widest">AI Recommendations</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-6">Similar High-Trust Garages</h4>
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center space-x-4 group cursor-pointer">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden shrink-0 border border-gray-200">
                    <img src={`https://picsum.photos/seed/rec${i}/100/100`} alt="Garage" className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm group-hover:text-red-600 transition-colors">Precision Motors {i}</h5>
                    <div className="flex items-center text-[#feba02] text-[10px] font-bold mt-1">
                      <Star className="h-3 w-3 fill-current mr-1" />
                      4.7 (850 reviews)
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Starts from AED 299</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GarageDetails;
