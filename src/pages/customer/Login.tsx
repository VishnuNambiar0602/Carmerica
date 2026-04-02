import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Mail, Lock, Eye, EyeOff, Chrome, Facebook, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login/signup
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-[#003580] p-3 rounded-xl">
              <Car className="h-8 w-8 text-[#feba02]" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 tracking-tight">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-[#0071c2] hover:underline focus:outline-none"
            >
              {isLogin ? 'Register here' : 'Sign in here'}
            </button>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Chrome className="h-5 w-5 mr-2 text-red-500" />
              Google
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <Facebook className="h-5 w-5 mr-2 text-blue-600" />
              Facebook
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 uppercase tracking-wider text-xs font-bold">Or continue with email</span>
            </div>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0071c2] focus:border-[#0071c2] sm:text-sm"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0071c2] focus:border-[#0071c2] sm:text-sm"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="appearance-none block w-full pl-10 pr-10 px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0071c2] focus:border-[#0071c2] sm:text-sm"
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

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#0071c2] focus:ring-[#0071c2] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-bold text-[#0071c2] hover:underline">
                    Forgot password?
                  </a>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#0071c2] hover:bg-[#005999] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071c2] transition-colors"
              >
                {isLogin ? 'Sign in' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-xs text-[#003580] leading-relaxed">
                By signing in or creating an account, you agree with our{' '}
                <span className="font-bold underline cursor-pointer">Terms & Conditions</span> and{' '}
                <span className="font-bold underline cursor-pointer">Privacy Statement</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
