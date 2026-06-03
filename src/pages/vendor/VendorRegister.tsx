import React from 'react';
import { useNavigate } from 'react-router-dom';

const VendorRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ businessName: '', email: '', password: '' });
  const [status, setStatus] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'vendor' })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Registration successful. Please check your email to verify your account before logging in.');
        setTimeout(() => navigate('/vendor/login?verify_needed=1'), 4000);
      } else {
        setStatus(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Register Your Garage</h2>
          <p className="text-sm text-gray-600 mt-2">Create a partner account to list your services and accept bookings.</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Business Name</label>
            <input value={form.businessName} onChange={(e) => setForm({...form, businessName: e.target.value})} required className="w-full px-3 py-3 border border-gray-300 rounded-md" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Business Email</label>
            <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required type="email" className="w-full px-3 py-3 border border-gray-300 rounded-md" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Password</label>
            <input value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required type="password" className="w-full px-3 py-3 border border-gray-300 rounded-md" />
          </div>

          <div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#003580] hover:bg-[#00224f]">
              Create partner account
            </button>
          </div>
        </form>

        {status && <div className="p-3 bg-green-50 text-green-800 rounded mt-4">{status}</div>}
      </div>
    </div>
  );
};

export default VendorRegister;
