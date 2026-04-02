import React from 'react';
import { 
  Check, 
  ChevronRight, 
  Car, 
  User, 
  CreditCard, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  Info,
  Lock,
  Sparkles,
  Zap,
  TrendingDown,
  MessageSquare,
  DollarSign,
  Wrench,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import AIGenie from '../../components/ai/AIGenie';

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [isAIGenieOpen, setIsAIGenieOpen] = React.useState(false);
  const [showBundles, setShowBundles] = React.useState(true);

  const steps = [
    { id: 1, name: 'Your Details', icon: User },
    { id: 2, name: 'Vehicle Info', icon: Car },
    { id: 3, name: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* AI Genie Floating Button */}
      <button 
        onClick={() => setIsAIGenieOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-red-600 text-white p-4 rounded-full shadow-2xl shadow-red-600/40 hover:scale-110 transition-all active:scale-95 group"
      >
        <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Need help with your booking?
        </span>
      </button>

      {/* AI Genie Modal */}
      {isAIGenieOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setIsAIGenieOpen(false)}
              className="absolute top-6 right-6 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Plus className="h-6 w-6 text-gray-400 rotate-45" />
            </button>
            <div className="p-8">
              <AIGenie />
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex items-center justify-center mb-16">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center relative">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 shadow-lg",
                step >= s.id ? "bg-red-600 text-white shadow-red-600/20" : "bg-white text-gray-400 border border-gray-100"
              )}>
                {step > s.id ? <Check className="h-6 w-6" /> : <s.icon className="h-6 w-6" />}
              </div>
              <span className={cn(
                "text-[10px] font-bold mt-4 uppercase tracking-widest absolute -bottom-8 whitespace-nowrap",
                step >= s.id ? "text-red-600" : "text-gray-400"
              )}>
                {s.name}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="h-[2px] w-16 md:w-32 mx-4 rounded-full bg-gray-100 overflow-hidden">
                <div className={cn(
                  "h-full bg-red-600 transition-all duration-700",
                  step > s.id ? "w-full" : "w-0"
                )} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Smart Bundle Upsell */}
          {showBundles && step === 2 && (
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-red-600/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
              <button 
                onClick={() => setShowBundles(false)}
                className="absolute top-6 right-6 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Zap className="h-6 w-6 text-yellow-400 fill-current" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI Smart Bundle: Save AED 120</h3>
                  <p className="text-white/80 text-sm">Based on your car's mileage, we recommend adding an AC Filter & Sanitization.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <button className="w-full md:w-auto bg-white text-red-600 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all active:scale-95">
                  Add to Booking (+ AED 180)
                </button>
                <button className="w-full md:w-auto bg-red-700 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-red-800 transition-all">
                  No thanks, just the service
                </button>
              </div>
            </div>
          )}

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl">
            {step === 1 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Your Details</h2>
                  <div className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Secure Checkout
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">First Name</label>
                    <input type="text" placeholder="e.g. John" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                    <input type="text" placeholder="e.g. Doe" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input type="email" placeholder="e.g. john@example.com" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                    <input type="tel" placeholder="e.g. +971 50 123 4567" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium" />
                  </div>
                </div>
                <div className="pt-8 border-t border-gray-50 flex justify-end">
                  <button 
                    onClick={() => setStep(2)}
                    className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 flex items-center shadow-xl shadow-red-600/20 transition-all active:scale-95"
                  >
                    Next Step <ChevronRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Vehicle Information</h2>
                  <div className="flex items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                    <Sparkles className="h-3 w-3 mr-1" /> AI Fitment Check
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Car Brand</label>
                    <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium appearance-none">
                      <option>Toyota</option>
                      <option>Honda</option>
                      <option>Ford</option>
                      <option>Tesla</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Model</label>
                    <input type="text" placeholder="e.g. Camry" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Year</label>
                    <input type="number" placeholder="e.g. 2022" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">License Plate (Optional)</label>
                    <input type="text" placeholder="e.g. DXB-1234" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium" />
                  </div>
                </div>
                <div className="pt-8 border-t border-gray-50 flex justify-between items-center">
                  <button 
                    onClick={() => setStep(1)}
                    className="text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-widest text-xs"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 flex items-center shadow-xl shadow-red-600/20 transition-all active:scale-95"
                  >
                    Next Step <ChevronRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Payment Method</h2>
                  <div className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
                    <Lock className="h-3 w-3 mr-1" /> Encrypted
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-6 border-2 border-red-600 bg-red-50/30 rounded-3xl flex items-center group cursor-pointer transition-all">
                    <div className="h-6 w-6 rounded-full border-2 border-red-600 flex items-center justify-center">
                      <div className="h-3 w-3 bg-red-600 rounded-full" />
                    </div>
                    <div className="ml-6 flex-grow">
                      <p className="font-bold text-gray-900">Pay at Garage</p>
                      <p className="text-sm text-gray-500">No payment required now. Pay after service completion.</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="p-6 border border-gray-100 rounded-3xl flex items-center opacity-50 cursor-not-allowed grayscale">
                    <div className="h-6 w-6 rounded-full border-2 border-gray-200" />
                    <div className="ml-6 flex-grow">
                      <p className="font-bold text-gray-900">Credit / Debit Card</p>
                      <p className="text-sm text-gray-500">Secure online payment (Coming Soon)</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-start">
                  <ShieldCheck className="h-6 w-6 text-green-600 mr-4 mt-0.5" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    By clicking "Confirm Booking", you agree to the <span className="text-red-600 font-bold underline cursor-pointer">Terms & Conditions</span> and <span className="text-red-600 font-bold underline cursor-pointer">Cancellation Policy</span>. Your data is protected by our AI Trust Engine.
                  </p>
                </div>

                <div className="pt-8 border-t border-gray-50 flex justify-between items-center">
                  <button 
                    onClick={() => setStep(2)}
                    className="text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-widest text-xs"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => navigate('/confirmation')}
                    className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 flex items-center shadow-xl shadow-red-600/20 transition-all active:scale-95"
                  >
                    Confirm Booking <Lock className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-8">Booking Summary</h3>
            <div className="flex items-start mb-8">
              <div className="relative">
                <img 
                  src="https://picsum.photos/seed/garage1/200/200" 
                  alt="Garage" 
                  className="h-20 w-20 rounded-2xl object-cover mr-4 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                  <ShieldCheck className="h-3 w-3" />
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Elite Auto Care</p>
                <p className="text-xs text-gray-400 flex items-center mt-1 font-bold uppercase tracking-widest">
                  <MapPin className="h-3 w-3 mr-1" /> Downtown, Dubai
                </p>
                <div className="flex items-center mt-2">
                  <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg mr-2">4.8</div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Excellent · 1,240 reviews</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-50 pt-8 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center"><Calendar className="h-4 w-4 mr-2" /> Date</span>
                <span className="text-sm font-bold text-gray-900">Oct 12, 2026</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center"><Clock className="h-4 w-4 mr-2" /> Time</span>
                <span className="text-sm font-bold text-gray-900">10:00 AM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center"><Wrench className="h-4 w-4 mr-2" /> Service</span>
                <span className="text-sm font-bold text-gray-900">General Service</span>
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-50 pt-8">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500">Service Price</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">AED 350</span>
                  <div className="flex items-center text-[10px] font-bold text-green-600 uppercase tracking-widest">
                    <TrendingDown className="h-3 w-3 mr-1" /> AI Price Verified
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500">Booking Fee</span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-widest">FREE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500">Taxes</span>
                <span className="text-sm font-bold text-gray-900">AED 17.50</span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-red-600">AED 367.50</span>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Saved AED 45 vs Market</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-100 rounded-full blur-2xl" />
            <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center relative z-10">
              <Info className="h-4 w-4 mr-2" /> Cancellation Policy
            </h4>
            <p className="text-xs text-blue-700/80 leading-relaxed relative z-10">
              Free cancellation up to 24 hours before your appointment. After that, a small late cancellation fee may apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
