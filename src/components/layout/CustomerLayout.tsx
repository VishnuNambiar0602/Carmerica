import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Car, Search, User, Menu, Briefcase, Globe, LogOut, Home as HomeIcon, Tag, Cpu, MapPin, LogIn } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NotificationBell } from '../NotificationBell';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    return !!token;
  };

  const getUser = () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };
  const user = getUser();

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Services', path: '/search', icon: Search },
    { name: 'Offers', path: '/offers', icon: Tag },
    { name: 'Smart Garage', path: '/smart-garage', icon: Cpu },
    { name: 'Map', path: '/garage-map', icon: MapPin },
  ];

  return (
    <nav className="bg-white border-b border-gray-150 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Left Nav links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2 mr-2">
              <Car className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-black tracking-tight text-gray-900">Carmerica</span>
            </Link>
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={cn(
                      "px-3 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-transparent",
                      isActive 
                        ? "bg-blue-50 text-blue-600 border-blue-100/50" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-950"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Right Header items */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              to="/vendor/login" 
              className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="h-3.5 w-3.5 text-gray-400" /> List your garage
            </Link>
            
            <button className="p-2 text-gray-400 hover:text-gray-900 rounded-none transition-colors">
              <Globe className="h-4 w-4" />
            </button>
            
            {isAuthenticated() ? (
              <div className="flex items-center gap-4">
                <NotificationBell userId={user?.id || 'user-1'} role="customer" />
                <Link 
                  to="/profile" 
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-950 bg-gray-50 border border-gray-150 px-3 py-1.5 rounded-none"
                >
                  <User className="h-3.5 w-3.5 text-gray-450" />
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('vendor');
                    window.location.reload();
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-red-500 bg-red-50/50 px-3 py-1.5 rounded-none transition-all flex items-center gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Link>
            )}
          </div>
          
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-none hover:bg-gray-50 text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-3 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "px-4 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-wider flex items-center gap-2",
                  isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="h-4 w-4 text-gray-400" />
                {link.name}
              </Link>
            );
          })}
          <Link
            to="/vendor/login"
            className="flex items-center gap-2 px-4 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <Briefcase className="h-4 w-4 text-gray-450" /> List your garage
          </Link>
          {isAuthenticated() ? (
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <div className="px-4 py-2.5 flex items-center justify-between bg-gray-50 rounded-none">
                <span className="text-[10px] font-bold uppercase text-gray-400">Notifications</span>
                <NotificationBell userId={user?.id || 'user-1'} role="customer" />
              </div>
              <Link
                to="/profile"
                className="px-4 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-800 text-center flex items-center justify-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-4 w-4 text-gray-400" />
                Profile
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('vendor');
                  setIsMenuOpen(false);
                  window.location.reload();
                }}
                className="w-full px-4 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 text-center flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white text-center shadow-sm flex items-center justify-center gap-1.5"
              onClick={() => setIsMenuOpen(false)}
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-150 text-gray-500 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-100">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">Carmerica</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-gray-500">
              An AI-assisted vehicle lifecycle manager matching car owners with verified mechanical service centers.
            </p>
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-xs tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/support" className="hover:text-blue-600 transition-colors">Help Center</Link></li>
              <li><Link to="/support" className="hover:text-blue-600 transition-colors">Safety Resource</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-xs tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link></li>
              <li><Link to="/offers" className="hover:text-blue-600 transition-colors">Offers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-xs tracking-wider uppercase mb-4">Partners</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/vendor/login" className="hover:text-blue-600 transition-colors">List Garage</Link></li>
              <li><Link to="/vendor/dashboard" className="hover:text-blue-600 transition-colors">Partner Dashboard</Link></li>
              <li><Link to="/admin/login" className="hover:text-blue-600 transition-colors">Admin Access</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
          <p>© 2026 Carmerica. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-900">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
