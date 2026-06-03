import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Building2, Loader2 } from 'lucide-react';

const VendorLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === '1') {
      setSuccessMessage('Your email has been successfully verified! You can now sign in.');
    } else if (params.get('verify_needed') === '1') {
      setSuccessMessage('Verification email sent! Please check your inbox and verify your email before signing in.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password, role: 'vendor' })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.vendor) localStorage.setItem('vendor', JSON.stringify(data.vendor));
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/vendor/dashboard';
        navigate(redirect);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Side - Branding/Info */}
      <div className="hidden md:flex md:w-1/2 bg-[#003580] p-12 flex-col justify-between text-white">
        <div>
          <Link to="/" className="flex items-center space-x-2 mb-12">
            <Building2 className="h-10 w-10 text-[#feba02]" />
            <span className="text-3xl font-bold tracking-tight">VendorHub</span>
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Grow your garage business <br /> with CarServ.
          </h1>
          <p className="text-xl text-white/80 max-w-lg mb-12">
            Join thousands of top-rated garages and reach more customers in your area.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-[#feba02]" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Verified Partner Program</h3>
                <p className="text-white/60 text-sm">Build trust with our verified badge and customer reviews.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg">
                <ArrowRight className="h-6 w-6 text-[#feba02]" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Real-time Management</h3>
                <p className="text-white/60 text-sm">Manage bookings, staff, and earnings from one simple dashboard.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-white/40">
          © 2026 CarServ Partner Network. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center md:text-left">
            <div className="md:hidden flex justify-center mb-6">
              <div className="bg-[#003580] p-3 rounded-xl">
                <Building2 className="h-8 w-8 text-[#feba02]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Partner Sign In</h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage your garage listing and bookings.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-lg animate-pulse">
              {successMessage}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Business Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#003580] focus:border-[#003580] sm:text-sm"
                    placeholder="partner@garage.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700">Password</label>
                  <Link to="/vendor/forgot-password" className="text-xs font-bold text-[#003580] hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="appearance-none block w-full pl-10 pr-10 px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#003580] focus:border-[#003580] sm:text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#003580] focus:ring-[#003580] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Keep me signed in
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#003580] hover:bg-[#00224f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003580] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In to Dashboard'}
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Not a partner yet?{' '}
              <Link to="/vendor/register" className="font-bold text-[#003580] hover:underline">
                Register your garage
              </Link>
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              By signing in, you agree to our <span className="underline cursor-pointer">Partner Terms of Service</span> and <span className="underline cursor-pointer">Data Processing Agreement</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;
