import { 
  Car, MapPin, Calendar, User, Menu, Search, Globe, HelpCircle, Heart, Bell, 
  Wrench, Settings, ShieldCheck, Package, Clock, Phone, Droplets, Disc, 
  Cpu, CircleDot, Battery, ChevronRight, Star, CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

const SERVICE_TYPES = [
  { id: 'oil-change', label: 'Oil Change', icon: <Droplets className="text-amber-600" size={32} /> },
  { id: 'brake-repair', label: 'Brake Repair', icon: <Disc className="text-red-600" size={32} /> },
  { id: 'engine-diag', label: 'Engine Diagnostics', icon: <Cpu className="text-blue-600" size={32} /> },
  { id: 'tire-service', label: 'Tire Service', icon: <CircleDot className="text-slate-700" size={32} /> },
  { id: 'battery', label: 'Battery Check', icon: <Battery className="text-green-600" size={32} /> },
];

const FEATURED_SERVICES = [
  {
    id: 1,
    name: 'Full Vehicle Service',
    type: 'Maintenance',
    price: 149,
    rating: 4.9,
    reviews: 450,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800',
    location: 'Central Garage',
    badge: 'Best Seller'
  },
  {
    id: 2,
    name: 'Brake Pad Replacement',
    type: 'Repairs',
    price: 89,
    rating: 4.8,
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
    location: 'North Branch',
  },
  {
    id: 3,
    name: 'Air Filter Change',
    type: 'Maintenance',
    price: 25,
    rating: 4.7,
    reviews: 180,
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80&w=800',
    location: 'East Side Service',
  },
  {
    id: 4,
    name: 'Transmission Flush',
    type: 'Repairs',
    price: 199,
    rating: 4.9,
    reviews: 120,
    image: 'https://images.unsplash.com/photo-1530046339160-ce3e5b0c7a2f?auto=format&fit=crop&q=80&w=800',
    location: 'Main Hub',
    badge: 'Premium'
  },
];

const POPULAR_PARTS = [
  {
    id: 1,
    name: 'Premium Brake Pads',
    brand: 'Brembo',
    price: 65,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 2,
    name: 'Synthetic Engine Oil',
    brand: 'Mobil 1',
    price: 45,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 3,
    name: 'High-Perf Battery',
    brand: 'Bosch',
    price: 120,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('services');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''} transition-colors duration-300`}>
      {/* Header */}
      <header className="bg-[#003580] dark:bg-slate-950 text-white py-3 px-4 md:px-6 sticky top-0 z-50 shadow-md backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <motion.h1 
              whileHover={{ scale: 1.05 }}
              className="text-xl font-black tracking-tighter cursor-pointer flex items-center gap-2"
            >
              <div className="bg-white dark:bg-slate-800 text-[#003580] dark:text-blue-400 p-1 rounded-lg shadow-inner">
                <Car size={20} />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">CarMerica</span>
            </motion.h1>
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider">
              <a 
                href="#" 
                className={`flex items-center gap-2 py-2 transition-all relative group ${activeTab === 'services' ? 'text-white' : 'text-white/70 hover:text-white'}`}
                onClick={() => setActiveTab('services')}
              >
                <Wrench size={18} />
                Services
                {activeTab === 'services' && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />}
              </a>
              <a 
                href="#" 
                className={`flex items-center gap-2 py-2 transition-all relative group ${activeTab === 'parts' ? 'text-white' : 'text-white/70 hover:text-white'}`}
                onClick={() => setActiveTab('parts')}
              >
                <Package size={18} />
                Car Parts
                {activeTab === 'parts' && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />}
              </a>
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 mr-2">
              <button 
                onClick={toggleDarkMode}
                className="p-2 hover:bg-white/10 rounded-lg transition-all active:scale-90"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Bell size={18} className="text-yellow-400" /> : <Bell size={18} />}
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <Globe size={18} />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <HelpCircle size={18} />
              </button>
            </div>
            <button className="hidden xl:block px-4 py-2 text-xs font-bold hover:bg-white/10 rounded-lg transition-all border border-white/20 hover:border-white/40">
              Register your Garage
            </button>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-xs font-bold bg-white text-[#003580] rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95">
                Register
              </button>
              <button className="px-4 py-2 text-xs font-bold bg-white text-[#003580] rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95">
                Sign in
              </button>
            </div>
            <button className="lg:hidden p-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero & Search */}
      <section className="bg-[#003580] dark:bg-slate-950 text-white pt-12 pb-24 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 -mr-32 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[0.95] tracking-tighter">
              Expert care for <br/>
              <span className="text-[#febb02] drop-shadow-sm">your vehicle</span>
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-xl font-medium leading-relaxed">
              Book professional services, find genuine parts, and keep your car in peak condition with CarMerica's trusted network.
            </p>
          </motion.div>

          {/* Search Bar - Compacted */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="bg-[#febb02] p-1.5 rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch gap-1.5">
              <div className="flex-[1.5] bg-white dark:bg-slate-900 rounded-xl flex items-center px-4 py-3 text-slate-800 dark:text-white focus-within:ring-2 ring-white/20 transition-all shadow-inner border border-transparent focus-within:border-blue-500">
                <Search className="text-slate-400 mr-3" size={20} />
                <input 
                  type="text" 
                  placeholder="Service or part..." 
                  className="w-full outline-none text-base font-bold placeholder:text-slate-400 bg-transparent"
                />
              </div>
              
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl flex items-center px-4 py-3 text-slate-800 dark:text-white focus-within:ring-2 ring-white/20 transition-all shadow-inner border border-transparent focus-within:border-blue-500">
                <Car className="text-slate-400 mr-3" size={20} />
                <div className="flex flex-col flex-1">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Vehicle</span>
                  <input type="text" placeholder="e.g. Toyota Camry" className="outline-none text-sm font-bold bg-transparent" />
                </div>
                <div className="mx-3 h-8 w-px bg-slate-100 dark:bg-slate-800 hidden md:block"></div>
                <div className="flex flex-col w-16">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Year</span>
                  <input type="text" placeholder="2022" className="outline-none text-sm font-bold bg-transparent" />
                </div>
              </div>

              <div className="md:w-64 bg-white dark:bg-slate-900 rounded-xl flex items-center px-4 py-3 text-slate-800 dark:text-white focus-within:ring-2 ring-white/20 transition-all shadow-inner border border-transparent focus-within:border-blue-500">
                <Calendar className="text-slate-400 mr-3" size={20} />
                <div className="flex flex-col flex-1">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Date</span>
                  <input type="date" className="outline-none text-sm font-bold bg-transparent cursor-pointer" />
                </div>
              </div>

              <button className="bg-[#006ce4] hover:bg-[#005bb8] text-white font-black px-8 py-3 rounded-xl transition-all text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95">
                Search
              </button>
            </div>
            
            <div className="mt-4 flex items-center gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-4 h-4 rounded border-2 border-white/30 flex items-center justify-center group-hover:border-white transition-all">
                  <input type="checkbox" className="hidden" defaultChecked />
                  <div className="w-2 h-2 bg-[#febb02] rounded-sm" />
                </div>
                <span className="opacity-90">Include emergency mobile service</span>
              </label>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-12">
        
        {/* Service Types Grid */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Service Categories</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-base">Professional care for every part of your vehicle</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {SERVICE_TYPES.map((type) => (
              <motion.div
                key={type.id}
                whileHover={{ y: -5, shadow: "0 15px 30px -10px rgb(0 0 0 / 0.1)" }}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#006ce4] dark:hover:border-[#006ce4] transition-all group"
              >
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-[#006ce4]/10 transition-colors">
                  {type.icon}
                </div>
                <span className="font-extrabold text-slate-700 dark:text-slate-200 text-center text-sm">{type.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Services */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Top-Rated Services</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-base">Expert mechanics vetted for quality and reliability</p>
            </div>
            <button className="text-[#006ce4] font-black hover:underline flex items-center gap-1 text-base">
              View all <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_SERVICES.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 group cursor-pointer hover:shadow-xl transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <button className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-white shadow-lg transition-all active:scale-90">
                    <Heart size={18} />
                  </button>
                  {service.badge && (
                    <div className="absolute top-3 left-3 bg-[#febb02] text-[#003580] px-3 py-1 rounded-full text-[10px] font-black shadow-lg uppercase tracking-wider">
                      {service.badge}
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black text-slate-800 dark:text-white shadow-sm">
                    {service.type}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-black text-lg text-slate-900 dark:text-white leading-tight group-hover:text-[#006ce4] transition-colors">{service.name}</h4>
                    <div className="flex items-center gap-1 bg-[#003580] dark:bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-black shadow-sm">
                      <Star size={12} fill="currentColor" /> {service.rating}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2 font-medium">
                    <MapPin size={16} className="text-[#006ce4]" /> {service.location}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      <span className="font-black text-slate-900 dark:text-slate-200">{service.reviews}</span> reviews
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-0.5">Starting from</p>
                      <p className="text-2xl font-black text-[#003580] dark:text-blue-400">£{service.price}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Car Parts Section */}
        <section className="mb-16 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Genuine Car Parts</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-base">Quality components for every make and model</p>
            </div>
            <button className="bg-slate-50 dark:bg-slate-800 text-[#006ce4] dark:text-blue-400 font-black px-6 py-2.5 rounded-xl hover:bg-[#006ce4]/10 transition-all shadow-sm text-sm">
              Shop all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POPULAR_PARTS.map((part) => (
              <motion.div 
                key={part.id} 
                whileHover={{ x: 5, shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-4 border border-transparent hover:border-[#006ce4]/20 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="relative overflow-hidden rounded-xl shadow-md shrink-0">
                  <img src={part.image} alt={part.name} className="w-20 h-20 object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-0.5">{part.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">{part.brand}</p>
                  <p className="text-xl font-black text-[#003580] dark:text-blue-400">£{part.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Promotions */}
        <section className="grid md:grid-cols-2 gap-6 mb-16">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl"
          >
            <div className="relative z-10">
              <div className="bg-[#febb02] text-[#003580] w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 shadow-lg">Limited Offer</div>
              <h3 className="text-2xl md:text-3xl font-black mb-3 leading-tight">Winter Ready <br/>Check</h3>
              <p className="mb-8 text-white/70 max-w-xs font-medium text-base leading-relaxed">Get a comprehensive 25-point safety inspection for your vehicle.</p>
              <button className="bg-[#006ce4] text-white px-8 py-3 rounded-xl font-black hover:bg-[#005bb8] transition-all shadow-xl active:scale-95 text-sm">
                Book for £29.99
              </button>
            </div>
            <Wrench className="absolute -right-12 -bottom-12 text-white/5 w-64 h-64 rotate-12" />
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[#006ce4] dark:text-blue-400 font-black text-[10px] uppercase tracking-widest mb-4">
                <Star size={14} fill="currentColor" /> Genius Rewards
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3 leading-tight">Save 10% on <br/>your first service</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium text-base leading-relaxed">Join CarMerica Genius to unlock instant discounts and earn points.</p>
              <div className="flex gap-3">
                <button className="bg-[#003580] dark:bg-blue-600 text-white px-8 py-3 rounded-xl font-black hover:shadow-xl transition-all active:scale-95 text-sm">Sign in</button>
                <button className="text-[#003580] dark:text-blue-400 font-black px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-sm">Join Free</button>
              </div>
            </div>
            <div className="w-32 h-32 bg-[#003580] dark:bg-blue-600 rounded-2xl flex items-center justify-center text-white text-6xl font-black italic shadow-2xl rotate-3 shrink-0">
              G
            </div>
          </motion.div>
        </section>

        {/* Trust Badges */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16 py-12 px-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-[#006ce4] dark:text-blue-400 shadow-inner">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="font-black text-lg text-slate-900 dark:text-white mb-1">Certified Mechanics</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Every garage is strictly vetted for quality and expertise</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 shadow-inner">
              <Clock size={28} />
            </div>
            <div>
              <h4 className="font-black text-lg text-slate-900 dark:text-white mb-1">Fast Turnaround</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Most routine services are completed within the same day</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
              <Phone size={28} />
            </div>
            <div>
              <h4 className="font-black text-lg text-slate-900 dark:text-white mb-1">24/7 Expert Support</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Our automotive experts are here to help you anytime</p>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-[#003580] dark:bg-slate-950 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
            >
              <Bell className="mx-auto mb-6 text-[#febb02]" size={48} />
            </motion.div>
            <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Never miss a service</h3>
            <p className="text-lg text-white/70 mb-10 font-medium leading-relaxed">Sign up for maintenance reminders and we'll notify you when your car needs its next check-up.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-6 py-4 rounded-xl text-slate-900 dark:text-white bg-white dark:bg-slate-900 outline-none font-bold placeholder:text-slate-400 shadow-inner border-2 border-transparent focus:border-[#febb02] transition-all text-sm"
              />
              <button className="bg-[#006ce4] px-8 py-4 rounded-xl font-black hover:bg-[#005bb8] transition-all shadow-xl active:scale-95 text-sm">
                Subscribe
              </button>
            </div>
            <p className="mt-6 text-xs opacity-50 flex items-center justify-center gap-2 font-medium">
              <CheckCircle2 size={14} /> No spam, just essential car care tips.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 lg:col-span-1">
              <h1 className="text-2xl font-black tracking-tighter text-[#003580] dark:text-blue-400 mb-6">CarMerica</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                The world's leading platform for car services and genuine parts. Making vehicle maintenance simple and accessible for everyone.
              </p>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#003580] dark:hover:text-blue-400 transition-colors cursor-pointer shadow-sm">
                  <Globe size={20} />
                </div>
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#003580] dark:hover:text-blue-400 transition-colors cursor-pointer shadow-sm">
                  <HelpCircle size={20} />
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-black text-slate-900 dark:text-white mb-6 uppercase text-[10px] tracking-[0.2em]">Services</h5>
              <ul className="space-y-3 text-sm font-bold text-[#006ce4] dark:text-blue-400">
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Oil Changes</li>
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Brake Repairs</li>
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Engine Diagnostics</li>
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Tire Services</li>
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Battery Checks</li>
              </ul>
            </div>
            <div>
              <h5 className="font-black text-slate-900 dark:text-white mb-6 uppercase text-[10px] tracking-[0.2em]">Car Parts</h5>
              <ul className="space-y-3 text-sm font-bold text-[#006ce4] dark:text-blue-400">
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Engine Components</li>
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Braking Systems</li>
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Filters & Fluids</li>
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Electrical</li>
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Tires & Wheels</li>
              </ul>
            </div>
            <div>
              <h5 className="font-black text-slate-900 dark:text-white mb-6 uppercase text-[10px] tracking-[0.2em]">Partners</h5>
              <ul className="space-y-3 text-sm font-bold text-[#006ce4] dark:text-blue-400">
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">List your Garage</li>
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Partner Help</li>
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Supplier Portal</li>
                <li className="hover:text-[#003580] dark:hover:text-white cursor-pointer transition-colors">Quality Standards</li>
              </ul>
            </div>
            <div className="col-span-2 lg:col-span-1">
              <h5 className="font-black text-slate-900 dark:text-white mb-6 uppercase text-[10px] tracking-[0.2em]">Download App</h5>
              <div className="flex flex-col gap-3">
                <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-black dark:hover:bg-slate-700 transition-all shadow-lg active:scale-95">
                  <div className="text-2xl"></div>
                  <div className="text-[9px] font-black uppercase tracking-widest">
                    App Store
                  </div>
                </div>
                <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-black dark:hover:bg-slate-700 transition-all shadow-lg active:scale-95">
                  <div className="text-2xl">▶</div>
                  <div className="text-[9px] font-black uppercase tracking-widest">
                    Google Play
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-50 dark:border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Copyright © 2024–2026 CarMerica.com™. All rights reserved.</p>
            <div className="flex items-center gap-8">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Visa_2021.svg/1200px-Visa_2021.svg.png" alt="Visa" className="h-4 opacity-20 dark:opacity-40 grayscale hover:grayscale-0 transition-all cursor-pointer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 opacity-20 dark:opacity-40 grayscale hover:grayscale-0 transition-all cursor-pointer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="PayPal" className="h-4 opacity-20 dark:opacity-40 grayscale hover:grayscale-0 transition-all cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
