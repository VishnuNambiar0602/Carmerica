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

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const location = useLocation();

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
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen w-64 bg-[#003580] text-white z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <Link to="/vendor/dashboard" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-[#feba02]" />
              <span className="text-2xl font-bold tracking-tight">VendorHub</span>
            </Link>
            <button className="md:hidden p-2" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path 
                    ? "bg-[#00224f] text-white shadow-sm" 
                    : "text-white/70 hover:bg-[#00224f] hover:text-white"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-[#00224f]">
            <Link 
              to="/vendor/login" 
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-[#00224f] hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center">
        <button 
          className="md:hidden p-2 mr-2 text-gray-500" 
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 hidden md:block">Garage Management</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell className="h-6 w-6" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800">Elite Motors</p>
            <p className="text-xs text-gray-500">Vendor ID: #12938</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#003580] text-white flex items-center justify-center font-bold">
            EM
          </div>
        </div>
      </div>
    </header>
  );
};

export const VendorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-grow flex flex-col">
        <Header setIsOpen={setIsSidebarOpen} />
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
