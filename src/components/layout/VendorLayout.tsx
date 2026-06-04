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
  Car,
  Bell
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { NotificationBell } from '../NotificationBell';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const location = useLocation();
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    return true;
  };

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
        "fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-950 border-r border-slate-900/80 text-white z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <Link to="/vendor/dashboard" className="flex items-center space-x-3 group">
              <div className="bg-blue-600/10 p-2 rounded-2xl border border-blue-500/20">
                <Car className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">VendorHub</span>
            </Link>
            <button className="md:hidden p-2.5 rounded-xl hover:bg-slate-900" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6 text-slate-400" />
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
                    "flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all border border-transparent",
                    isActive 
                      ? "bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-sm" 
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

          <div className="p-4 border-t border-slate-900">
            {isAuthenticated() ? (
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('vendor');
                  window.location.reload();
                }}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-2xl text-sm font-semibold text-red-400 hover:bg-red-500/5 hover:text-red-300 transition-all border border-transparent"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                <span>Log Out</span>
              </button>
            ) : (
              <Link 
                to="/vendor/login" 
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-transparent"
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
  // Check if user is authenticated
  const isAuthenticated = () => {
    return true;
  };

  const getUser = () => {
    return { id: 'user-2', role: 'vendor', email: 'partner@garage.com', full_name: 'Elite Motors' };
  };
  const user = getUser();

  return (
    <header className="bg-slate-900/20 backdrop-blur-md border-b border-slate-900/80 h-20 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 text-white">
      <div className="flex items-center">
        <button 
          className="md:hidden p-2.5 mr-2 rounded-xl text-slate-400 hover:bg-slate-900" 
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        {isAuthenticated() ? (
          <h1 className="text-lg font-bold text-white hidden md:block">Garage Operations</h1>
        ) : (
          <Link to="/vendor/login" className="text-lg font-bold text-white hidden md:block">
            VendorHub
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated() && (
          <NotificationBell userId={user?.id || 'vendor-1'} role="vendor" />
        )}
        {isAuthenticated() ? (
          <div className="flex items-center space-x-3 border-l pl-4 border-slate-900">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-200">Elite Motors</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ID: #12938</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
              EM
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 border-l pl-4 border-slate-900">
            <Link to="/vendor/login" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all">
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
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
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

