import React from 'react';
import { Search, MapPin, Calendar, Car, Shield, Star, Clock, ChevronRight, Sparkles, Zap, TrendingUp, ShieldCheck, BellRing, BadgePercent, LogIn, ArrowRight, CheckCircle2, ShieldAlert, Cpu, Wrench, BarChart4, ClipboardList, Check, DollarSign, Activity } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const promoCards = [
  {
    title: 'Instant 15% Member Discount',
    text: 'Unlock exclusive pricing and save up to 15% on your first two maintenance bookings.',
    badge: 'Member Privilege',
    icon: BadgePercent,
    features: ['15% off first 2 bookings', 'Accredited garage priority', 'Zero hidden fees']
  },
  {
    title: 'Smart Diagnostic Alerts',
    text: 'Sync your vehicle history for priority access to AI deals, maintenance predictions, and rate drops.',
    badge: 'AI Priority',
    icon: BellRing,
    features: ['Real-time sensor sync', 'Automated quote audit', 'Resale value tracking']
  },
  {
    title: 'Fast Track Check-in',
    text: 'Save your vehicle models in the digital garage for seamless one-click booking.',
    badge: 'Premium Flow',
    icon: LogIn,
    features: ['Digital service passport', 'One-click confirmation', 'Instant digital receipts']
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
    }, 4500);

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
    <div className="flex flex-col bg-white text-gray-900 overflow-x-hidden">
      
      {/* Hero Section - Split Grid, Dotted Background, Sharp Edges, Dual-Tone Blue & White */}
      <section className="relative pt-24 pb-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/80 via-blue-50/30 to-white border-b border-blue-100/50 overflow-hidden">
        
        {/* Subtle grid pattern to add rich texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-80" />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-none text-blue-600 text-[10px] font-black tracking-widest uppercase">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>AI-ASSISTED GARAGE AUDITORS v4.2</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-gray-900 max-w-3xl">
            Audit Repair Quotes. <br />
            <span className="text-blue-600">Compare Certified Garages.</span>
          </h1>
          
          <p className="text-gray-500 text-sm sm:text-base max-w-xl leading-relaxed">
            Submit your car maintenance specifications, analyze quotes against historical regional database averages, and book vetted technicians instantly.
          </p>

          {/* Centered & Increased Size Search Box */}
          <div className="w-full max-w-3xl px-2">
            <form 
              onSubmit={handleSearch}
              className="bg-white border-2 border-blue-600 p-2 sm:p-3 rounded-none shadow-[0_20px_50px_rgba(37,99,235,0.08)] flex flex-col sm:flex-row items-stretch gap-3 w-full"
            >
              <div className="flex-grow rounded-none flex items-center px-4 py-4 border-b sm:border-b-0 sm:border-r border-gray-150 focus-within:bg-blue-50/20 transition-all">
                <MapPin className="h-6 w-6 text-blue-600 mr-3 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Where is your vehicle located?" 
                  className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 font-semibold"
                  value={searchQuery.location}
                  onChange={(e) => setSearchQuery({...searchQuery, location: e.target.value})}
                />
              </div>
              <div className="flex-grow rounded-none flex items-center px-4 py-4 focus-within:bg-blue-50/20 transition-all">
                <Car className="h-6 w-6 text-blue-600 mr-3 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Car Model (e.g. BMW M4)" 
                  className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 font-semibold"
                  value={searchQuery.carModel}
                  onChange={(e) => setSearchQuery({...searchQuery, carModel: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-none font-bold text-xs sm:text-sm shadow-md shadow-blue-600/10 transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Search className="h-5 w-5" />
                Audit Quotes
              </button>
            </form>
          </div>

          {/* New Statistics Display (Replaces platform status ticker) */}
          <div className="w-full max-w-3xl bg-blue-50/45 border border-blue-100/60 p-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-blue-200/50">
              <div className="flex flex-col items-center justify-center p-2">
                <span className="text-3xl font-black text-blue-600 tracking-tight">15,000+</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Customers Served</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <span className="text-3xl font-black text-blue-600 tracking-tight">218+</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Accredited Garages</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <span className="text-3xl font-black text-blue-600 tracking-tight">45,000+</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Deliveries Done</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Vetting Workflow Process Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f2f6fc] border-b border-blue-100/40 flex flex-col items-center">
        <div className="max-w-7xl w-full text-center">
          <div className="flex flex-col items-center mb-12">
            <span className="text-blue-650 text-xs font-black uppercase tracking-widest">Network Blueprint</span>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mt-1">
              Vetting Process Workflow
            </h2>
            <p className="text-gray-550 text-xs mt-2 max-w-sm">Every booking passes through three stages of validation checks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Quote / Specifications', desc: 'Input your repair items, zip codes, and vehicle model variants to retrieve verified average price deltas.' },
              { step: '02', title: 'Automated Rate Auditing', desc: 'The auditor scans nearby historic labor invoices to flags margins that exceed regional averages.' },
              { step: '03', title: 'Vetted Direct Booking', desc: 'Book appointments with partner garages that carry verified technician credentials.' }
            ].map((process, i) => (
              <div key={i} className="bg-white border border-blue-100/50 p-6 text-left relative flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] rounded-none">
                <span className="text-4xl font-extrabold text-blue-600/10 absolute top-4 right-4">{process.step}</span>
                <div className="space-y-3">
                  <h4 className="font-extrabold text-gray-950 text-sm">{process.title}</h4>
                  <p className="text-xs text-gray-550 leading-relaxed">{process.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suggested Services */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white flex flex-col items-center relative">
        <div className="max-w-7xl w-full text-center relative z-10">
          <div className="flex flex-col items-center mb-16">
            <div className="flex items-center space-x-1.5 text-blue-600 mb-2">
              <Zap className="h-4.5 w-4.5" />
              <span className="text-xs font-black uppercase tracking-widest">Accredited Services</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Suggested Maintenance Options
            </h2>
            <p className="text-gray-550 text-sm max-w-md mt-2">Verified rates checked against regional database price averages.</p>
            <Link to="/search" className="text-blue-600 font-bold hover:underline flex items-center text-xs mt-4">
              Browse All Listings <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {[
              { title: 'Full Synthetic Oil Change', garage: 'Elite Auto Care', price: 189, rating: 4.9, reviews: 142, hours: '1.0 Hr Est.', parts: 'Oil & Filter' },
              { title: 'AC Performance Check', garage: 'Precision Mechanics', price: 99, rating: 4.8, reviews: 96, hours: '0.8 Hr Est.', parts: 'Refrigerant' },
              { title: 'Brake Pad Replacement', garage: 'The Garage Co.', price: 345, rating: 4.7, reviews: 218, hours: '1.8 Hr Est.', parts: 'Ceramic Pads' },
              { title: 'Major Diagnostics & Tune-up', garage: 'Quick Fix Motors', price: 850, rating: 4.9, reviews: 310, hours: '2.5 Hr Est.', parts: 'Multisystem Spark' },
            ].map((item, i) => (
              <div 
                key={i} 
                className="bg-white rounded-none overflow-hidden border border-gray-200 hover:border-blue-600 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_45px_rgba(37,99,235,0.06)] transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                onClick={() => navigate('/garage/1')}
              >
                <div className="relative h-44 bg-gray-50 border-b border-gray-100">
                  <img 
                    src={`https://picsum.photos/seed/service${i}/400/250`} 
                    alt={item.title} 
                    className="w-full h-full object-cover opacity-90 rounded-none group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    width="400"
                    height="250"
                    decoding="async"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-gray-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center text-gray-550 text-xs gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="line-clamp-1">{item.garage}</span>
                    </div>
                  </div>
 
                  {/* Detailing attributes */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-semibold border-y border-gray-100 py-2">
                    <div>⏱ {item.hours}</div>
                    <div>📦 {item.parts}</div>
                  </div>
 
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="flex items-center text-blue-650 font-bold bg-blue-50 px-2.5 py-0.5 rounded-none border border-blue-100">
                      <Star className="h-3.5 w-3.5 fill-current mr-0.5 text-blue-600" />
                      {item.rating}
                    </div>
                    <span className="text-gray-400">({item.reviews} reviews)</span>
                  </div>
 
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Est. Price</span>
                      <span className="font-extrabold text-base text-gray-900">${item.price}</span>
                    </div>
                    <div className="bg-slate-50 group-hover:bg-blue-600 text-gray-400 group-hover:text-white p-2.5 rounded-none transition-all border border-gray-200">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Verification Panel - Centered details & sharp boxes */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-blue-50/20 border-t border-blue-100/30 flex flex-col items-center relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px)] [background-size:40px] pointer-events-none opacity-30" />
        
        <div className="max-w-7xl w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center space-x-1.5 bg-blue-50 border border-blue-100 px-4 py-2 rounded-none text-blue-650 text-xs font-black tracking-widest uppercase">
                <ShieldCheck className="h-4 w-4" />
                <span>VERIFICATION MATRIX</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl leading-tight">
                Transparent Verification. <br />
                <span className="text-blue-600">Zero Guesswork.</span>
              </h2>
              <p className="text-gray-550 text-sm sm:text-base leading-relaxed max-w-md">
                Our verification checks ensure you never overpay for repairs and interface only with accredited local garages.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-left w-full">
                <div className="flex items-start space-x-3 bg-white p-4 border border-blue-100/60 shadow-sm rounded-none">
                  <div className="bg-blue-50 p-2.5 rounded-none border border-blue-100 text-blue-600 shrink-0">
                    <TrendingUp className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-950 text-xs mb-1">Fair Cost Algorithms</h4>
                    <p className="text-[11px] text-gray-550 leading-relaxed">Quotes are systematically checked against regional database averages.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 border border-blue-100/60 shadow-sm rounded-none">
                  <div className="bg-blue-50 p-2.5 rounded-none border border-blue-100 text-blue-600 shrink-0">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-950 text-xs mb-1">License Verification</h4>
                    <p className="text-[11px] text-gray-550 leading-relaxed">Every mechanic undergoes standard accreditation checkups.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 w-full flex justify-center">
              <div className="bg-white p-8 rounded-none border border-blue-200/60 shadow-[0_15px_40px_rgba(37,99,235,0.04)] max-w-md w-full relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
                
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-50 p-2.5 rounded-none border border-blue-100 text-blue-655">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-xs tracking-tight">Standard Verification Core</h4>
                      <p className="text-[9px] font-black uppercase text-gray-450 tracking-wider">Live Check Matrix</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-450 font-bold uppercase tracking-wider">Score</p>
                    <p className="text-xl font-black text-blue-650">98.4</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: 'Technical Accuracies Audit', status: 'Optimal', details: 'All estimated labor and part rates conform to standard values.' },
                    { label: 'Accreditation Checks', status: 'Passed', details: 'Accredited and vetted by regional partner boards.' },
                    { label: 'Quoting Value Scanner', status: 'Verified', details: 'Quote margins fall strictly within optimal guidelines.' },
                  ].map((check, i) => (
                    <div key={i} className="p-4 bg-white border border-blue-100/50 rounded-none space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">{check.label}</span>
                        <span className="text-[9px] font-black px-2.5 py-0.5 rounded-none bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                          {check.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-450 leading-relaxed">{check.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Member Privileges Panel */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f2f6fc] border-t border-blue-100/40 flex flex-col items-center">
        <div className="max-w-7xl w-full space-y-12 text-center flex flex-col items-center">
          
          <div className="max-w-sm mx-auto space-y-1">
            <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">Member Privileges</h2>
            <p className="text-xs text-gray-550">Sync vehicle histories to unlock priority network rates.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left w-full">
            {promoCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="p-8 rounded-none border border-blue-100/60 flex flex-col justify-between hover:border-blue-600 hover:shadow-md transition-all bg-white relative">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-50 border border-blue-100 text-blue-655 text-[10px] font-black px-3 py-1 rounded-none uppercase tracking-wider">
                        {card.badge}
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-blue-50 w-12 h-12 rounded-none flex items-center justify-center border border-blue-100 text-blue-600">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-gray-950 tracking-tight">{card.title}</h3>
                        <p className="text-xs text-gray-550 mt-1.5">{card.text}</p>
                      </div>
                      
                      {/* Checklists for detailing */}
                      <ul className="space-y-2 pt-2 border-t border-gray-100">
                        {card.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-[11px] text-gray-550 space-x-2">
                            <span className="h-1.5 w-1.5 bg-blue-650 rounded-full" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-gray-150 mt-6">
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-none text-xs font-bold tracking-wider uppercase transition-all cursor-pointer shadow-sm shadow-blue-600/5 active:translate-y-px"
                    >
                      Access Feature
                    </button>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Static promotion banner */}
          <div className="bg-[#003580] border border-blue-900 rounded-none p-8 flex flex-col md:flex-row justify-between items-center gap-6 w-full text-left text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-blue-900/50 p-3 rounded-none border border-blue-700/80 text-blue-200 shrink-0">
                <BellRing className="h-5 w-5 text-blue-300 animate-bounce" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">Configure your Carmerica Digital Garage</h4>
                <p className="text-xs text-blue-100 mt-1">Input vehicle details, activate diagnostic scanners, and verify quotes instantly.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-white hover:bg-blue-50 text-[#003580] px-6 py-3 rounded-none text-xs font-bold uppercase transition-all shrink-0 cursor-pointer shadow-sm tracking-wider"
            >
              Configure Garage
            </button>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;
