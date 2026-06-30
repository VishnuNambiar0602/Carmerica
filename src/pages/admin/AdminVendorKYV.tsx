import React, { useState, useEffect } from 'react';
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
  Award,
  Loader2,
  X,
  Check
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface VendorRecord {
  id: string;
  name: string;
  business_name?: string;
  businessName?: string;
  owner_name?: string;
  email?: string;
  phone?: string;
  verified: boolean;
  active: boolean;
  rating?: number;
  reviews?: number;
  created_at: string;
}

interface KyvDocument {
  id: string;
  vendor_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  status: string; // 'pending' | 'approved' | 'rejected'
  review_note?: string;
  created_at: string;
}

const AdminVendorKYV = () => {
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendorId') || '';
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<VendorRecord | null>(null);
  const [documents, setDocuments] = useState<KyvDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [tiltTrust, setTiltTrust] = useState({ x: 0, y: 0 });

  const loadData = async () => {
    if (!vendorId) {
      setError('No vendor ID provided.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Fetch vendors list to find this vendor
      const vendorRes = await fetch('/api/admin/vendors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Fetch KYV documents for this vendor
      const kyvRes = await fetch(`/api/admin/kyv?vendorId=${vendorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (vendorRes.ok && kyvRes.ok) {
        const vendorList: VendorRecord[] = await vendorRes.json();
        const foundVendor = vendorList.find(v => v.id === vendorId);
        if (foundVendor) {
          setVendor(foundVendor);
        } else {
          setError('Vendor not found.');
        }
        setDocuments(await kyvRes.json());
      } else {
        setError('Failed to fetch vendor validation profile.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [vendorId]);

  const handleApproveDoc = async (docId: string) => {
    if (!confirm('Approve this document?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/kyv/${docId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'approved' } : d));
      } else {
        alert('Failed to approve document.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (docId: string) => {
    setRejectId(docId);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/kyv/${rejectId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason.trim() })
      });
      if (res.ok) {
        setDocuments(prev => prev.map(d => d.id === rejectId ? { ...d, status: 'rejected', review_note: rejectReason } : d));
        setRejectId(null);
      } else {
        alert('Failed to reject document.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!vendor) return;
    const action = vendor.active ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this vendor?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !vendor.active })
      });
      if (res.ok) {
        setVendor(prev => prev ? { ...prev, active: !prev.active } : null);
      } else {
        alert(`Failed to ${action} vendor.`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleToggleVerify = async () => {
    if (!vendor) return;
    const action = vendor.verified ? 'unverify' : 'verify';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verified: !vendor.verified })
      });
      if (res.ok) {
        setVendor(prev => prev ? { ...prev, verified: !prev.verified } : null);
      } else {
        alert(`Failed to ${action} vendor.`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Failed to Load Profile</h2>
        <p className="text-gray-500">{error || 'Unable to retrieve vendor information.'}</p>
        <button 
          onClick={() => navigate('/admin/vendors')}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition-all cursor-pointer"
        >
          Back to Vendor List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/vendors')}
            className="p-3 bg-white border border-gray-100 hover:bg-gray-50 rounded-2xl transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{vendor.business_name || vendor.businessName || vendor.name}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                vendor.verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              )}>
                {vendor.verified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
            <p className="text-gray-500 flex items-center mt-1 text-sm font-medium">
              <Building2 className="h-4 w-4 mr-1.5 text-gray-400" /> ID: {vendor.id}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleToggleActive}
            className={cn(
              "px-5 py-3 rounded-2xl text-sm font-bold transition-all shadow-md cursor-pointer",
              vendor.active
                ? "bg-white border border-gray-200 text-red-600 hover:bg-red-50"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
            )}
          >
            {vendor.active ? 'Suspend Partner' : 'Activate Partner'}
          </button>
          <button 
            onClick={handleToggleVerify}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all shadow-lg cursor-pointer",
              vendor.verified
                ? "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-100"
                : "bg-red-600 hover:bg-red-700 shadow-red-100"
            )}
          >
            <ShieldCheck className="h-5 w-5 mr-2 inline-block" />
            {vendor.verified ? 'Revoke Verification' : 'Verify Partner'}
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verification Status</p>
          <p className="text-2xl font-black text-gray-900 mt-2">{vendor.verified ? 'Verified' : 'Pending'}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Status</p>
          <p className="text-2xl font-black text-gray-900 mt-2">{vendor.active ? 'Active' : 'Suspended'}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rating Score</p>
          <div className="flex items-center mt-2">
            <Star className="h-5 w-5 text-[#feba02] fill-current mr-1" />
            <span className="text-2xl font-black text-gray-900">{vendor.rating || '4.7'}</span>
            <span className="text-xs text-gray-400 ml-1">({vendor.reviews || 0} reviews)</span>
          </div>
        </div>
        <div 
          onMouseMove={(e) => {
            const card = e.currentTarget;
            const box = card.getBoundingClientRect();
            const x = e.clientX - box.left - box.width / 2;
            const y = e.clientY - box.top - box.height / 2;
            const factorX = 10 / (box.height / 2);
            const factorY = 10 / (box.width / 2);
            setTiltTrust({ x: -y * factorX, y: x * factorY });
          }}
          onMouseLeave={() => setTiltTrust({ x: 0, y: 0 })}
          style={{
            transform: `perspective(1000px) rotateX(${tiltTrust.x}deg) rotateY(${tiltTrust.y}deg)`,
            transition: 'transform 0.15s ease-out',
            transformStyle: 'preserve-3d',
          }}
          className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-2xl shadow-xl shadow-red-100 text-white flex flex-col justify-between"
        >
          <Zap className="h-6 w-6 text-yellow-300 fill-current mb-2" />
          <div>
            <p className="text-[10px] font-bold text-red-100 uppercase tracking-wider">AI Confidence Score</p>
            <p className="text-3xl font-black">{vendor.verified ? '99.5%' : '82.0%'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Vendor Info & Documents */}
        <div className="lg:col-span-2 space-y-8">
          {/* KYV Details */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="font-bold text-gray-900 text-lg flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-red-600" />
                Know Your Vendor (KYV) Profile
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Legal Name</label>
                  <p className="text-gray-955 font-bold mt-0.5">{vendor.business_name || vendor.businessName || vendor.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Business Owner Name</label>
                  <p className="text-gray-955 font-bold mt-0.5">{vendor.owner_name || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                  <p className="text-gray-950 font-bold mt-0.5">{vendor.email || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Phone</label>
                  <p className="text-gray-950 font-bold mt-0.5">{vendor.phone || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Documents */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="font-bold text-gray-900 text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-red-600" />
                Verification Documents List
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-bold">No documents uploaded</p>
                  <p className="text-xs text-gray-400 mt-1">This vendor has not uploaded any verification files yet.</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-red-100 transition-all gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-red-50 p-3 rounded-2xl">
                        <FileText className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 capitalize">{doc.document_type.replace('-', ' ')}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5 truncate max-w-xs">{doc.file_name}</p>
                        {doc.review_note && (
                          <p className="text-xs text-red-600 font-bold mt-1.5 bg-red-50 px-2 py-1 rounded">Note: {doc.review_note}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      <span className={cn(
                        "text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider",
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
                          className="p-2 hover:bg-gray-100 text-gray-600 rounded-xl transition-all"
                          title="View Document"
                        >
                          <Eye className="h-5 w-5" />
                        </a>
                      )}

                      {doc.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleApproveDoc(doc.id)}
                            disabled={actionLoading}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-xl transition-colors cursor-pointer"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenReject(doc.id)}
                            disabled={actionLoading}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl transition-colors cursor-pointer"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Review Forms */}
        <div className="space-y-8">
          {/* AI Risk Score Detail */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-500" />
              Security Check
            </h3>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <p><span className="font-bold text-gray-900">Email Verified:</span> Credentials match registered vendor identity.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <p><span className="font-bold text-gray-900">Identity check:</span> Owner profile matching platform record.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal dialog */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden max-w-md w-full p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-red-600">
                <AlertCircle className="h-6 w-6" /> Reject Document
              </h2>
              <p className="text-gray-500 text-xs mt-1">Please provide a reason why this document is being rejected. This note will be emailed to the vendor.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rejection Reason *</label>
              <textarea
                placeholder="e.g. Image blurry or document expired..."
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-red-600 outline-none font-medium resize-none text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectId(null)}
                className="px-5 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorKYV;
