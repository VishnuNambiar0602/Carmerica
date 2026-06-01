import React from 'react';
import { Search, MapPin, Calendar, Car, Shield, Star, Clock, ChevronRight, Sparkles, Zap, TrendingUp, ShieldCheck, BellRing, BadgePercent, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const promoCards = [
  {
    title: 'Login now and save 15%',
    text: 'Unlock an instant 15% discount on your first 2 bookings when you sign in today.',
    badge: 'Limited time',
    accent: 'from-amber-400/30 via-white/95 to-white',
    icon: BadgePercent,
  },
  {
    title: 'Members get early deals',
    text: 'Sign in to get priority access to flash offers, loyalty rewards, and price drops.',
    badge: 'Flash alert',
    accent: 'from-sky-400/25 via-white/95 to-white',
    icon: BellRing,
  },
  {
    title: 'Quick sign-in, better prices',
    text: 'Create a login to unlock member-only discounts before you book your next service.',
    badge: 'Best value',
    accent: 'from-emerald-400/25 via-white/95 to-white',
    icon: LogIn,
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState({
    location: '',
    carModel: '',
    serviceType: ''
  });
  const [promoIndex, setPromoIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setPromoIndex((current) => (current + 1) % promoCards.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.location) params.set('location', searchQuery.location);
    if (searchQuery.carModel) params.set('carModel', searchQuery.carModel);
    if (searchQuery.serviceType) params.set('serviceType', searchQuery.serviceType);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-[#003580] pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-white text-xs font-bold mb-6 backdrop-blur-sm border border-white/10">
              <Sparkles className="h-3 w-3 fill-current text-yellow-400" />
              <span>AI-Powered Car Servicing Platform</span>
            </div>
            <h1 className="text-white text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
              Expert Car Servicing, <br /> <span className="text-[#feba02]">Simplified by AI.</span>
            </h1>
            <p className="text-white/80 text-xl mb-12 max-w-lg leading-relaxed">
              Use our AI Genie to find the best deals, identify parts, and manage your vehicle's lifecycle in one place.
            </p>

            {/* Search Box */}
            <div className="relative z-10">
              <form 
                onSubmit={handleSearch}
                className="bg-[#feba02] p-1.5 rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch gap-1.5"
              >
                <div className="flex-grow bg-white rounded-xl flex items-center px-4 py-3.5 border border-transparent focus-within:border-blue-200 transition-all">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <input 
                    type="text" 
                    placeholder="Where are you located?" 
                    className="w-full outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                    value={searchQuery.location}
                    onChange={(e) => setSearchQuery({...searchQuery, location: e.target.value})}
                  />
                </div>
                <div className="flex-grow bg-white rounded-xl flex items-center px-4 py-3.5 border border-transparent focus-within:border-blue-200 transition-all">
                  <Car className="h-5 w-5 text-gray-400 mr-3" />
                  <input 
                    type="text" 
                    placeholder="Car Model (e.g. Toyota Camry)" 
                    className="w-full outline-none text-gray-800 placeholder:text-gray-400 font-medium"
                    value={searchQuery.carModel}
                    onChange={(e) => setSearchQuery({...searchQuery, carModel: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-[#0071c2] text-white px-10 py-3.5 rounded-xl font-bold text-lg hover:bg-[#005999] transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  Search
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Try searching:</span>
                <button onClick={() => navigate('/search')} className="text-white/90 text-xs font-medium hover:text-[#feba02] underline decoration-[#feba02]/30 underline-offset-4 transition-all">“SUV service under $500”</button>
                <button onClick={() => navigate('/search')} className="text-white/90 text-xs font-medium hover:text-[#feba02] underline decoration-[#feba02]/30 underline-offset-4 transition-all">“Best brake repair near Dubai”</button>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-end">
            <div className="relative w-full max-w-md pt-10 pr-4">
              <div className="absolute inset-y-16 right-10 w-40 rounded-full bg-[#feba02]/20 blur-3xl" />

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                <div className={cn(
                  'rounded-[1.75rem] border p-5 shadow-2xl transition-all duration-700 transform-gpu bg-gradient-to-br',
                  promoCards[promoIndex].accent,
                  'translate-x-0 scale-100 opacity-100 shadow-black/20 animate-promo-float'
                )}>
                  {(() => {
                    const card = promoCards[promoIndex];
                    const Icon = card.icon;

                    return (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg',
                              promoIndex === 0 ? 'bg-[#feba02]' : promoIndex === 1 ? 'bg-[#0071c2]' : 'bg-[#0f766e]'
                            )}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                {card.badge}
                              </p>
                              <h3 className="mt-1 text-xl font-black text-slate-900">{card.title}</h3>
                            </div>
                          </div>
                          <span className="relative mt-1 flex h-3 w-3 items-center justify-center">
                            <span className="absolute h-3 w-3 animate-ping rounded-full bg-[#feba02]/70" />
                            <span className="relative h-3 w-3 rounded-full bg-[#feba02] shadow-[0_0_0_8px_rgba(254,186,2,0.12)]" />
                          </span>
                        </div>

                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
                          {card.text}
                        </p>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#003580] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#00295e] active:scale-95"
                          >
                            <LogIn className="h-4 w-4" />
                            Login now
                          </button>
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                            Save on 2 orders
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  {promoCards.map((card, index) => (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => setPromoIndex(index)}
                      aria-label={`Show promo card ${index + 1}`}
                      className={cn(
                        'h-2.5 rounded-full transition-all duration-300',
                        index === promoIndex ? 'w-8 bg-[#feba02]' : 'w-2.5 bg-white/40 hover:bg-white/70'
                      )}
                    />
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md animate-pop-in">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#feba02] text-white shadow-lg shadow-amber-400/40 animate-pulse">
                      <BellRing className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#feba02]">Advertisement</p>
                      <p className="text-sm font-bold">Sign up today and grab 15% OFF!</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="rounded-xl bg-[#feba02] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#003580] transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Claim Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Recommendation Engine */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="flex items-center space-x-2 text-red-600 mb-2">
                <Zap className="h-5 w-5 fill-current" />
                <span className="text-sm font-bold uppercase tracking-widest">Personalized for you</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">AI Recommended Services</h2>
              <p className="text-gray-500 mt-2">Based on your vehicle profile and local market trends.</p>
            </div>
            <Link to="/search" className="text-[#0071c2] font-bold hover:underline flex items-center group">
              Explore all <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Full Synthetic Oil Change', garage: 'Elite Auto Care', price: 189, rating: 4.9, tag: 'Best Value', img: 'oil' },
              { title: 'AC Performance Check', garage: 'Precision Mechanics', price: 99, rating: 4.8, tag: 'Summer Deal', img: 'ac' },
              { title: 'Brake Pad Replacement', garage: 'The Garage Co.', price: 345, rating: 4.7, tag: 'Safety First', img: 'brake' },
              { title: 'Major Service (30K km)', garage: 'Quick Fix Motors', price: 850, rating: 4.9, tag: 'Recommended', img: 'service' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group cursor-pointer" onClick={() => navigate('/garage/1')}>
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/service${i}/400/250`} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center">
                      <Sparkles className="h-3 w-3 mr-1 text-red-600 fill-current" />
                      {item.tag}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">{item.title}</h3>
                    <div className="flex items-center text-[#feba02] text-xs font-bold">
                      <Star className="h-3 w-3 fill-current mr-1" />
                      {item.rating}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-6 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" /> {item.garage}
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Starts from</span>
                      <span className="font-bold text-xl text-gray-900">${item.price}</span>
                    </div>
                    <button className="bg-gray-900 text-white p-2 rounded-xl group-hover:bg-red-600 transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Engine AI Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-3 rounded-2xl">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Trust Engine AI</h4>
                      <p className="text-xs text-gray-500">Real-time verification active</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Trust Score</p>
                    <p className="text-3xl font-bold text-green-600">98/100</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: 'Mechanical Verification', status: 'Verified', color: 'text-green-600' },
                    { label: 'KYC & Identity Check', status: 'Passed', color: 'text-green-600' },
                    { label: 'Price Fairness Check', status: 'Fair Deal', color: 'text-blue-600' },
                    { label: 'Fraud Detection Scan', status: 'Secure', color: 'text-green-600' },
                  ].map((check, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="text-sm font-medium text-gray-700">{check.label}</span>
                      <span className={cn("text-xs font-bold px-3 py-1 rounded-full bg-white border border-gray-100 shadow-sm", check.color)}>
                        {check.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <div className="inline-flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full text-red-600 text-xs font-bold mb-6">
                <Shield className="h-3 w-3" />
                <span>Unmatched Transparency</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Replacing opacity with <br /> <span className="text-red-600">Verified AI Data.</span>
              </h2>
              <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                Our Trust Engine AI scans thousands of data points to ensure every listing is legitimate, every price is fair, and every garage is certified.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-50">
                    <TrendingUp className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Fair Value Pricing</h4>
                    <p className="text-sm text-gray-500">AI-driven market comparison ensures you never overpay.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-50">
                    <ShieldCheck className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Mechanical Verified</h4>
                    <p className="text-sm text-gray-500">Every service package is audited by our AI for technical accuracy.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Exclusive AI-Curated Deals</h2>
            <Link to="/offers" className="text-red-600 font-bold hover:underline">View all offers</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="relative rounded-[2.5rem] overflow-hidden h-80 group cursor-pointer shadow-2xl">
              <img 
                src="https://picsum.photos/seed/offer1/800/400" 
                alt="Offer" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-10">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Limited Time</span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">AI Pick</span>
                </div>
                <h3 className="text-white text-3xl font-bold mb-2">20% Off Full Service</h3>
                <p className="text-white/70 mb-6 max-w-sm text-sm">Get your car winter-ready with our comprehensive checkup. Valid for all SUV models.</p>
                <button 
                  onClick={() => navigate('/offers')}
                  className="bg-white text-gray-900 px-8 py-3 rounded-2xl font-bold w-fit hover:bg-[#feba02] transition-all active:scale-95"
                >
                  Claim Offer
                </button>
              </div>
            </div>
            <div className="relative rounded-[2.5rem] overflow-hidden h-80 group cursor-pointer shadow-2xl">
              <img 
                src="https://picsum.photos/seed/offer2/800/400" 
                alt="Offer" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-10">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-[#feba02] text-[#003580] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Members Only</span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">High Demand</span>
                </div>
                <h3 className="text-white text-3xl font-bold mb-2">Free AC Sanitization</h3>
                <p className="text-white/70 mb-6 max-w-sm text-sm">Join our loyalty program and get free add-ons with every service. Limited slots available.</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-white text-gray-900 px-8 py-3 rounded-2xl font-bold w-fit hover:bg-[#feba02] transition-all active:scale-95"
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
