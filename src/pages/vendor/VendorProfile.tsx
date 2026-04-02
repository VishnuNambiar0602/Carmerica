import React from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Clock, Camera, Save, Star, ShieldCheck, Check, Info, Wrench, Image as ImageIcon, Plus, Trash2, CheckCircle2, FileText, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

const VendorProfile = () => {
  const [activeTab, setActiveTab] = React.useState('general');

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
          <h1 className="text-2xl font-bold text-gray-900">Garage Profile</h1>
          <p className="text-gray-500">Manage your garage's public information, branding, and operational details.</p>
        </div>
        <button className="bg-[#003580] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#00224f] flex items-center shadow-lg shadow-blue-100 transition-all">
          <Save className="h-4 w-4 mr-2" /> Save Profile
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 text-center">
              <div className="relative inline-block mb-4">
                <img src="https://picsum.photos/seed/garage1/200/200" alt="Garage Logo" className="h-24 w-24 rounded-xl object-cover border-2 border-gray-100" />
                <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md border border-gray-100 hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-[#003580]" />
                </button>
              </div>
              <h2 className="font-bold text-gray-900">Elite Auto Care</h2>
              <div className="flex items-center justify-center mt-1 text-xs text-green-600 font-bold">
                <ShieldCheck className="h-3 w-3 mr-1" /> Verified Partner
              </div>
            </div>
            <nav className="flex flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center px-6 py-4 text-sm font-bold border-l-4 transition-all",
                    activeTab === tab.id 
                      ? "bg-blue-50 border-[#003580] text-[#003580]" 
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">General Information</h2>
                <p className="text-sm text-gray-500">Basic details about your garage business.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Garage Name</label>
                    <input type="text" defaultValue="Elite Auto Care" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003580] focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Business Registration Number</label>
                    <input type="text" defaultValue="REG-90210-BC" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003580] focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Contact Email</label>
                    <input type="email" defaultValue="contact@eliteautocare.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003580] focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Phone Number</label>
                    <input type="text" defaultValue="+1 234 567 8900" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003580] focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">About the Garage</label>
                  <textarea 
                    rows={4} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003580] focus:outline-none"
                    defaultValue="Elite Auto Care has been serving the community for over 15 years. We specialize in high-end European and Japanese vehicles, providing dealership-quality service at competitive prices."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kyv' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">KYV (Know Your Vendor) Verification</h2>
                  <p className="text-sm text-gray-500">Complete your verification to unlock premium platform features and build customer trust.</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-900 uppercase">Identity</p>
                        <p className="text-sm font-black text-green-700">Verified</p>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-900 uppercase">Business License</p>
                        <p className="text-sm font-black text-green-700">Verified</p>
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-center gap-4">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-yellow-900 uppercase">Tax Registration</p>
                        <p className="text-sm font-black text-yellow-700">Pending Review</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900">Required Documents</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { name: 'Business Registration Certificate', status: 'verified', date: 'Oct 10, 2025' },
                        { name: 'Trade License / Operating Permit', status: 'verified', date: 'Oct 10, 2025' },
                        { name: 'VAT / Tax Registration Document', status: 'pending', date: 'Oct 12, 2025' },
                        { name: 'Garage Insurance Policy', status: 'verified', date: 'Oct 11, 2025' },
                      ].map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                              <p className="text-[10px] text-gray-500">Uploaded on {doc.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                              doc.status === 'verified' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            )}>
                              {doc.status}
                            </span>
                            <button className="text-xs font-bold text-[#003580] hover:underline">View</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#003580] to-blue-600 p-6 rounded-xl text-white shadow-lg shadow-blue-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">AI Trust Score: 98%</h3>
                    <p className="text-sm text-white/80">Your profile is highly trusted by our AI engine.</p>
                  </div>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-white rounded-full" style={{ width: '98%' }}></div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  High trust scores improve your visibility in search results and allow you to participate in premium service programs. Complete the tax registration to reach 100%.
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-start space-x-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900 mb-1">Public Profile Visibility</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
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
