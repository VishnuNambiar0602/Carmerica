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
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CardPaymentForm = ({ onConfirm, isSubmitting }: { onConfirm: (stripe: any, elements: any) => Promise<void>; isSubmitting: boolean }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    try {
      await onConfirm(stripe, elements);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && <div className="text-sm text-red-600 font-bold">{errorMessage}</div>}
      <button 
        type="submit"
        disabled={isSubmitting || !stripe || !elements}
        className="w-full bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 flex items-center justify-center shadow-xl shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Processing Payment...' : 'Confirm & Pay Now'} <Lock className="h-5 w-5 ml-2" />
      </button>
    </form>
  );
};

const MockCreditCard = ({ number, name, expiry, cvv, tilt }: { number: string; name: string; expiry: string; cvv: string; tilt: { x: number; y: number } }) => {
  return (
    <div 
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className="w-full max-w-md h-56 mx-auto rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between mb-8 select-none"
    >
      <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-12 pointer-events-none" />
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Premium Member</p>
          <div className="h-8 w-12 bg-yellow-400/80 rounded-lg flex items-center justify-center font-bold text-gray-900 shadow-inner text-xs">CHIP</div>
        </div>
        <CreditCard className="h-10 w-10 text-white/30" />
      </div>
      <div>
        <p className="text-xl font-mono tracking-widest text-center py-2">
          {number || '•••• •••• •••• ••••'}
        </p>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Cardholder</p>
          <p className="text-sm font-bold tracking-wide">{name || 'YOUR NAME'}</p>
        </div>
        <div className="flex gap-4">
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Expires</p>
            <p className="text-sm font-bold tracking-wide">{expiry || 'MM/YY'}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">CVV</p>
            <p className="text-sm font-bold tracking-wide">{cvv || '•••'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [showBundles, setShowBundles] = React.useState(true);

  const [paymentMethod, setPaymentMethod] = React.useState<'garage' | 'card'>('garage');
  const [pendingBookingId, setPendingBookingId] = React.useState<string | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [stripePromise, setStripePromise] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/payments/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.publishableKey) {
          setStripePromise(loadStripe(data.publishableKey));
        }
      })
      .catch((err) => console.error('Failed to load Stripe config', err));
  }, []);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [carBrand, setCarBrand] = React.useState('Toyota');
  const [carModel, setCarModel] = React.useState('Camry');
  const [carYear, setCarYear] = React.useState('2022');
  const [license, setLicense] = React.useState('DXB-1234');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [vendorIdParam, setVendorIdParam] = React.useState<string | null>(null);
  const [serviceParam, setServiceParam] = React.useState<string | null>(null);
  const [priceParam, setPriceParam] = React.useState<number | null>(null);

  const [garage, setGarage] = React.useState<any>(null);
  const [service, setService] = React.useState<any>(null);
  const [loadingGarage, setLoadingGarage] = React.useState(false);
  const [availableSlots, setAvailableSlots] = React.useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // 3D Tilt states
  const [garageTilt, setGarageTilt] = React.useState({ x: 0, y: 0 });
  const [cardTilt, setCardTilt] = React.useState({ x: 0, y: 0 });
  const [mockCardTilt, setMockCardTilt] = React.useState({ x: 0, y: 0 });

  // Mock Card states
  const [mockCardNum, setMockCardNum] = React.useState('');
  const [mockCardName, setMockCardName] = React.useState('');
  const [mockCardExp, setMockCardExp] = React.useState('');
  const [mockCardCvv, setMockCardCvv] = React.useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('vendorId') || params.get('garageId');
    const s = params.get('service') || params.get('serviceId');
    const p = params.get('price');
    if (v) setVendorIdParam(v);
    if (s) setServiceParam(s);
    if (p) setPriceParam(Number(p));
  }, []);

  React.useEffect(() => {
    if (!vendorIdParam) return;
    setLoadingGarage(true);
    fetch(`/api/garages/${vendorIdParam}`)
      .then((r) => r.json())
      .then((data) => {
        setGarage(data);
        if (serviceParam) {
          const matched = data.services?.find((s: any) =>
            s.name === serviceParam || s.id === serviceParam
          );
          if (matched) setService(matched);
        }
      })
      .catch((err) => console.error('Failed to fetch garage details', err))
      .finally(() => setLoadingGarage(false));
  }, [vendorIdParam, serviceParam]);

  React.useEffect(() => {
    if (!date || !vendorIdParam) return;
    setLoadingSlots(true);
    fetch(`/api/availability/slots?vendorId=${vendorIdParam}&date=${date}`)
      .then((r) => r.json())
      .then((data) => setAvailableSlots(data.slots.map((s: any) => s.time)))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, vendorIdParam]);

  function validate(stepNum: number): boolean {
    const newErrors: Record<string, string> = {};
    if (stepNum === 1) {
      if (!firstName.trim()) newErrors.firstName = 'First name is required';
      if (!lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email';
      if (!phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^\+?[\d\s\-()]{8,15}$/.test(phone)) newErrors.phone = 'Enter a valid phone number';
    }
    if (stepNum === 2) {
      if (!carModel.trim()) newErrors.carModel = 'Car model is required';
      const yearNum = Number(carYear);
      if (!carYear || yearNum < 1990 || yearNum > new Date().getFullYear() + 1) {
        newErrors.carYear = 'Enter a valid year (1990-present)';
      }
      if (!date) newErrors.date = 'Please select a date';
      if (!time) newErrors.time = 'Please select a time';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSelectCardPayment = async () => {
    setPaymentMethod('card');
    if (clientSecret) return; // already loaded

    setErrors({});
    setIsSubmitting(true);
    try {
      const finalPrice = total;
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        carModel,
        carYear,
        license,
        date,
        time,
        service: service?.name || serviceParam || 'General Service',
        serviceId: service?.id || '',
        price: finalPrice,
        vendorId: garage?.vendor_id || 'vendor-1',
        garageId: garage?.id || vendorIdParam || 'garage-1',
        promoId: promoResult?.promoId || undefined
      };
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Create the pending booking
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setPendingBookingId(data.id);
        
        // Fetch payment intent secret
        const intentRes = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: finalPrice, currency: 'usd', bookingId: data.id })
        });
        const intentData = await intentRes.json();
        if (intentRes.ok && intentData.clientSecret) {
          setClientSecret(intentData.clientSecret);
        } else {
          alert('Failed to initialize payment gateway.');
          setPaymentMethod('garage');
        }
      } else {
        alert(data.message || 'Failed to create booking.');
        setPaymentMethod('garage');
      }
    } catch (err) {
      console.error(err);
      alert('Network error initializing card payment.');
      setPaymentMethod('garage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCardPayment = async (stripe: any, elements: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation?bookingId=${pendingBookingId}`,
        },
      });
      if (error) {
        alert(error.message || 'Payment confirmation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [promoCode, setPromoCode] = React.useState('');
  const [promoResult, setPromoResult] = React.useState<any>(null);
  const [promoError, setPromoError] = React.useState('');
  const [isApplyingPromo, setIsApplyingPromo] = React.useState(false);

  const servicePrice = service?.price || priceParam || 0;
  const discount = promoResult?.discountAmount || 0;
  const discountedPrice = Math.max(0, servicePrice - discount);
  const tax = Math.round(discountedPrice * 0.05 * 100) / 100;
  const total = Math.round((discountedPrice + tax) * 100) / 100;
  const hasSavings = service?.marketPrice && service.marketPrice > service.price;
  const savings = hasSavings ? Math.round((service.marketPrice - service.price) * 100) / 100 : 0;

  async function applyPromo() {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    setPromoError('');
    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, amount: servicePrice, vendorId: garage?.vendor_id || vendorIdParam }),
      });
      const data = await res.json();
      if (res.ok) {
        setPromoResult(data);
        setPromoError('');
      } else {
        setPromoError(data.message || 'Invalid or expired promo code');
        setPromoResult(null);
      }
    } catch (err) {
      setPromoError('Failed to validate promo code');
      setPromoResult(null);
    } finally {
      setIsApplyingPromo(false);
    }
  }

  const steps = [
    { id: 1, name: 'Your Details', icon: User },
    { id: 2, name: 'Vehicle Info', icon: Car },
    { id: 3, name: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
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
              <div className="h-0.5 w-16 md:w-32 mx-4 rounded-full bg-gray-100 overflow-hidden">
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
            <div className="bg-linear-to-br from-red-600 to-red-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-red-600/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-full bg-linear-to-l from-white/10 to-transparent pointer-events-none" />
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
                  <h3 className="text-xl font-bold">AI Smart Bundle: Save $120</h3>
                  <p className="text-white/80 text-sm">Based on your car's mileage, we recommend adding an AC Filter & Sanitization.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <button className="w-full md:w-auto bg-white text-red-600 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all active:scale-95">
                  Add to Booking (+ $180)
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
                    <input value={firstName} onChange={(e) => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, firstName: '' })); }} type="text" placeholder="e.g. John" className={cn("w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium", errors.firstName && "border-red-600 focus:border-red-600 bg-red-50/10")} />
                    {errors.firstName && <p className="text-xs text-red-600 font-bold">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                    <input value={lastName} onChange={(e) => { setLastName(e.target.value); setErrors(prev => ({ ...prev, lastName: '' })); }} type="text" placeholder="e.g. Doe" className={cn("w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium", errors.lastName && "border-red-600 focus:border-red-600 bg-red-50/10")} />
                    {errors.lastName && <p className="text-xs text-red-600 font-bold">{errors.lastName}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input value={email} onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }} type="email" placeholder="e.g. john@example.com" className={cn("w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium", errors.email && "border-red-600 focus:border-red-600 bg-red-50/10")} />
                    {errors.email && <p className="text-xs text-red-600 font-bold">{errors.email}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                    <input value={phone} onChange={(e) => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: '' })); }} type="tel" placeholder="e.g. +971 50 123 4567" className={cn("w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium", errors.phone && "border-red-600 focus:border-red-600 bg-red-50/10")} />
                    {errors.phone && <p className="text-xs text-red-600 font-bold">{errors.phone}</p>}
                  </div>
                </div>
                <div className="pt-8 border-t border-gray-50 flex justify-end">
                  <button 
                    onClick={() => { if (validate(1)) setStep(2); }}
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
                    <select value={carBrand} onChange={(e) => setCarBrand(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium appearance-none">
                      <option>Toyota</option>
                      <option>Honda</option>
                      <option>Ford</option>
                      <option>Tesla</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Model</label>
                    <input value={carModel} onChange={(e) => { setCarModel(e.target.value); setErrors(prev => ({ ...prev, carModel: '' })); }} type="text" placeholder="e.g. Camry" className={cn("w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium", errors.carModel && "border-red-600 focus:border-red-600 bg-red-50/10")} />
                    {errors.carModel && <p className="text-xs text-red-600 font-bold">{errors.carModel}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Year</label>
                    <input value={carYear} onChange={(e) => { setCarYear(e.target.value); setErrors(prev => ({ ...prev, carYear: '' })); }} type="number" placeholder="e.g. 2022" className={cn("w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium", errors.carYear && "border-red-600 focus:border-red-600 bg-red-50/10")} />
                    {errors.carYear && <p className="text-xs text-red-600 font-bold">{errors.carYear}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">License Plate (Optional)</label>
                    <input value={license} onChange={(e) => setLicense(e.target.value)} type="text" placeholder="e.g. DXB-1234" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium" />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-red-600" /> Select Appointment Date & Time
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preferred Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        value={date}
                        onChange={(e) => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: '' })); }}
                        className={cn("w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium", errors.date && "border-red-600")}
                      />
                      {errors.date && <p className="text-xs text-red-600 font-bold">{errors.date}</p>}
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available Time Slots</label>
                      {!date ? (
                        <p className="text-sm text-gray-400 py-4">Please select a date first</p>
                      ) : loadingSlots ? (
                        <p className="text-sm text-gray-400 py-4 flex items-center"><Clock className="animate-spin h-4 w-4 mr-2" /> Loading slots...</p>
                      ) : availableSlots.length === 0 ? (
                        <p className="text-sm text-red-500 py-4 font-bold">No slots available for this date</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-2">
                           {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => { setTime(slot); setErrors(prev => ({ ...prev, time: '' })); }}
                              className={cn(
                                "p-3 rounded-xl text-xs font-bold border transition-all text-center",
                                time === slot
                                  ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20"
                                  : "bg-gray-50 text-gray-700 border-gray-100 hover:border-red-200"
                              )}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.time && <p className="text-xs text-red-600 font-bold">{errors.time}</p>}
                    </div>
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
                    onClick={() => { if (validate(2)) setStep(3); }}
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
                  <div 
                    onClick={() => {
                      setPaymentMethod('garage');
                      setClientSecret(null);
                    }}
                    onMouseMove={(e) => {
                      const card = e.currentTarget;
                      const box = card.getBoundingClientRect();
                      const x = e.clientX - box.left - box.width / 2;
                      const y = e.clientY - box.top - box.height / 2;
                      const factorX = 10 / (box.height / 2);
                      const factorY = 10 / (box.width / 2);
                      setGarageTilt({ x: -y * factorX, y: x * factorY });
                    }}
                    onMouseLeave={() => setGarageTilt({ x: 0, y: 0 })}
                    style={{
                      transform: `perspective(1000px) rotateX(${garageTilt.x}deg) rotateY(${garageTilt.y}deg)`,
                      transition: 'transform 0.15s ease-out',
                      transformStyle: 'preserve-3d',
                    }}
                    className={cn(
                      "p-6 border-2 rounded-3xl flex items-center group cursor-pointer transition-all hover:shadow-lg",
                      paymentMethod === 'garage' 
                        ? "border-red-600 bg-red-50/30 shadow-md" 
                        : "border-gray-100 bg-white"
                    )}
                  >
                    <div className={cn(
                      "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                      paymentMethod === 'garage' ? "border-red-600" : "border-gray-200"
                    )}>
                      {paymentMethod === 'garage' && <div className="h-3 w-3 bg-red-600 rounded-full" />}
                    </div>
                    <div className="ml-6 grow">
                      <p className="font-bold text-gray-900">Pay at Garage</p>
                      <p className="text-sm text-gray-500">No payment required now. Pay after service completion.</p>
                    </div>
                    <DollarSign className={cn("h-8 w-8 transition-colors", paymentMethod === 'garage' ? "text-red-600" : "text-gray-400")} />
                  </div>

                  <div 
                    onClick={handleSelectCardPayment}
                    onMouseMove={(e) => {
                      const card = e.currentTarget;
                      const box = card.getBoundingClientRect();
                      const x = e.clientX - box.left - box.width / 2;
                      const y = e.clientY - box.top - box.height / 2;
                      const factorX = 10 / (box.height / 2);
                      const factorY = 10 / (box.width / 2);
                      setCardTilt({ x: -y * factorX, y: x * factorY });
                    }}
                    onMouseLeave={() => setCardTilt({ x: 0, y: 0 })}
                    style={{
                      transform: `perspective(1000px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
                      transition: 'transform 0.15s ease-out',
                      transformStyle: 'preserve-3d',
                    }}
                    className={cn(
                      "p-6 border-2 rounded-3xl flex items-center group cursor-pointer transition-all hover:shadow-lg",
                      paymentMethod === 'card' 
                        ? "border-red-600 bg-red-50/30 shadow-md" 
                        : "border-gray-100 bg-white"
                    )}
                  >
                    <div className={cn(
                      "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                      paymentMethod === 'card' ? "border-red-600" : "border-gray-200"
                    )}>
                      {paymentMethod === 'card' && <div className="h-3 w-3 bg-red-600 rounded-full" />}
                    </div>
                    <div className="ml-6 grow">
                      <p className="font-bold text-gray-900">Credit / Debit Card</p>
                      <p className="text-sm text-gray-500">Secure online payment via Stripe Elements</p>
                    </div>
                    <CreditCard className={cn("h-8 w-8 transition-colors", paymentMethod === 'card' ? "text-red-600" : "text-gray-400")} />
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-start">
                  <ShieldCheck className="h-6 w-6 text-green-600 mr-4 mt-0.5" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    By clicking "Confirm Booking" / "Pay & Confirm", you agree to the <span className="text-red-600 font-bold underline cursor-pointer">Terms & Conditions</span> and <span className="text-red-600 font-bold underline cursor-pointer">Cancellation Policy</span>. Your data is protected by our AI Trust Engine.
                  </p>
                </div>

                {paymentMethod === 'card' ? (
                  clientSecret && stripePromise && !clientSecret.startsWith('pi_mock_secret') ? (
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CardPaymentForm onConfirm={handleConfirmCardPayment} isSubmitting={isSubmitting} />
                      </Elements>
                    </div>
                  ) : clientSecret ? (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
                      <div className="text-center mb-6">
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                          Mock Payment Gateway Active
                        </span>
                      </div>
                      <MockCreditCard 
                        number={mockCardNum} 
                        name={mockCardName} 
                        expiry={mockCardExp} 
                        cvv={mockCardCvv} 
                        tilt={mockCardTilt} 
                      />
                      
                      <div 
                        onMouseMove={(e) => {
                          const card = e.currentTarget;
                          const box = card.getBoundingClientRect();
                          const x = e.clientX - box.left - box.width / 2;
                          const y = e.clientY - box.top - box.height / 2;
                          const factorX = 8 / (box.height / 2);
                          const factorY = 8 / (box.width / 2);
                          setMockCardTilt({ x: -y * factorX, y: x * factorY });
                        }}
                        onMouseLeave={() => setMockCardTilt({ x: 0, y: 0 })}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Card Number</label>
                            <input 
                              type="text" 
                              placeholder="4111 2222 3333 4444" 
                              value={mockCardNum}
                              onChange={(e) => setMockCardNum(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19))}
                              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cardholder Name</label>
                            <input 
                              type="text" 
                              placeholder="John Doe" 
                              value={mockCardName}
                              onChange={(e) => setMockCardName(e.target.value)}
                              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expiry Date</label>
                              <input 
                                type="text" 
                                placeholder="MM/YY" 
                                value={mockCardExp}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\//g, '');
                                  if (val.length > 2) {
                                    val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                  }
                                  setMockCardExp(val.slice(0, 5));
                                }}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium font-mono"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">CVV</label>
                              <input 
                                type="password" 
                                placeholder="123" 
                                value={mockCardCvv}
                                onChange={(e) => setMockCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none transition-all font-medium font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex justify-between items-center gap-4">
                          <button 
                            type="button"
                            onClick={() => { setPaymentMethod('garage'); setClientSecret(null); }}
                            className="text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-widest text-xs"
                          >
                            Cancel
                          </button>
                          <button 
                            type="button"
                            onClick={async () => {
                              if (!mockCardNum || !mockCardName || !mockCardExp || !mockCardCvv) {
                                alert('Please fill in all card details.');
                                return;
                              }
                              setIsSubmitting(true);
                              try {
                                const confirmRes = await fetch('/api/payments/confirm', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ paymentIntentId: clientSecret.replace('_secret_', '_') })
                                });
                                if (confirmRes.ok) {
                                  navigate(`/confirmation?bookingId=${pendingBookingId}`);
                                } else {
                                  alert('Payment processing failed.');
                                }
                              } catch (err) {
                                console.error(err);
                                alert('Network error processing payment.');
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                            disabled={isSubmitting}
                            className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center shadow-xl shadow-red-600/20 transition-all active:scale-95 cursor-pointer"
                          >
                            {isSubmitting ? 'Processing...' : 'Pay & Confirm'} <Lock className="h-5 w-5 ml-2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                      <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-2"></span>
                      <span>Initializing secure card checkout...</span>
                    </div>
                  )
                ) : (
                  <div className="pt-8 border-t border-gray-50 flex justify-between items-center">
                    <button 
                      onClick={() => setStep(2)}
                      className="text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-widest text-xs"
                    >
                      Back
                    </button>
                    <button 
                      onClick={async () => {
                        if (!validate(1)) {
                          setStep(1);
                          return;
                        }
                        if (!validate(2)) {
                          setStep(2);
                          return;
                        }
                        if (isSubmitting) return;
                        setIsSubmitting(true);
                        try {
                          const finalPrice = discountedPrice;
                          const payload = {
                            firstName,
                            lastName,
                            email,
                            phone,
                            carModel,
                            carYear,
                            license,
                            date,
                            time,
                            service: service?.name || serviceParam || 'General Service',
                            serviceId: service?.id || '',
                            price: finalPrice,
                            vendorId: garage?.vendor_id || 'vendor-1',
                            garageId: garage?.id || vendorIdParam || 'garage-1',
                            promoId: promoResult?.promoId || undefined
                          };
                          const token = localStorage.getItem('token');
                          const headers: Record<string, string> = {
                            'Content-Type': 'application/json',
                          };
                          if (token) {
                            headers['Authorization'] = `Bearer ${token}`;
                          }
                          const res = await fetch('/api/bookings', {
                            method: 'POST',
                            headers,
                            body: JSON.stringify(payload)
                          });
                          const data = await res.json();
                          if (res.ok) {
                            navigate('/confirmation');
                          } else {
                            alert(data.message || 'Booking failed');
                          }
                        } catch (err) {
                          console.error(err);
                          alert('Network error');
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 flex items-center shadow-xl shadow-red-600/20 transition-all active:scale-95"
                    >
                      {isSubmitting ? 'Confirming...' : 'Confirm Booking'} <Lock className="h-5 w-5 ml-2" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-8">Booking Summary</h3>
            {loadingGarage ? (
              <div className="animate-pulse space-y-6 py-4">
                <div className="h-20 bg-gray-100 rounded-2xl" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start mb-8">
                  <div className="relative">
                    <img 
                      src={garage?.image || "https://picsum.photos/seed/garage1/200/200"} 
                      alt="Garage" 
                      className="h-20 w-20 rounded-2xl object-cover mr-4 shadow-md"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      width="80"
                      height="80"
                      decoding="async"
                    />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{garage?.name || "Selected Garage"}</p>
                    <p className="text-xs text-gray-400 flex items-center mt-1 font-bold uppercase tracking-widest">
                      <MapPin className="h-3 w-3 mr-1" /> {garage?.location || "-"}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg mr-2">{garage?.rating || "4.8"}</div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Excellent · {garage?.reviews || "1,240"} reviews</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-gray-50 pt-8 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center"><Calendar className="h-4 w-4 mr-2" /> Date</span>
                    <span className="text-sm font-bold text-gray-900">{date || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center"><Clock className="h-4 w-4 mr-2" /> Time</span>
                    <span className="text-sm font-bold text-gray-900">{time || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center"><Wrench className="h-4 w-4 mr-2" /> Service</span>
                    <span className="text-sm font-bold text-gray-900">{service?.name || serviceParam || "General Service"}</span>
                  </div>
                </div>

                <div className="space-y-4 border-t border-gray-50 pt-8">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">Service Price</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">${servicePrice}</span>
                      <div className="flex items-center text-[10px] font-bold text-green-600 uppercase tracking-widest">
                        <TrendingDown className="h-3 w-3 mr-1" /> AI Price Verified
                      </div>
                    </div>
                  </div>

                  {/* Promo Code Input Block */}
                  <div className="py-2 border-t border-b border-gray-50/50 my-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Promo Code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="grow bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-red-200 uppercase tracking-wider text-gray-900"
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        disabled={isApplyingPromo || !promoCode}
                        className="bg-gray-900 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        {isApplyingPromo ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[10px] text-red-600 font-bold mt-1.5">{promoError}</p>
                    )}
                    {promoResult && (
                      <p className="text-[10px] text-green-600 font-bold mt-1.5">Code applied successfully!</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">Booking Fee</span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-widest">FREE</span>
                  </div>

                  {promoResult && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-green-600">Promo Discount</span>
                      <span className="text-sm font-bold text-green-600">- ${discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">Taxes (5% VAT)</span>
                    <span className="text-sm font-bold text-gray-900">${tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      {promoResult ? (
                        <>
                          <span className="text-sm line-through text-gray-400 mr-2">${((servicePrice + (Math.round(servicePrice * 0.05 * 100) / 100))).toFixed(2)}</span>
                          <span className="text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-red-600">${total.toFixed(2)}</span>
                      )}
                      {hasSavings && (
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mt-1">Saved ${savings.toFixed(2)} vs Market</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-4xl border border-blue-100 relative overflow-hidden">
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
