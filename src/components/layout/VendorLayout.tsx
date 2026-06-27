import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Wrench, 
  ClipboardList, 
  Users, 
  Star, 
  DollarSign, 
  Tag, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Car
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { NotificationBell } from '../NotificationBell';

const getUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('vendor');
      return null;
    }
    return { 
      id: payload.sub || payload.id, 
      role: payload.role, 
      email: payload.email, 
      full_name: payload.name || 'Vendor Partner' 
    };
  } catch { 
    return null; 
  }
};

const getVendorName = () => {
  try {
    const v = localStorage.getItem('vendor');
    if (v) {
      const parsed = JSON.parse(v);
      return parsed.business_name || parsed.businessName || 'Garage Partner';
    }
  } catch {}
  return 'Garage Partner';
};

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const location = useLocation();
  const user = getUser();
  const isAuthenticated = !!user;

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/vendor/dashboard' },
    { name: 'Bookings', icon: ClipboardList, path: '/vendor/bookings' },
    { name: 'Calendar', icon: Calendar, path: '/vendor/calendar' },
    { name: 'Services', icon: Wrench, path: '/vendor/services' },
    { name: 'Staff', icon: Users, path: '/vendor/staff' },
    { name: 'Reviews', icon: Star, path: '/vendor/reviews' },
    { name: 'Earnings', icon: DollarSign, path: '/vendor/earnings' },
    { name: 'Promotions', icon: Tag, path: '/vendor/promotions' },
    { name: 'Messages', icon: MessageSquare, path: '/vendor/messages' },
    { name: 'Reports', icon: BarChart3, path: '/vendor/reports' },
    { name: 'Profile', icon: Settings, path: '/vendor/profile' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-950 border-r-2 border-slate-900 text-white z-50 transition-transform duration-300 ease-in-out md:translate-x-0 rounded-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <Link to="/vendor/dashboard" className="flex items-center space-x-3 group">
              <div className="bg-blue-600/10 p-2 border-2 border-blue-500/20 rounded-none">
                <Car className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-xl font-black tracking-tight text-white uppercase">VendorHub</span>
            </Link>
            <button className="md:hidden p-2 border-2 border-slate-700 bg-slate-900 rounded-none" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <nav className="flex-grow px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 text-sm font-bold border-2 border-transparent transition-all rounded-none",
                    isActive 
                      ? "bg-blue-600/10 text-blue-400 border-blue-500/30 shadow-sm" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-blue-400" : "text-slate-400")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t-2 border-slate-900">
            {isAuthenticated ? (
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('vendor');
                  window.location.reload();
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/5 hover:text-red-300 transition-all border border-transparent rounded-none"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                <span>Log Out</span>
              </button>
            ) : (
              <Link 
                to="/vendor/login" 
                className="flex items-center space-x-3 px-4 py-3 text-sm font-bold text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-transparent rounded-none"
              >
                <LogOut className="h-4 w-4 text-slate-400" />
                <span>Log Out</span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => {
  const user = getUser();
  const isAuthenticated = !!user;
  const vendorName = getVendorName();

  return (
    <header className="bg-slate-950 border-b-2 border-slate-900 h-20 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 text-white rounded-none">
      <div className="flex items-center">
        <button 
          className="md:hidden p-2.5 mr-2 border-2 border-slate-700 bg-slate-900 text-slate-400 rounded-none" 
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        {isAuthenticated ? (
          <h1 className="text-lg font-black text-white hidden md:block uppercase tracking-wider">Garage Operations</h1>
        ) : (
          <Link to="/vendor/login" className="text-lg font-black text-white hidden md:block uppercase tracking-wider">
            VendorHub
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated && user?.id && (
          <NotificationBell userId={user.id} role="vendor" />
        )}
        {isAuthenticated ? (
          <div className="flex items-center space-x-3 border-l-2 pl-4 border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-200">{vendorName}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Partner Account</p>
            </div>
            <div className="h-10 w-10 border-2 border-blue-500/20 bg-blue-600/10 text-blue-400 flex items-center justify-center font-black text-sm rounded-none shadow-[2px_2px_0px_0px_rgba(59,130,246,0.15)]">
              {vendorName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 border-l-2 pl-4 border-slate-800">
            <Link to="/vendor/login" className="border-2 border-black bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-none">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export const VendorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans vendor-portal">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-grow flex flex-col">
        <Header setIsOpen={setIsSidebarOpen} />
        <main className="p-4 md:p-8 flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
