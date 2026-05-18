import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: 'customer' })
      });
      const data = await res.json();
      setStatus(data.message || 'If the email exists, a reset link was sent.');
    } catch (err) {
      console.error(err);
      setStatus('Network error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Forgot Password</h2>
          <p className="text-sm text-gray-600 mt-2">Enter your account email and we'll send reset instructions.</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Email address</label>
            <input
              type="email"
              required
              className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0071c2] focus:border-[#0071c2] sm:text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#0071c2] hover:bg-[#005999]">
              Send reset link
            </button>
          </div>
        </form>

        {status && <div className="p-3 bg-green-50 text-green-800 rounded mt-4">{status}</div>}

        <div className="text-center text-sm text-gray-600 mt-4">
          <Link to="/login" className="font-bold text-[#0071c2] hover:underline">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
