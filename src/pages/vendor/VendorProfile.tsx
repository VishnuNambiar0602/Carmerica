import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Camera, 
  Save, 
  ShieldCheck, 
  Info, 
  Wrench, 
  Image as ImageIcon, 
  FileText, 
  Zap, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const PREDEFINED_LOCATIONS = [
  'Al Quoz, Dubai',
  'Deira, Dubai',
  'Al Barsha, Dubai',
  'Jumeirah, Dubai',
  'Mussafah, Abu Dhabi',
  'Al Khalidiyah, Abu Dhabi',
  'Industrial Area, Sharjah',
  'Al Majaz, Sharjah',
  'Al Jurf, Ajman',
  'Al Nakheel, Ras Al Khaimah'
];

const VendorProfile = () => {
  const [activeTab, setActiveTab] = React.useState('general');
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [docType, setDocType] = React.useState('trade-license');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  // Profile data state
  const [vendorId, setVendorId] = React.useState('');
  const [garageId, setGarageId] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState('https://picsum.photos/seed/garage1/200/200');
  const [businessName, setBusinessName] = React.useState('Elite Auto Care');
  const [vendorMetadata, setVendorMetadata] = React.useState<any>({});
  
  const [profile, setProfile] = React.useState({
    garageName: '',
    businessReg: '',
    contactEmail: '',
    phone: '',
    description: '',
    location: '',
    city: '',
    openingHours: '',
    lat: '',
    lng: '',
    leadTime: '60',
    cancellationPolicy: '24'
  });

  const [saving, setSaving] = React.useState(false);
  const [saveMsg, setSaveMsg] = React.useState('');
  const [saveError, setSaveError] = React.useState(false);

  const fetchDocs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vendor/kyv', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const loadProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/vendor/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      
      setVendorId(data.id);
      setBusinessName(data.business_name || '');
      setLogoUrl(data.metadata?.logoUrl || 'https://picsum.photos/seed/garage1/200/200');
      setVendorMetadata(data.metadata || {});

      // Fetch garage details
      const garageRes = await fetch(`/api/garages?vendorId=${data.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let garage: any = {};
      if (garageRes.ok) {
        const garages = await garageRes.json();
        if (garages && garages.length > 0) {
          garage = garages[0];
          setGarageId(garage.id);
        }
      }

      setProfile({
        garageName: data.business_name || '',
        businessReg: data.metadata?.businessReg || '',
        contactEmail: data.email || '',
        phone: data.phone || '',
        description: data.description || '',
        location: garage.location || '',
        city: garage.city || '',
        openingHours: garage.opening_hours || garage.openingHours || '',
        lat: garage.lat ? String(garage.lat) : '',
        lng: garage.lng ? String(garage.lng) : '',
        leadTime: data.metadata?.leadTime || '60',
        cancellationPolicy: data.metadata?.cancellationPolicy || '24'
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  React.useEffect(() => {
    loadProfileData();
    fetchDocs();
  }, []);

  const handleLogoChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB');
        return;
      }
      const formData = new FormData();
      formData.append('logo', file);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/vendor/logo', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setLogoUrl(data.logoUrl);
          setSaveError(false);
          setSaveMsg('Logo updated successfully!');
          setTimeout(() => setSaveMsg(''), 3000);
        } else {
          alert('Failed to upload logo.');
        }
      } catch (err) {
        console.error(err);
        alert('Logo upload error.');
      }
    };
    input.click();
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    setSaveError(false);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Save general and services settings to vendor profile
      const vendorRes = await fetch('/api/vendor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          businessName: profile.garageName,
          phone: profile.phone,
          description: profile.description,
          metadata: {
            ...vendorMetadata,
            businessReg: profile.businessReg,
            leadTime: profile.leadTime,
            cancellationPolicy: profile.cancellationPolicy,
          }
        }),
      });

      // 2. Save location & operating hours to garage details if garageId is set
      let garageOk = true;
      if (garageId) {
        const garageRes = await fetch(`/api/garages/${garageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            location: profile.location,
            city: profile.city,
            openingHours: profile.openingHours,
            opening_hours: profile.openingHours,
            lat: profile.lat ? Number(profile.lat) : undefined,
            lng: profile.lng ? Number(profile.lng) : undefined,
          }),
        });
        garageOk = garageRes.ok;
      }

      if (vendorRes.ok && garageOk) {
        setSaveError(false);
        setSaveMsg('Profile details saved successfully!');
        setBusinessName(profile.garageName);
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveError(true);
        setSaveMsg('Failed to save profile. Please check validation errors.');
      }
    } catch (err) {
      console.error(err);
      setSaveError(true);
      setSaveMsg('Network error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', docType);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/kyv/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setSelectedFile(null);
        fetchDocs();
      } else {
        const data = await res.json();
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Upload error');
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General Info', icon: Building2 },
    { id: 'location', name: 'Location & Hours', icon: MapPin },
    { id: 'services', name: 'Service Settings', icon: Wrench },
    { id: 'gallery', name: 'Gallery', icon: ImageIcon },
    { id: 'kyv', name: 'KYV Verification', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Garage Profile</h1>
          <p className="text-gray-500">Manage your garage's public information, branding, and operational details.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="border-2 border-black bg-[#003580] text-white px-6 py-2.5 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none flex items-center disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Profile
        </button>
      </div>

      {saveMsg && (
        <div className={cn(
          "border-2 border-black p-4 font-bold text-sm flex items-center gap-3 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
          saveError ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
        )}>
          {saveError ? <AlertCircle className="h-5 w-5 shrink-0" /> : <ShieldCheck className="h-5 w-5 shrink-0 text-green-700" />}
          {saveMsg}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all rounded-none overflow-hidden">
            <div className="p-6 border-b-2 border-black text-center">
              <div className="relative inline-block mb-4">
                <img 
                  src={logoUrl} 
                  alt="Garage Logo" 
                  className="h-24 w-24 border-2 border-black object-cover rounded-none" 
                  loading="lazy" 
                  width="96" 
                  height="96" 
                  decoding="async" 
                />
                <button 
                  onClick={handleLogoChange}
                  className="absolute -bottom-2 -right-2 bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 rounded-none transition-all"
                >
                  <Camera className="h-4 w-4 text-[#003580]" />
                </button>
              </div>
              <h2 className="font-black text-gray-900 text-lg leading-tight">{businessName}</h2>
              <div className="flex items-center justify-center mt-2 text-xs text-green-700 font-black bg-green-50 border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified Partner
              </div>
            </div>
            <nav className="flex flex-col divide-y divide-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center px-6 py-4 text-sm font-black border-l-4 transition-all rounded-none",
                    activeTab === tab.id 
                      ? "bg-blue-50 border-l-[#003580] text-[#003580]" 
                      : "border-l-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  )}
                >
                  <tab.icon className={cn("h-5 w-5 mr-3", activeTab === tab.id ? "text-[#003580]" : "text-gray-400")} />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-grow space-y-6">
          {activeTab === 'general' && (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
              <div className="p-6 border-b-2 border-black">
                <h2 className="text-xl font-black text-gray-900">General Information</h2>
                <p className="text-sm text-gray-500">Basic details about your garage business.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">Garage Name</label>
                    <input 
                      type="text" 
                      value={profile.garageName}
                      onChange={(e) => setProfile(p => ({ ...p, garageName: e.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">Business Registration Number</label>
                    <input 
                      type="text" 
                      value={profile.businessReg}
                      onChange={(e) => setProfile(p => ({ ...p, businessReg: e.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">Contact Email</label>
                    <input 
                      type="email" 
                      value={profile.contactEmail}
                      onChange={(e) => setProfile(p => ({ ...p, contactEmail: e.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">Phone Number</label>
                    <input 
                      type="text" 
                      value={profile.phone}
                      onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">About the Garage</label>
                  <textarea 
                    rows={4} 
                    className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none resize-none focus:ring-2 focus:ring-[#003580]"
                    value={profile.description}
                    onChange={(e) => setProfile(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
              <div className="p-6 border-b-2 border-black">
                <h2 className="text-xl font-black text-gray-900">Location & Operating Hours</h2>
                <p className="text-sm text-gray-500">Configure address and map settings for your garage.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">Street Address *</label>
                    <select
                      value={PREDEFINED_LOCATIONS.includes(profile.location) ? profile.location : (profile.location ? 'Other' : 'Al Quoz, Dubai')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setProfile(p => ({ ...p, location: '' }));
                        } else {
                          setProfile(p => ({ ...p, location: val }));
                        }
                      }}
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580] bg-white text-black"
                    >
                      {PREDEFINED_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                      <option value="Other">Other (Type custom location)</option>
                    </select>
                    {(!PREDEFINED_LOCATIONS.includes(profile.location) || profile.location === '') && (
                      <input 
                        type="text" 
                        value={profile.location}
                        onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))}
                        placeholder="Enter custom address/location..." 
                        className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580] mt-2" 
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">City</label>
                    <input 
                      type="text" 
                      value={profile.city}
                      onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Dubai" 
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">Latitude (for map pin)</label>
                    <input 
                      type="number" 
                      step="any" 
                      value={profile.lat}
                      onChange={(e) => setProfile(p => ({ ...p, lat: e.target.value }))}
                      placeholder="e.g. 25.2048" 
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">Longitude (for map pin)</label>
                    <input 
                      type="number" 
                      step="any" 
                      value={profile.lng}
                      onChange={(e) => setProfile(p => ({ ...p, lng: e.target.value }))}
                      placeholder="e.g. 55.2708" 
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]" 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-black text-gray-700">Opening Hours</label>
                    <input 
                      type="text" 
                      value={profile.openingHours}
                      onChange={(e) => setProfile(p => ({ ...p, openingHours: e.target.value }))}
                      placeholder="e.g. Mon-Sat: 8:00 AM – 6:00 PM" 
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
              <div className="p-6 border-b-2 border-black">
                <h2 className="text-xl font-black text-gray-900">Service Settings</h2>
                <p className="text-sm text-gray-500">Configure default booking limits and policies.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">Booking Lead Time (minutes)</label>
                    <input 
                      type="number" 
                      value={profile.leadTime}
                      onChange={(e) => setProfile(p => ({ ...p, leadTime: e.target.value }))}
                      min="0" 
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]" 
                    />
                    <p className="text-xs text-gray-400">Minimum notice required before a booking can be made.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">Cancellation Policy (hours)</label>
                    <input 
                      type="number" 
                      value={profile.cancellationPolicy}
                      onChange={(e) => setProfile(p => ({ ...p, cancellationPolicy: e.target.value }))}
                      min="0" 
                      className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm outline-none focus:ring-2 focus:ring-[#003580]" 
                    />
                    <p className="text-xs text-gray-400">Hours before appointment when free cancellation ends.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
              <div className="p-6 border-b-2 border-black">
                <h2 className="text-xl font-black text-gray-900">Garage Gallery</h2>
                <p className="text-sm text-gray-500">Upload photos of your garage to build customer trust.</p>
              </div>
              <div className="p-6 space-y-6">
                <div 
                  className="border-2 border-dashed border-black p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 rounded-none transition-all"
                  onClick={() => {
                    const inp = document.createElement('input');
                    inp.type = 'file';
                    inp.accept = 'image/*';
                    inp.multiple = true;
                    inp.onchange = () => {
                      alert('Files selected! Supabase integration placeholder (Task A8.3)');
                    };
                    inp.click();
                  }}
                >
                  <Camera className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="font-black text-gray-800">Click to upload garage photos</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB each. Max 10 photos.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kyv' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
                <div className="p-6 border-b-2 border-black">
                  <h2 className="text-xl font-black text-gray-900">KYV (Know Your Vendor) Verification</h2>
                  <p className="text-sm text-gray-500">Complete your verification to unlock premium platform features and build customer trust.</p>
                </div>
                <div className="p-6 space-y-8">
                  {/* Upload Form */}
                  <div className="bg-gray-50 p-6 border-2 border-black rounded-none space-y-4">
                    <h3 className="text-sm font-black text-gray-900">Upload Verification Document</h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="space-y-1 grow">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Type</label>
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                          className="w-full p-3 bg-white border-2 border-black rounded-none text-sm font-bold focus:ring-2 focus:ring-[#003580] outline-none"
                        >
                          <option value="trade-license">Trade License / Operating Permit</option>
                          <option value="business-registration">Business Registration Certificate</option>
                          <option value="tax-registration">VAT / Tax Registration Document</option>
                          <option value="insurance-policy">Garage Insurance Policy</option>
                        </select>
                      </div>
                      <div className="space-y-1 grow">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Choose File</label>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="w-full p-2 bg-white border-2 border-black rounded-none text-sm file:mr-4 file:py-1 file:px-3 file:border-2 file:border-black file:text-xs file:font-black file:bg-blue-50 file:text-[#003580] hover:file:bg-blue-100"
                        />
                      </div>
                      <button
                        onClick={handleUpload}
                        disabled={uploading || !selectedFile}
                        className="border-2 border-black bg-[#003580] hover:bg-[#00224f] text-white px-6 py-3 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap rounded-none"
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>

                  {/* Document List */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-gray-900">Your Verification Documents</h3>
                    {documents.length === 0 ? (
                      <p className="text-sm text-gray-400 py-6 text-center italic border-2 border-dashed border-black rounded-none">No documents uploaded yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border-2 border-black rounded-none hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                              <div>
                                <p className="text-sm font-black text-gray-900 capitalize">{doc.document_type.replace('-', ' ')}</p>
                                <p className="text-[10px] text-gray-500">{doc.file_name} • Uploaded {new Date(doc.created_at).toLocaleDateString()}</p>
                                {doc.review_note && (
                                  <p className="text-xs text-red-700 font-bold mt-1 bg-red-50 border border-black px-2 py-0.5 rounded-none">Note: {doc.review_note}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-[10px] font-black px-2.5 py-1 border border-black rounded-none uppercase tracking-widest",
                                doc.status === 'approved' ? "bg-green-100 text-green-700" :
                                doc.status === 'rejected' ? "bg-red-100 text-red-700" :
                                "bg-yellow-100 text-yellow-700"
                              )}>
                                {doc.status}
                              </span>
                              {doc.file_url && (
                                <a 
                                  href={doc.file_url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-xs font-black text-[#003580] hover:underline"
                                >
                                  View
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-2 border-black bg-gradient-to-r from-[#003580] to-blue-600 p-6 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/20 p-2 border border-white rounded-none">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">AI Trust Score: 98%</h3>
                    <p className="text-sm text-white/80">Your profile is highly trusted by our AI engine.</p>
                  </div>
                </div>
                <div className="h-2.5 bg-white/20 border border-black rounded-none overflow-hidden mb-4">
                  <div className="h-full bg-white rounded-none" style={{ width: '98%' }}></div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-bold">
                  High trust scores improve your visibility in search results and allow you to participate in premium service programs. Complete the tax registration to reach 100%.
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border-2 border-black p-6 rounded-none flex items-start space-x-4">
            <div className="bg-blue-100 border border-black p-2 rounded-none">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-blue-900 mb-1">Public Profile Visibility</h3>
              <p className="text-sm text-blue-700 leading-relaxed font-bold">
                Your garage profile is currently <span className="font-bold">Public</span>. Changes made here will be reflected on the customer-facing search results and details pages immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
