import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Car, Search, User, Menu, Phone, HelpCircle, Globe, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/search' },
    { name: 'Offers', path: '/offers' },
    { name: 'Smart Garage', path: '/smart-garage' },
  ];

  return (
    <nav className="bg-[#003580] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-[#feba02]" />
              <span className="text-2xl font-bold tracking-tight">CarServ</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === link.path 
                        ? "bg-[#00224f] text-white" 
                        : "hover:bg-[#00224f] text-white/90 hover:text-white"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/vendor/login" className="text-sm font-medium hover:underline flex items-center gap-1">
              <Briefcase className="h-4 w-4" /> List your garage
            </Link>
            <button className="p-2 hover:bg-[#00224f] rounded-full">
              <Globe className="h-5 w-5" />
            </button>
            <Link to="/login" className="bg-white text-[#003580] px-4 py-2 rounded-sm text-sm font-bold hover:bg-gray-100 transition-colors">
              Sign in / Register
            </Link>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-[#00224f]"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#003580] border-t border-[#00224f] px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#00224f]"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/login"
            className="block px-3 py-2 rounded-md text-base font-medium bg-white text-[#003580] mt-4"
            onClick={() => setIsMenuOpen(false)}
          >
            Sign in
          </Link>
        </div>
      )}
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#003580] text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-[#00224f] pb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/support" className="hover:underline">Help Center</Link></li>
              <li><Link to="/support" className="hover:underline">Safety Resource Center</Link></li>
              <li><Link to="/support" className="hover:underline">Cancellation options</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/about" className="hover:underline">About CarServ</Link></li>
              <li><Link to="/blog" className="hover:underline">Blog</Link></li>
              <li><Link to="/careers" className="hover:underline">Careers</Link></li>
              <li><Link to="/press" className="hover:underline">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Terms</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/terms" className="hover:underline">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="hover:underline">Cookie Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">For Partners</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/vendor/login" className="hover:underline">List your garage</Link></li>
              <li><Link to="/vendor/dashboard" className="hover:underline">Partner Dashboard</Link></li>
              <li><Link to="/admin/login" className="hover:underline">Admin Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/60">
          <p>© 2026 CarServ.com. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/" className="hover:text-white">Facebook</Link>
            <Link to="/" className="hover:text-white">Twitter</Link>
            <Link to="/" className="hover:text-white">Instagram</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
