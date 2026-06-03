import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Clock, FileText, Loader2, Compass, AlertCircle } from 'lucide-react';

export default function VendorGarageSetup() {
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [city, setCity] = React.useState('Dubai');
  const [phone, setPhone] = React.useState('');
  const [openingHours, setOpeningHours] = React.useState('8:00 AM - 6:00 PM');
  const [description, setDescription] = React.useState('');
  const [lat, setLat] = React.useState('');
  const [lng, setLng] = React.useState('');
  
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Garage name is required';
    if (!location.trim()) newErrors.location = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (phone && !/^\+?[\d\s\-()]{8,15}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (lat && isNaN(Number(lat))) newErrors.lat = 'Latitude must be a number';
    if (lng && isNaN(Number(lng))) newErrors.lng = 'Longitude must be a number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/garages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim(),
          city: city.trim(),
          phone: phone.trim(),
          openingHours: openingHours.trim(),
          description: description.trim(),
          lat: lat ? Number(lat) : undefined,
          lng: lng ? Number(lng) : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Retrieve existing vendor info if available to update cache
        const storedVendor = localStorage.getItem('vendor');
        if (storedVendor) {
          const parsed = JSON.parse(storedVendor);
          parsed.garageId = data.id;
          localStorage.setItem('vendor', JSON.stringify(parsed));
        }
        navigate('/vendor/dashboard');
      } else {
        setSubmitError(data.message || 'Failed to register garage');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
        {/* Header decoration */}
        <div className="bg-linear-to-r from-[#003580] to-[#005999] p-8 md:p-12 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-full bg-linear-to-l from-white/10 to-transparent pointer-events-none" />
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
              <Building2 className="h-8 w-8 text-[#feba02]" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-white/60">Partner Onboarding</span>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl mt-1">Set Up Your Garage Profile</h1>
            </div>
          </div>
          <p className="text-white/80 max-w-2xl text-sm leading-relaxed">
            Create your garage page, enter operational hours, address details, and coordinates so customers can find and book your services.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-2xl flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Section 1: Core Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="bg-blue-50 text-[#003580] h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm mr-3">1</span>
              General Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Garage Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Performance Tuning"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-4 bg-gray-50 border rounded-2xl focus:bg-white focus:border-[#003580] outline-none transition-all font-medium ${
                    errors.name ? 'border-red-600 focus:border-red-600 bg-red-50/5' : 'border-gray-100'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-600 font-bold">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. +971 4 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full p-4 pl-12 bg-gray-50 border rounded-2xl focus:bg-white focus:border-[#003580] outline-none transition-all font-medium ${
                      errors.phone ? 'border-red-600 focus:border-red-600 bg-red-50/5' : 'border-gray-100'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-600 font-bold">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Garage Description</label>
              <div className="relative">
                <div className="absolute top-4 left-4 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  placeholder="Describe your garage's specialties, history, and equipment..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#003580] outline-none transition-all font-medium resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="space-y-6 pt-8 border-t border-gray-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="bg-blue-50 text-[#003580] h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm mr-3">2</span>
              Location & Mapping
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Address / Location *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Warehouse 15, Street 4, Al Quoz 3"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`w-full p-4 pl-12 bg-gray-50 border rounded-2xl focus:bg-white focus:border-[#003580] outline-none transition-all font-medium ${
                      errors.location ? 'border-red-600 focus:border-red-600 bg-red-50/5' : 'border-gray-100'
                    }`}
                  />
                </div>
                {errors.location && <p className="text-xs text-red-600 font-bold">{errors.location}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">City *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#003580] outline-none transition-all font-medium appearance-none"
                >
                  <option value="Dubai">Dubai</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Ajman">Ajman</option>
                  <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                  <option value="Fujairah">Fujairah</option>
                  <option value="Umm Al Quwain">Umm Al Quwain</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                  <Compass className="h-4 w-4 mr-1 text-[#feba02]" /> Latitude (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 25.1384"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className={`w-full p-4 bg-gray-50 border rounded-2xl focus:bg-white focus:border-[#003580] outline-none transition-all font-medium ${
                    errors.lat ? 'border-red-600 focus:border-red-600 bg-red-50/5' : 'border-gray-100'
                  }`}
                />
                {errors.lat && <p className="text-xs text-red-600 font-bold">{errors.lat}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                  <Compass className="h-4 w-4 mr-1 text-[#feba02]" /> Longitude (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 55.2341"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className={`w-full p-4 bg-gray-50 border rounded-2xl focus:bg-white focus:border-[#003580] outline-none transition-all font-medium ${
                    errors.lng ? 'border-red-600 focus:border-red-600 bg-red-50/5' : 'border-gray-100'
                  }`}
                />
                {errors.lng && <p className="text-xs text-red-600 font-bold">{errors.lng}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Operations */}
          <div className="space-y-6 pt-8 border-t border-gray-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="bg-blue-50 text-[#003580] h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm mr-3">3</span>
              Operations & Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Opening Hours</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 8:00 AM - 6:00 PM"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#003580] outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-8 border-t border-gray-50 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#003580] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#00224f] flex items-center shadow-xl shadow-blue-600/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Saving Garage Profile...
                </>
              ) : (
                'Save & Complete Setup'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
