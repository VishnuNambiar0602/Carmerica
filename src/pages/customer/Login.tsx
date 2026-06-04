import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Mail, Lock, Eye, EyeOff, Chrome, Facebook, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body: Record<string, string> = {
        email: formData.email,
        password: formData.password,
        role: 'customer'
      };
      if (!isLogin) body.fullName = formData.fullName;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/';
        navigate(redirect);
      } else {
        setError(data.message || (isLogin ? 'Login failed' : 'Registration failed'));
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-none border border-gray-150 shadow-sm relative z-10">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-50 p-2.5 rounded-none border border-blue-100 text-blue-650">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-1.5 text-xs text-gray-500">
            {isLogin ? "New to Carmerica? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-bold text-blue-600 hover:text-blue-700 focus:outline-none transition-colors cursor-pointer"
            >
              {isLogin ? 'Register now' : 'Sign in instead'}
            </button>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-none">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-none text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all cursor-pointer">
              <Chrome className="h-4 w-4 mr-2 text-red-500" />
              Google
            </button>
            <button className="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-none text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all cursor-pointer">
              <Facebook className="h-4 w-4 mr-2 text-blue-600" />
              Facebook
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-150"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 uppercase tracking-widest text-[9px] font-bold">Or use email</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="block w-full bg-white border border-gray-200 rounded-none px-4 py-2.5 text-xs text-gray-905 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="block w-full bg-white border border-gray-200 rounded-none px-4 py-2.5 text-xs text-gray-905 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  placeholder="you@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full bg-white border border-gray-200 rounded-none pl-4 pr-10 py-2.5 text-xs text-gray-905 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-650 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-3.5 w-3.5 border-gray-200 text-blue-600 focus:ring-blue-500 rounded-none cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-1.5 block text-xs text-gray-500 font-medium">
                    Keep me signed in
                  </label>
                </div>
                <div className="text-xs font-bold">
                  <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 transition-colors">
                    Forgot details?
                  </Link>
                </div>
              </div>
            )}

            <div className="pt-1.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-none text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : (isLogin ? 'Sign in' : 'Create account')}
              </button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-450 leading-relaxed">
              By logging in, you agree to our{' '}
              <span className="font-bold underline cursor-pointer text-gray-550">Terms of Service</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
