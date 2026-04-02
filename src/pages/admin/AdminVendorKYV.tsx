import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Star, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ExternalLink,
  DollarSign,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Download,
  Eye,
  MoreVertical,
  Ban,
  MessageSquare,
  Award
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

const AdminVendorKYV = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data for the vendor
  const vendor = {
    id: 1,
    name: 'Elite Auto Care',
    owner: 'Robert Wilson',
    email: 'robert@eliteautocare.com',
    phone: '+1 234 567 8900',
    location: '123 Downtown St, Los Angeles, CA 90012',
    registrationNumber: 'REG-90210-BC',
    status: 'verified',
    rating: 4.8,
    reviews: 1240,
    revenue: '$45,280',
    joined: 'Oct 12, 2025',
    image: 'https://picsum.photos/seed/garage1/400/200',
    aiTrustScore: 98,
    riskLevel: 'Low',
    documents: [
      { name: 'Business License', status: 'verified', date: '2025-10-10', type: 'PDF' },
      { name: 'Insurance Certificate', status: 'verified', date: '2025-10-11', type: 'PDF' },
      { name: 'Owner ID (Passport)', status: 'verified', date: '2025-10-10', type: 'JPG' },
      { name: 'Tax Registration', status: 'pending', date: '2025-10-12', type: 'PDF' },
    ],
    services: [
      { name: 'Full Synthetic Oil Change', price: '$89.99', marketAvg: '$95.00' },
      { name: 'Brake Pad Replacement', price: '$199.99', marketAvg: '$220.00' },
      { name: 'AC Sanitization', price: '$45.00', marketAvg: '$55.00' },
      { name: 'Engine Diagnostic', price: '$75.00', marketAvg: '$85.00' },
    ]
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/vendors')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                vendor.status === 'verified' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              )}>
                {vendor.status}
              </span>
            </div>
            <p className="text-gray-500 flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" /> {vendor.location}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center">
            <Ban className="h-4 w-4 mr-2" /> Suspend
          </button>
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-red-700 flex items-center shadow-lg shadow-red-100">
            <ShieldCheck className="h-4 w-4 mr-2" /> Verify Vendor
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-2 rounded-xl">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +12%
            </span>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-black text-gray-900">{vendor.revenue}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-50 p-2 rounded-xl">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <span className="text-xs font-bold text-gray-400">1.2k reviews</span>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Rating</p>
          <p className="text-2xl font-black text-gray-900">{vendor.rating} / 5.0</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-2 rounded-xl">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-purple-600">Active</span>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Bookings</p>
          <p className="text-2xl font-black text-gray-900">452</p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-2xl shadow-lg shadow-red-100 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <Award className="h-5 w-5 text-white/50" />
          </div>
          <p className="text-sm font-bold text-white/80 uppercase tracking-wider">AI Trust Score</p>
          <p className="text-2xl font-black">{vendor.aiTrustScore}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-black text-gray-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-red-600" />
                Know Your Vendor (KYV) Profile
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Vendor Name</label>
                  <p className="text-gray-900 font-bold">{vendor.name}</p>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Business Owner</label>
                  <p className="text-gray-900 font-bold">{vendor.owner}</p>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Registration No.</label>
                  <p className="text-gray-900 font-bold">{vendor.registrationNumber}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                  <p className="text-gray-900 font-bold">{vendor.email}</p>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <p className="text-gray-900 font-bold">{vendor.phone}</p>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Member Since</label>
                  <p className="text-gray-900 font-bold">{vendor.joined}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Services */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-black text-gray-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-red-600" />
                Service Pricing Analysis
              </h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">AI Price Intelligence</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-xs font-black text-gray-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Service Name</th>
                    <th className="px-6 py-4">Vendor Price</th>
                    <th className="px-6 py-4">Market Average</th>
                    <th className="px-6 py-4">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendor.services.map((service, idx) => {
                    const price = parseFloat(service.price.replace('$', ''));
                    const avg = parseFloat(service.marketAvg.replace('$', ''));
                    const diff = ((price - avg) / avg) * 100;
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{service.name}</td>
                        <td className="px-6 py-4 font-black text-gray-900">{service.price}</td>
                        <td className="px-6 py-4 text-gray-500">{service.marketAvg}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded",
                            diff <= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}>
                            {diff <= 0 ? '' : '+'}{diff.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification Documents */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-black text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-red-600" />
                Verification Documents
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-red-100 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-red-50 transition-colors">
                      <FileText className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">Uploaded on {doc.date} • {doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === 'verified' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Actions */}
        <div className="space-y-6">
          {/* AI Trust Assessment */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-red-50/30">
              <h2 className="font-black text-gray-900 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-red-600" />
                AI Trust Assessment
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">Risk Level</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-widest">
                  {vendor.riskLevel} Risk
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-500 uppercase tracking-widest">Verification Confidence</span>
                  <span className="text-red-600">99.2%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: '99.2%' }}></div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex gap-3">
                  <div className="bg-green-50 p-1.5 rounded-lg h-fit">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-bold text-gray-900">Document Authenticity:</span> AI has verified all uploaded documents against government databases with 100% match.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-blue-50 p-1.5 rounded-lg h-fit">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-bold text-gray-900">Market Positioning:</span> Vendor pricing is within 5% of market average, indicating healthy business practices.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-yellow-50 p-1.5 rounded-lg h-fit">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-bold text-gray-900">Pending Item:</span> Tax registration document is still in manual review queue.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-black text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-red-600" />
                Internal Admin Notes
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-900">Admin: Sarah J.</span>
                  <span className="text-[10px] font-bold text-gray-400">2 days ago</span>
                </div>
                <p className="text-xs text-gray-600">Spoke with the owner. They are expanding to a second location next month. Verification looks solid.</p>
              </div>
              <textarea 
                placeholder="Add a private note about this vendor..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                rows={3}
              />
              <button className="w-full bg-gray-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-black transition-all">
                Add Internal Note
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all group">
              <span className="text-sm font-bold text-gray-700 group-hover:text-red-600">Request More Info</span>
              <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all group">
              <span className="text-sm font-bold text-gray-700 group-hover:text-red-600">View Public Profile</span>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all group">
              <span className="text-sm font-bold text-gray-700 group-hover:text-red-600">Contact Owner</span>
              <Mail className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVendorKYV;
